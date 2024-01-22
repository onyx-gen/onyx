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
      this.color(node)
      this.autoLayout(node)
    }

    if (node.type === 'TEXT') {
      this.color(node)
      this.autoLayout(node)
      this.typography(node)
    }
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

  typography(node: SceneNode) {
    if (this.tokens.typography)
      this.attributes.push(`font-$${this.tokens.typography}`)
  }

  color(node: MinimalFillsMixin & SceneNode): this {
    const paint: MinimalFillsMixin['fills'] = node.fills

    const fill = retrieveTopFill(paint)

    if (!fill)
      return this

    if (fill.type === 'SOLID') {
      console.log('solid')
      if (node.type === 'TEXT')
        this.attributes.push(`color-$${this.tokens.fill}`)
      else
        this.attributes.push(`bg-$${this.tokens.fill}`)
    }

    // TODO MF
    else { console.error('fill is not solid', fill) }

    return this
  }

  build(): string {
    return this.attributes.join(' ')
  }
}
