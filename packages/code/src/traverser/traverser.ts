import { cloneDeep } from 'lodash-es'
import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, TreeNode } from '../interfaces'
import type { ITreeTraverser } from './types'

/**
 * Abstract class representing a tree traverser.
 *
 * This class provides a default implementation for the traverse method, which
 * traverses the tree based on the type of TreeNodeData and calls the appropriate
 * hook method for each node type.
 *
 * @abstract
 * @implements {ITreeTraverser}
 */
abstract class AbstractTreeTraverser implements ITreeTraverser {
  public traverse(_tree: TreeNode): TreeNode {
    const tree = cloneDeep(_tree)

    // Traverse based on the type of TreeNodeData
    switch (tree.data.type) {
      case 'container':
        return this.traverseContainerNode(tree as TreeNode<ContainerNodeData>)
      case 'text':
        return this.traverseTextNode(tree as TreeNode<TextNodeData>)
      case 'instance':
        return this.traverseInstanceNode(tree as TreeNode<InstanceNodeData>)
      case 'icon':
        return this.traverseIconNode(tree as TreeNode<IconNodeData>)
      default:
        console.error('[TreeTraverser] Unsupported tree data type:', tree)
        throw new Error('Unsupported data type')
    }
  }

  /**
   * Traverses the given container node tree and updates each node by invoking a hook function.
   *
   * @param {TreeNode<ContainerNodeData>} tree - The container node to traverse.
   * @return {TreeNode<ContainerNodeData>} - The traversed container node.
   */
  private traverseContainerNode(tree: TreeNode<ContainerNodeData>): TreeNode<ContainerNodeData> {
    tree.children = tree.children.map(child => this.traverse(child))
    return this.hookContainerNode(tree)
  }

  /**
   * Traverses the given icon text tree and updates each node by invoking a hook function.
   *
   * @param {TreeNode<TextNodeData>} tree - The tree to traverse.
   * @return {TreeNode<TextNodeData>} - The updated tree after traversal.
   */
  private traverseTextNode(tree: TreeNode<TextNodeData>): TreeNode<TextNodeData> {
    tree.children = tree.children.map(child => this.traverse(child))
    return this.hookTextNode(tree)
  }

  /**
   * Traverses the given instance node tree and updates each node by invoking a hook function.
   *
   * @param {TreeNode<InstanceNodeData>} tree - The root node of the instance node tree.
   * @return {TreeNode<InstanceNodeData>} - The modified root node of the instance node tree.
   */
  private traverseInstanceNode(tree: TreeNode<InstanceNodeData>): TreeNode<InstanceNodeData> {
    tree.children = tree.children.map(child => this.traverse(child))
    return this.hookInstanceNode(tree)
  }

  /**
   * Traverses the given icon node tree and updates each node by invoking a hook function.
   *
   * @param {TreeNode<IconNodeData>} tree - The root node of the icon node tree.
   * @returns {TreeNode<IconNodeData>} - The updated root node of the icon node tree.
   */
  private traverseIconNode(tree: TreeNode<IconNodeData>): TreeNode<IconNodeData> {
    tree.children = tree.children.map(child => this.traverse(child))
    return this.hookIconNode(tree)
  }

  protected abstract hookContainerNode(tree: TreeNode<ContainerNodeData>): TreeNode<ContainerNodeData>

  protected abstract hookTextNode(tree: TreeNode<TextNodeData>): TreeNode<TextNodeData>

  protected abstract hookInstanceNode(tree: TreeNode<InstanceNodeData>): TreeNode<InstanceNodeData>

  protected abstract hookIconNode(tree: TreeNode<IconNodeData>): TreeNode<IconNodeData>
}

export default AbstractTreeTraverser
