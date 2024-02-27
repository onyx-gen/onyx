import type {
  ContainerNodeData,
  IconNodeData,
  InstanceNodeData,
  NodeCSSData,
  TextNodeData,
  TreeNode,
} from '../interfaces'
import { wrapInVariant } from '../css'
import AbstractTreeTraverser from './traverser'

class CssTraverser extends AbstractTreeTraverser {
  /**
   * @param {string} variant - The variant to initialize the instance with.
   */
  constructor(private variant: string) {
    super()
  }

  protected hookContainerNode(tree: TreeNode<ContainerNodeData>): TreeNode<ContainerNodeData> {
    if (tree.data.css)
      tree.data.css = this.wrapNodeCSSDataInVariant(tree.data.css)

    return tree
  }

  /**
   * Wraps the whole CSS data of a node in a variant.
   *
   * @param {NodeCSSData} css - The CSS data of a node.
   * @return {NodeCSSData} - The CSS data wrapped in a variant.
   */
  private wrapNodeCSSDataInVariant(css: NodeCSSData): NodeCSSData {
    return Object.fromEntries(
      Object.entries(css)
        .map(([key, value]) => {
          return [key, wrapInVariant(this.variant, value)]
        }),
    )
  }

  protected hookIconNode(tree: TreeNode<IconNodeData>): TreeNode<IconNodeData> {
    console.error('[CssTraverser] hookIconNode method not yet implemented', tree)
    return tree
  }

  protected hookInstanceNode(tree: TreeNode<InstanceNodeData>): TreeNode<InstanceNodeData> {
    console.error('[CssTraverser] hookInstanceNode method not yet implemented', tree)
    return tree
  }

  protected hookTextNode(tree: TreeNode<TextNodeData>): TreeNode<TextNodeData> {
    console.error('[CssTraverser] hookTextNode method not yet implemented', tree)
    return tree
  }
}

export default CssTraverser
