import config from '../config'
import { getAppliedTokens } from '../tokens/tokens'
import { Properties } from '../tokens/properties'
import { rgbToHex } from './utils'
import type { ColorUtilityValue, GenericUtilityValue, RectCornersNew, RectSidesNew, UtilityValue } from './types'

class Builder {
  private attributes: Set<string> = new Set()

  public build(node: SceneNode) {
    console.log('building with mode', config)

    if (Builder.isMinimalFillsMixin(node))
      this.buildMinimalFillsMixin(node as SceneNode & MinimalFillsMixin)

    if (Builder.isMinimalStrokesMixin(node))
      this.buildMinimalStrokesMixin(node as SceneNode & MinimalStrokesMixin)

    if (Builder.isDimensionAndPositionMixin(node))
      this.buildDimensionAndPositionMixin(node as SceneNode & DimensionAndPositionMixin)

    if (Builder.isCornerMixin(node))
      this.buildCornerMixin(node as SceneNode & CornerMixin)

    return this.attributes
  }

  private static isDimensionAndPositionMixin(node: SceneNode) {
    return 'width' in node && 'height' in node && 'x' in node && 'y' in node
  }

  private static isMinimalFillsMixin(node: SceneNode) {
    return 'fills' in node
  }

  private static isMinimalStrokesMixin(node: SceneNode) {
    return 'strokes' in node
  }

  private static isCornerMixin(node: SceneNode) {
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
        this.attributes.add(`rounded-${this.translateUtilityValue(this.getNearestDimension(cornerRadius))}`)
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
      this.attributes.add(`${attributePrefix}-${this.translateUtilityValue(this.getNearestDimension(rectCorners.topLeft!))}`)
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
      this.attributes.add(`${attributePrefix}-t-${this.translateUtilityValue(this.getNearestDimension(rectCorners.topLeft!))}`)
    if (hasBottomCornersEqual)
      this.attributes.add(`${attributePrefix}-b-${this.translateUtilityValue(this.getNearestDimension(rectCorners.bottomLeft!))}`)
    if (hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-l-${this.translateUtilityValue(this.getNearestDimension(rectCorners.topLeft!))}`)
    if (hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-r-${this.translateUtilityValue(this.getNearestDimension(rectCorners.topRight!))}`)

    if (hasTopCornersEqual && hasBottomCornersEqual && hasLeftCornersEqual && hasRightCornersEqual)
      return

    if (rectCorners.topLeft !== null && !hasTopCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-tl-${this.translateUtilityValue(this.getNearestDimension(rectCorners.topLeft))}`)
    if (rectCorners.topRight !== null && !hasTopCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-tr-${this.translateUtilityValue(this.getNearestDimension(rectCorners.topRight))}`)
    if (rectCorners.bottomLeft !== null && !hasBottomCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-bl-${this.translateUtilityValue(this.getNearestDimension(rectCorners.bottomLeft))}`)
    if (rectCorners.bottomRight !== null && !hasBottomCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-br-${this.translateUtilityValue(this.getNearestDimension(rectCorners.bottomRight))}`)
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

    this.attributes.add(`w-${this.translateUtilityValue(this.getNearestDimension(width))}`)
    this.attributes.add(`h-${this.translateUtilityValue(this.getNearestDimension(height))}`)

    if (minWidth)
      this.attributes.add(`min-w-${this.translateUtilityValue(this.getNearestDimension(minWidth))}`)

    if (minHeight)
      this.attributes.add(`min-h-${this.translateUtilityValue(this.getNearestDimension(minHeight))}`)

    if (maxWidth)
      this.attributes.add(`max-w-${this.translateUtilityValue(this.getNearestDimension(maxWidth))}`)

    if (maxHeight)
      this.attributes.add(`max-h-${this.translateUtilityValue(this.getNearestDimension(maxHeight))}`)
  }

  private getNearestDimension(widthOrHeight: number): GenericUtilityValue {
    console.error('[Builder] Nearest widthOrHeight is not yet implemented.', widthOrHeight)

    return {
      mode: 'arbitrary',
      type: 'generic',
      value: `${widthOrHeight}px`,
    }
  }

