import type { DesignTokens } from '../tokens'
import { getAppliedTokens } from '../tokens'
import { Properties } from '../properties'

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

  handleHeight(token: string) {
    this.attributes.push(`h-$${token}`)
  }

  handleWidth(token: string) {
    this.attributes.push(`w-$${token}`)
  }

  build(): string {
    this.handlePadding()
    this.handleBorderRadius()

    return this.attributes.join(' ').toLowerCase()
  }
}
