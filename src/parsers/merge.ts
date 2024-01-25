import type {
  ContainerNodeData,
  IconNodeData,
  InstanceNodeData,
  TextNodeData,
  TreeNode,
  TreeNodeData,
} from '../interfaces'
import { difference } from '../set/utils'
import { zip } from '../utils'

/**
 * Class responsible for merging two tree structures.
 * The merging logic is based on the type of the nodes and their respective data.
 */
class TreeMerger {
  constructor(private state: string) {}

  /**
   * Merges two TreeNode structures into one.
   *
   * @param tree1 The first TreeNode to merge.
   * @param tree2 The second TreeNode to merge.
   * @returns TreeNode representing the merged result of tree1 and tree2.
   */
  public merge(tree1: TreeNode, tree2: TreeNode): TreeNode {
    if (!this.isSameTree(tree1, tree2)) {
      // Check if tree1 is a subtree of tree2
      if (this.isSubtree(tree2, tree1))
        return this.mergeSubtree(tree1, tree2)

      // Check if tree2 is a subtree of tree1
      else if (this.isSubtree(tree1, tree2))
        return this.mergeSupertree(tree1, tree2)
    }

    return this.mergeNodes(tree1, tree2)
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
    if (this.isSameTree(subTree, superTree))
      return this.mergeNodes(superTree, subTree)

    const superChildren = superTree.children

    superTree.children = superChildren.map(child =>
      this.mergeSupertree(child, subTree),
    )

    const hasSubtreeChild = superChildren.some(child => this.isSameTree(child, subTree))
    const hasSupertreeChild = superChildren.some(child => !this.isSameTree(child, subTree))

    const conditionals = []

    if (hasSubtreeChild && hasSupertreeChild)
      conditionals.push('case1')
    else if (!hasSubtreeChild && hasSupertreeChild)
      conditionals.push(`!${this.state}`)

    return { ...superTree, data: { ...superTree.data, if: conditionals } }
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
    if (this.isSameTree(mainTree, subTree))
      return this.mergeNodes(subTree, mainTree)

    const mainData = mainTree.data

    const extendedConditionals = mainData.if ? [...mainData.if, this.state] : [this.state]

    const hasSubtreeChild = mainTree.children.some(child => this.isSameTree(child, subTree))
    if (!hasSubtreeChild)
      return { ...mainTree, data: { ...mainData, if: extendedConditionals } }

    mainTree.children = mainTree.children.map(child =>
      this.mergeSubtree(subTree, child, !hasSubtreeChild),
    )

    const conditionals = hasSubtreeSibling || !hasSubtreeChild ? extendedConditionals : []

    if ('css' in mainData && mainData.css.size > 0) {
      const hoverCss = this.composeVariantCss(this.state, mainData.css)
      return {
        ...mainTree,
        data: {
          ...mainData,
          type: 'container',
          css: new Set([hoverCss]),
          if: conditionals,
        },
      }
    }

    return { ...mainTree, data: { ...mainData, if: conditionals } }
  }

