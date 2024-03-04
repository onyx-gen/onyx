import config from '../config/config'
import { getAppliedTokens } from '../tokens/tokens'
import { Properties } from '../tokens/properties'
import { getToken } from './utils'
import type { ColorUtilityValue, RectCornersNew, RectSidesNew } from './types'
import { getInferredSolidColor } from './inference/color'
import AutoLayoutBuilder from './auto-layout-builder'
import { translateUtilityValue } from './inference/utility'
import { getInferredDimension } from './inference/dimension'

class Builder {
  private attributes: Set<string> = new Set()

  public build(node: SceneNode) {
    if (Builder.isMinimalFillsMixin(node))
      this.buildMinimalFillsMixin(node)

    if (Builder.isMinimalStrokesMixin(node))
      this.buildMinimalStrokesMixin(node)

    if (Builder.isDimensionAndPositionMixin(node))
      this.buildDimensionAndPositionMixin(node)

    if (Builder.isCornerMixin(node))
      this.buildCornerMixin(node)

    if (Builder.isAutoLayoutMixin(node))
      this.buildAutoLayout(node)

    return this.attributes
  }

  private buildAutoLayout(node: SceneNode & AutoLayoutMixin) {
    let autoLayoutBuilder: AutoLayoutBuilder | null = null

    const tokens = getAppliedTokens(node)

    if (node.layoutMode !== 'NONE')
      autoLayoutBuilder = new AutoLayoutBuilder(node, node, tokens)

    // User has not explicitly set auto-layout, but Figma has inferred auto-layout
    // https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
    else if ('inferredAutoLayout' in node && node.inferredAutoLayout !== null)
      autoLayoutBuilder = new AutoLayoutBuilder(node, node.inferredAutoLayout, tokens)

    if (autoLayoutBuilder)
      autoLayoutBuilder.build().forEach(css => this.attributes.add(css))
  }

  private static isAutoLayoutMixin(node: SceneNode): node is SceneNode & AutoLayoutMixin {
    return 'layoutMode' in node
  }

  private static isDimensionAndPositionMixin(node: SceneNode): node is SceneNode & DimensionAndPositionMixin {
    return 'width' in node && 'height' in node && 'x' in node && 'y' in node
  }

  private static isMinimalFillsMixin(node: SceneNode): node is SceneNode & MinimalFillsMixin {
    return 'fills' in node
  }

  private static isMinimalStrokesMixin(node: SceneNode): node is SceneNode & MinimalStrokesMixin {
    return 'strokes' in node
  }

  private static isCornerMixin(node: SceneNode): node is SceneNode & CornerMixin {
    return 'cornerRadius' in node
  }

  private static isRectangleCornerMixin(node: SceneNode) {
    return 'topLeftRadius' in node
      && 'topRightRadius' in node
      && 'bottomLeftRadius' in node
      && 'bottomRightRadius' in node
  }

  private buildCornerMixin(node: SceneNode & CornerMixin) {
    const cornerRadius = node.cornerRadius

    if (cornerRadius !== figma.mixed) {
      if (cornerRadius !== 0)
        this.attributes.add(`rounded-${translateUtilityValue(getInferredDimension(cornerRadius))}`)
    }
    else if (Builder.isRectangleCornerMixin(node)) {
      const {
        topLeftRadius,
        topRightRadius,
        bottomLeftRadius,
        bottomRightRadius,
      } = node as SceneNode & RectangleCornerMixin

      const corners: RectCornersNew = {
        topLeft: topLeftRadius !== 0 ? topLeftRadius : null,
        topRight: topRightRadius !== 0 ? topRightRadius : null,
        bottomLeft: bottomLeftRadius !== 0 ? bottomLeftRadius : null,
        bottomRight: bottomRightRadius !== 0 ? bottomRightRadius : null,
      }

      this.handleRectCornersAttribute(corners, 'rounded')
    }
  }

  /**
   * Handles attributes for rectangular corners (border-radius).
   * It generates CSS classes based on the uniformity and equality of the rectangular corners.
   * @param rectCorners The object containing values for each corner of the rectangle.
   * @param attributePrefix The prefix to use for the CSS class.
   */
  private handleRectCornersAttribute(
    rectCorners: RectCornersNew,
    attributePrefix: string,
  ) {
    const allCornersEqual = rectCorners.topLeft !== null
      && rectCorners.topLeft === rectCorners.topRight
      && rectCorners.topRight === rectCorners.bottomLeft
      && rectCorners.bottomLeft === rectCorners.bottomRight

    if (allCornersEqual) {
      this.attributes.add(`${attributePrefix}-${translateUtilityValue(getInferredDimension(rectCorners.topLeft!))}`)
      return
    }

    const hasTopCornersEqual = rectCorners.topLeft !== null
      && rectCorners.topLeft === rectCorners.topRight
    const hasBottomCornersEqual = rectCorners.bottomLeft !== null
      && rectCorners.bottomLeft === rectCorners.bottomRight
    const hasLeftCornersEqual = rectCorners.topLeft !== null
      && rectCorners.topLeft === rectCorners.bottomLeft
    const hasRightCornersEqual = rectCorners.topRight !== null
      && rectCorners.topRight === rectCorners.bottomRight

    if (hasTopCornersEqual)
      this.attributes.add(`${attributePrefix}-t-${translateUtilityValue(getInferredDimension(rectCorners.topLeft!))}`)
    if (hasBottomCornersEqual)
      this.attributes.add(`${attributePrefix}-b-${translateUtilityValue(getInferredDimension(rectCorners.bottomLeft!))}`)
    if (hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-l-${translateUtilityValue(getInferredDimension(rectCorners.topLeft!))}`)
    if (hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-r-${translateUtilityValue(getInferredDimension(rectCorners.topRight!))}`)

    if (hasTopCornersEqual && hasBottomCornersEqual && hasLeftCornersEqual && hasRightCornersEqual)
      return

    if (rectCorners.topLeft !== null && !hasTopCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-tl-${translateUtilityValue(getInferredDimension(rectCorners.topLeft))}`)
    if (rectCorners.topRight !== null && !hasTopCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-tr-${translateUtilityValue(getInferredDimension(rectCorners.topRight))}`)
    if (rectCorners.bottomLeft !== null && !hasBottomCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-bl-${translateUtilityValue(getInferredDimension(rectCorners.bottomLeft))}`)
    if (rectCorners.bottomRight !== null && !hasBottomCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-br-${translateUtilityValue(getInferredDimension(rectCorners.bottomRight))}`)
  }

