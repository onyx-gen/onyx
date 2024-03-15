import { Properties } from '../tokens/properties'
import type { Configuration } from '../config/config'
import { Log } from '../decoratos/log'
import { createDimensionHandler } from './inference/dimension'
import { getUtilityClass } from './inference/utility'
import type { IBuilder } from './types'

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
   * @param autoLayout - The inferred auto layout result of the node.
   * @param config - The configuration for the builder.
   */
  constructor(
    private readonly autoLayout: AutoLayoutMixin,
    private readonly config: Configuration,
  ) {}

  /**
   * Determines the flex direction based on the auto layout's layout mode.
   */
  private buildFlexDirection(): void {
    const flexDirection = this.autoLayout.layoutMode === 'HORIZONTAL' ? '' : 'flex-col'

    if (flexDirection)
      this.attributes.add(flexDirection)
  }

  /**
   * Determines the appropriate CSS class for 'justify-content' based on the primary axis alignment.
   */
  private buildJustifyContent(): void {
    switch (this.autoLayout.primaryAxisAlignItems) {
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
   */
  private buildAlignItems(): void {
    switch (this.autoLayout.counterAxisAlignItems) {
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
  private buildGap(node: SceneNode): void {
    const hasGap = this.autoLayout.itemSpacing > 0 && this.autoLayout.primaryAxisAlignItems !== 'SPACE_BETWEEN'

    if (hasGap) {
      const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

      const gap = getUtilityClass(
        node,
        'generic',
        Properties.itemSpacing,
        'gap',
        this.autoLayout.itemSpacing,
        dimensionHandler,
        this.config.mode,
      )

      this.attributes.add(gap)
    }
  }

  /**
   * Determines the padding of the auto layout, using the design tokens if available.
   * @private
   */
  private buildPadding(node: SceneNode): void {
    const paddingLeft = this.autoLayout.paddingLeft
    const paddingRight = this.autoLayout.paddingRight
    const paddingTop = this.autoLayout.paddingTop
    const paddingBottom = this.autoLayout.paddingBottom

    const hasLeftPadding = paddingLeft > 0
    const hasRightPadding = paddingRight > 0
    const hasTopPadding = paddingTop > 0
    const hasBottomPadding = paddingBottom > 0

    if (hasLeftPadding) {
      const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

      const attr = getUtilityClass(
        node,
        'generic',
        Properties.paddingLeft,
        'pl',
        paddingLeft,
        dimensionHandler,
        this.config.mode,
      )

      this.attributes.add(attr)
    }

    if (hasRightPadding) {
      const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

      const attr = getUtilityClass(
        node,
        'generic',
        Properties.paddingRight,
        'pr',
        paddingRight,
        dimensionHandler,
        this.config.mode,
      )

      this.attributes.add(attr)
    }

    if (hasBottomPadding) {
      const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

      const attr = getUtilityClass(
        node,
        'generic',
        Properties.paddingBottom,
        'pb',
        paddingBottom,
        dimensionHandler,
        this.config.mode,
      )

      this.attributes.add(attr)
    }

    if (hasTopPadding) {
      const dimensionHandler = createDimensionHandler(this.config.dimensionsLookup, this.config.nearestInference, this.config.unit)

      const attr = getUtilityClass(
        node,
        'generic',
        Properties.paddingTop,
        'pt',
        paddingTop,
        dimensionHandler,
        this.config.mode,
      )

      this.attributes.add(attr)
    }
  }

  /**
   * Determines the flex property based on the node's relationship to its parent.
   */
  private buildFlex(node: SceneNode): void {
    const flex = node.parent
      && 'layoutMode' in node.parent
      && node.parent.layoutMode === this.autoLayout.layoutMode
      ? 'flex'
      : 'inline-flex'

    this.attributes.add(flex)
  }

  /**
   * Builds a string of CSS class names based on the auto layout properties of the node.
   *
   * @returns A string of CSS class names.
   */
  public build(node: SceneNode): Set<string> {
    this.buildFlex(node)
    this.buildFlexDirection()
    this.buildJustifyContent()
    this.buildAlignItems()
    this.buildGap(node)
    this.buildPadding(node)

    return this.attributes
  }
}

export default AutoLayoutBuilder
