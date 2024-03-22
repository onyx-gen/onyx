import type { Configuration } from '../config/config'
import { Properties } from '../tokens/properties'
import { Log } from '../decoratos/log'
import type { GenericUtilityValue, IBuilder } from './types'
import { getToken, hasToken } from './utils'
import { getUtilityClass, translateUtilityValue } from './inference/utility'
import { createDimensionHandler } from './inference/dimension'
import { isNonResizableTextMixin, isTextNode } from './mixins'
import { createFontNameHandler } from './inference/font'
import { createLineHeightHandler } from './inference/line-height'

/**
 * A builder for text nodes.
 */
@Log
class TextBuilder implements IBuilder {
  private attributes: Set<string> = new Set()

  constructor(private readonly config: Configuration) {}

  build(node: SceneNode): Set<string> {
    this.attributes.clear()

    if (isNonResizableTextMixin(node))
      this.buildNonResizableTextMixin(node)

    if (isTextNode(node)) {
      this.buildSuperscriptTextNode(node)
      this.buildSubscriptTextNode(node)
      this.buildTextAlignHorizontal(node)
      this.buildTextAlignVertical(node)
    }

    return this.attributes
  }

  /**
   * Processes non-resizable text properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with non-resizable text properties to process.
   */
  private buildNonResizableTextMixin(node: SceneNode & NonResizableTextMixin) {
    const shouldUseTypographyCompositionToken = this.config.mode === 'variables' && hasToken(node, Properties.typography)

    if (shouldUseTypographyCompositionToken) {
      this.buildTypographyCompositionToken(node)
    }
    else {
      this.buildFontName(node)
      this.buildFontSize(node)
      this.buildLetterSpacing(node)
      this.buildLineHeight(node)
    }
  }

  private buildTextAlignHorizontal(node: TextNode) {
    const { textAlignHorizontal } = node

    if (textAlignHorizontal === 'LEFT')
      this.attributes.add('text-left') // TODO: Default can be hidden
    else if (textAlignHorizontal === 'CENTER')
      this.attributes.add('text-center')
    else if (textAlignHorizontal === 'RIGHT')
      this.attributes.add('text-right')
    else if (textAlignHorizontal === 'JUSTIFIED')
      this.attributes.add('text-justify')
  }

  private buildTextAlignVertical(node: TextNode) {
    const { textAlignVertical } = node

    if (textAlignVertical === 'TOP')
      this.attributes.add('align-top')
    else if (textAlignVertical === 'CENTER')
      this.attributes.add('align-middle')
    else if (textAlignVertical === 'BOTTOM')
      this.attributes.add('align-bottom')
  }

  private buildSuperscriptTextNode(node: TextNode) {
    if (this.isSuperScriptTextNode(node))
      this.attributes.add('superscript')
  }

  private buildSubscriptTextNode(node: TextNode) {
    if (this.isSubScriptTextNode(node))
      this.attributes.add('subscript')
  }

  /**
   * Checks if a given text node is a superscript text node.
   *
   * @param {TextNode} node - The text node to check.
   * @returns {boolean} - Returns true if the text node is a superscript text node, otherwise false.
   */
  private isSuperScriptTextNode(node: TextNode): boolean {
    // Get the OpenType features applied to the text in the node.
    const openTypeFeatures = node.getRangeOpenTypeFeatures(0, node.characters.length)

    // Check if there are any OpenType features applied.
    if (Object.keys(openTypeFeatures).length > 0) {
      // Check if the 'SUPS' (superscript) OpenType feature is applied.
      // @ts-expect-error: SUPS is not in the type definition
      if (openTypeFeatures.SUPS === true)
        return true
    }

    // If no 'SUPS' feature is found, return false.
    return false
  }

