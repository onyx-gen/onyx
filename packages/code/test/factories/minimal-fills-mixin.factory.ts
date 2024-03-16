import type { INodeFactory } from './types'

class MinimalFillsMixinFactory implements INodeFactory<SceneNode & MinimalFillsMixin> {
  create(): SceneNode & MinimalFillsMixin {
    return {
      type: 'FRAME',
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1 },
        },
      ],
      getSharedPluginData: () => '',
    } as unknown as FrameNode & MinimalFillsMixin
  }
}

export default MinimalFillsMixinFactory
