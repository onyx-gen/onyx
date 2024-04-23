import { Properties } from '../tokens/properties'
import type { Configuration } from '../config/config'
import { Log } from '../decoratos/log'
import { createDimensionHandler } from './inference/dimension'
import type { TokenPropertyUtilityClassPrefixMap } from './inference/utility'
import { getUtilityClass, getUtilityClassForSides } from './inference/utility'
import type { IBuilder } from './types'
import { isAutoLayoutMixin, isInferredAutoLayout } from './mixins'

/**
 * The AutoLayoutBuilder class is responsible for constructing a string of CSS class names
 * based on the properties of a SceneNode and an InferredAutoLayoutResult. It uses DesignTokens
 * for certain values like gaps. The generated string can be used to style elements
 * with CSS utility class frameworks like TailwindCSS or UnoCSS.
 */
@Log
class AutoLayoutBuilder implements IBuilder {
  private attributes: Set<string> = new Set()

  /**
   * Constructs an instance of AutoLayoutBuilder.
   *
   * @param config - The configuration for the builder.
   */
  constructor(private readonly config: Configuration) {}

  /**
   * Builds a string of CSS class names based on the auto layout properties of the node.
   *
   * @returns A string of CSS class names.
   */
  public build(node: SceneNode): Set<string> {
    this.attributes.clear()

    if (isAutoLayoutMixin(node) && node.layoutMode !== 'NONE')
      this.buildAutoLayout(node)

    else if (isInferredAutoLayout(node))
      this.buildAutoLayout(node)

    return this.attributes
  }

  private buildAutoLayout(node: SceneNode & AutoLayoutMixin): void {
    this.buildFlex(node)
    this.buildFlexDirection(node)
    this.buildJustifyContent(node)
    this.buildAlignItems(node)
    this.buildGap(node)
    this.buildPadding(node)
  }

  /**
   * Determines the flex direction based on the auto layout's layout mode.
   * @param node The scene node to check.
   */
  private buildFlexDirection(node: SceneNode & AutoLayoutMixin): void {
    const flexDirection = node.layoutMode === 'HORIZONTAL' ? '' : 'flex-col'

    if (flexDirection)
      this.attributes.add(flexDirection)
  }

  /**
   * Determines the appropriate CSS class for 'justify-content' based on the primary axis alignment.
   * @param node The scene node to check.
   */
  private buildJustifyContent(node: SceneNode & AutoLayoutMixin): void {
    switch (node.primaryAxisAlignItems) {
      case 'MIN':
        this.attributes.add('justify-start')
        break

      case 'CENTER':
        this.attributes.add('justify-center')
        break

      case 'MAX':
        this.attributes.add('justify-end')
        break

      case 'SPACE_BETWEEN':
        this.attributes.add('justify-between')
        break
    }
  }

  /**
   * Determines the appropriate CSS class for 'align-items' based on the counter axis alignment.
   * @param node The scene node to check.
   */
  private buildAlignItems(node: SceneNode & AutoLayoutMixin): void {
    switch (node.counterAxisAlignItems) {
      case 'MIN':
        this.attributes.add('items-start')
        break
      case 'CENTER':
        this.attributes.add('items-center')
        break
      case 'MAX':
        this.attributes.add('items-end')
        break
      case 'BASELINE':
        this.attributes.add('items-baseline')
        break
    }
  }

  /**
   * Determines the gap between items in the layout, using the design tokens if available.
   */
  private buildGap(node: SceneNode & AutoLayoutMixin): void {
    const hasGap = node.itemSpacing > 0 && node.primaryAxisAlignItems !== 'SPACE_BETWEEN'

    if (hasGap) {
      const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

      const gap = getUtilityClass(
        node,
        'generic',
        Properties.itemSpacing,
        'gap',
        node.itemSpacing,
        dimensionHandler,
        this.config.mode,
        this.config.variableNameTransformations,
      )

      this.attributes.add(gap)
    }
  }

  /**
   * Determines the padding of the auto layout, using the design tokens if available.
   * @private
   */
  private buildPadding(node: SceneNode & AutoLayoutMixin): void {
    const paddingLeft = node.paddingLeft
    const paddingRight = node.paddingRight
    const paddingTop = node.paddingTop
    const paddingBottom = node.paddingBottom

    const hasLeftPadding = paddingLeft > 0
    const hasRightPadding = paddingRight > 0
    const hasTopPadding = paddingTop > 0
    const hasBottomPadding = paddingBottom > 0

    const hasPadding
      = hasLeftPadding
      || hasRightPadding
      || hasTopPadding
      || hasBottomPadding

    if (hasPadding) {
      const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

      const transformMap: TokenPropertyUtilityClassPrefixMap<number> = {}

      if (hasTopPadding) {
        transformMap.top = {
          property: Properties.paddingTop,
          utilityClassPrefix: 'pt',
          figmaValue: paddingTop,
        }
      }

      if (hasBottomPadding) {
        transformMap.bottom = {
          property: Properties.paddingBottom,
          utilityClassPrefix: 'pb',
          figmaValue: paddingBottom,
        }
      }

      if (hasLeftPadding) {
        transformMap.left = {
          property: Properties.paddingLeft,
          utilityClassPrefix: 'pl',
          figmaValue: paddingLeft,
        }
      }

      if (hasRightPadding) {
        transformMap.right = {
          property: Properties.paddingRight,
          utilityClassPrefix: 'pr',
          figmaValue: paddingRight,
        }
      }

      const attrs = getUtilityClassForSides(
        node,
        'generic',
        transformMap,
        {
          horizontalEqualUtilityClassPrefix: 'px',
          verticalEqualUtilityClassPrefix: 'py',
          allEqualUtilityClassPrefix: 'p',
        },
        dimensionHandler,
        this.config.mode,
        this.config.variableNameTransformations,
      )

      attrs.forEach(element => this.attributes.add(element))
    }
  }

  /**
   * Determines the flex property based on the node's relationship to its parent.
   */
  private buildFlex(node: SceneNode & AutoLayoutMixin): void {
    const flex = node.parent
      && 'layoutMode' in node.parent
      && node.parent.layoutMode === node.layoutMode
      ? 'flex'
      : 'inline-flex'

    this.attributes.add(flex)
  }
}

export default AutoLayoutBuilder
