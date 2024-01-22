import { retrieveTopFill } from '../common/retrieve-fill'
import type { DesignTokens } from '../tokens'
import { getAppliedTokens } from '../tokens'

export class UnocssBuilder {
  private attributes: string[] = []
  private readonly tokens: DesignTokens

  constructor(node: SceneNode) {
    this.tokens = getAppliedTokens(node)
  }

  commonShapeStyles(node: GeometryMixin & BlendMixin & SceneNode) {
    this.color(node.fills)
  }

  color(paint: MinimalFillsMixin['fills']): this {
    const fill = retrieveTopFill(paint)

    if (fill && fill.type === 'SOLID') {
      this.attributes.push(`bg-$${this.tokens.fill}`)

      console.log('tokens', this.tokens)
    }
    else {
      console.error('fill is not solid')
    }

    return this
  }

  build(additionalAttr = ''): string {
    this.attributes.push(additionalAttr)
    return this.attributes.join(' ')
  }
}
