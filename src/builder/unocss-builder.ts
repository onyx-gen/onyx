import type { DesignTokens } from '../tokens'
import { getAppliedTokens } from '../tokens'
import { Properties } from '../properties'
import { getUnoCSSAutoLayoutProps } from './auto-layout'

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

export class UnocssBuilder {
  private attributes: string[] = []
  private readonly tokens: DesignTokens
  private padding: RectSides = { top: null, bottom: null, left: null, right: null }
  private borderWidth: RectSides = { top: null, bottom: null, left: null, right: null }
  private borderRadius: RectCorners = { topLeft: null, topRight: null, bottomLeft: null, bottomRight: null }

  constructor(private node: SceneNode) {
    this.tokens = getAppliedTokens(node)
    this.tokens.forEach((token, tokenType) => this.handleToken(token, tokenType))
  }

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

  private handleDimension(dimension: 'height' | 'width', token: string) {
    this.attributes.push(`${dimension[0]}-$${token}`)
  }

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

  private handlePadding() {
    this.handleRectSidesAttribute(this.padding, 'p')
  }

  private handleBorderWidth() {
    this.handleRectSidesAttribute(this.borderWidth, 'border-size')
  }

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

  private handleBorderRadius() {
    this.handleRectCornersAttribute(this.borderRadius, 'rounded')
  }

  private handleAutoLayout() {
    if (!('layoutMode' in this.node))
      return

    let css = ''

    if (this.node.layoutMode !== 'NONE')
      css = getUnoCSSAutoLayoutProps(this.node, this.node, this.tokens)

    // User has not explicitly set auto-layout, but Figma has inferred auto-layout
    // https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
    else if (this.node.inferredAutoLayout !== null)
      css = getUnoCSSAutoLayoutProps(this.node, this.node.inferredAutoLayout, this.tokens)

    this.attributes.push(css)
  }

  build(): string {
    this.handlePadding()
    this.handleBorderWidth()
    this.handleBorderRadius()

    this.handleAutoLayout()

    // Implement the logic to concatenate attributes...
    return this.attributes.join(' ').toLowerCase()
  }
}
