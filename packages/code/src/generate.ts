import FigmaNodeParser from './parsers/figma-node.parser'
import HTMLGenerator from './generators/html.generator'
import { getSelectedNodes } from './utils'
import ComponentSetProcessor from './set/component-set-processor'
import { sendHtmlMessage, sendSelectedMessage, sendUnselectedMessage } from './messages'
import { getComponentProperties } from './set/utils'

/**
 * Generate HTML code for the selected Figma nodes.
 *
 * @returns A Promise that resolves to the generated HTML code as a string or void if no node is selected.
 */
export default async function generate(): Promise<string | void> {
  const nodes = getSelectedNodes()

  // Early return if no node is selected
  if (nodes.length === 0) {
    sendUnselectedMessage()
    return
  }

  const parser = new FigmaNodeParser()
  const generator = new HTMLGenerator()

  let html = ''

  if (nodes.length === 1) {
    const node = nodes[0]

    if (node.type === 'COMPONENT_SET') {
      const componentSetProcessor = new ComponentSetProcessor()

      try {
        html = await componentSetProcessor.process(node)
      }
      catch (error) {
        console.error(`[Onyx Plugin] Error during component set processing`, error)
        figma.notify('Error during component set processing')
      }
    }
    else {
      const tree = await parser.parse(node)

      if (tree) {
        html = generator.generate(tree)
      }
      else {
        console.error('It was not possible to generate HTML code for the selected node.')
        figma.notify('Error during HTML generation')
      }
    }
  }
  else {
    const componentSetProcessor = new ComponentSetProcessor()

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
    sendSelectedMessage(componentNodes.map(node => ({ id: node.id, props: getComponentProperties(node) })))
  }

  // only send message if html is not empty
  if (html)
    sendHtmlMessage(html)
  else
    sendUnselectedMessage()
}
