import type { ContainerNodeData, TreeNode } from '../../interfaces'
import { appendToVariantCSS, wrapInVariant, wrapInVariants } from '../../css'
import AbstractTreeMerger from '../tree-merger'
import StateDataMerger from './state-data-merger'

class StateTreeMerger extends AbstractTreeMerger {
  constructor(
    private state: string, // e.g. 'default', 'hover', 'focus' or 'active'
    private previousStates: string[] = [],
  ) {
    const dataMerger = new StateDataMerger(state)
    super(dataMerger)
  }

  createConditionalContainerNode(node: TreeNode): TreeNode {
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

  createConflictContainerNode(node1: TreeNode, node2: TreeNode): TreeNode {
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

  diverge(tree1: TreeNode, tree2: TreeNode): TreeNode {
    const tree1Conditionals = [...(tree1.data.if || [])]
    const tree2Conditionals = [...(tree2.data.if || [])]

    if (tree1.data.type === 'container' && tree2.data.type === 'container') {
      tree1.data.css = appendToVariantCSS(tree1.data.css, 'hidden', this.state)
      tree2.data.css = appendToVariantCSS(tree2.data.css, 'hidden', this.previousStates)
    }
    else {
      // TODO MF: Implement
      console.error('Not a container (NOT YET IMPLEMENTED)')
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

  protected hookHasCss(mainTree: TreeNode<ContainerNodeData>): TreeNode {
    const hoverCss = wrapInVariant(this.state, mainTree.data.css)
    return {
      ...mainTree,
      data: {
        ...mainTree.data,
        type: 'container',
        css: hoverCss,
      },
    }
  }

  protected getSubtreeConditionals(mainTree: TreeNode): string[] {
    const mainData = mainTree.data
    return mainData.if ? [...mainData.if, this.state] : [this.state]
  }

  protected hookHasSubtreeChild(superTree: TreeNode) {
    if (superTree.data.type === 'container')
      superTree.data.css = wrapInVariants(this.previousStates, superTree.data.css)
    else
      console.error('hookHasSubtreeChild: Hook not implemented for non-container nodes')
  }

  protected hookHasNotSubtreeChild(superTree: TreeNode) {
    if (superTree.data.type === 'container')
      superTree.data.css = appendToVariantCSS(superTree.data.css, 'hidden', this.state)
    else
      console.error('hookHasNotSubtreeChild: Hook not implemented for non-container nodes')
  }
}

export default StateTreeMerger
