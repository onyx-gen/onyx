import { hexToRGB } from '../../src/builder/utils'
import type { Properties } from '../../src/tokens/properties'
import type { INodeFactory } from './types'

class MinimalFillsMixinFactory implements INodeFactory<SceneNode & MinimalFillsMixin> {
  private color: RGB = { r: 1, g: 1, b: 1 }

  public setColor(color: RGB): this
  public setColor(color: string): this
  public setColor(color: RGB | string): this {
    if (typeof color === 'string') {
      // Convert hex string to RGB object
      this.color = hexToRGB(color, true)
    }
    else {
      this.color = color
    }
    return this
  }

  private tokens: Map<Properties, string> = new Map()

  public addToken(tokenName: Properties, tokenValue: string): this {
    this.tokens.set(tokenName, tokenValue)
    return this
  }

  create(): SceneNode & MinimalFillsMixin {
    return {
      type: 'FRAME',
      fills: [
        {
          type: 'SOLID',
          color: this.color,
        },
      ],
      getSharedPluginData: (namespace: 'tokens', key: Properties) => {
        return ` ${this.tokens.get(key) ?? ''} `
      },
    } as unknown as FrameNode & MinimalFillsMixin
  }
}

export default MinimalFillsMixinFactory
