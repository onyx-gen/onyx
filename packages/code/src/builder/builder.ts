import { getAppliedTokens } from '../tokens/tokens'
import { Properties } from '../tokens/properties'
import type { Configuration } from '../config/config'
import type { RectCornersNew, RectSidesNew } from './types'
import { createColorHandler } from './inference/color'
import AutoLayoutBuilder from './auto-layout-builder'
import { getUtilityClass, translateUtilityValue } from './inference/utility'
import { createDimensionHandler } from './inference/dimension'

class Builder {
  constructor(private readonly config: Configuration) {}

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

    if (Builder.isNonResizableTextMixin(node))
      this.buildNonResizableTextMixin(node)

    return this.attributes
  }

  private buildAutoLayout(node: SceneNode & AutoLayoutMixin) {
    let autoLayoutBuilder: AutoLayoutBuilder | null = null

    const tokens = getAppliedTokens(node)

    if (node.layoutMode !== 'NONE')
      autoLayoutBuilder = new AutoLayoutBuilder(node, node, tokens, this.config)

    // User has not explicitly set auto-layout, but Figma has inferred auto-layout
    // https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
    else if ('inferredAutoLayout' in node && node.inferredAutoLayout !== null)
      autoLayoutBuilder = new AutoLayoutBuilder(node, node.inferredAutoLayout, tokens, this.config)

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

  private static isNonResizableTextMixin(node: SceneNode): node is SceneNode & NonResizableTextMixin {
    return 'fontName' in node && 'fontSize' in node && 'letterSpacing' in node && 'lineHeight' in node
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
      if (cornerRadius !== 0) {
        const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)
        this.attributes.add(`rounded-${translateUtilityValue(dimensionHandler(cornerRadius))}`)
      }
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

    const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

    if (allCornersEqual) {
      this.attributes.add(`${attributePrefix}-${translateUtilityValue(dimensionHandler(rectCorners.topLeft!))}`)
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
      this.attributes.add(`${attributePrefix}-t-${translateUtilityValue(dimensionHandler(rectCorners.topLeft!))}`)
    if (hasBottomCornersEqual)
      this.attributes.add(`${attributePrefix}-b-${translateUtilityValue(dimensionHandler(rectCorners.bottomLeft!))}`)
    if (hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-l-${translateUtilityValue(dimensionHandler(rectCorners.topLeft!))}`)
    if (hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-r-${translateUtilityValue(dimensionHandler(rectCorners.topRight!))}`)

    if (hasTopCornersEqual && hasBottomCornersEqual && hasLeftCornersEqual && hasRightCornersEqual)
      return

    if (rectCorners.topLeft !== null && !hasTopCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-tl-${translateUtilityValue(dimensionHandler(rectCorners.topLeft))}`)
    if (rectCorners.topRight !== null && !hasTopCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-tr-${translateUtilityValue(dimensionHandler(rectCorners.topRight))}`)
    if (rectCorners.bottomLeft !== null && !hasBottomCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-bl-${translateUtilityValue(dimensionHandler(rectCorners.bottomLeft))}`)
    if (rectCorners.bottomRight !== null && !hasBottomCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-br-${translateUtilityValue(dimensionHandler(rectCorners.bottomRight))}`)
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

    const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

    this.attributes.add(`w-${translateUtilityValue(dimensionHandler(width))}`)
    this.attributes.add(`h-${translateUtilityValue(dimensionHandler(height))}`)

    if (minWidth)
      this.attributes.add(`min-w-${translateUtilityValue(dimensionHandler(minWidth))}`)

    if (minHeight)
      this.attributes.add(`min-h-${translateUtilityValue(dimensionHandler(minHeight))}`)

    if (maxWidth)
      this.attributes.add(`max-w-${translateUtilityValue(dimensionHandler(maxWidth))}`)

    if (maxHeight)
      this.attributes.add(`max-h-${translateUtilityValue(dimensionHandler(maxHeight))}`)
  }

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

  private buildNonResizableTextMixin(node: SceneNode & NonResizableTextMixin) {
    const {
      fontName,
      fontSize,
      letterSpacing,
      lineHeight,
    } = node

    if (fontName === figma.mixed) {
      console.error('[Builder] Mixed font names are not supported yet.')
    }
    else {
      // TODO
    }

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
}

export default Builder
