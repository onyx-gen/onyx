import { beforeEach, describe, expect, it } from 'vitest'
import { Configuration } from '../../src/config/config'
import MinimalFillsMixinFactory from '../factories/minimal-fills-mixin.factory'
import FillsAndStrokesBuilder from '../../src/builder/fills-and-strokes.builder'

describe('fills and strokes builder', () => {
  let minimalFillsMixinFactory: MinimalFillsMixinFactory = new MinimalFillsMixinFactory()

  beforeEach(() => {
    minimalFillsMixinFactory = new MinimalFillsMixinFactory()
  })

  it('handles fills inference correctly', () => {
    const config: Configuration = new Configuration({})
    const fillsAndStrokesBuilder = new FillsAndStrokesBuilder(config)

    const node = minimalFillsMixinFactory.create()
    const attrs = fillsAndStrokesBuilder.build(node)
    expect(attrs).toContain(`bg-light-50`)
  })
})
