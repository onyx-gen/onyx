import type { ContainerNodeData, TreeNode } from '../../interfaces'
import { conditionalTree, variantKey } from '../utils'
import type { VariantKey, VariantPermutation } from '../../set/types'
import AbstractTreeMerger from './../tree-merger'
import VariantDataMerger from './variant-data-merger'

class VariantTreeMerger extends AbstractTreeMerger {
  constructor(private readonly variantPermutation: VariantPermutation) {
    console.log('Constructed VariantTreeMerger', { variantPermutation })
    const dataMerger = new VariantDataMerger(variantPermutation)
    super(dataMerger)
  }

  private get variant(): VariantKey {
    return variantKey(this.variantPermutation)
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
    console.error('[VariantTreeMerger] createConflictContainerNode method not yet implemented.', { node1, node2 })
    return node1
  }

  protected createConditionalContainerNode(node: TreeNode): TreeNode {
    console.error('[VariantTreeMerger] createConditionalContainerNode method not yet implemented.', { node })
    return node
  }

  protected hookHasSubtreeChild(superTree: TreeNode): void {
    console.error('[VariantTreeMerger] hookHasSubtreeChild method not yet implemented.', { superTree })
  }

  protected hookHasNotSubtreeChild(superTree: TreeNode): void {
    console.error('[VariantTreeMerger] hookHasNotSubtreeChild method not yet implemented.', { superTree })
  }

  protected hookHasCss(mainTree: TreeNode<ContainerNodeData>): void {
    console.error('[VariantTreeMerger] hookHasCss method not yet implemented.', { mainTree })
  }

  protected getSubtreeConditionals(mainTree: TreeNode): string[] {
    console.error('[VariantTreeMerger] getSubtreeConditionals method not yet implemented.', { mainTree })
    return []
  }
}

export default VariantTreeMerger
