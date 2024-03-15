import { Properties } from '../tokens/properties'
import type { Configuration } from '../config/config'
import { Log } from '../decoratos/log'
import type { IBuilder } from './types'
import { isIndividualStrokesMixin, isMinimalFillsMixin, isMinimalStrokesMixin } from './mixins'
import { createColorHandler } from './inference/color'
import {
  type TokenPropertyUtilityClassPrefixMap,
  getUtilityClass,
  getUtilityClassForSides,
} from './inference/utility'
import { createDimensionHandler } from './inference/dimension'

@Log
class FillsAndStrokesBuilder implements IBuilder {
  private attributes: Set<string> = new Set()

  constructor(private readonly config: Configuration) {}

  /**
   * Builds CSS attributes for the given node.
   * @param node
   */
  build(node: SceneNode): Set<string> {
    if (isMinimalFillsMixin(node))
      this.buildMinimalFillsMixin(node)

    if (isMinimalStrokesMixin(node))
      this.buildMinimalStrokesMixin(node)

    return this.attributes
  }

  /**
   * Processes minimal fills properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with minimal fills properties to process.
   */
  private buildMinimalFillsMixin(node: SceneNode & MinimalFillsMixin) {
    const fills = node.fills
    if (Array.isArray(fills) && fills.length > 0) {
      if (fills.length === 1) {
        const fill = fills[0]
        if (fill.type === 'SOLID') {
          const colorHandler = createColorHandler(this.config.colorLookup, this.config.nearestInference)

          const utilityClass = getUtilityClass(
            node,
            'color',
            Properties.fill,
            'bg',
            fill,
            colorHandler,
            this.config.mode,
          )
          this.attributes.add(utilityClass)
        }
        else { console.error('[Builder] Only solid fills are supported yet.') }
      }
      else {
        console.error('[Builder] Multiple fills are not supported yet.')
      }
    }
  }

  /**
   * Processes minimal strokes properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with minimal strokes properties to process.
   */
  private buildMinimalStrokesMixin(node: SceneNode & MinimalStrokesMixin) {
    const {
      strokes,
      strokeWeight,
    } = node

    if (Array.isArray(strokes) && strokes.length > 0) {
      if (strokes.length === 1) {
        const stroke: Paint = strokes[0]
        if (stroke.type === 'SOLID') {
          const colorHandler = createColorHandler(this.config.colorLookup, this.config.nearestInference)

          const utilityClass = getUtilityClass(
            node,
            'color',
            Properties.borderColor,
            'border-color',
            stroke,
            colorHandler,
            this.config.mode,
          )
          this.attributes.add(utilityClass)
        }
        else { console.error('[Builder] Only solid strokes are supported yet.') }
      }
      else {
        console.error('[Builder] Multiple strokes are not supported yet.')
      }

      if (strokeWeight !== figma.mixed) {
        const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.borderWidth,
          'border',
          strokeWeight,
          dimensionHandler,
          this.config.mode,
        )

        this.attributes.add(utilityClass)
      }
      else if (isIndividualStrokesMixin(node)) {
        this.buildIndividualStrokesMixin(node)
      }
    }
  }

  /**
   * Processes individual strokes properties of the given node and collects CSS attributes.
   * @param node - The scene node with individual strokes properties to process.
   * @private
   */
  private buildIndividualStrokesMixin(node: SceneNode & IndividualStrokesMixin) {
    const {
      strokeTopWeight,
      strokeBottomWeight,
      strokeLeftWeight,
      strokeRightWeight,
    } = node

    const hasTopStrokeWeight = strokeTopWeight > 0
    const hasBottomStrokeWeight = strokeBottomWeight > 0
    const hasRightStrokeWeight = strokeRightWeight > 0
    const hasLeftStrokeWeight = strokeLeftWeight > 0

    const transformMap: TokenPropertyUtilityClassPrefixMap<number> = {}

    if (hasTopStrokeWeight) {
      transformMap.top = {
        property: Properties.borderWidthTop,
        utilityClassPrefix: 'border-t',
        figmaValue: strokeTopWeight,
      }
    }

    if (hasBottomStrokeWeight) {
      transformMap.bottom = {
        property: Properties.borderWidthBottom,
        utilityClassPrefix: 'border-b',
        figmaValue: strokeBottomWeight,
      }
    }

    if (hasRightStrokeWeight) {
      transformMap.right = {
        property: Properties.borderWidthRight,
        utilityClassPrefix: 'border-r',
        figmaValue: strokeRightWeight,
      }
    }

    if (hasLeftStrokeWeight) {
      transformMap.left = {
        property: Properties.borderWidthLeft,
        utilityClassPrefix: 'border-l',
        figmaValue: strokeLeftWeight,
      }
    }

    const attrs = getUtilityClassForSides(
      node,
      'generic',
      transformMap,
      {
        horizontalEqualUtilityClassPrefix: 'border-x',
        verticalEqualUtilityClassPrefix: 'border-y',
        allEqualUtilityClassPrefix: 'border',
      },
      createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit),
      this.config.mode,
    )

    attrs.forEach(element => this.attributes.add(element))
  }
}

export default FillsAndStrokesBuilder
