import { describe, expect, it } from 'vitest'
import FigmaNodeParser from '../src/parsers/figma-node.parser'
import { Configuration } from '../src/config/config'
import TextNodeFactory from './factories/text-node.factory'
import FrameNodeFactory from './factories/frame-node.factory'

describe('parsers', () => {
  const config = new Configuration({})

  it('should parse a file', async () => {
    const parser = new FigmaNodeParser({ default: 'default' }, config)

    const textNode: TextNode = new TextNodeFactory().setCharacters('Hello, World!').create()

    const frameNode: FrameNode = new FrameNodeFactory().addChild(textNode).create()

    const result = await parser.parse(frameNode)

    expect(result).toMatchSnapshot()
  })
})
