import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, TreeNode } from '../interfaces'
import { UnocssBuilder } from '../builder/unocss-builder'

/**
 * Class to generate a abstract tree structure from a Figma node.
 * The tree structure is used to generate HTML code.
 */
class FigmaNodeParser {
  /**
   * Public method to initiate parsing of the Figma node and its subtree.
   * This method serves as the core of the tree traversal logic.
   * @param node - The Figma node to process.
   * @returns {TreeNode|null} The generated tree node, or null if not applicable.
   */
  public parse(node: SceneNode): TreeNode | null {
    if (node.type === 'INSTANCE')
      return this.parseInstanceNode(node)
    else
      return this.parseNode(node)
  }

  /**
   * Parses nodes of type 'INSTANCE'.
   * @param node - The instance node to process.
   * @returns {TreeNode|null} The generated tree node, or null if not applicable.
   */
  private parseInstanceNode(node: InstanceNode): TreeNode | null {
    const isIcon = node.name === 'icon'
    if (isIcon)
      return this.createIconNode(node)
    else
      return this.createInstanceNode(node)
  }

  /**
   * Creates a tree node for icon type.
   * @param node - The icon node to process.
   * @returns {TreeNode} The generated tree node for the icon.
   */
  private createIconNode(node: InstanceNode): TreeNode<IconNodeData> {
    const iconName = node.mainComponent?.name

    if (!iconName)
      console.warn('No icon name found for node', node)

    return { children: [], data: { type: 'icon', name: iconName || '?' } }
  }

  /**
   * Creates a tree node for instance type.
   * @param node - The instance node to process.
   * @returns {TreeNode} The generated tree node for the instance.
   */
  private createInstanceNode(node: InstanceNode): TreeNode<InstanceNodeData> {
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
   * Parses nodes other than 'INSTANCE' type.
   * @param node - The node to process.
   * @returns {TreeNode|null} The generated tree node, or null if not applicable.
   */
  private parseNode(node: SceneNode): TreeNode | null {
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
   * @returns {TreeNode} The generated tree node for the text.
   */
  private createTextNode(node: TextNode, css: string): TreeNode {
    const parentNodeData: ContainerNodeData = { type: 'container', css }
    const childNodeData: TextNodeData = { type: 'text', text: node.characters }

    return { data: parentNodeData, children: [{ children: [], data: childNodeData }] }
  }

  /**
   * Creates a tree node for container type.
   * @param node - The container node to process.
   * @param {string} css - CSS for the node.
   * @param {boolean} hasChildren - Flag indicating if the node has children.
   * @returns {TreeNode} The generated tree node for the container.
   */
  private createContainerNode(node: SceneNode, css: string, hasChildren: boolean): TreeNode {
    const data: ContainerNodeData = { type: 'container', css }
    const treeNode: TreeNode = { data, children: [] }

    if (hasChildren)
      this.addChildrenToNode(node as SceneNode & ChildrenMixin, treeNode)

    return treeNode
  }

  /**
   * Adds child nodes to the given tree node.
   * @param {ChildrenMixin & SceneNode} node - The parent node.
   * @param {TreeNode} treeNode - The tree node to add children to.
   */
  private addChildrenToNode(node: ChildrenMixin & SceneNode, treeNode: TreeNode): void {
    node.children
      .filter(child => child.visible)
      .forEach((child) => {
        const childTree = this.parse(child)
        if (childTree)
          treeNode.children.push(childTree)
      })
  }
}

export default FigmaNodeParser
