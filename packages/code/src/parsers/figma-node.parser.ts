import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, TreeNode } from '../interfaces'
import type { VariantKey, VariantPermutation } from '../set/types'
import { variantKey } from '../merge/utils'
import Builder from '../builder/builder'
import type { Configuration } from '../config/config'
import type { IBuilder } from '../builder/types'
import { Log } from '../decoratos/log'

/**
 * Class to generate a abstract tree structure from a Figma node.
 * The tree structure is used to generate HTML code.
 */
@Log
class FigmaNodeParser {
  constructor(
    private readonly variantPermutation: VariantPermutation = { default: 'default' },
    private readonly config: Configuration,
  ) {}

  /**
   * Returns the unique variant key based on the current permutation.
   *
   * @private
   * @returns {VariantKey} The variant key.
   */
  private get variant(): VariantKey {
    return variantKey(this.variantPermutation)
  }

  /**
   * Public method to initiate parsing of the Figma node and its subtree.
   * This method serves as the core of the tree traversal logic.
   * @param node - The Figma node to process.
   * @returns {TreeNode|null} The generated tree node, or null if not applicable.
   */
  public async parse(node: SceneNode): Promise<TreeNode | null> {
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
  private async parseInstanceNode(node: InstanceNode): Promise<TreeNode | null> {
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
  private async createIconNode(node: InstanceNode): Promise<TreeNode<IconNodeData>> {
    try {
      const mainComponent = await node.getMainComponentAsync()
      const iconName = mainComponent?.name

      const builder: IBuilder = new Builder(this.config)

      const css = builder.build(node)

      if (!iconName)
        console.warn('No icon name found for node', node)

      const outputNode: TreeNode<IconNodeData> = {
        children: [],
        data: {
          type: 'icon',
          name: iconName || '?',
        },
      }

      // Add CSS to the output node
      if (css.size > 0)
        outputNode.data.css = { [this.variant]: { css: [css] } }

      return outputNode
    }
    catch (e) {
      figma.notify('Not possible to create icon node')
      console.error('Not possible to create icon node', e)
      throw new Error('Not possible to create icon node')
    }
  }

  /**
   * Creates a tree node for instance type.
   * @param node - The instance node to process.
   * @returns {TreeNode} The generated tree node for the instance.
   */
  private createInstanceNode(node: InstanceNode): TreeNode<InstanceNodeData> | null {
    if (this.config.ignoredComponentInstances.includes(node.name))
      return null

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
  private async parseNode(node: SceneNode): Promise<TreeNode | null> {
    const builder: IBuilder = new Builder(this.config)
    const css = builder.build(node)
    const hasChildren = this.nodeHasChildren(node)

    // Skip leaf nodes with empty CSS
    if (!hasChildren && css.size === 0) {
      console.log('Skipping leaf with empty CSS')
      return null
    }

    return node.type === 'TEXT' ? this.createTextNode(node, css) : await this.createContainerNode(node, css, hasChildren)
  }

  /**
   * Checks if a given node has any children.
   *
   * @param {SceneNode} node - The node to check for children.
   * @return {boolean} - Returns true if the node has children, false otherwise.
   */
  private nodeHasChildren(node: SceneNode): boolean {
    return 'children' in node && node.children.length > 0
  }

  /**
   * Creates a tree node for text type.
   * @param node - The text node to process.
   * @param {string} css - CSS for the node.
   * @returns {TreeNode} The generated tree node for the text.
   */
  private createTextNode(node: TextNode, css: Set<string>): TreeNode {
    const parentNodeData: ContainerNodeData = {
      type: 'container',
      css: { [this.variant]: { css: [css] } },
    }

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
  private async createContainerNode(node: SceneNode, css: Set<string>, hasChildren: boolean): Promise<TreeNode> {
    const data: ContainerNodeData = {
      type: 'container',
      css: { [this.variant]: { css: [css] } },
    }
    const treeNode: TreeNode = { data, children: [] }

    if (hasChildren)
      await this.addChildrenToNode(node as SceneNode & ChildrenMixin, treeNode)

    return treeNode
  }

  /**
   * Adds child nodes to the given tree node.
   * @param {ChildrenMixin & SceneNode} node - The parent node.
   * @param {TreeNode} treeNode - The tree node to add children to.
   */
  private async addChildrenToNode(node: ChildrenMixin & SceneNode, treeNode: TreeNode): Promise<void> {
    const visibleChildren = node.children.filter(child => child.visible)

    for (const visibleChild of visibleChildren) {
      const childTree = await this.parse(visibleChild)
      if (childTree)
        treeNode.children.push(childTree)
    }
  }
}

export default FigmaNodeParser
