import type { ContainerNodeData, TreeNode } from '../../interfaces'
import { conditionalTree } from '../utils'
import AbstractTreeMerger from './../tree-merger'
import VariantDataMerger from './variant-data-merger'

class VariantTreeMerger extends AbstractTreeMerger {
  constructor(
    // For example: `variant-primary`, `variant-secondary` or `selected-true`, `selected-false`
    private readonly variant: string,
  ) {
    console.log('Constructed VariantTreeMerger', { variant })
    const dataMerger = new VariantDataMerger(variant)
    super(dataMerger)
  }

  protected diverge(tree1: TreeNode, tree2: TreeNode): TreeNode {
    return {
      data: {
        type: 'container',
      },
      children: [
        conditionalTree(tree1, `!${this.variant}`),
        conditionalTree(tree2, this.variant),
      ],
    }
  }

  protected createConflictContainerNode(node1: TreeNode, node2: TreeNode): TreeNode {
    console.error('createConflictContainerNode method not yet implemented.', { node1, node2 })
    return node1
  }

  protected createConditionalContainerNode(node: TreeNode): TreeNode {
    console.error('createConditionalContainerNode method not yet implemented.', { node })
    return node
  }

  protected hookHasSubtreeChild(superTree: TreeNode): void {
    console.error('hookHasSubtreeChild method not yet implemented.', { superTree })
  }

  protected hookHasNotSubtreeChild(superTree: TreeNode): void {
    console.error('hookHasNotSubtreeChild method not yet implemented.', { superTree })
  }

  protected hookHasCss(mainTree: TreeNode<ContainerNodeData>): TreeNode {
    console.error('hookHasCss method not yet implemented.', { mainTree })
    return mainTree
  }

  protected getSubtreeConditionals(mainTree: TreeNode): string[] {
    console.error('getSubtreeConditionals method not yet implemented.', { mainTree })
    return []
  }
}

export default VariantTreeMerger
