// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.

import { UnocssBuilder } from './builder/unocss-builder'

interface UnoTreeNode<T extends UnoTreeNodeData = UnoTreeNodeData> {
  data: T
  children: UnoTreeNode[]
}

type UnoTreeNodeData = DivNodeData | InstanceNodeData

interface DivNodeData {
  type: 'div'
  css: string
}

interface InstanceNodeData {
  type: 'instance'
  name: string
}

// Skip over invisible nodes and their descendants inside instances for faster performance.
figma.skipInvisibleInstanceChildren = true

figma.codegen.on('generate', async () => {
  const selection = figma.currentPage.selection
  const node = selection[0]

  let html = ''

  if (node.type === 'COMPONENT') {
    const unoTree = generateUnoTree(node)
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

function generateUnoTree(node: SceneNode): UnoTreeNode | null {
  const isInstance = node.type === 'INSTANCE'

  if (isInstance) {
    // TODO MF: Add main component name
    return { children: [], data: { type: 'instance', name: node.name } }
  }
  else {
    const builder = new UnocssBuilder(node)
    const css = builder.build()

    const hasChildren = 'children' in node && node.children.length > 0

    // If it's a leaf node with empty CSS, return null
    if (!hasChildren && css === '') {
      console.log('Skipping leaf with empty CSS')
      return null
    }

    const unoTreeNode: UnoTreeNode = { data: { type: 'div', css }, children: [] }

    if (hasChildren) {
      node.children
        .filter(child => child.visible)
        .forEach((child) => {
          const childTree = generateUnoTree(child)

          // Only add the child if it's not null
          if (childTree)
            unoTreeNode.children.push(childTree)
        })
    }

    return unoTreeNode
  }
}

function generateHTMLFromTree(unoTreeNode: UnoTreeNode, depth: number = 0): string {
  const indent = '  '.repeat(depth)
  const hasChildren = unoTreeNode.children && unoTreeNode.children.length > 0

  let html = ''

  if (unoTreeNode.data.type === 'div') {
    const css = unoTreeNode.data.css ? ` class="${unoTreeNode.data.css}"` : ''
    html = `${indent}<div${css}>`
  }
  else if (unoTreeNode.data.type === 'instance') {
    console.warn('Instance nodes are not yet supported (before tag)', unoTreeNode)
  }

  if (hasChildren) {
    html += '\n'
    unoTreeNode.children.forEach((child) => {
      html += generateHTMLFromTree(child, depth + 1)
    })
    html += indent
  }

  if (unoTreeNode.data.type === 'div')
    html += `</div>\n`
  else
    console.warn('Instance nodes are not yet supported (end tag)', unoTreeNode)

  return html
}
