import FigmaNodeParser from './parsers/figma-node.parser'
import HTMLGenerator from './generators/html.generator'
import { getInstanceNodes, getSelectedNodes } from './utils'
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

    interface ComponentInstanceInfo {
      node: ComponentNode
      instanceName: string
    }

    const instanceNodes = await Promise.all(
      nodes
        .flatMap(selectedNode => getInstanceNodes(selectedNode))
        .filter(instanceNode => !config.ignoredComponentInstances.includes(instanceNode.name))
        .map(async instanceNode => ({
          node: await instanceNode.getMainComponentAsync(),
          instanceName: instanceNode.name,
        }))
        .filter(async c => (await c).node !== null) as Promise<ComponentInstanceInfo>[],
    )
    console.log('Found instanceNodes', instanceNodes)

    const generatedInstances: Record<string, string> = {}

    const promises = instanceNodes.map(async (componentInstanceInfo) => {
      console.log('Processing instanceNode....', componentInstanceInfo.instanceName)

      const parser = new FigmaNodeParser({ default: 'default' }, config)
      const tree = await parser.parse(componentInstanceInfo.node)

      if (tree) {
        const generator = new HTMLGenerator([], {}, config)
        generatedInstances[componentInstanceInfo.instanceName] = await generator.generate(tree)

        console.log('Generated HTML for instanceNode', componentInstanceInfo.instanceName, generatedInstances[componentInstanceInfo.instanceName])
      }
      else {
        console.error('It was not possible to generate HTML code for the selected node.')
        figma.notify('Error during HTML generation')
      }
    })

    await Promise.all(promises)

    // only send message if html is not empty
    if (html) {
      sendGeneratedComponentsMessage({
        mainComponent: 'main',
        components: { main: html, ...generatedInstances },
      })
    }
    else { sendUnselectedMessage() }
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
