import { retrieveTopFill } from '../common/retrieve-fill'
import type { DesignTokens } from '../tokens'
import { getAppliedTokens } from '../tokens'
import { getUnoCSSAutoLayoutProps } from './auto-layout'

export class UnocssBuilder {
  private attributes: string[] = []
  private readonly tokens: DesignTokens

  constructor(node: SceneNode) {
    this.tokens = getAppliedTokens(node)

    if (node.type === 'COMPONENT') {
      this.commonShapeStyles(node)
      this.autoLayout(node)
    }
  }

  commonShapeStyles(node: MinimalFillsMixin & SceneNode) {
    this.color(node.fills)
  }

  autoLayout(node: GeometryMixin & BlendMixin & SceneNode) {
    if (node.type !== 'COMPONENT')
      return this

    // User has explicitly set auto-layout
    if (node.layoutMode !== 'NONE') {
      console.log('node.layoutMode')
      const rowColumn = getUnoCSSAutoLayoutProps(node, node, this.tokens)
      this.attributes.push(rowColumn)
    }

    // User has not explicitly set auto-layout, but Figma has inferred auto-layout
    // https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
    else if (node.inferredAutoLayout !== null) {
      console.log('node.inferredAutoLayout')
    }

    // No explicitly set or automatically inferred auto-layout
    else {
      // Auto-layout is disabled
      console.log('node.layoutMode NONE')
    }

    return this
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

  build(): string {
    return this.attributes.join(' ')
  }
}
