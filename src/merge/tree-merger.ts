import type { ContainerNodeData, TreeNode } from '../interfaces'
import type { IDataMerger, ITreeMerger } from './types'
import TreeComparator from './tree-comparator'

abstract class AbstractTreeMerger implements ITreeMerger {
  protected constructor(
    private readonly dataMerger: IDataMerger,
  ) {}

  /**
   * Merges two TreeNode structures into one.
   *
   * @param tree1 The first TreeNode to merge.
   * @param tree2 The second TreeNode to merge.
   * @returns TreeNode representing the merged result of tree1 and tree2.
   */
  public merge(tree1: TreeNode, tree2: TreeNode): TreeNode {
    if (!TreeComparator.isSameTree(tree1, tree2)) {
      // Check if tree1 is a subtree of tree2
      if (TreeComparator.isSubtree(tree2, tree1))
        return this.mergeSubtree(tree1, tree2)

      // Check if tree2 is a subtree of tree1
      if (TreeComparator.isSubtree(tree1, tree2))
        return this.mergeSupertree(tree1, tree2)

      return this.diverge(tree1, tree2)
    }

    return this.mergeNodes(tree1, tree2)
  }

  /**
   * Diverges two TreeNode structures when they are not identical nor subtrees of each other.
   *
   * This method handles the scenario where two TreeNode structures need to be merged, but they
   * neither represent the same tree nor is one a subtree of the other. It performs a conditional
   * merge based on the state of the TreeMerger object. If the conditional mode is active, it
   * applies conditions to the merged tree nodes based on the current state. Otherwise, it checks
   * for container type nodes and applies CSS for visible and hidden states. This method ensures
   * that the diverged trees are visually represented in the merged structure, preserving their
   * unique characteristics while combining them into a single TreeNode.
   *
   * @param tree1 The first TreeNode to be diverged.
   * @param tree2 The second TreeNode to be diverged.
   * @returns TreeNode representing the diverged structure of tree1 and tree2.
   */
  protected abstract diverge(tree1: TreeNode, tree2: TreeNode): TreeNode

  /**
   * Merges a subtree into a main tree at the matching node.
   *
   * @param subTree - The subtree to be merged.
   * @param mainTree - The main tree where the subtree will be merged.
   * @param hasSubtreeSibling - Whether the main tree has a sibling that is the same as the subtree.
   * @returns {TreeNode} - The main tree with the subtree merged at the appropriate node.
   */
  private mergeSubtree(
    subTree: TreeNode,
    mainTree: TreeNode,
    hasSubtreeSibling: boolean = false,
  ): TreeNode {
    if (TreeComparator.isSameTree(mainTree, subTree))
      return this.mergeNodes(subTree, mainTree)

    const mainData = mainTree.data
    const extendedConditionals = this.getSubtreeConditionals(mainTree)

    const hasSubtreeChild = mainTree.children.some(child => TreeComparator.isSameTree(child, subTree))
    if (!hasSubtreeChild)
      return { ...mainTree, data: { ...mainData, if: extendedConditionals } }

    mainTree.children = mainTree.children.map(child =>
      this.mergeSubtree(subTree, child, !hasSubtreeChild),
    )

    mainTree.data.if = hasSubtreeSibling || !hasSubtreeChild ? extendedConditionals : []

    if ('css' in mainData)
      this.hookHasCss(mainTree as TreeNode<ContainerNodeData>)

    return mainTree
  }

  /**
   * Merges a subtree into a supertree by recursively comparing and combining their nodes.
   *
   * This method traverses the `superTree` and `subTree`, merging them based on node similarities.
   *
   * @param superTree - The primary tree node into which the `subTree` is being merged.
   * @param subTree - The secondary tree node that is being merged into the `superTree`.
   * @returns TreeNode - The resulting tree after merging `subTree` into `superTree`.
   */
  private mergeSupertree(
    superTree: TreeNode,
    subTree: TreeNode,
  ): TreeNode {
    if (TreeComparator.isSameTree(subTree, superTree))
      return this.mergeNodes(superTree, subTree)

    const superChildren = superTree.children

    superTree.children = superChildren.map(child =>
      this.mergeSupertree(child, subTree),
    )

    const hasSubtreeChild = superChildren.some(child => TreeComparator.isSameTree(child, subTree))
    const hasSupertreeChild = superChildren.some(child => !TreeComparator.isSameTree(child, subTree))

    if (!hasSubtreeChild && hasSupertreeChild)
      this.hookHasNotSubtreeChild(superTree)

    if (hasSubtreeChild && hasSupertreeChild)
      this.hookHasSubtreeChild(superTree)

    return superTree
  }

