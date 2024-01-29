export interface TreeNode<T extends TreeNodeData = TreeNodeData> {
  data: T
  children: TreeNode[]
}

export type TreeNodeData =
  | ContainerNodeData
  | InstanceNodeData
  | IconNodeData
  | TextNodeData

export interface ContainerNodeCSSData {
  [key: string]: VariantCSS
}

export interface AbstractNodeData {
  type: string
  if?: string[]
}

export interface VariantCSS {
  variant?: string
  css: (VariantCSS | Set<string>)[]
}

export interface ContainerNodeData extends AbstractNodeData {
  type: 'container'
  css?: ContainerNodeCSSData
}

export interface TextNodeData extends AbstractNodeData {
  type: 'text'
  text: string
}

export interface InstanceNodeData extends AbstractNodeData {
  type: 'instance'
  name: string
  props: ComponentProperties
}

export interface IconNodeData extends AbstractNodeData {
  type: 'icon'
  name: string
}
