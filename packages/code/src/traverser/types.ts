import type { TreeNode } from '../interfaces'

export interface ITreeTraverser {
  traverse: (tree: TreeNode) => TreeNode
}