  /**
   * Merges two TreeNode objects into a single TreeNode.
   * If both nodes are present and of the same type, their data and children are merged.
   * In case of a type conflict (nodes of different types), a new container node is created
   * with both nodes as children to represent the conflict visually.
   * If one of the nodes is missing, the other node is returned as is.
   *
   * @param node1 The first TreeNode to merge. Can be undefined if the node does not exist in the first tree.
   * @param node2 The second TreeNode to merge. Can be undefined if the node does not exist in the second tree.
   * @returns A merged TreeNode. In case of a conflict, a container node with both nodes as children is returned.
   *          If one node is undefined, the other node is returned.
   */
  private mergeNodes(node1: TreeNode | undefined, node2: TreeNode | undefined): TreeNode {
    if (!node1 && !node2)
      throw new Error('Both nodes are undefined')

    // Handle the case where either of the nodes is missing
    if (!node1)
      return this.createConditionalContainerNode(node2!)
    if (!node2)
      return node1!

    // Check for type conflict
    if (node1.data.type !== node2.data.type) {
      console.warn(`Type conflict at node: ${node1.data.type} vs ${node2.data.type}. Creating a container node.`)
      // Create a container node with both nodes as children to visualize the conflict
      return this.createConflictContainerNode(node1, node2)
    }

    // Assuming similar structure, merge TreeNodeData
    const mergedData = this.dataMerger.merge(node1.data, node2.data)

    // Merge children
    const children = this.mergeChildren(node1.children, node2.children)

    return { data: mergedData, children }
  }

  /**
   * Creates a container TreeNode to handle conflicting nodes.
   * This method is used when two nodes being merged have different types,
   * indicating a conflict in the tree structure. A new container node
   * is created with both conflicting nodes as its children, allowing
   * for easy identification and resolution of these conflicts.
   *
   * @param node1 The first TreeNode involved in the conflict.
   * @param node2 The second TreeNode involved in the conflict.
   * @returns A new TreeNode of the container type, containing both node1 and node2 as children.
   */
  protected abstract createConflictContainerNode(node1: TreeNode, node2: TreeNode): TreeNode

  /**
   * Creates a conditional container TreeNode. This method wraps a given TreeNode in a new
   * container node that includes a conditional state. The conditional state is applied to
   * the outer container, while the inner node retains its original structure. This is useful
   * for creating nodes that should only be displayed on the state that the node to merge
   * is currently in (i.e., `this.state`).
   *
   * @param node The TreeNode to be wrapped in the conditional container.
   * @returns TreeNode The new conditional container node with the original node as its child.
   */
  protected abstract createConditionalContainerNode(node: TreeNode): TreeNode

  /**
   * Merges the children arrays of two TreeNode objects.
   *
   * @param children1 The first array of TreeNode children to merge.
   * @param children2 The second array of TreeNode children to merge.
   * @returns Array of TreeNode representing the merged children.
   */
  private mergeChildren(children1: TreeNode[], children2: TreeNode[]): TreeNode[] {
    // Merge children arrays by corresponding positions
    const maxLength = Math.max(children1.length, children2.length)
    const mergedChildren: TreeNode[] = []
    for (let i = 0; i < maxLength; i++)
      mergedChildren.push(this.mergeNodes(children1[i], children2[i]))

    return mergedChildren
  }

  // TODO MF: Documentation
  protected abstract hookHasSubtreeChild(superTree: TreeNode): void

  // TODO MF: Documentation
  protected abstract hookHasNotSubtreeChild(superTree: TreeNode): void

  // TODO MF: Documentation
  protected abstract hookHasCss(mainTree: TreeNode<ContainerNodeData>): void

  // TODO MF: Documentation
  protected abstract getSubtreeConditionals(mainTree: TreeNode): string[]
}

export default AbstractTreeMerger
