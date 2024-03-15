import type { Configuration } from '../config/config'
import { Properties } from '../tokens/properties'
import { Log } from '../decoratos/log'
import type { GenericUtilityValue, IBuilder } from './types'
import { getToken, hasToken } from './utils'
import { getUtilityClass, translateUtilityValue } from './inference/utility'
import { createDimensionHandler } from './inference/dimension'
import { isNonResizableTextMixin } from './mixins'

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
    const {
      fontName,
      fontSize,
      letterSpacing,
      lineHeight,
    } = node

    if (this.config.mode === 'variables' && hasToken(node, Properties.typography)) {
      const typographyToken = getToken(node, Properties.typography)!

      const utilityValue: GenericUtilityValue = {
        mode: 'variable',
        type: 'generic',
        value: typographyToken,
      }

      this.attributes.add(`font-${translateUtilityValue(utilityValue)}`)
    }
    else {
      if (fontName === figma.mixed)
        console.error('[Builder] Mixed font names are not supported yet.')
      else
        console.error('[Builder] Font names are not supported yet.')
      // TODO

      if (fontSize === figma.mixed) {
        console.error('[Builder] Mixed font sizes are not supported yet.')
      }
      else {
        console.log('this.config.nearestInference', this.config.nearestInference)
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
  }
}

export default TextBuilder
