import FigmaNodeParser from './parsers/figma-node.parser'
import HTMLGenerator from './generators/html.generator'
import { getSelectedNode } from './utils'
import ComponentSetProcessor from './set/component-set-processor'

/**
 * This plugin generates HTML code that reflects the structure and styling
 * of components in Figma. It uses the UnoCSS framework to handle styling.
 * The plugin operates within the Figma environment and can process selected
 * components to output corresponding HTML structure.
 */

// Skip over invisible nodes and their descendants inside instances for faster performance.

figma.skipInvisibleInstanceChildren = true

figma.showUI(__html__, { themeColors: true })

figma.on('selectionchange', () => {
  const html = generate()

  figma.ui.postMessage(html)
})

/**
 * Event listener for the 'generate' event in Figma.
 * Processes the selected node and generates HTML code.
 * The generated code is displayed in the dev tools panel
 * inside Figma.
 */
function generate(): string {
  const node = getSelectedNode()

  // Early return if no node is selected
  if (!node)
    return ''

  const parser = new FigmaNodeParser()
  const generator = new HTMLGenerator()

  let html = ''

  if (node.type === 'COMPONENT_SET') {
    const componentSetProcessor = new ComponentSetProcessor()

    try {
      html = componentSetProcessor.process(node)
    }
    catch (error) {
      console.error(`[UnoCSS-Variables Plugin] Error during component set processing`, error)
    }
  }
  else {
    const tree = parser.parse(node)

    if (tree)
      html = generator.generate(tree)
    else
      console.error('It was not possible to generate HTML code for the selected node.')
  }

  return html
}
