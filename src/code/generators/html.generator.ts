import { cloneDeep } from 'lodash-es'
import type {
  InstanceNodeData,
  TreeNode,
  TreeNodeData,
  VariantCSS,
} from '../interfaces'
import { createIndent, entries } from '../utils'
import { translateContainerNodeCSSData, translateVariantCSS } from '../css'
import { simplifyConditionalString, transformPropKey } from './utils'

type AttributeValue = string | { [key: string]: string }
interface Attributes { [key: string]: AttributeValue }

type AttrsFunction<T extends TreeNodeData> = (node: TreeNode<T>) => Attributes
type ConditionalFunction<T extends TreeNodeData> = (node: TreeNode<T>) => string | undefined
type TagFunction<T extends TreeNodeData> = ((node: TreeNode<T>) => string) | string

/**
 * Class representing the mapping from node types to their corresponding HTML tags and attributes.
 */
class HTMLGenerator {
  // Improve NodeTypeToTagMap to handle different node data types
  private nodeTypeToTag: NodeTypeToTagMap = {
    container: {
      tag: treeNode => treeNode.data.element || 'div',
      attrs: (treeNode) => {
        const attrs: Attributes = {}

        if (treeNode.data.css) {
          const defaultVariantCSS: VariantCSS | undefined = Object.values(treeNode.data.css)[0]

          if (defaultVariantCSS)
            attrs.class = translateVariantCSS(defaultVariantCSS)

          // Remove empty variant CSS entries
          const filteredEntries = Object.fromEntries(
            entries(treeNode.data.css)
              .filter(([, value]) => !!value)
              .filter(([, value]) => value.css.length > 0),
          )

          const length = Object.keys(filteredEntries).length

          if (length > 1) {
            const clonedCSS = cloneDeep(treeNode.data.css)
            delete clonedCSS.default
            attrs[':class'] = translateContainerNodeCSSData(clonedCSS)
          }
        }

        return attrs
      },
      if: (treeNode) => {
        const conditionalString = treeNode.data.if ? treeNode.data.if.join(' && ') : undefined
        return conditionalString ? simplifyConditionalString(conditionalString) : undefined
      },
    },
    icon: {
      tag: 'i',
      attrs: (treeNode) => {
        const attrs: Attributes = {
          class: `i-figma-${treeNode.data.name}`,
        }

        if (treeNode.data.css) {
          const defaultVariantCSS: VariantCSS | undefined = Object.values(treeNode.data.css)[0]

          if (defaultVariantCSS)
            attrs.class += ` ${translateVariantCSS(defaultVariantCSS)}`
        }

        return attrs
      },
    },
    text: {},
    instance: {
      tag: this.getInstanceNodeHTMLTag,
      attrs: this.getInstanceNodeHTMLAttrs,
    },
  }

