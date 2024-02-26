import { cloneDeep } from 'lodash-es'
import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, TreeNode } from '../interfaces'
import type { ITreeTraverser } from './types'

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

  private traverseContainerNode(tree: TreeNode<ContainerNodeData>): TreeNode<ContainerNodeData> {
    tree.children = tree.children.map(child => this.traverse(child))
    return this.hookContainerNode(tree)
  }

  private traverseTextNode(tree: TreeNode<TextNodeData>): TreeNode<TextNodeData> {
    tree.children = tree.children.map(child => this.traverse(child))
    return this.hookTextNode(tree)
  }

  private traverseInstanceNode(tree: TreeNode<InstanceNodeData>): TreeNode<InstanceNodeData> {
    tree.children = tree.children.map(child => this.traverse(child))
    return this.hookInstanceNode(tree)
  }

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
