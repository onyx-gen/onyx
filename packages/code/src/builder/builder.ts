import { Properties } from '../tokens/properties'
import type { Configuration } from '../config/config'
import type { IBuilder, RectCornersNew } from './types'
import AutoLayoutBuilder from './auto-layout.builder'
import { getUtilityClass, translateUtilityValue } from './inference/utility'
import { createDimensionHandler } from './inference/dimension'
import FillsAndStrokesBuilder from './fills-and-strokes.builder'
import {
  isCornerMixin,
  isDimensionAndPositionMixin,
  isLayoutMixin,
  isRectangleCornerMixin,
} from './mixins'
import TextBuilder from './text.builder'

/**
 * A builder class for constructing CSS attributes based on a scene node's properties.
 * It supports various mixins to handle different properties like auto layout, dimensions,
 * fills, and strokes. The builder uses configuration for dimension and color inference.
 */
// @Log
class Builder implements IBuilder {
  private attributes: Set<string> = new Set()

  /**
   * Constructs a new Builder instance with the provided configuration.
   * @param config The configuration object containing settings for dimension and color inference.
   */
  constructor(private readonly config: Configuration) {}

  /**
   * Builds and collects CSS attributes for the given scene node based on its properties.
   * It identifies the applicable mixins in the node and processes each accordingly.
   * @param node The scene node to process.
   * @returns A set of CSS attributes applicable to the node.
   */
  public build(node: SceneNode) {
    this.attributes.clear()

    this.buildFillsAndStrokes(node)
    this.buildAutoLayout(node)
    this.buildTextStyling(node)

    if (isDimensionAndPositionMixin(node))
      this.buildDimensionAndPositionMixin(node)

    if (isCornerMixin(node))
      this.buildCornerMixin(node)

    return this.attributes
  }

  /**
   * Processes the fills and strokes properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with fills and strokes properties to process.
   * @private
   */
  private buildFillsAndStrokes(node: SceneNode): void {
    const fillsAndStrokesBuilder = new FillsAndStrokesBuilder(this.config)
    const fillsAndStrokesAttributes = fillsAndStrokesBuilder.build(node)
    this.addAttributes(fillsAndStrokesAttributes)
  }

  /**
   * Processes the auto layout properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with auto layout properties to process.
   * @private
   */
  private buildAutoLayout(node: SceneNode): void {
    const autoLayoutBuilder = new AutoLayoutBuilder(this.config)
    const autoLayoutAttributes = autoLayoutBuilder.build(node)
    this.addAttributes(autoLayoutAttributes)
  }

  /**
   * Processes the text styling properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with auto layout properties to process.
   * @private
   */
  private buildTextStyling(node: SceneNode): void {
    const textBuilder = new TextBuilder(this.config)
    const textAttributes = textBuilder.build(node)
    this.addAttributes(textAttributes)
  }

  /**
   * Adds the given attributes to the internal set of attributes.
   * @param attributes
   * @private
   */
  private addAttributes(attributes: Set<string>): void {
    attributes.forEach(attribute => this.attributes.add(attribute))
  }

  /**
   * Processes the corner properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with corner properties to process.
   */
  private buildCornerMixin(node: SceneNode & CornerMixin) {
    const cornerRadius = node.cornerRadius

    if (cornerRadius !== figma.mixed) {
      if (cornerRadius !== 0) {
        const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)
        this.attributes.add(`rounded-${translateUtilityValue(dimensionHandler(cornerRadius))}`)
      }
    }
    else if (isRectangleCornerMixin(node)) {
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

  /**
   * Processes dimension and position properties of the given node, if applicable, and collects CSS attributes.
   * @param node The scene node with dimension and position properties to process.
   */
  private buildDimensionAndPositionMixin(node: SceneNode & DimensionAndPositionMixin) {
    const {
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = node

    let hasFixedWidth = false
    let hasFixedHeight = false

    if (isLayoutMixin(node)) {
      const { layoutSizingHorizontal, layoutSizingVertical } = node
      hasFixedWidth = layoutSizingHorizontal === 'FIXED'
      hasFixedHeight = layoutSizingVertical === 'FIXED'
    }

    const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

    if (hasFixedWidth) {
      if (width > 0) {
        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.width,
          'w',
          width,
          dimensionHandler,
          this.config.mode,
          this.config.variableNameTransformations,
        )

        this.attributes.add(utilityClass)
      }

      if (minWidth) {
        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.minWidth,
          'min-w',
          minWidth,
          dimensionHandler,
          this.config.mode,
          this.config.variableNameTransformations,
        )

        this.attributes.add(utilityClass)
      }

      if (maxWidth) {
        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.maxWidth,
          'max-w',
          maxWidth,
          dimensionHandler,
          this.config.mode,
          this.config.variableNameTransformations,
        )

        this.attributes.add(utilityClass)
      }
    }

    if (hasFixedHeight) {
      if (height > 0) {
        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.height,
          'h',
          height,
          dimensionHandler,
          this.config.mode,
          this.config.variableNameTransformations,
        )

        this.attributes.add(utilityClass)
      }

      if (minHeight) {
        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.minHeight,
          'min-h',
          minHeight,
          dimensionHandler,
          this.config.mode,
          this.config.variableNameTransformations,
        )

        this.attributes.add(utilityClass)
      }

      if (maxHeight) {
        const utilityClass = getUtilityClass(
          node,
          'generic',
          Properties.maxHeight,
          'max-h',
          maxHeight,
          dimensionHandler,
          this.config.mode,
          this.config.variableNameTransformations,
        )

        this.attributes.add(utilityClass)
      }
    }
  }
}

export default Builder
