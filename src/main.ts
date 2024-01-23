/**
 * This plugin generates HTML code that reflects the structure and styling
 * of components in Figma. It uses the UnoCSS framework to handle styling.
 * The plugin operates within the Figma environment and can process selected
 * components to output corresponding HTML structure.
 */

// Skip over invisible nodes and their descendants inside instances for faster performance.
import TreeGenerator from './generators/tree.generator'
import HTMLGenerator from './generators/html.generator'
import { getSelectedNode } from './utils'

figma.skipInvisibleInstanceChildren = true

/**
 * Event listener for the 'generate' event in Figma.
 * Processes the selected node and generates HTML code.
 * The generated code is displayed in the dev tools panel
 * inside Figma.
 */
figma.codegen.on('generate', async () => {
  const node = getSelectedNode()

  // Early return if no node is selected
  if (!node)
    return []

  const htmlGenerator = new HTMLGenerator()
  const treeGenerator = new TreeGenerator()

  let html = ''

  const unoTree = treeGenerator.generate(node)

  if (unoTree)
    html = htmlGenerator.generate(unoTree)
  else
    console.error('It was not possible to generate HTML code for the selected node.')

  return [
    {
      language: 'HTML',
      code: html,
      title: 'UnoCSS & Tokens Studio for Figma',
    },
  ]
})