  /**
   * Composes a variant CSS string from the given CSS set.
   *
   * @param variant - The variant to compose the CSS string for (e.g. 'hover' or 'focus').
   * @param cssSet - The set of CSS styles.
   * @returns {string} - The composed hover CSS string.
   */
  private composeVariantCss(variant: string, cssSet: Set<string>): string {
    const showParentheses = cssSet.size > 1
    return `${variant}:${showParentheses ? '(' : ''}${[...cssSet.values()].join(' ')}${showParentheses ? ')' : ''}`
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
    const mergedData = this.mergeData(node1.data, node2.data)

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
        css: new Set(),
      },
      children: [
        { ...node1, data: { ...node1.data } },
        { ...node2, data: { ...node2.data, if: [`${this.state}-conflict`] } },
      ],
    }
  }

  private createConditionalContainerNode(node: TreeNode): TreeNode {
    console.log('Creating conditional container node', node)

    const parentTreeNode: TreeNode = {
      data: {
        type: 'container',
        css: new Set(),
        if: [this.state],
      },
      children: [node],
    }

    return {
      data: {
        type: 'container',
        css: new Set(),
      },
      children: [parentTreeNode],
    }
  }

  /**
   * Merges the data of two TreeNodeData objects.
   *
   * @param data1 The first TreeNodeData to merge.
   * @param data2 The second TreeNodeData to merge.
   * @returns TreeNodeData representing the merged result of data1 and data2.
   */
  private mergeData(data1: TreeNodeData, data2: TreeNodeData): TreeNodeData {
    // Merge based on the type of TreeNodeData
    switch (data1.type) {
      case 'container':
        return this.mergeContainerData(data1, data2 as ContainerNodeData)
      case 'text':
        return this.mergeTextData(data1, data2 as TextNodeData)
      case 'instance':
        return this.mergeInstanceData(data1, data2 as InstanceNodeData)
      case 'icon':
        return this.mergeIconData(data1, data2 as IconNodeData)
      default:
        throw new Error('Unsupported data type')
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

  /**
   * Merges ContainerNodeData objects.
   *
   * @param data1 The first ContainerNodeData to merge.
   * @param data2 The second ContainerNodeData to merge.
   * @returns ContainerNodeData representing the merged result.
   */
  private mergeContainerData(data1: ContainerNodeData, data2: ContainerNodeData): ContainerNodeData {
    if (data1.css !== data2.css) {
      const cssDiff = difference(data2.css, data1.css)

      // No difference so return data1
      if (cssDiff.size === 0)
        return data1

      const hoverCss = this.composeVariantCss(this.state, data1.css)

      return {
        type: 'container',
        css: new Set([...data1.css, hoverCss]),
      }
    }
    else {
      return data1
    }
  }

  /**
   * Merges TextNodeData objects.
   *
   * @param data1 The first TextNodeData to merge.
   * @param data2 The second TextNodeData to merge.
   * @returns TextNodeData representing the merged result.
   */
  private mergeTextData(data1: TextNodeData, data2: TextNodeData): TextNodeData {
    if (data1.text !== data2.text) {
      // Example: Concatenate text
      return {
        type: 'text',
        text: `text1(${data1.text}) text2(${data2.text})`,
      }
    }
    else {
      return data1
    }
  }

  /**
   * Merges InstanceNodeData objects.
   *
   * @param data1 The first InstanceNodeData to merge.
   * @param data2 The second InstanceNodeData to merge.
   * @returns InstanceNodeData representing the merged result.
   */
  private mergeInstanceData(data1: InstanceNodeData, data2: InstanceNodeData): InstanceNodeData {
    // TODO MF
    console.error('Merging Instance Data (NOT YET IMPLEMENTED)', data1, data2)
    return data1
  }

  /**
   * Merges IconNodeData objects.
   *
   * @param data1 The first IconNodeData to merge.
   * @param data2 The second IconNodeData to merge.
   * @returns IconNodeData representing the merged result.
   */
  private mergeIconData(data1: IconNodeData, data2: IconNodeData): IconNodeData {
    // TODO MF
    console.log('Merging Icon Data (NOT YET IMPLEMENTED)', data1, data2)
    return data1
  }

  /**
   * Determines whether one tree is a subtree of another.
   *
   * @param mainTree The main tree to check in.
   * @param subTree The tree to check if it is a subtree.
   * @returns boolean indicating if subTree is a subtree of mainTree.
   */
  private isSubtree(mainTree: TreeNode | undefined, subTree: TreeNode | undefined): boolean {
    if (!subTree)
      return true // An empty tree is a subtree of any tree
    if (!mainTree)
      return false // Non-empty subtree can't be found in an empty tree

    if (this.isSameTree(mainTree, subTree))
      return true

    return this.isSubtree(mainTree.children[0], subTree) || this.isSubtree(mainTree.children[1], subTree)
  }

  /**
   * Compares two trees to determine if they are identical.
   *
   * @param node1 The first tree to compare.
   * @param node2 The second tree to compare.
   * @returns boolean indicating if the two trees are identical.
   */
  private isSameTree(node1: TreeNode | undefined, node2: TreeNode | undefined): boolean {
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
}

export default TreeMerger
