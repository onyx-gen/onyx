import type {
  ContainerNodeData,
  IconNodeData,
  InstanceNodeData,
  TextNodeData,
  UnoTreeNode,
  UnoTreeNodeData,
} from '../interfaces'

// Define a type for the attrs function
type AttrsFunction<T extends UnoTreeNodeData> = (node: UnoTreeNode<T>) => { [key: string]: string }

// Improve NodeTypeToTagMap to handle different node data types
interface NodeTypeToTagMap {
  container: {
    start: string
    end: string
    attrs: AttrsFunction<ContainerNodeData>
  }
  icon: {
    start: string
    end: string
    attrs: AttrsFunction<IconNodeData>
  }
  text: {
    start: string
    end: string
    attrs: AttrsFunction<TextNodeData>
  }
  instance: {
    start: string
    end: string
    attrs: AttrsFunction<InstanceNodeData>
  }
}

const nodeTypeToTag: NodeTypeToTagMap = {
  container: {
    start: 'div',
    end: 'div',
    attrs: (treeNode) => {
      // Only add 'class' property if css is not undefined
      const attrs: { [key: string]: string } = {}
      if (treeNode.data.css)
        attrs.class = treeNode.data.css

      return attrs
    },
  },
  icon: {
    start: 'i',
    end: 'i',
    attrs: treeNode => ({ class: `i-figma-${treeNode.data.name}` }),
  },
  text: {
    start: '',
    end: '',
    attrs: () => ({}),
  },
  instance: {
    start: '',
    end: '',
    attrs: () => ({}),
  },
}

/**
 * Generates HTML markup from a given UnoCSS tree structure.
 * @param {UnoTreeNode} unoTreeNode - The UnoCSS tree node to process.
 * @param {number} [depth] - The current depth in the tree, used for indentation.
 * @returns {string} The generated HTML string.
 */
export function generateHTMLFromTree(unoTreeNode: UnoTreeNode, depth: number = 0): string {
  // Create an indentation based on the current depth
  const indent = '  '.repeat(depth)

  let html = ''
  const nodeTag = nodeTypeToTag[unoTreeNode.data.type]

  // Handle different node types
  if (unoTreeNode.data.type === 'text') {
    // Directly use text content for text nodes
    html = `${indent}${unoTreeNode.data.text}`
  }
  else if (nodeTag) {
    if (unoTreeNode.data.type === 'instance') {
      // Warning for unsupported instance nodes
      console.warn('Instance nodes are not yet supported', unoTreeNode)
    }
    else {
      // Construct start tag with attributes
      html = `${indent}<${nodeTag.start} ${attrsToString(nodeTag.attrs(unoTreeNode as any))}>`
    }
  }

  // Check if the node has children
  const hasChildren = unoTreeNode.children && unoTreeNode.children.length > 0

  // Handle child nodes if present
  if (hasChildren) {
    html += '\n'
    unoTreeNode.children.forEach((child) => {
      html += generateHTMLFromTree(child, depth + 1)
    })
    // Add end tag for nodes with children
    if (nodeTag && nodeTag.end)
      html += `${indent}</${nodeTag.end}>\n`
  }
  else if (nodeTag && nodeTag.end) {
    // Add end tag for nodes without children
    html += `</${nodeTag.end}>\n`
  }

  return html
}

// Convert attributes object to string
function attrsToString(attrs: { [key: string]: string }): string {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}
