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
  constructor(private variant: string) {
    super()
  }

  protected hookContainerNode(tree: TreeNode<ContainerNodeData>): TreeNode<ContainerNodeData> {
    if (tree.data.css)
      tree.data.css = this.wrapNodeCSSDataInVariant(tree.data.css)

    return tree
  }

  private wrapNodeCSSDataInVariant(css: NodeCSSData) {
    return Object.fromEntries(
      Object.entries(css)
        .map(([key, value]) => {
          return [key, wrapInVariant(this.variant, value)]
        }),
    )
  }

  protected hookIconNode(tree: TreeNode<IconNodeData>): TreeNode<IconNodeData> {
    return tree
  }

  protected hookInstanceNode(tree: TreeNode<InstanceNodeData>): TreeNode<InstanceNodeData> {
    return tree
  }

  protected hookTextNode(tree: TreeNode<TextNodeData>): TreeNode<TextNodeData> {
    return tree
  }
}

export default CssTraverser
