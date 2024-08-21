import type { ComponentTreeNode } from '@onyx-gen/types'
import FigmaNodeParser from './parsers/figma-node.parser'
import HTMLGenerator from './generators/html.generator'
import { getSelectedNodes, getUniqueInstanceNodes } from './utils'
import ComponentSetProcessor from './set/component-set-processor'
import {
  sendExecutionTimeMessage,
  sendGeneratedComponentsMessage,
  sendIsLoadingMessage,
  sendSelectedMessage,
  sendUnselectedMessage,
} from './messages'
import { getComponentProperties } from './set/utils'
import type { Configuration } from './config/config'
import type { ContainerNodeData, HTMLStringNodeData, TreeNode } from './interfaces'
import { getInstanceNodeHTMLTag } from './generators/utils'

/**
 * Generate HTML code for the selected Figma nodes.
 *
 * @returns A Promise that resolves to the generated HTML code as a string or void if no node is selected.
 */
export default async function generate(config: Configuration): Promise<string | void> {
  sendIsLoadingMessage(true)
  const startTime: number = Date.now()

  try {
    const nodes = getSelectedNodes()

    // Early return if no node is selected
    if (nodes.length === 0) {
      sendUnselectedMessage()
      return
    }

    let html = ''

    if (nodes.length === 1) {
      const node = nodes[0]

      if (node.type === 'COMPONENT_SET') {
        const componentSetProcessor = new ComponentSetProcessor(config)

        try {
          html = await componentSetProcessor.process(node)
        }
        catch (error) {
          console.error(`[Onyx Plugin] Error during component set processing`, error)
          figma.notify('Error during component set processing')
        }
      }
      else {
        const parser = new FigmaNodeParser({ default: 'default' }, config)
        const tree = await parser.parse(node)

        if (tree) {
          const generator = new HTMLGenerator([], {}, config)
          html = await generator.generate(tree)
        }
        else {
          console.error('It was not possible to generate HTML code for the selected node.')
          figma.notify('Error during HTML generation')
        }
      }
    }
    else {
      const componentSetProcessor = new ComponentSetProcessor(config)

      try {
        html = await componentSetProcessor.process(nodes)
      }
      catch (error) {
        console.error(`[Onyx Plugin] Error during multiple selected nodes processing`, error)
        figma.notify('Error during multiple selected nodes processing')
      }
    }

    if (nodes.length === 1 && nodes[0].type === 'COMPONENT_SET') {
      const componentSet = nodes[0] as ComponentSetNode
      const componentNodes = componentSet.children as ComponentNode[]
      sendSelectedMessage(componentNodes.map(node => ({ id: node.id, props: getComponentProperties(node) })))
    }
    else {
      const componentNodes = nodes.filter(node => node.type === 'COMPONENT') as ComponentNode[]

      if (componentNodes.length > 0)
        sendSelectedMessage(componentNodes.map(node => ({ id: node.id, props: getComponentProperties(node) })))
      else
        sendSelectedMessage([])
    }

    const instanceNodes = (await Promise.all(nodes.map(node => getUniqueInstanceNodes(node)))).flat()

    const mainComponentsOfInstanceNodes = await Promise.all(
      instanceNodes
        .map(instanceNode => instanceNode.getMainComponentAsync())
        .filter((mainComponent): mainComponent is Promise<ComponentNode> => mainComponent !== null),
    )

    const instances = await Promise.all(mainComponentsOfInstanceNodes.map(instanceNode => generateComponentTree(instanceNode, config)))

    const mainNode = nodes[0]

    const nodeName = getNodeName(mainNode)

    const componentTree: ComponentTreeNode = {
      rawName: nodeName,
      name: getInstanceNodeHTMLTag(nodeName),
      figmaNode: nodes[0] as ComponentNode, // TODO MF: Should also work for other node types
      code: html,
      instances,
    }

    console.log('### COMPONENT TREE ###', componentTree)

    // only send message if html is not empty
    if (html)
      sendGeneratedComponentsMessage({ componentTree })

    else sendUnselectedMessage()
  }
  catch (e) {
    figma.notify('Onyx: Unexpected Error')
    console.error(`[Onyx Plugin] Error during HTML generation`, e)
  }
  finally {
    const endTime = Date.now()
    const executionTime = endTime - startTime
    sendIsLoadingMessage(false)
    sendExecutionTimeMessage(executionTime)
  }
}

/**
 * Generates a remote component tree based on a given ComponentNode and Configuration.
 *
 * @param node - The ComponentNode to generate the remote component tree from.
 * @param config - The Configuration object that defines the generation settings.
 * @return A Promise that resolves to a ComponentTreeNode representing the remote component tree.
 */
async function generateRemoteComponentTree(node: ComponentNode, config: Configuration): Promise<ComponentTreeNode> {
  const svg = await node.exportAsync({ format: 'SVG_STRING' })

  const svgNode: TreeNode<HTMLStringNodeData> = {
    data: {
      type: 'html',
      html: svg,
    },
    children: [],
  }

  const rootNode: TreeNode<ContainerNodeData> = {
    data: {
      type: 'container',
      element: 'div',
    },
    children: [svgNode],
  }

  const generator = new HTMLGenerator([], {}, config)
  const html = await generator.generate(rootNode)

  const nodeName = getNodeName(node)

  const componentTreeNode: ComponentTreeNode = {
    rawName: nodeName,
    name: getInstanceNodeHTMLTag(nodeName),
    code: html,
    figmaNode: node,
    instances: [],
  }

  return Promise.resolve(componentTreeNode)
}

/**
 * Recursively generates a component tree for given Figma nodes.
 * Each node's HTML code is generated using FigmaNodeParser and HTMLGenerator.
 *
 * @param node - The initial node to generate the tree from.
 * @param config - Configuration object containing settings and options for node processing.
 * @returns A promise that resolves to a ComponentTreeNode representing the node hierarchy with generated HTML.
 */
async function generateComponentTree(node: ComponentNode, config: Configuration): Promise<ComponentTreeNode> {
  if (node.remote || node.name.toLowerCase().includes('icon'))
    return generateRemoteComponentTree(node, config)

  const parser = new FigmaNodeParser({ default: 'default' }, config)
  const generator = new HTMLGenerator([], {}, config)

  const tree = await parser.parse(node)
  const html = tree ? await generator.generate(tree) : ''

  const instances: ComponentTreeNode[] = []

  const instanceNodes = await getUniqueInstanceNodes(node)
  for (const instanceNode of instanceNodes) {
    if (!config.ignoredComponentInstances.includes(instanceNode.name)) {
      const mainComponent = await instanceNode.getMainComponentAsync()
      if (mainComponent) {
        const instanceTree = await generateComponentTree(mainComponent, config)
        instances.push(instanceTree)
      }
    }
  }

  const rawNodeName = getNodeName(node)

  return {
    rawName: rawNodeName,
    name: getInstanceNodeHTMLTag(rawNodeName),
    code: html,
    figmaNode: node,
    instances,
  }
}

/**
 * Returns the name of a given node.
 *
 * @param {SceneNode} node - The node for which the name is to be retrieved.
 *
 * @return {string} The name of the node, or the name of the parent node if
 * the given node is a component and its parent is a component set.
 */
function getNodeName(node: SceneNode): string {
  let nodeName = node.name

  if (node.type === 'COMPONENT') {
    const hasComponentSetParent = node.parent?.type === 'COMPONENT_SET'

    if (hasComponentSetParent)
      nodeName = node.parent.name
  }

  return nodeName
}
