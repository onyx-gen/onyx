import type { DesignTokens } from '../tokens'
import { getAppliedTokens } from '../tokens'
import { Properties } from '../properties'
import AutoLayoutBuilder from './auto-layout-builder'

interface RectSides {
  top: string | null
  bottom: string | null
  left: string | null
  right: string | null
}

interface RectCorners {
  topLeft: string | null
  topRight: string | null
  bottomLeft: string | null
  bottomRight: string | null
}

type TokenHandler = () => void
type TokenHandlers = { [key in Properties]?: TokenHandler }

/**
 * UnocssBuilder is a class for building CSS classes based on design tokens and properties
 * of a Figma node. It supports various CSS properties such as padding, border width,
 * border radius, typography, color, dimensions, and auto-layout. The builder pattern
 * is used to accumulate CSS classes and build a final class string that can be applied
 * to HTML elements.
 *
 * @example
 * // To use the UnocssBuilder, create an instance with a Figma node,
 * // and then call the build method to generate the CSS class string.
 * const node: SceneNode = { ... }; // Assume this is a Figma node object.
 * const builder = new UnocssBuilder(node);
 * const cssClasses = builder.build();
 * // Now, cssClasses contains the CSS classes derived from the node's design tokens.
 *
 * This builder abstracts the complexity of handling different design tokens and
 * CSS generation logic, providing a simple interface to generate UnoCSS utility classes
 * from Figma nodes.
 */
export class UnocssBuilder {
  private attributes: string[] = []
  private readonly tokens: DesignTokens
  private padding: RectSides = { top: null, bottom: null, left: null, right: null }
  private borderWidth: RectSides = { top: null, bottom: null, left: null, right: null }
  private borderRadius: RectCorners = { topLeft: null, topRight: null, bottomLeft: null, bottomRight: null }

  /**
   * Constructs an UnoCSS builder with the specified node.
   * It initializes design tokens for the node and sets up the builder.
   * @param node The scene node for which to build CSS attributes.
   */
  constructor(private node: SceneNode) {
    this.tokens = getAppliedTokens(node)
    this.tokens.forEach((token, tokenType) => this.handleToken(token, tokenType))
  }

  /**
   * Handles the given token based on its type.
   * It maps various token types to their respective handler functions.
   * @param token The value of the design token.
   * @param tokenType The type of the design token.
   */
  private handleToken(token: string, tokenType: Properties) {
    const paddingHandlers: TokenHandlers = {
      [Properties.paddingLeft]: () => this.padding.left = token,
      [Properties.paddingRight]: () => this.padding.right = token,
      [Properties.paddingTop]: () => this.padding.top = token,
      [Properties.paddingBottom]: () => this.padding.bottom = token,
    }

    const borderWidthHandlers: TokenHandlers = {
      [Properties.borderWidth]: () => {
        this.borderWidth.top = token
        this.borderWidth.bottom = token
        this.borderWidth.left = token
        this.borderWidth.right = token
      },
      [Properties.borderWidthTop]: () => this.borderWidth.top = token,
      [Properties.borderWidthBottom]: () => this.borderWidth.bottom = token,
      [Properties.borderWidthLeft]: () => this.borderWidth.left = token,
      [Properties.borderWidthRight]: () => this.borderWidth.right = token,
    }

    const borderRadiusHandlers: TokenHandlers = {
      [Properties.borderRadius]: () => {
        this.borderRadius.topLeft = token
        this.borderRadius.topRight = token
        this.borderRadius.bottomLeft = token
        this.borderRadius.bottomRight = token
      },
      [Properties.borderRadiusTopLeft]: () => this.borderRadius.topLeft = token,
      [Properties.borderRadiusTopRight]: () => this.borderRadius.topRight = token,
      [Properties.borderRadiusBottomLeft]: () => this.borderRadius.bottomLeft = token,
      [Properties.borderRadiusBottomRight]: () => this.borderRadius.bottomRight = token,
    }

    const sizingHandlers: TokenHandlers = {
      [Properties.sizing]: () => {
        this.handleDimension('height', token)
        this.handleDimension('width', token)
      },
      [Properties.height]: () => this.handleDimension('height', token),
      [Properties.width]: () => this.handleDimension('width', token),
    }

    const handlers: TokenHandlers = {
      [Properties.typography]: () => this.attributes.push(`font-$${token}`),
      [Properties.fill]: () => this.attributes.push(this.node.type === 'TEXT' ? `color-$${token}` : `bg-$${token}`),
      [Properties.borderColor]: () => this.attributes.push(`border-color-$${token}`),

      ...paddingHandlers,
      ...borderWidthHandlers,
      ...borderRadiusHandlers,
      ...sizingHandlers,
    }

    const handler = handlers[tokenType]
    if (handler)
      handler()
    else
      console.log('Token is not yet supported by codegen', tokenType, token)
  }

  /**
   * Handles the dimension attributes for height and width.
   * It adds the appropriate CSS class for the given dimension.
   * @param dimension The dimension type ('height' or 'width').
   * @param token The value of the dimension token.
   */
  private handleDimension(dimension: 'height' | 'width', token: string) {
    this.attributes.push(`${dimension[0]}-$${token}`)
  }

