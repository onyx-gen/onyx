import { hexToRGB } from '../../src/builder/utils'
import { createUncallableMock } from '../utils/mocks'
import type { INodeFactory } from './types'

interface IndividualStrokeWeights {
  top: number
  right: number
  bottom: number
  left: number
}

class MinimalFillsMixinFactory implements
  INodeFactory<
    & SceneNode
    & MinimalFillsMixin
    & MinimalStrokesMixin
  > {
  private color: RGB | null = null
  private strokeColor: RGB | null = null

  private strokeWeight: number | PluginAPI['mixed'] = 0
  private strokeWeights: IndividualStrokeWeights | null = null

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

  public setStrokeWeight(weight: number): this
  public setStrokeWeight(individualWeights: IndividualStrokeWeights): this
  public setStrokeWeight(weight: number | IndividualStrokeWeights): this {
    if (typeof weight === 'number') {
      this.strokeWeight = weight
    }
    else {
      this.strokeWeight = figma.mixed
      this.strokeWeights = weight
    }

    return this
  }

  public setStrokeColor(color: RGB): this
  public setStrokeColor(color: string): this
  public setStrokeColor(color: RGB | string): this {
    if (typeof color === 'string') {
      // Convert hex string to RGB object
      this.strokeColor = hexToRGB(color, true)
    }
    else {
      this.strokeColor = color
    }
    return this
  }

  private get minimalStrokesMixin(): MinimalStrokesMixin | IndividualStrokesMixin {
    const strokes: SolidPaint[] = []

    if (this.strokeColor !== null) {
      strokes.push({
        type: 'SOLID',
        color: this.strokeColor,
      })
    }

    return {
      strokeStyleId: 'todo',
      setStrokeStyleIdAsync: createUncallableMock(),
      strokes,
      strokeWeight: this.strokeWeight,
      strokeJoin: 'ROUND',
      strokeAlign: 'OUTSIDE',
      dashPattern: [],
      strokeGeometry: [],
    }
  }

  private get minimalFillsMixin(): MinimalFillsMixin {
    return {
      fillStyleId: 'todo',
      fills: this.fills,
      setFillStyleIdAsync: createUncallableMock(),
    }
  }

  private get fills(): readonly SolidPaint[] {
    if (this.color === null)
      return []

    return [
      {
        type: 'SOLID',
        color: this.color,
      },
    ]
  }

  create(): SceneNode & MinimalFillsMixin & MinimalStrokesMixin {
    return {
      type: 'FRAME',
      getSharedPluginData: () => '',

      ...this.minimalFillsMixin,
      ...this.minimalStrokesMixin,
    } as unknown as FrameNode & MinimalFillsMixin
  }
}

export default MinimalFillsMixinFactory
