/**
 * This plugin generates HTML code that reflects the structure and styling
 * of components in Figma. It uses the UnoCSS framework to handle styling.
 * The plugin operates within the Figma environment and can process selected
 * components to output corresponding HTML structure.
 */

import { UnocssBuilder } from './builder/unocss-builder'

interface UnoTreeNode<T extends UnoTreeNodeData = UnoTreeNodeData> {
  data: T
  children: UnoTreeNode[]
}

type UnoTreeNodeData = DivNodeData | InstanceNodeData | IconNodeData

interface AbstractNodeData {
  type: string
}

interface DivNodeData extends AbstractNodeData {
  type: 'div'
  css: string
}

interface InstanceNodeData extends AbstractNodeData {
  type: 'instance'
  name: string
}

interface IconNodeData extends AbstractNodeData {
  type: 'icon'
  name: string
}

// Skip over invisible nodes and their descendants inside instances for faster performance.
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

/**
 * Generates a tree structure representing the UnoCSS components.
 * @param {SceneNode} node - The Figma node to process.
 * @returns {UnoTreeNode|null} The generated tree node, or null if not applicable.
 */
function generateUnoTree(node: SceneNode): UnoTreeNode | null {
  const isInstance = node.type === 'INSTANCE'

  if (isInstance) {
    const isIcon = isInstance && node.name === 'icon'
    if (isIcon) {
      const mainComponent = node.mainComponent
      if (mainComponent) {
        const iconName = mainComponent.name
        return { children: [], data: { type: 'icon', name: iconName } }
      }
    }
    else {
      return { children: [], data: { type: 'instance', name: node.name } }
    }

    // TODO MF: Add main component name
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

  console.error('This should never happen')
  return null
}

/**
 * Generates HTML markup from a given UnoCSS tree structure.
 * @param {UnoTreeNode} unoTreeNode - The UnoCSS tree node to process.
 * @param {number} [depth] - The current depth in the tree (used for indentation).
 * @returns {string} The generated HTML string.
 */
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
  else if (unoTreeNode.data.type === 'icon') {
    html = `${indent}<i class="i-figma-${unoTreeNode.data.name}">`
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
  else if (unoTreeNode.data.type === 'icon')
    html += `</i>\n`
  else
    console.warn('Instance nodes are not yet supported (end tag)', unoTreeNode)

  return html
}
