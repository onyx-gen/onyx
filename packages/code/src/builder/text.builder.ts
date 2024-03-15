import type { Configuration } from '../config/config'
import { Properties } from '../tokens/properties'
import { Log } from '../decoratos/log'
import type { GenericUtilityValue, IBuilder } from './types'
import { getToken, hasToken } from './utils'
import { getUtilityClass, translateUtilityValue } from './inference/utility'
import { createDimensionHandler } from './inference/dimension'
import { isNonResizableTextMixin } from './mixins'

/**
 * A builder for text nodes.
 */
@Log
class TextBuilder implements IBuilder {
  private attributes: Set<string> = new Set()

  constructor(private readonly config: Configuration) {}

  build(node: SceneNode): Set<string> {
    if (isNonResizableTextMixin(node))
      this.buildNonResizableTextMixin(node)

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

  /**
   * Processes the font name of the given node and collects CSS attributes.
   * @param node - The scene node with a font name to process.
   * @private
   */
  private buildFontName(node: SceneNode & NonResizableTextMixin) {
    const { fontName } = node

    if (fontName === figma.mixed)
      console.error('[Builder] Mixed font names are not supported yet.')
    else
      console.error('[Builder] Font names are not supported yet.')
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
      if (lineHeight.unit === 'PIXELS') {
        const value = lineHeight.value

        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.letterSpacing,
          'leading',
          value,
          createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit),
          this.config.mode,
        )

        this.attributes.add(utilityClass)
      }
      else {
        console.error('[Builder] Only pixel line heights are supported yet.')
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
