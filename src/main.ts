/**
 * This plugin generates HTML code that reflects the structure and styling
 * of components in Figma. It uses the UnoCSS framework to handle styling.
 * The plugin operates within the Figma environment and can process selected
 * components to output corresponding HTML structure.
 */

// Skip over invisible nodes and their descendants inside instances for faster performance.
import { generateUnoTree } from './generators/unocss-tree.generator'
import { generateHTMLFromTree } from './generators/html.generator'

figma.skipInvisibleInstanceChildren = true

/**
 * Event listener for the 'generate' event in Figma.
 * Processes the selected node and generates HTML code.
 * The generated code is displayed in the dev tools panel
 * inside Figma.
 */
figma.codegen.on('generate', async () => {
  const selection = figma.currentPage.selection
  const node = selection[0]

  let html = ''

  const unoTree = generateUnoTree(node)
  if (unoTree)
    html = generateHTMLFromTree(unoTree)

  else console.log('Please select a component')

  return [
    {
      language: 'HTML',
      code: html,
      title: 'UnoCSS & Tokens Studio for Figma',
    },
  ]
})
