import type { DesignTokens } from '../tokens/tokens'
import { getAppliedTokens } from '../tokens/tokens'
import { Properties } from '../tokens/properties'
import { replaceToken } from '../tokens/replacer'
import type { Configuration } from '../config/config'
import AutoLayoutBuilder from './auto-layout-builder'
import type { IBuilder, RectCorners, RectSides } from './types'

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
export class UnocssBuilder implements IBuilder {
  private attributes: Set<string> = new Set()
  private readonly tokens: DesignTokens
  private padding: RectSides = { top: null, bottom: null, left: null, right: null }
  private borderWidth: RectSides = { top: null, bottom: null, left: null, right: null }
  private borderRadius: RectCorners = { topLeft: null, topRight: null, bottomLeft: null, bottomRight: null }

  /**
   * Constructs an UnoCSS builder with the specified node.
   * It initializes design tokens for the node and sets up the builder.
   * @param node The scene node for which to build CSS attributes.
   * @param config The configuration for the builder.
   */
  constructor(
    private node: SceneNode,
    private config: Configuration,
  ) {
    this.tokens = getAppliedTokens(node)
    this.tokens.forEach((token, tokenType) =>
      this.canHandleToken(tokenType) && this.handleToken(token, tokenType),
    )
  }

  /**
   * Checks whether the given token type can be handled via the handleToken method.
   *
   * Some tokenTypes are handled outside the handleToken method, such as itemSpacing.
   * This tokenType is handled in the AutoLayoutBuilder class.
   * @param tokenType
   * @private
   */
  private canHandleToken(tokenType: Properties): boolean {
    return tokenType !== Properties.itemSpacing
  }

  /**
   * Handles the given token based on its type.
   * It maps various token types to their respective handler functions.
   * @param _token The value of the design token.
   * @param tokenType The type of the design token.
   */
  private handleToken(_token: string, tokenType: Properties) {
    const token = replaceToken(_token)

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
        this.handleDimension('h', token)
        this.handleDimension('w', token)
      },

      [Properties.height]: () => this.handleDimension('h', token),
      [Properties.width]: () => this.handleDimension('w', token),

      [Properties.minWidth]: () => this.handleDimension('min-w', token),
      [Properties.minHeight]: () => this.handleDimension('min-h', token),

