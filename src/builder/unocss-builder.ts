import type { DesignTokens } from '../tokens'
import { getAppliedTokens } from '../tokens'
import { Properties } from '../properties'
import { getUnoCSSAutoLayoutProps } from './auto-layout'

interface Padding {
  top: string | null
  bottom: string | null
  left: string | null
  right: string | null
}

interface BorderRadius {
  topLeft: string | null
  topRight: string | null
  bottomLeft: string | null
  bottomRight: string | null
}

interface BorderWidth {
  top: string | null
  bottom: string | null
  left: string | null
  right: string | null
}

export class UnocssBuilder {
  private attributes: string[] = []
  private readonly tokens: DesignTokens

  private padding: Padding = {
    top: null,
    bottom: null,
    left: null,
    right: null,
  }

  private borderRadius: BorderRadius = {
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,
  }

  private borderWidth: BorderWidth = {
    top: null,
    bottom: null,
    left: null,
    right: null,
  }

  constructor(private node: SceneNode) {
    this.tokens = getAppliedTokens(node)

    this.tokens.forEach((token, tokenType) => {
      switch (tokenType) {
        case Properties.typography:
          this.handleTypographyToken(token)
          break
        case Properties.fill:
          this.handleFillToken(token)
          break

        case Properties.paddingLeft:
          this.padding.left = token
          break
        case Properties.paddingRight:
          this.padding.right = token
          break
        case Properties.paddingTop:
          this.padding.top = token
          break
        case Properties.paddingBottom:
          this.padding.bottom = token
          break

        case Properties.height:
          this.handleHeight(token)
          break
        case Properties.width:
          this.handleWidth(token)
          break
        case Properties.sizing:
          this.handleHeight(token)
          this.handleWidth(token)
          break

        case Properties.borderRadius:
          this.borderRadius.topLeft = token
          this.borderRadius.topRight = token
          this.borderRadius.bottomLeft = token
          this.borderRadius.bottomRight = token
          break
        case Properties.borderRadiusTopLeft:
          this.borderRadius.topLeft = token
          break
        case Properties.borderRadiusTopRight:
          this.borderRadius.topRight = token
          break
        case Properties.borderRadiusBottomLeft:
          this.borderRadius.bottomLeft = token
          break
        case Properties.borderRadiusBottomRight:
          this.borderRadius.bottomRight = token
          break

        case Properties.borderColor:
          this.handleBorderColor(token)
          break

        case Properties.borderWidth:
          this.borderWidth.top = token
          this.borderWidth.bottom = token
          this.borderWidth.left = token
          this.borderWidth.right = token
          break
        case Properties.borderWidthBottom:
          this.borderWidth.bottom = token
          break
        case Properties.borderWidthLeft:
          this.borderWidth.left = token
          break
        case Properties.borderWidthRight:
          this.borderWidth.right = token
          break
        case Properties.borderWidthTop:
          this.borderWidth.top = token
          break

        default:
          console.log('token is not yet supported by codegen', tokenType, token)
          break
      }
    })
  }

  handleTypographyToken(token: string) {
    this.attributes.push(`font-$${token}`)
  }

  handleFillToken(token: string) {
    if (this.node.type === 'TEXT')
      this.attributes.push(`color-$${token}`)
    else
      this.attributes.push(`bg-$${token}`)
  }

  handlePadding() {
    // all sides the same padding
    const p = this.padding.top !== null
      && this.padding.top === this.padding.bottom
      && this.padding.bottom === this.padding.left
      && this.padding.left === this.padding.right

    if (p) {
      this.attributes.push(`p-$${this.padding.top}`)
      return
    }

    // one axis the same
    const px = this.padding.left !== null && this.padding.left === this.padding.right
    const py = this.padding.top !== null && this.padding.top === this.padding.bottom

    if (px || py) {
      if (px)
        this.attributes.push(`px-$${this.padding.left}`)

      if (py)
        this.attributes.push(`py-$${this.padding.top}`)

      if (px && py)
        return
    }

    if (this.padding.top !== null && !py)
      this.attributes.push(`pt-$${this.padding.top}`)
    if (this.padding.right !== null && !px)
      this.attributes.push(`pr-$${this.padding.right}`)
    if (this.padding.bottom !== null && !py)
      this.attributes.push(`pb-$${this.padding.bottom}`)
    if (this.padding.left !== null && !px)
      this.attributes.push(`pl-$${this.padding.left}`)
  }

