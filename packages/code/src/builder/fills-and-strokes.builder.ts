import { Properties } from '../tokens/properties'
import type { Configuration } from '../config/config'
import { Log } from '../decoratos/log'
import type { IBuilder, RectSidesNew } from './types'
import { isMinimalFillsMixin, isMinimalStrokesMixin } from './mixins'
import { createColorHandler } from './inference/color'
import { getUtilityClass, translateUtilityValue } from './inference/utility'
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
      else {
        const {
          strokeTopWeight,
          strokeBottomWeight,
          strokeLeftWeight,
          strokeRightWeight,
        } = node as SceneNode & IndividualStrokesMixin

        const rectSides: RectSidesNew = {
          top: strokeTopWeight || null,
          bottom: strokeBottomWeight || null,
          left: strokeLeftWeight || null,
          right: strokeRightWeight || null,
        }

        this.handleRectSidesAttribute(rectSides, 'border')
      }
    }
  }

  /**
   * Handles attributes for rectangular sides (such as padding or border-width).
   * It generates CSS classes based on the uniformity and equality of the rectangular sides.
   * @param rectSides The object containing values for each side of the rectangle.
   * @param attributePrefix The prefix to use for the CSS class.
   */
  private handleRectSidesAttribute(rectSides: RectSidesNew, attributePrefix: string) {
    // Check if all sides are the same
    const allSidesEqual = rectSides.top !== null
      && rectSides.top === rectSides.bottom
      && rectSides.bottom === rectSides.left
      && rectSides.left === rectSides.right

    const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

    if (allSidesEqual) {
      this.attributes.add(`${attributePrefix}-${translateUtilityValue(dimensionHandler(rectSides.top!))}`)
      return
    }

    // Check if one axis is the same
    const axisXEqual = rectSides.left !== null && rectSides.left === rectSides.right
    const axisYEqual = rectSides.top !== null && rectSides.top === rectSides.bottom

    if (axisXEqual)
      this.attributes.add(`${attributePrefix}-x-${translateUtilityValue(dimensionHandler(rectSides.left!))}`)
    if (axisYEqual)
      this.attributes.add(`${attributePrefix}-y-${translateUtilityValue(dimensionHandler(rectSides.top!))}`)

    if (axisXEqual && axisYEqual)
      return

    // Individual sides
    if (rectSides.top !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-t-${translateUtilityValue(dimensionHandler(rectSides.top))}`)
    if (rectSides.right !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-r-${translateUtilityValue(dimensionHandler(rectSides.right))}`)
    if (rectSides.bottom !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-b-${translateUtilityValue(dimensionHandler(rectSides.bottom))}`)
    if (rectSides.left !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-l-${translateUtilityValue(dimensionHandler(rectSides.left))}`)
  }
}

export default FillsAndStrokesBuilder
