export interface UnoTreeNode<T extends UnoTreeNodeData = UnoTreeNodeData> {
  data: T
  children: UnoTreeNode[]
}

export type UnoTreeNodeData =
  | ContainerNodeData
  | InstanceNodeData
  | IconNodeData
  | TextNodeData

export interface AbstractNodeData {
  type: string
}

export interface ContainerNodeData extends AbstractNodeData {
  type: 'container'
  css: string
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
