import type { TreeNode } from '../interfaces'
import DataMerger from '../merge/data-merger'
import TreeComparator from '../merge/tree-comparator'
import { composeVariantCss, composeVariantsCss } from '../set/utils'
import { appendSetToVariantCSS, wrapInVariant, wrapInVariants } from '../css'

/**
 * Class responsible for merging two tree structures.
 * The merging logic is based on the type of the nodes and their respective data.
 */
class TreeMerger {
  private readonly dataMerger: DataMerger

  constructor(
    private state: string,
    private previousStates: string[] = [],
    private conditionalMode = false,
  ) {
    this.dataMerger = new DataMerger(state)
  }

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
  private diverge(tree1: TreeNode, tree2: TreeNode): TreeNode {
    const tree1Conditionals = [...(tree1.data.if || [])]
    const tree2Conditionals = [...(tree2.data.if || [])]

    if (this.conditionalMode) {
      tree1Conditionals.push(`!${this.state}`)
      tree2Conditionals.push(this.state)
    }
    else {
      if (tree1.data.type === 'container' && tree2.data.type === 'container') {
        // TODO MF: Optimize this
        const hiddenCssTree1 = composeVariantCss(this.state, new Set(['hidden']))
        tree1.data.css = appendSetToVariantCSS(tree1.data.css, new Set([hiddenCssTree1]))

        // TODO MF: Optimize this
        const hiddenCssTree2 = composeVariantsCss(this.previousStates, new Set(['hidden']))
        tree2.data.css = appendSetToVariantCSS(tree2.data.css, new Set([hiddenCssTree2]))
      }
      else {
        // TODO MF: Implement
        console.error('Not a container (NOT YET IMPLEMENTED)')
      }
    }

    return {
      data: {
        type: 'container',
      },
      children: [
        { ...tree1, data: { ...tree1.data, if: tree1Conditionals } },
        { ...tree2, data: { ...tree2.data, if: tree2Conditionals } },
      ],
    }
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

    const conditionals = []

    if (!hasSubtreeChild && hasSupertreeChild) {
      if (this.conditionalMode) {
        conditionals.push(this.previousStates.join(' || '))
      }
      else {
        if (superTree.data.type === 'container') {
          // TODO MF: optimize this
          const hiddenCss = composeVariantCss(this.state, new Set(['hidden']))
          superTree.data.css = appendSetToVariantCSS(superTree.data.css, new Set([hiddenCss]))
        }
        else {
          console.error('Not a container (NOT YET IMPLEMENTED)')
        }
      }
    }

    if (superTree.data.type === 'container') {
      if (hasSubtreeChild && hasSupertreeChild) {
        if (this.conditionalMode)
          conditionals.push(`!${this.state}`)

        else
          superTree.data.css = wrapInVariants(this.previousStates, superTree.data.css)
      }
    }
    else {
      console.error('Not a container (NOT YET IMPLEMENTED)')
    }

    return {
      ...superTree,
      data: {
        ...superTree.data,
        if: conditionals,
      },
    }
  }

  /**
   * Merges a subtree into a main tree at the matching node.
   *
   * @param subTree - The subtree to be merged.
   * @param mainTree - The main tree where the subtree will be merged.
   * @param hasSubtreeSibling - Indicates if the subtree has a sibling node. Defaults to false.
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

    const extendedConditionals = mainData.if ? [...mainData.if, this.state] : [this.state]

    const hasSubtreeChild = mainTree.children.some(child => TreeComparator.isSameTree(child, subTree))
    if (!hasSubtreeChild)
      return { ...mainTree, data: { ...mainData, if: extendedConditionals } }

    mainTree.children = mainTree.children.map(child =>
      this.mergeSubtree(subTree, child, !hasSubtreeChild),
    )

    const conditionals = hasSubtreeSibling || !hasSubtreeChild ? extendedConditionals : []

    // TODO MF: Optimize this and create a function that tests whether ContainerNodeData has CSS
    if ('css' in mainData && mainData.css && mainData.css.css.length > 0) {
      const hoverCss = wrapInVariant(this.state, mainData.css)
      return {
        ...mainTree,
        data: {
          ...mainData,
          type: 'container',
          css: hoverCss,
          if: conditionals,
        },
      }
    }

    return { ...mainTree, data: { ...mainData, if: conditionals } }
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
  private createConflictContainerNode(node1: TreeNode, node2: TreeNode): TreeNode {
    return {
      data: {
        type: 'container',
      },
      children: [
        { ...node1, data: { ...node1.data } },
        { ...node2, data: { ...node2.data, if: [this.state] } },
      ],
    }
  }

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
  private createConditionalContainerNode(node: TreeNode): TreeNode {
    const parentTreeNode: TreeNode = {
      data: {
        type: 'container',
        if: [this.state],
      },
      children: [node],
    }

    return {
      data: {
        type: 'container',
      },
      children: [parentTreeNode],
    }
  }

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
}

export default TreeMerger
