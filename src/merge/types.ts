import type { TreeNode, TreeNodeData } from '../interfaces'

export interface ITreeMerger {
  merge(tree1: TreeNode, tree2: TreeNode): TreeNode
}

export interface IDataMerger {
  merge(data1: TreeNodeData, data2: TreeNodeData): TreeNodeData
}
