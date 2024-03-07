class FrameNodeFactory {
  private children: SceneNode[] = []

  public addChild(child: SceneNode) {
    this.children.push(child)
    return this
  }

  public create() {
    return {
      type: 'FRAME',
      children: this.children,
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1 },
        },
      ],
      getSharedPluginData: () => '',
    } as unknown as FrameNode
  }
}

export default FrameNodeFactory
