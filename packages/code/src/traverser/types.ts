import type { TreeNode } from '../interfaces'

/**
 * Represents a tree traverser.
 *
 * A tree traverser is an object that can traverse a tree and return a new tree.
 */
export interface ITreeTraverser {
  traverse: (tree: TreeNode) => TreeNode
}
