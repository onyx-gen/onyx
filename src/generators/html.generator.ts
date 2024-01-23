import type { UnoTreeNode } from '../interfaces'

/**
 * Generates HTML markup from a given UnoCSS tree structure.
 * @param {UnoTreeNode} unoTreeNode - The UnoCSS tree node to process.
 * @param {number} [depth] - The current depth in the tree (used for indentation).
 * @returns {string} The generated HTML string.
 */
export function generateHTMLFromTree(unoTreeNode: UnoTreeNode, depth: number = 0): string {
  const indent = '  '.repeat(depth)
  const hasChildren = unoTreeNode.children && unoTreeNode.children.length > 0

  let html = ''

  if (unoTreeNode.data.type === 'container') {
    const css = unoTreeNode.data.css ? ` class="${unoTreeNode.data.css}"` : ''
    html = `${indent}<div${css}>`
  }
  else if (unoTreeNode.data.type === 'instance') {
    console.warn('Instance nodes are not yet supported (before tag)', unoTreeNode)
  }
  else if (unoTreeNode.data.type === 'icon') {
    html = `${indent}<i class="i-figma-${unoTreeNode.data.name}">`
  }
  else if (unoTreeNode.data.type === 'text') {
    html = `${indent}${unoTreeNode.data.text}`
  }

  if (hasChildren) {
    html += '\n'
    unoTreeNode.children.forEach((child) => {
      html += generateHTMLFromTree(child, depth + 1)
    })
    html += indent
  }

  if (unoTreeNode.data.type === 'container')
    html += `</div>\n`
  else if (unoTreeNode.data.type === 'icon')
    html += `</i>\n`
  else if (unoTreeNode.data.type === 'text')
    html += `\n`
  else
    console.warn('Instance nodes are not yet supported (end tag)', unoTreeNode)

  return html
}
