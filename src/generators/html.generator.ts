import type {
  InstanceNodeData,
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
      tag: 'div',
      attrs: (treeNode) => {
        // Only add 'class' property if css is not undefined
        const attrs: { [key: string]: string } = {}
        if (treeNode.data.css)
          attrs.class = treeNode.data.css

        return attrs
      },
    },
    icon: {
      tag: 'i',
      attrs: treeNode => ({ class: `i-figma-${treeNode.data.name}` }),
    },
    text: {},
    instance: {
      tag: this.getInstanceNodeHTMLTag,
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
    const nodeMapping = this.nodeTypeToTag[unoTreeNode.data.type]

    html = indent

    if (unoTreeNode.data.type === 'text') {
      html += `${unoTreeNode.data.text}\n`
    }
    else if (nodeMapping.tag) {
      const htmlTag = typeof nodeMapping.tag === 'function' ? nodeMapping.tag(unoTreeNode as any) : nodeMapping.tag
      const attrs = nodeMapping.attrs?.(unoTreeNode as any)

      html += `<${htmlTag}`

      if (attrs)
        html += ` ${this.attrsToString(attrs)}>`
    }
    else {
      console.error(`No tag defined for node type '${unoTreeNode.data.type}'`)
    }

    const hasChildren = unoTreeNode.children && unoTreeNode.children.length > 0
    if (hasChildren) {
      html += '\n'
      unoTreeNode.children.forEach((child) => {
        html += this.generate(child, depth + 1)
      })
      if (nodeMapping.tag) {
        const htmlTag = typeof nodeMapping.tag === 'function' ? nodeMapping.tag(unoTreeNode as any) : nodeMapping.tag
        html += `${indent}</${htmlTag}>\n`
      }
    }
    else if (nodeMapping.tag) {
      const htmlTag = typeof nodeMapping.tag === 'function' ? nodeMapping.tag(unoTreeNode as any) : nodeMapping.tag
      const attrs = nodeMapping.attrs?.(unoTreeNode as any)
      const hasAttrs = attrs && Object.keys(attrs).length > 0

      if (hasAttrs)
        html += `></${htmlTag}>`
      else
        html += ` />`

      html += '\n'
    }

    return html
  }

  private getInstanceNodeHTMLTag(treeNode: UnoTreeNode<InstanceNodeData>): string {
    return treeNode.data.name
      .replaceAll('\\', '_')
      .replaceAll('/', '_')
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
    tag?: TagFunction<ExtractedNodeDataType<K>>
    attrs?: AttrsFunction<ExtractedNodeDataType<K>>
  }
}

export default HTMLGenerator