  private buildDimensionAndPositionMixin(node: SceneNode & DimensionAndPositionMixin) {
    const {
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = node

    this.attributes.add(`w-${translateUtilityValue(getInferredDimension(width))}`)
    this.attributes.add(`h-${translateUtilityValue(getInferredDimension(height))}`)

    if (minWidth)
      this.attributes.add(`min-w-${translateUtilityValue(getInferredDimension(minWidth))}`)

    if (minHeight)
      this.attributes.add(`min-h-${translateUtilityValue(getInferredDimension(minHeight))}`)

    if (maxWidth)
      this.attributes.add(`max-w-${translateUtilityValue(getInferredDimension(maxWidth))}`)

    if (maxHeight)
      this.attributes.add(`max-h-${translateUtilityValue(getInferredDimension(maxHeight))}`)
  }

  private buildMinimalStrokesMixin(node: SceneNode & MinimalStrokesMixin) {
    const {
      strokes,
      strokeWeight,
    } = node

    if (Array.isArray(strokes) && strokes.length > 0) {
      if (strokes.length === 1) {
        const stroke = strokes[0]
        if (stroke.type === 'SOLID') {
          let utilityValue: ColorUtilityValue | null = null

          if (config.mode === 'variables') {
            const token = getToken(node, Properties.borderColor)

            if (token) {
              utilityValue = {
                mode: 'variable',
                type: 'color',
                value: token,
              }
            }
          }

          if (!utilityValue)
            utilityValue = getInferredSolidColor(stroke)

          const value = translateUtilityValue(utilityValue)
          this.attributes.add(`border-color-${value}`)
        }
        else { console.error('[Builder] Only solid strokes are supported yet.') }
      }
      else {
        console.error('[Builder] Multiple strokes are not supported yet.')
      }

      if (strokeWeight !== figma.mixed) {
        this.attributes.add(`border-${translateUtilityValue(getInferredDimension(strokeWeight))}`)
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

    if (allSidesEqual) {
      this.attributes.add(`${attributePrefix}-${translateUtilityValue(getInferredDimension(rectSides.top!))}`)
      return
    }

    // Check if one axis is the same
    const axisXEqual = rectSides.left !== null && rectSides.left === rectSides.right
    const axisYEqual = rectSides.top !== null && rectSides.top === rectSides.bottom

    if (axisXEqual)
      this.attributes.add(`${attributePrefix}-x-${translateUtilityValue(getInferredDimension(rectSides.left!))}`)
    if (axisYEqual)
      this.attributes.add(`${attributePrefix}-y-${translateUtilityValue(getInferredDimension(rectSides.top!))}`)

    if (axisXEqual && axisYEqual)
      return

    // Individual sides
    if (rectSides.top !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-t-${translateUtilityValue(getInferredDimension(rectSides.top))}`)
    if (rectSides.right !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-r-${translateUtilityValue(getInferredDimension(rectSides.right))}`)
    if (rectSides.bottom !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-b-${translateUtilityValue(getInferredDimension(rectSides.bottom))}`)
    if (rectSides.left !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-l-${translateUtilityValue(getInferredDimension(rectSides.left))}`)
  }

  private buildMinimalFillsMixin(node: SceneNode & MinimalFillsMixin) {
    const fills = node.fills
    if (Array.isArray(fills) && fills.length > 0) {
      if (fills.length === 1) {
        const fill = fills[0]
        if (fill.type === 'SOLID') {
          let utilityValue: ColorUtilityValue | null = null

          if (config.mode === 'variables') {
            const token = getToken(node, Properties.fill)

            if (token) {
              utilityValue = {
                mode: 'variable',
                type: 'color',
                value: token,
              }
            }
          }

          if (!utilityValue)
            utilityValue = getInferredSolidColor(fill)

          const value = translateUtilityValue(utilityValue)
          this.attributes.add(`bg-${value}`)
        }
        else { console.error('[Builder] Only solid fills are supported yet.') }
      }
      else {
        console.error('[Builder] Multiple fills are not supported yet.')
      }
    }
  }
}

export default Builder
