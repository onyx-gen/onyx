import type { TreeNode, TreeNodeData } from '../interfaces'

/**
 * Tree mergers are objects that can merge two trees and return a new (merged) tree.
 */
export interface ITreeMerger {
  /**
   * Merges two trees into a single merged tree.
   *
   * @param {TreeNode} tree1 - The first tree to merge.
   * @param {TreeNode} tree2 - The second tree to merge.
   * @returns {TreeNode} - The merged tree.
   */
  merge: (tree1: TreeNode, tree2: TreeNode) => TreeNode
}

/**
 * Data mergers are objects that can merge two tree node data objects and return a new (merged) tree node data object.
 *
 * Data mergers might be used by tree mergers to merge the data of two tree nodes.
 */
export interface IDataMerger {
  /**
   * Merges two TreeNodeData objects into one TreeNodeData object.
   *
   * @param {TreeNodeData} data1 - The first TreeNodeData object to merge.
   * @param {TreeNodeData} data2 - The second TreeNodeData object to merge.
   * @return {TreeNodeData} - The merged TreeNodeData object.
   */
  merge: (data1: TreeNodeData, data2: TreeNodeData) => TreeNodeData
}
