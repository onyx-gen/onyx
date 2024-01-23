import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, UnoTreeNode } from '../interfaces'
import { UnocssBuilder } from '../builder/unocss-builder'

/**
 * Class to generate a tree structure representing UnoCSS components.
 */
class TreeGenerator {
  /**
   * Public method to initiate the tree generation.
   * This method serves as the core of the tree generation logic.
   * @param node - The Figma node to process.
   * @returns {UnoTreeNode|null} The generated tree node, or null if not applicable.
   */
  public generate(node: SceneNode): UnoTreeNode | null {
    if (node.type === 'INSTANCE')
      return this.handleInstanceNode(node)
    else
      return this.handleOtherNodes(node)
  }

  /**
   * Handles nodes of type 'INSTANCE'.
   * @param node - The instance node to process.
   * @returns {UnoTreeNode|null} The generated tree node, or null if not applicable.
   */
  private handleInstanceNode(node: InstanceNode): UnoTreeNode | null {
    const isIcon = node.name === 'icon'
    if (isIcon)
      return this.createIconNode(node)
    else
      return this.createInstanceNode(node)
  }

  /**
   * Creates a tree node for icon type.
   * @param node - The icon node to process.
   * @returns {UnoTreeNode} The generated tree node for the icon.
   */
  private createIconNode(node: InstanceNode): UnoTreeNode<IconNodeData> {
    const iconName = node.mainComponent?.name

    if (!iconName)
      console.warn('No icon name found for node', node)

    return { children: [], data: { type: 'icon', name: iconName || '?' } }
  }

  /**
   * Creates a tree node for instance type.
   * @param node - The instance node to process.
   * @returns {UnoTreeNode} The generated tree node for the instance.
   */
  private createInstanceNode(node: InstanceNode): UnoTreeNode<InstanceNodeData> {
    return {
      children: [],
      data: {
        type: 'instance',
        name: node.name,
        props: node.componentProperties,
      },
    }
  }

  /**
   * Handles nodes other than 'INSTANCE' type.
   * @param node - The node to process.
   * @returns {UnoTreeNode|null} The generated tree node, or null if not applicable.
   */
  private handleOtherNodes(node: SceneNode): UnoTreeNode | null {
    const builder = new UnocssBuilder(node)
    const css = builder.build()

    const hasChildren = 'children' in node && node.children.length > 0

    // Skip leaf nodes with empty CSS
    if (!hasChildren && css === '') {
      console.log('Skipping leaf with empty CSS')
      return null
    }

    return node.type === 'TEXT' ? this.createTextNode(node, css) : this.createContainerNode(node, css, hasChildren)
  }

  /**
   * Creates a tree node for text type.
   * @param node - The text node to process.
   * @param {string} css - CSS for the node.
   * @returns {UnoTreeNode} The generated tree node for the text.
   */
  private createTextNode(node: TextNode, css: string): UnoTreeNode {
    const parentNodeData: ContainerNodeData = { type: 'container', css }
    const childNodeData: TextNodeData = { type: 'text', text: node.characters }

    return { data: parentNodeData, children: [{ children: [], data: childNodeData }] }
  }

  /**
   * Creates a tree node for container type.
   * @param node - The container node to process.
   * @param {string} css - CSS for the node.
   * @param {boolean} hasChildren - Flag indicating if the node has children.
   * @returns {UnoTreeNode} The generated tree node for the container.
   */
  private createContainerNode(node: SceneNode, css: string, hasChildren: boolean): UnoTreeNode {
    const data: ContainerNodeData = { type: 'container', css }
    const unoTreeNode: UnoTreeNode = { data, children: [] }

    if (hasChildren)
      this.addChildrenToNode(node as SceneNode & ChildrenMixin, unoTreeNode)

    return unoTreeNode
  }

  /**
   * Adds child nodes to the given tree node.
   * @param {ChildrenMixin & SceneNode} node - The parent node.
   * @param {UnoTreeNode} unoTreeNode - The tree node to add children to.
   */
  private addChildrenToNode(node: ChildrenMixin & SceneNode, unoTreeNode: UnoTreeNode): void {
    node.children
      .filter(child => child.visible)
      .forEach((child) => {
        const childTree = this.generate(child)
        if (childTree)
          unoTreeNode.children.push(childTree)
      })
  }
}

export default TreeGenerator
