import type { TreeNode } from '../interfaces'

class TreeMerger {
  public merge(tree1: TreeNode, tree2: TreeNode): TreeNode {
    return this.mergeNodes(tree1, tree2)
  }

  private mergeNodes(node1: TreeNode, node2: TreeNode): TreeNode {
    // TODO MF
    return node1
  }
}

export default TreeMerger
