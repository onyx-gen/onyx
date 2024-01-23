import type {
  InstanceNodeData,
  UnoTreeNode,
  UnoTreeNodeData,
} from '../interfaces'
import { createIndent, typedObjectEntries } from '../utils'

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
      attrs: this.getInstanceNodeHTMLAttrs,
    },
  }

  /**
   * Generates HTML markup from a given UnoCSS tree node.
   * @param {UnoTreeNode} unoTreeNode - The UnoCSS tree node to process.
   * @param {number} depth - The current depth in the tree, used for indentation.
   * @returns {string} The generated HTML string.
   */
  public generate(unoTreeNode: UnoTreeNode, depth: number = 0): string {
    // Create indentation based on the current depth
    const indent = createIndent(depth)
    let html = indent

    // Retrieve the mapping for the current node type
    const nodeMapping = this.nodeTypeToTag[unoTreeNode.data.type]

    // Early return if no mapping is found for the node type
    if (!nodeMapping) {
      console.error(`No tag defined for node type '${unoTreeNode.data.type}'`)
      return ''
    }

    // Determine the tag and attributes for the current node
    const tag = typeof nodeMapping.tag === 'function' ? nodeMapping.tag(unoTreeNode as any) : nodeMapping.tag
    const attrs = nodeMapping.attrs ? nodeMapping.attrs(unoTreeNode as any) : {}
    const hasAttrs = Object.keys(attrs).length > 0
    const hasChildren = unoTreeNode.children && unoTreeNode.children.length > 0

    // Handle text nodes separately
    if (unoTreeNode.data.type === 'text') {
      html += `${unoTreeNode.data.text}\n`
    }
    else if (tag) {
      // Start tag construction for non-text nodes
      html += `<${tag}${hasAttrs ? ` ${this.attrsToString(attrs)}` : ''}`

      if (hasChildren) {
        // Add children nodes if present
        html += '>\n'
        unoTreeNode.children.forEach((child) => {
          html += this.generate(child, depth + 1)
        })
        // Close the tag
        html += `${indent}</${tag}>\n`
      }
      else {
        // Self-closing tag for nodes without children
        html += ' />\n'
      }
    }

    return html
  }

  /**
   * This method is used to generate a string that represents the HTML tag for an instance node.
   * It takes a treeNode with instance node data as an argument and escapes certain chars in the name
   * in order to generate a valid HTML tag.
   * @param treeNode - The UnoTreeNode of type InstanceNodeData for which the HTML tag string is to be generated.
   * @returns A string representing the HTML tag for the given instance node.
   */
  private getInstanceNodeHTMLTag(treeNode: UnoTreeNode<InstanceNodeData>): string {
    return treeNode.data.name
      .replaceAll('\\', '_')
      .replaceAll('/', '_')
      .replaceAll(' ', '_')
  }

  /**
   * This method is used to generate an object that represents the HTML attributes for an instance node.
   * @param treeNode - The UnoTreeNode of type InstanceNodeData for which the HTML attributes are to be generated.
   * @returns An object representing the HTML attributes for the given instance node.
   */
  private getInstanceNodeHTMLAttrs(treeNode: UnoTreeNode<InstanceNodeData>): { [key: string]: string } {
    const attrs: { [key: string]: string } = {}

    typedObjectEntries(treeNode.data.props)
      .filter(([, prop]) => prop.type === 'VARIANT')
      .forEach(([key, prop]) => {
        attrs[key] = `${prop.value}`
      })

    return attrs
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
