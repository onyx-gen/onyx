import { cloneDeep } from 'lodash-es'
import type { HasNodeCSSData, InstanceNodeData, TreeNode, TreeNodeData, VariantCSS } from '../interfaces'
import { createIndent, entries } from '../utils'
import { translateContainerNodeCSSData, translateVariantCSS } from '../css'
import type { VariantKey, VariantPermutation } from '../set/types'
import { variantKey } from '../merge/utils'
import { simplifyConditionalString, transformPropKey } from './utils'
import type { Attributes, CSSAttributes, ComputedProperties, NodeTypeToTagMap } from './types'

/**
 * Class representing the mapping from node types to their corresponding HTML tags and attributes.
 */
class HTMLGenerator {
  private readonly permutationMap: { [key: VariantKey]: VariantPermutation }

  constructor(
    private readonly permutations: VariantPermutation[] = [],
    private readonly computedProperties: ComputedProperties = {},
  ) {
    this.permutationMap = Object.fromEntries(
      this.permutations.map((permutation) => {
        return [variantKey(permutation), permutation]
      }),
    )
  }

  // Improve NodeTypeToTagMap to handle different node data types
  private nodeTypeToTag: NodeTypeToTagMap = {
    container: {
      tag: treeNode => treeNode.data.element || 'div',
      attrs: (treeNode) => {
        const attrs: Attributes = {}

        const cssAttributes: CSSAttributes = this.getCSSAttributes(treeNode)

        if (cssAttributes.static)
          attrs.class = cssAttributes.static

        if (cssAttributes.dynamic)
          attrs[':class'] = cssAttributes.dynamic

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

        const cssAttributes: CSSAttributes = this.getCSSAttributes(treeNode)

        if (cssAttributes.static)
          attrs.class += ` ${cssAttributes.static}`

        if (cssAttributes.dynamic)
          attrs[':class'] = cssAttributes.dynamic

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
   * Retrieves the CSS attributes from a TreeNode with CSS data.
   *
   * @param {TreeNode<TreeNodeData & HasNodeCSSData>} tree - The TreeNode with CSS data.
   * @returns {CSSAttributes} - The CSS attributes extracted from the TreeNode.
   */
  private getCSSAttributes(tree: TreeNode<TreeNodeData & HasNodeCSSData>): CSSAttributes {
    const attrs: CSSAttributes = {}

    if (tree.data.css) {
      const defaultVariantCSS: VariantCSS | undefined = Object.values(tree.data.css)[0]

      if (defaultVariantCSS)
        attrs.static = translateVariantCSS(defaultVariantCSS)

      // Remove empty top-level variant CSS entries
      // TODO: Optimization is incomplete as it does not remove recursively empty variant CSS entries
      // TODO: optimization should not be done here, but in the CSS set operations
      const filteredEntries = Object.fromEntries(
        entries(tree.data.css)
          .filter(([, value]) => !!value)
          .filter(([, value]) => value.css.length > 0),
      )

      const length = Object.keys(filteredEntries).length

      if (length > 1) {
        const clonedCSS = cloneDeep(tree.data.css)
        delete clonedCSS.default // TODO: We have a symbol for that
        const translatedCSSData = translateContainerNodeCSSData(clonedCSS)
        attrs.dynamic = Object.fromEntries(
          Object.entries(translatedCSSData).map(([key, value]) => {
            const permutation: VariantPermutation | undefined = this.permutationMap[key]

            if (permutation) {
              const conditional = Object.entries(permutation).map(([permutationKey, permutationValue]) => {
                return this.computedProperties[permutationKey]?.[permutationValue]
              }).join(' && ')
              return [value, conditional]
            }
            else {
              return [value, key]
            }
          }),
        )
      }
    }

    return attrs
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

export default HTMLGenerator