      [Properties.maxWidth]: () => this.handleDimension('max-w', token),
      [Properties.maxHeight]: () => this.handleDimension('max-h', token),
    }

    const handlers: TokenHandlers = {
      [Properties.typography]: () => this.attributes.add(`font-$${token}`),
      [Properties.fill]: () => this.attributes.add(this.node.type === 'TEXT' ? `color-$${token}` : `bg-$${token}`),
      [Properties.borderColor]: () => this.attributes.add(`border-color-$${token}`),
      [Properties.boxShadow]: () => this.attributes.add(`shadow-$${token}`),

      ...paddingHandlers,
      ...borderWidthHandlers,
      ...borderRadiusHandlers,
      ...sizingHandlers,
    }

    const propertiesToIgnore = new Set([
      Properties.fontFamilies,
      Properties.fontWeights,
      Properties.fontSizes,
      Properties.lineHeights,
      Properties.letterSpacing,
    ])

    // Warn if there are unhandled properties
    if (Object.keys(handlers).length + propertiesToIgnore.size !== Object.keys(Properties).length) {
      const unhandledProperties = Object.keys(Properties).filter(property => !Object.keys(handlers).includes(property) && !propertiesToIgnore.has(property as Properties))
      console.warn(`There are ${unhandledProperties.length} properties that do not have a handler defined in UnocssBuilder: ${unhandledProperties.join(', ')}`)
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
   * @param dimension The dimension type (e.g. 'h' for 'height').
   * @param token The value of the dimension token.
   */
  private handleDimension(dimension: 'h' | 'w' | 'min-w' | 'min-h' | 'max-w' | 'max-h', token: string) {
    this.attributes.add(`${dimension[0]}-$${token}`)
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
      this.attributes.add(`${attributePrefix}-$${rectSides.top}`)
      return
    }

    // Check if one axis is the same
    const axisXEqual = rectSides.left !== null && rectSides.left === rectSides.right
    const axisYEqual = rectSides.top !== null && rectSides.top === rectSides.bottom

    if (axisXEqual)
      this.attributes.add(`${attributePrefix}-x-$${rectSides.left}`)
    if (axisYEqual)
      this.attributes.add(`${attributePrefix}-y-$${rectSides.top}`)

    if (axisXEqual && axisYEqual)
      return

    // Individual sides
    if (rectSides.top !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-t-$${rectSides.top}`)
    if (rectSides.right !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-r-$${rectSides.right}`)
    if (rectSides.bottom !== null && !axisYEqual)
      this.attributes.add(`${attributePrefix}-b-$${rectSides.bottom}`)
    if (rectSides.left !== null && !axisXEqual)
      this.attributes.add(`${attributePrefix}-l-$${rectSides.left}`)
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
      this.attributes.add(`${attributePrefix}-$${rectCorners.topLeft}`)
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
      this.attributes.add(`${attributePrefix}-t-$${rectCorners.topLeft}`)
    if (hasBottomCornersEqual)
      this.attributes.add(`${attributePrefix}-b-$${rectCorners.bottomLeft}`)
    if (hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-l-$${rectCorners.topLeft}`)
    if (hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-r-$${rectCorners.topRight}`)

    if (hasTopCornersEqual && hasBottomCornersEqual && hasLeftCornersEqual && hasRightCornersEqual)
      return

    if (rectCorners.topLeft !== null && !hasTopCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-tl-$${rectCorners.topLeft}`)
    if (rectCorners.topRight !== null && !hasTopCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-tr-$${rectCorners.topRight}`)
    if (rectCorners.bottomLeft !== null && !hasBottomCornersEqual && !hasLeftCornersEqual)
      this.attributes.add(`${attributePrefix}-bl-$${rectCorners.bottomLeft}`)
    if (rectCorners.bottomRight !== null && !hasBottomCornersEqual && !hasRightCornersEqual)
      this.attributes.add(`${attributePrefix}-br-$${rectCorners.bottomRight}`)
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
      autoLayoutBuilder = new AutoLayoutBuilder(this.node, this.node, this.config)

    // User has not explicitly set auto-layout, but Figma has inferred auto-layout
    // https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
    else if (this.node.inferredAutoLayout !== null)
      autoLayoutBuilder = new AutoLayoutBuilder(this.node, this.node.inferredAutoLayout, this.config)

    if (autoLayoutBuilder)
      autoLayoutBuilder.build().forEach(css => this.attributes.add(css))
  }

  /**
   * Handles the text node properties.
   * It adds CSS classes based on the text properties of the node.
   */
  private handleTextNode() {
    if (this.node.type !== 'TEXT')
      return

    const textNode = this.node as TextNode

    if (this.isSuperScriptTextNode(textNode))
      this.attributes.add('superscript')
    else if (this.isSubScriptTextNode(textNode))
      this.attributes.add('subscript')
  }

  /**
   * Checks if a given text node is a superscript text node.
   *
   * @param {TextNode} node - The text node to check.
   * @returns {boolean} - Returns true if the text node is a superscript text node, otherwise false.
   */
  private isSuperScriptTextNode(node: TextNode): boolean {
    // Get the OpenType features applied to the text in the node.
    const openTypeFeatures = node.getRangeOpenTypeFeatures(0, node.characters.length)

    // Check if there are any OpenType features applied.
    if (Object.keys(openTypeFeatures).length > 0) {
      // Check if the 'SUPS' (superscript) OpenType feature is applied.
      // @ts-expect-error: SUPS is not in the type definition
      if (openTypeFeatures.SUPS === true)
        return true
    }

    // If no 'SUPS' feature is found, return false.
    return false
  }

  /**
   * Checks if a given text node is a subscript text node.
   *
   * @param {TextNode} node - The text node to check.
   * @returns {boolean} - Returns true if the text node is a subtext text node, otherwise false.
   */
  private isSubScriptTextNode(node: TextNode): boolean {
    // Get the OpenType features applied to the text in the node.
    const openTypeFeatures = node.getRangeOpenTypeFeatures(0, node.characters.length)

    // Check if there are any OpenType features applied.
    if (Object.keys(openTypeFeatures).length > 0) {
      // Check if the 'SUBS' (superscript) OpenType feature is applied.
      // @ts-expect-error: SUBS is not in the type definition
      if (openTypeFeatures.SUBS === true)
        return true
    }

    // If no 'SUBS' feature is found, return false.
    return false
  }

  /**
   * Builds and returns the final CSS class string.
   * It combines all the handled attributes into a single CSS class string.
   * @returns The final CSS class string.
   */
  public build(node: SceneNode): Set<string> {
    console.log('Building CSS for node', node.name)

    this.handlePadding()
    this.handleBorderWidth()
    this.handleBorderRadius()

    this.handleAutoLayout()
    this.handleTextNode()

    // Lowercase all attributes
    this.attributes = new Set([...this.attributes].map(attr => attr.toLowerCase()))

    // Implement the logic to concatenate attributes...
    return this.attributes
  }
}
