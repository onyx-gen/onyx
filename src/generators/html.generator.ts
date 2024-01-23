import type {
  UnoTreeNode,
  UnoTreeNodeData,
} from '../interfaces'

// Define a type for the attrs function
type AttrsFunction<T extends UnoTreeNodeData> = (node: UnoTreeNode<T>) => { [key: string]: string }

type TagFunction<T extends UnoTreeNodeData> = ((node: UnoTreeNode<T>) => string) | string

/**
 * Class representing the mapping from node types to their corresponding HTML tags and attributes.
 */
class HTMLGenerator {
  // Improve NodeTypeToTagMap to handle different node data types
  private nodeTypeToTag: NodeTypeToTagMap = {
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
      start: node => node.data.name,
      end: node => node.data.name,
      attrs: () => ({}),
    },
  }

  /**
   * Generates HTML markup from a given UnoCSS tree node.
   * @param {UnoTreeNode} unoTreeNode - The UnoCSS tree node to process.
   * @param {number} depth - The current depth in the tree, used for indentation.
   * @returns {string} The generated HTML string.
   */
  public generate(unoTreeNode: UnoTreeNode, depth: number = 0): string {
    const indent = '  '.repeat(depth)
    let html = ''
    const nodeTag = this.nodeTypeToTag[unoTreeNode.data.type]

    if (unoTreeNode.data.type === 'text') {
      html = `${indent}${unoTreeNode.data.text}`
    }
    else if (nodeTag) {
      const htmlTag = typeof nodeTag.start === 'function' ? nodeTag.start(unoTreeNode as any) : nodeTag.start
      html = `${indent}<${htmlTag} ${this.attrsToString(nodeTag.attrs(unoTreeNode as any))}>`
    }

    const hasChildren = unoTreeNode.children && unoTreeNode.children.length > 0
    if (hasChildren) {
      html += '\n'
      unoTreeNode.children.forEach((child) => {
        html += this.generate(child, depth + 1)
      })
      if (nodeTag && nodeTag.end) {
        const htmlTag = typeof nodeTag.end === 'function' ? nodeTag.end(unoTreeNode as any) : nodeTag.end
        html += `${indent}</${htmlTag}>\n`
      }
    }
    else if (nodeTag && nodeTag.end) {
      const htmlTag = typeof nodeTag.end === 'function' ? nodeTag.end(unoTreeNode as any) : nodeTag.end
      html += `</${htmlTag}>\n`
    }

    return html
  }

  /**
   * Converts an attributes object into a string format.
   * @param {object} attrs - The attributes object.
   * @returns {string} The string representation of the attributes.
   */
  private attrsToString(attrs: { [key: string]: string }): string {
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')
  }
}

type ExtractedNodeDataType<K extends UnoTreeNodeData['type']> = Extract<UnoTreeNodeData, { type: K }>

/**
 * Maps each 'type' of UnoTreeNodeData to its corresponding HTML tag configuration.
 * For each type (e.g., 'container', 'text'), it defines the HTML start and end tags,
 * and a function to generate the HTML attributes appropriate for that type.
 * This mapping leverages TypeScript's conditional types and mapped types to automatically
 * associate the correct subtype of UnoTreeNodeData with its tag configuration, ensuring type safety.
 */
export type NodeTypeToTagMap = {
  [K in UnoTreeNodeData['type']]: {
    start: TagFunction<ExtractedNodeDataType<K>>
    end: TagFunction<ExtractedNodeDataType<K>>
    attrs: AttrsFunction<ExtractedNodeDataType<K>>
  }
}

export default HTMLGenerator
