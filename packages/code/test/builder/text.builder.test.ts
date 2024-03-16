import { beforeEach, describe, expect, it } from 'vitest'
import { Configuration } from '../../src/config/config'
import TextBuilder from '../../src/builder/text.builder'
import TextNodeFactory from '../factories/text-node.factory'

describe('text builder', () => {
  const config: Configuration = new Configuration({})
  const textBuilder: TextBuilder = new TextBuilder(config)
  let nodeFactory: TextNodeFactory

  beforeEach(() => {
    nodeFactory = new TextNodeFactory()
  })

  it('handles font name correctly', () => {
    const textNode = nodeFactory
      .setCharacters('Test')
      .setFontName({ family: 'Arial', style: 'Regular' })
      .create()

    const attrs = textBuilder.build(textNode)
    expect(attrs).toContain(`font-Arial`)
  })

  it('adds utility class for letter spacing in pixels', () => {
    const textNode = nodeFactory
      .setCharacters('Test')
      .setLetterSpacing({ value: 4, unit: 'PIXELS' })
      .create()

    const attrs = textBuilder.build(textNode)
    expect(attrs).toContain('tracking-1') // Adjust the expected value based on actual implementation
  })

  it('handles zero line height', () => {
    const textNode = nodeFactory
      .setCharacters('Test')
      .setLineHeight({ value: 0, unit: 'PIXELS' })
      .create()

    const attrs = textBuilder.build(textNode)
    expect(attrs.size).toBe(0) // Assuming no attributes should be added for a line height of 0
  })
})
