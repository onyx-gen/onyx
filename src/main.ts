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
    if (unoTree)
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

function recursiveGeneration(node: SceneNode): UnoTree | null {
  const builder = new UnocssBuilder(node)
  const css = builder.build()

  const hasChildren = 'children' in node && node.children.length > 0

  // If it's a leaf node with empty CSS, return null
  if (!hasChildren && css === '') {
    console.log('Skipping leaf with empty CSS')
    return null
  }

  const cssTree: UnoTree = { css, children: [] }

  if (hasChildren) {
    node.children
      .filter(child => child.visible)
      .forEach((child) => {
        const childTree = recursiveGeneration(child)

        // Only add the child if it's not null
        if (childTree)
          cssTree.children.push(childTree)
      })
  }

  return cssTree
}

function generateHTMLFromTree(tree: UnoTree, depth: number = 0): string {
  const indent = '  '.repeat(depth)
  const hasChildren = tree.children && tree.children.length > 0

  const css = tree.css ? ` class="${tree.css}"` : ''
  let html = `${indent}<div${css}>`

  if (hasChildren) {
    html += '\n'
    tree.children.forEach((child) => {
      html += generateHTMLFromTree(child, depth + 1)
    })
    html += indent
  }

  html += `</div>\n`
  return html
}
