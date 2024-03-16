export interface INodeFactory<T extends SceneNode> {
  create: () => T
}