  /**
   * Checks if a given text node is a subscript text node.
   *
   * @param {TextNode} node - The text node to check.
   * @returns {boolean} - Returns true if the text node is a subtext text node, otherwise false.
   */
  private isSubScriptTextNode(node: TextNode): boolean {
    // Get the OpenType features applied to the text in the node.
    const openTypeFeatures = node.getRangeOpenTypeFeatures(0, node.characters.length)

    // Check if there are any OpenType features applied.
    if (Object.keys(openTypeFeatures).length > 0) {
      // Check if the 'SUBS' (superscript) OpenType feature is applied.
      // @ts-expect-error: SUBS is not in the type definition
      if (openTypeFeatures.SUBS === true)
        return true
    }

    // If no 'SUBS' feature is found, return false.
    return false
  }

  /**
   * Processes the font name of the given node and collects CSS attributes.
   * @param node - The scene node with a font name to process.
   * @private
   */
  private buildFontName(node: SceneNode & NonResizableTextMixin) {
    const { fontName } = node

    if (fontName === figma.mixed) {
      console.error('[Builder] Mixed font names are not supported yet.')
    }
    else {
      // TODO: Handle font family and font style from fontName value

      if (fontName.family === '')
        return

      const utilityClass = getUtilityClass(
        node,
        'font-name',
        Properties.fontFamilies,
        'font',
        fontName.family,
        createFontNameHandler(this.config.nearestInference),
        this.config.mode,
      )

      this.attributes.add(utilityClass)
    }
  }

  /**
   * Processes the font size of the given node and collects CSS attributes.
   * @param node - The scene node with a font size to process.
   * @private
   */
  private buildFontSize(node: SceneNode & NonResizableTextMixin) {
    const { fontSize } = node

    if (fontSize === figma.mixed) {
      console.error('[Builder] Mixed font sizes are not supported yet.')
    }
    else {
      if (fontSize === 0)
        return

      const utilityClass = getUtilityClass(
        node,
        'generic',
        Properties.fontSizes,
        'text',
        fontSize,
        createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit),
        this.config.mode,
      )

      this.attributes.add(utilityClass)
    }
  }

  /**
   * Processes the letter spacing of the given node and collects CSS attributes.
   * @param node - The scene node with a letter spacing to process.
   * @private
   */
  private buildLetterSpacing(node: SceneNode & NonResizableTextMixin) {
    const { letterSpacing } = node

    if (letterSpacing === figma.mixed) {
      console.error('[Builder] Mixed letter spacings are not supported yet.')
    }
    else {
      if (letterSpacing.unit === 'PIXELS') {
        const space = letterSpacing.value

        if (space === 0)
          return

        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.letterSpacing,
          'tracking',
          space,
          createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit),
          this.config.mode,
        )

        this.attributes.add(utilityClass)
      }
      else {
        console.error('[Builder] Only pixel letter spacings are supported yet.')
      }
    }
  }

  /**
   * Processes the line height of the given node and collects CSS attributes.
   * @param node - The scene node with a line height to process.
   * @private
   */
  private buildLineHeight(node: SceneNode & NonResizableTextMixin) {
    const { lineHeight } = node

    if (lineHeight === figma.mixed) {
      console.error('[Builder] Mixed line heights are not supported yet.')
    }
    else {
      if (lineHeight.unit === 'PIXELS' || lineHeight.unit === 'PERCENT') {
        const value = lineHeight.value

        if (value === 0)
          return

        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.letterSpacing,
          'leading',
          value,
          createLineHeightHandler(lineHeight.unit, this.config.dimensionsLookup, this.config.nearestInference, this.config.unit),
          this.config.mode,
        )

        this.attributes.add(utilityClass)
      }
      else {
        console.error('[Builder] Only pixel and percent line heights are supported yet.')
      }
    }
  }

  /**
   * Processes the typography composition token of the given node and collects CSS attributes.
   * @param node - The scene node with a typography composition token to process.
   * @private
   */
  private buildTypographyCompositionToken(node: SceneNode & NonResizableTextMixin) {
    const typographyToken = getToken(node, Properties.typography)!

    const utilityValue: GenericUtilityValue = {
      mode: 'variable',
      type: 'generic',
      value: typographyToken,
    }

    this.attributes.add(`font-${translateUtilityValue(utilityValue)}`)
  }
}

export default TextBuilder
