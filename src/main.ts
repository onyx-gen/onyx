// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.

import { UnocssBuilder } from './builder/unocss-builder'

interface UnoTree {
  css: string
  children: UnoTree[]
}

// Skip over invisible nodes and their descendants inside instances for faster performance.
figma.skipInvisibleInstanceChildren = true

figma.codegen.on('generate', async () => {
  const selection = figma.currentPage.selection
  const node = selection[0]

  let html = ''

  if (node.type === 'COMPONENT') {
    const unoTree = recursiveGeneration(node)
    html = generateHTMLFromTree(unoTree)
  }

  else { console.log('Please select a component') }

  return [
    {
      language: 'HTML',
      code: html,
      title: 'UnoCSS & Tokens Studio for Figma',
    },
  ]
})

function recursiveGeneration(node: SceneNode): UnoTree {
  const builder = new UnocssBuilder(node)
  const css = builder.build()

  const cssTree: UnoTree = { css, children: [] }

  const hasChildren = 'children' in node && node.children.length > 0

  if (hasChildren) {
    node.children.forEach((child) => {
      cssTree.children.push(recursiveGeneration(child))
    })
  }

  return cssTree
}

function generateHTMLFromTree(tree: UnoTree, depth: number = 0): string {
  const indent = '  '.repeat(depth)
  const hasChildren = tree.children && tree.children.length > 0

  let html = `${indent}<div class="${tree.css}">`

  if (hasChildren) {
    html += '\n'
    tree.children.forEach((child) => {
      html += generateHTMLFromTree(child, depth + 1)
    })
  }

  html += `${indent}</div>\n`
  return html
}