  handleBorderRadius() {
    const b = this.borderRadius.topLeft !== null
      && this.borderRadius.topLeft === this.borderRadius.topRight
      && this.borderRadius.topRight === this.borderRadius.bottomLeft
      && this.borderRadius.bottomLeft === this.borderRadius.bottomRight

    if (b) {
      this.attributes.push(`rounded-$${this.borderRadius.topLeft}`)
      return
    }

    const hasBorderTop = this.borderRadius.topRight !== null
      && this.borderRadius.topRight === this.borderRadius.topLeft

    const hasBorderBottom = this.borderRadius.bottomLeft !== null
      && this.borderRadius.bottomLeft === this.borderRadius.bottomRight

    if (hasBorderTop || hasBorderBottom) {
      if (hasBorderTop)
        this.attributes.push(`rounded-t-$${this.borderRadius.topLeft}`)

      if (hasBorderBottom)
        this.attributes.push(`rounded-b-$${this.borderRadius.bottomLeft}`)

      if (hasBorderTop && hasBorderBottom)
        return
    }

    const hasBorderLeft = this.borderRadius.topLeft !== null
      && this.borderRadius.topLeft === this.borderRadius.bottomLeft

    const hasBorderRight = this.borderRadius.topRight !== null
      && this.borderRadius.topRight === this.borderRadius.bottomRight

    if (hasBorderLeft || hasBorderRight) {
      if (hasBorderLeft)
        this.attributes.push(`rounded-l-$${this.borderRadius.topLeft}`)

      if (hasBorderRight)
        this.attributes.push(`rounded-r-$${this.borderRadius.topRight}`)

      if (hasBorderLeft && hasBorderRight)
        return
    }

    const hasBorderTopLeft = this.borderRadius.topLeft !== null
    const hasBorderTopRight = this.borderRadius.topRight !== null
    const hasBorderBottomLeft = this.borderRadius.bottomLeft !== null
    const hasBorderBottomRight = this.borderRadius.bottomRight !== null

    if (hasBorderTopLeft && !hasBorderTop && !hasBorderLeft)
      this.attributes.push(`rounded-tl-$${this.borderRadius.topLeft}`)
    if (hasBorderTopRight && !hasBorderTop && !hasBorderRight)
      this.attributes.push(`rounded-tr-$${this.borderRadius.topRight}`)
    if (hasBorderBottomLeft && !hasBorderBottom && !hasBorderLeft)
      this.attributes.push(`rounded-bl-$${this.borderRadius.bottomLeft}`)
    if (hasBorderBottomRight && !hasBorderBottom && !hasBorderRight)
      this.attributes.push(`rounded-br-$${this.borderRadius.bottomRight}`)
  }

  handleBorderColor(token: string) {
    this.attributes.push(`border-color-$${token}`)
  }

  handleBorderWidth() {
    // all sides the same padding
    const p = this.borderWidth.top !== null
      && this.borderWidth.top === this.borderWidth.bottom
      && this.borderWidth.bottom === this.borderWidth.left
      && this.borderWidth.left === this.borderWidth.right

    if (p) {
      this.attributes.push(`border-size-$${this.borderWidth.top}`)
      return
    }

    // one axis the same
    const px = this.borderWidth.left !== null && this.borderWidth.left === this.borderWidth.right
    const py = this.borderWidth.top !== null && this.borderWidth.top === this.borderWidth.bottom

    if (px || py) {
      if (px)
        this.attributes.push(`border-x-size-$${this.borderWidth.left}`)

      if (py)
        this.attributes.push(`border-y-size-$${this.borderWidth.top}`)

      if (px && py)
        return
    }

    if (this.borderWidth.top !== null && !py)
      this.attributes.push(`border-t-size-$${this.borderWidth.top}`)
    if (this.borderWidth.right !== null && !px)
      this.attributes.push(`border-r-size-$${this.borderWidth.right}`)
    if (this.borderWidth.bottom !== null && !py)
      this.attributes.push(`border-b-size-$${this.borderWidth.bottom}`)
    if (this.borderWidth.left !== null && !px)
      this.attributes.push(`border-l-size-$${this.borderWidth.left}`)
  }

  handleHeight(token: string) {
    this.attributes.push(`h-$${token}`)
  }

  handleWidth(token: string) {
    this.attributes.push(`w-$${token}`)
  }

  handleAutoLayout() {
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
    this.handleBorderRadius()
    this.handleBorderWidth()
    this.handleAutoLayout()

    return this.attributes.join(' ').toLowerCase()
  }
}
