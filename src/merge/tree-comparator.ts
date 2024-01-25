import type { TreeNode } from '../interfaces'
import { zip } from '../utils'

/**
 * Class responsible for comparing tree structures.
 */
class TreeComparator {
  /**
   * Compares two trees to determine if they are identical.
   *
   * @param node1 The first tree to compare.
   * @param node2 The second tree to compare.
   * @returns boolean indicating if the two trees are identical.
   */
  public static isSameTree(node1: TreeNode | undefined, node2: TreeNode | undefined): boolean {
    if (!node1 && !node2)
      return true
    if (!node1 || !node2)
      return false

    if (node1.data.type !== node2.data.type || node1.children.length !== node2.children.length)
      return false

    for (const [child1, child2] of zip(node1.children, node2.children)) {
      if (!this.isSameTree(child1, child2))
        return false
    }

    return true
  }

  /**
   * Determines whether one tree is a subtree of another.
   *
   * @param mainTree The main tree to check in.
   * @param subTree The tree to check if it is a subtree.
   * @returns boolean indicating if subTree is a subtree of mainTree.
   */
  public static isSubtree(mainTree: TreeNode | undefined, subTree: TreeNode | undefined): boolean {
    if (!subTree)
      return true // An empty tree is a subtree of any tree
    if (!mainTree)
      return false // Non-empty subtree can't be found in an empty tree

    if (this.isSameTree(mainTree, subTree))
      return true

    return mainTree.children.some(child => this.isSubtree(child, subTree))
  }
}

export default TreeComparator