  private buildMinimalStrokesMixin(node: SceneNode & MinimalStrokesMixin) {
    const {
      strokes,
      strokeWeight,
      strokeJoin,
      strokeAlign,
      dashPattern,
    } = node

    console.log({
      strokes,
      strokeWeight,
      strokeJoin,
      strokeAlign,
      dashPattern,
    })

    if (Array.isArray(strokes) && strokes.length > 0) {
      if (strokes.length === 1) {
        const stroke = strokes[0]
        if (stroke.type === 'SOLID') {
          const value = this.translateUtilityValue(this.getNearestSolidColor(stroke))
          this.attributes.add(`border-color-${value}`)
        }
        else { console.error('[Builder] Only solid strokes are supported yet.') }
      }
      else {
        console.error('[Builder] Multiple strokes are not supported yet.')
      }

      if (strokeWeight !== figma.mixed) {
        this.attributes.add(`border-${this.translateUtilityValue(this.getNearestDimension(strokeWeight))}`)
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
      this.attributes.add(`${attributePrefix}-${this.translateUtilityValue(this.getNearestDimension(rectSides.top!))}`)
      return
    }

    // Check if one axis is the same
    const axisXEqual = rectSides.left !== null && rectSides.left === rectSides.right
    const axisYEqual = rectSides.top !== null && rectSides.top === rectSides.bottom

    if (axisXEqual)
      this.attributes.add(`${attributePrefix}-x-${this.translateUtilityValue(this.getNearestDimension(rectSides.left!))}`)
    if (axisYEqual)
      this.attributes.add(`${attributePrefix}-y-${this.translateUtilityValue(this.getNearestDimension(rectSides.top!))}`)

    if (axisXEqual && axisYEqual)
      return

    // Individual sides
    if (rectSides.top !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-t-${this.translateUtilityValue(this.getNearestDimension(rectSides.top))}`)
    if (rectSides.right !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-r-${this.translateUtilityValue(this.getNearestDimension(rectSides.right))}`)
    if (rectSides.bottom !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-b-${this.translateUtilityValue(this.getNearestDimension(rectSides.bottom))}`)
    if (rectSides.left !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-l-${this.translateUtilityValue(this.getNearestDimension(rectSides.left))}`)
  }

  private buildMinimalFillsMixin(node: SceneNode & MinimalFillsMixin) {
    const fills = node.fills
    if (Array.isArray(fills) && fills.length > 0) {
      if (fills.length === 1) {
        const fill = fills[0]
        if (fill.type === 'SOLID') {
          let utilityValue: ColorUtilityValue | null = null

          if (config.mode === 'variables') {
            const token = this.getTokenByType(node, Properties.fill)

            if (token) {
              utilityValue = {
                mode: 'variable',
                type: 'color',
                value: token,
              }
            }
          }

          if (!utilityValue)
            utilityValue = this.getNearestSolidColor(fill)

          const value = this.translateUtilityValue(utilityValue)
          this.attributes.add(`bg-${value}`)
        }
        else { console.error('[Builder] Only solid fills are supported yet.') }
      }
      else {
        console.error('[Builder] Multiple fills are not supported yet.')
      }
    }
  }

  /**
   * Retrieves the token value of a given type for a specified scene node.
   *
   * @param {SceneNode} node - The scene node from which to retrieve the token value.
   * @param {Properties} type - The type of token to retrieve.
   * @return {string|null} - The token value of the specified type if found, otherwise null.
   */
  private getTokenByType(node: SceneNode, type: Properties): string | null {
    const tokens = getAppliedTokens(node)
    return tokens.get(type) || null
  }

  private translateUtilityValue(utilityValue: UtilityValue): string {
    let value = ''
    switch (utilityValue.mode) {
      case 'inferred':
        value = utilityValue.value
        break
      case 'arbitrary':
        value = `[${utilityValue.value}]`
        break
      case 'variable':
        value = `$${utilityValue.value}`
        break
    }

    if (utilityValue.type === 'color' && utilityValue.opacity && utilityValue.opacity < 100)
      value += `/${utilityValue.opacity}`

    return value
  }

  private getNearestSolidColor(paint: SolidPaint): ColorUtilityValue {
    console.error('[Builder] Nearest solid color is not yet implemented.', paint)
    const color = rgbToHex(
      Math.floor(paint.color.r * 256),
      Math.floor(paint.color.g * 256),
      Math.floor(paint.color.b * 256),
    )

    return {
      mode: 'arbitrary',
      type: 'color',
      value: color,
      opacity: paint.opacity ? paint.opacity * 100 : undefined,
    }
  }
}

export default Builder
