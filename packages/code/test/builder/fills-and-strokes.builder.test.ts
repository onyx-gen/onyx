import { beforeEach, describe, expect, it } from 'vitest'
import { Configuration } from '../../src/config/config'
import MinimalFillsMixinFactory from '../factories/minimal-fills-mixin.factory'
import FillsAndStrokesBuilder from '../../src/builder/fills-and-strokes.builder'
import { Properties } from '../../src/tokens/properties'
import { setTokens } from '../utils/tokens'

describe('fills and strokes builder', () => {
  let minimalFillsMixinFactory: MinimalFillsMixinFactory = new MinimalFillsMixinFactory()

  beforeEach(() => {
    minimalFillsMixinFactory = new MinimalFillsMixinFactory()
  })

  describe('buildMinimalFillsMixin', () => {
    it('computes fills utility class (inference)', () => {
      const config: Configuration = new Configuration({
        nearestInference: true,
      })
      const fillsAndStrokesBuilder = new FillsAndStrokesBuilder(config)

      const node = minimalFillsMixinFactory.create()
      const attrs = fillsAndStrokesBuilder.build(node)
      expect(attrs).toContain(`bg-light-50`)
    })

    it('computes fills utility class (arbitrary)', () => {
      const config: Configuration = new Configuration({
        nearestInference: false,
      })
      const fillsAndStrokesBuilder = new FillsAndStrokesBuilder(config)

      const color = '#ab12ef'

      const node = minimalFillsMixinFactory.setColor(color).create()
      const attrs = fillsAndStrokesBuilder.build(node)
      expect(attrs).toContain(`bg-[${color}]`)
    })

    it('computes fills utility class (variables)', () => {
      const config: Configuration = new Configuration({
        mode: 'variables',
      })
      const fillsAndStrokesBuilder = new FillsAndStrokesBuilder(config)

      const token = 'color-primary-500'

      const node = minimalFillsMixinFactory.create()

      setTokens(
        node,
        new Map([[Properties.fill, token]]),
      )

      const attrs = fillsAndStrokesBuilder.build(node)

      expect(attrs).toContain(`bg-$${token}`)
    })
  })

  describe('buildMinimalStrokesMixin', () => {
    describe('buildStrokeColor', () => {
      it('computes strokes utility class (inference)', () => {})

      it('computes strokes utility class (arbitrary)', () => {
        const config: Configuration = new Configuration({
          nearestInference: false,
        })
        const fillsAndStrokesBuilder = new FillsAndStrokesBuilder(config)

        const color = '#ab12ef'

        const node = minimalFillsMixinFactory.create()
        const attrs = fillsAndStrokesBuilder.build(node)
        expect(attrs).toContain(`border-color-[${color}]`)
      })

      it('computes strokes utility class (variables)', () => {})
    })

    describe('buildBorderWidth', () => {

    })
  })
})