  /**
   * Handles attributes for rectangular sides (such as padding or border-width).
   * It generates CSS classes based on the uniformity and equality of the rectangular sides.
   * @param rectSides The object containing values for each side of the rectangle.
   * @param attributePrefix The prefix to use for the CSS class.
   */
  private handleRectSidesAttribute(rectSides: RectSides, attributePrefix: string) {
    // Check if all sides are the same
    const allSidesEqual = rectSides.top !== null
      && rectSides.top === rectSides.bottom
      && rectSides.bottom === rectSides.left
      && rectSides.left === rectSides.right

    if (allSidesEqual) {
      this.attributes.push(`${attributePrefix}-$${rectSides.top}`)
      return
    }

    // Check if one axis is the same
    const axisXEqual = rectSides.left !== null && rectSides.left === rectSides.right
    const axisYEqual = rectSides.top !== null && rectSides.top === rectSides.bottom

    if (axisXEqual)
      this.attributes.push(`${attributePrefix}-x-$${rectSides.left}`)
    if (axisYEqual)
      this.attributes.push(`${attributePrefix}-y-$${rectSides.top}`)

    if (axisXEqual && axisYEqual)
      return

    // Individual sides
    if (rectSides.top !== null && !axisYEqual)
      this.attributes.push(`${attributePrefix}-t-$${rectSides.top}`)
    if (rectSides.right !== null && !axisXEqual)
      this.attributes.push(`${attributePrefix}-r-$${rectSides.right}`)
    if (rectSides.bottom !== null && !axisYEqual)
      this.attributes.push(`${attributePrefix}-b-$${rectSides.bottom}`)
    if (rectSides.left !== null && !axisXEqual)
      this.attributes.push(`${attributePrefix}-l-$${rectSides.left}`)
  }

  /**
   * Handles the padding attributes.
   * It delegates to handleRectSidesAttribute with the 'padding' prefix.
   */
  private handlePadding() {
    this.handleRectSidesAttribute(this.padding, 'p')
  }

  /**
   * Handles the border-width attributes.
   * It delegates to handleRectSidesAttribute with the 'border-size' prefix.
   */
  private handleBorderWidth() {
    this.handleRectSidesAttribute(this.borderWidth, 'border-size')
  }

  /**
   * Handles attributes for rectangular corners (border-radius).
   * It generates CSS classes based on the uniformity and equality of the rectangular corners.
   * @param rectCorners The object containing values for each corner of the rectangle.
   * @param attributePrefix The prefix to use for the CSS class.
   */
  private handleRectCornersAttribute(rectCorners: RectCorners, attributePrefix: string) {
    const allCornersEqual = rectCorners.topLeft !== null
      && rectCorners.topLeft === rectCorners.topRight
      && rectCorners.topRight === rectCorners.bottomLeft
      && rectCorners.bottomLeft === rectCorners.bottomRight

    if (allCornersEqual) {
      this.attributes.push(`${attributePrefix}-$${rectCorners.topLeft}`)
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
      this.attributes.push(`${attributePrefix}-t-$${rectCorners.topLeft}`)
    if (hasBottomCornersEqual)
      this.attributes.push(`${attributePrefix}-b-$${rectCorners.bottomLeft}`)
    if (hasLeftCornersEqual)
      this.attributes.push(`${attributePrefix}-l-$${rectCorners.topLeft}`)
    if (hasRightCornersEqual)
      this.attributes.push(`${attributePrefix}-r-$${rectCorners.topRight}`)

    if (hasTopCornersEqual && hasBottomCornersEqual && hasLeftCornersEqual && hasRightCornersEqual)
      return

    if (rectCorners.topLeft !== null && !hasTopCornersEqual && !hasLeftCornersEqual)
      this.attributes.push(`${attributePrefix}-tl-$${rectCorners.topLeft}`)
    if (rectCorners.topRight !== null && !hasTopCornersEqual && !hasRightCornersEqual)
      this.attributes.push(`${attributePrefix}-tr-$${rectCorners.topRight}`)
    if (rectCorners.bottomLeft !== null && !hasBottomCornersEqual && !hasLeftCornersEqual)
      this.attributes.push(`${attributePrefix}-bl-$${rectCorners.bottomLeft}`)
    if (rectCorners.bottomRight !== null && !hasBottomCornersEqual && !hasRightCornersEqual)
      this.attributes.push(`${attributePrefix}-br-$${rectCorners.bottomRight}`)
  }

  /**
   * Handles the border-radius attributes.
   * It delegates to handleRectCornersAttribute with the 'rounded' prefix.
   */
  private handleBorderRadius() {
    this.handleRectCornersAttribute(this.borderRadius, 'rounded')
  }

  /**
   * Handles the auto-layout properties of the node.
   * It adds CSS classes based on the layout properties of the node.
   */
  private handleAutoLayout() {
    if (!('layoutMode' in this.node))
      return

    let autoLayoutBuilder: AutoLayoutBuilder | null = null

    if (this.node.layoutMode !== 'NONE')
      autoLayoutBuilder = new AutoLayoutBuilder(this.node, this.node, this.tokens)

    // User has not explicitly set auto-layout, but Figma has inferred auto-layout
    // https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
    else if (this.node.inferredAutoLayout !== null)
      autoLayoutBuilder = new AutoLayoutBuilder(this.node, this.node.inferredAutoLayout, this.tokens)

    if (autoLayoutBuilder)
      this.attributes.push(autoLayoutBuilder.build())
  }

  /**
   * Builds and returns the final CSS class string.
   * It combines all the handled attributes into a single CSS class string.
   * @returns The final CSS class string.
   */
  build(): string {
    this.handlePadding()
    this.handleBorderWidth()
    this.handleBorderRadius()

    this.handleAutoLayout()

    // Implement the logic to concatenate attributes...
    return this.attributes.join(' ').toLowerCase()
  }
}