  /**
   * Generates HTML markup from a given tree node.
   * @param {TreeNode} treeNode - The tree node to process.
   * @param {number} depth - The current depth in the tree, used for indentation.
   * @returns {string} The generated HTML string.
   */
  public generate(treeNode: TreeNode, depth: number = 0): string {
    // Create indentation based on the current depth
    const indent = createIndent(depth)
    let html = indent

    // Retrieve the mapping for the current node type
    const nodeMapping = this.nodeTypeToTag[treeNode.data.type]

    // Early return if no mapping is found for the node type
    if (!nodeMapping) {
      console.error(`No tag defined for node type '${treeNode.data.type}'`)
      return ''
    }

    // Determine the tag and attributes for the current node
    const tag = typeof nodeMapping.tag === 'function' ? nodeMapping.tag(treeNode as any) : nodeMapping.tag
    const attrs = nodeMapping.attrs ? nodeMapping.attrs(treeNode as any) : {}
    const hasAttrs = Object.keys(attrs).length > 0 && Object.values(attrs).some(val => !!val)
    const hasAttrsObject = hasAttrs && Object.values(attrs).some(val => typeof val === 'object')
    const hasChildren = treeNode.children && treeNode.children.length > 0

    const conditionals = nodeMapping.if ? nodeMapping.if(treeNode as any) : undefined
    const hasConditionals = !!(conditionals && Object.keys(conditionals).length > 0)

    const hasMultipleAttrs = (hasAttrs && hasConditionals)

    // Handle text nodes separately
    if (treeNode.data.type === 'text') {
      html += `${treeNode.data.text}\n`
    }
    else if (tag) {
      // Start tag construction for non-text nodes
      html += `<${tag}`

      if (hasAttrs) {
        if (!hasAttrsObject && !hasMultipleAttrs)
          html += ' '

        html += this.attrsToString(attrs, depth, hasConditionals)
      }

      if (hasConditionals) {
        if (hasAttrsObject || hasMultipleAttrs)
          html += indent
        else
          html += ` `

        html += ` v-if="${conditionals}"`

        if (hasAttrsObject || hasMultipleAttrs)
          html += `\n${indent}`
      }

      if (hasChildren) {
        // Add children nodes if present
        html += '>\n'
        treeNode.children.forEach((child) => {
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
   * @param treeNode - The TreeNode of type InstanceNodeData for which the HTML tag string is to be generated.
   * @returns A string representing the HTML tag for the given instance node.
   */
  private getInstanceNodeHTMLTag(treeNode: TreeNode<InstanceNodeData>): string {
    return treeNode.data.name
      .replaceAll('\\', '_')
      .replaceAll('/', '_')
      .replaceAll(' ', '_')
  }

  /**
   * This method is used to generate an object that represents the HTML attributes for an instance node.
   * @param treeNode - The TreeNode of type InstanceNodeData for which the HTML attributes are to be generated.
   * @returns An object representing the HTML attributes for the given instance node.
   */
  private getInstanceNodeHTMLAttrs(treeNode: TreeNode<InstanceNodeData>): { [key: string]: string } {
    const attrs: { [key: string]: string } = {}

    entries(treeNode.data.props)
      .filter(([, prop]) => prop.type === 'VARIANT')
      .forEach(([key, prop]) => {
        attrs[key] = `${prop.value}`
      })

    entries(treeNode.data.props)
      .filter(([, prop]) => prop.type === 'INSTANCE_SWAP')
      .forEach(([key, prop]) => {
        if (typeof prop.value === 'string') {
          const instance: BaseNode | null = figma.getNodeById(prop.value)
          if (instance)
            attrs[transformPropKey(`${key}`)] = `${instance.name}`
        }
      })

    return attrs
  }

  /**
   * Converts an attributes object into a string format.
   * @param {object} attrs - The attributes object.
   * @param {number} depth - The current depth in the tree, used for indentation.
   * @param forceIndentation - Whether to force indentation even if there is only one attribute.
   * @returns {string} The string representation of the attributes.
   */
  private attrsToString(attrs: Attributes, depth: number, forceIndentation: boolean = false): string {
    const pairs = entries(attrs).map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`
      }
      else {
        const pairValue = JSON.stringify(value, null, 2)
          .replaceAll('"', '\'')
          .replaceAll('\n', `\n${createIndent(depth + 1)}`)
        return `${key}="${pairValue}"`
      }
    })

    if (pairs.length === 1 && !forceIndentation) {
      return ` ${pairs[0]}`
    }
    else {
      // with indent and each pair on a new line. at the beginning and at the end an additional new line
      const indent = createIndent(depth + 1)
      return `\n${indent}${pairs.join(`\n${indent}`)}\n${createIndent(depth)}`
    }
  }
}

type ExtractedNodeDataType<K extends TreeNodeData['type']> = Extract<TreeNodeData, { type: K }>

/**
 * Maps each 'type' of TreeNodeData to its corresponding HTML tag configuration.
 * For each type (e.g., 'container', 'text'), it defines the HTML start and end tags,
 * and a function to generate the HTML attributes appropriate for that type.
 * This mapping leverages TypeScript's conditional types and mapped types to automatically
 * associate the correct subtype of TreeNodeData with its tag configuration, ensuring type safety.
 */
export type NodeTypeToTagMap = {
  [K in TreeNodeData['type']]: {
    tag?: TagFunction<ExtractedNodeDataType<K>>
    attrs?: AttrsFunction<ExtractedNodeDataType<K>>
    if?: ConditionalFunction<ExtractedNodeDataType<K>>
  }
}

export default HTMLGenerator