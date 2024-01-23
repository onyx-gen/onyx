import type { DesignTokens } from '../tokens'
import { Properties } from '../properties'

/**
 * The AutoLayoutBuilder class is responsible for constructing a string of CSS class names
 * based on the properties of a SceneNode and an InferredAutoLayoutResult. It uses DesignTokens
 * for certain values like gaps. The generated string can be used to style elements
 * with CSS utility class frameworks like TailwindCSS or UnoCSS.
 */
class AutoLayoutBuilder {
  /**
   * Constructs an instance of AutoLayoutBuilder.
   *
   * @param node - The SceneNode for which the auto layout properties are inferred.
   * @param autoLayout - The inferred auto layout result of the node.
   * @param tokens - Design tokens used for styling.
   */
  constructor(
    private readonly node: SceneNode,
    private readonly autoLayout: InferredAutoLayoutResult,
    private readonly tokens: DesignTokens,
  ) {}

  /**
   * Determines the flex direction based on the auto layout's layout mode.
   *
   * @returns A string representing the CSS class for flex direction.
   */
  private getFlexDirection(): string {
    return this.autoLayout.layoutMode === 'HORIZONTAL' ? '' : 'flex-col'
  }

  /**
   * Determines the appropriate CSS class for 'justify-content' based on the primary axis alignment.
   *
   * @returns A string representing the CSS class for justify content.
   */
  private getJustifyContent(): string {
    switch (this.autoLayout.primaryAxisAlignItems) {
      case 'MIN':
        return 'justify-start'
      case 'CENTER':
        return 'justify-center'
      case 'MAX':
        return 'justify-end'
      case 'SPACE_BETWEEN':
        return 'justify-between'
    }
  }

  /**
   * Determines the appropriate CSS class for 'align-items' based on the counter axis alignment.
   *
   * @returns A string representing the CSS class for align items.
   */
  private getAlignItems(): string {
    switch (this.autoLayout.counterAxisAlignItems) {
      case 'MIN':
        return 'items-start'
      case 'CENTER':
        return 'items-center'
      case 'MAX':
        return 'items-end'
      case 'BASELINE':
        return 'items-baseline'
    }
  }

  /**
   * Determines the gap between items in the layout, using the design tokens if available.
   *
   * @returns A string representing the CSS class for gap.
   */
  private getGap(): string {
    const hasGap = this.autoLayout.itemSpacing > 0 && this.autoLayout.primaryAxisAlignItems !== 'SPACE_BETWEEN'

    if (hasGap) {
      const tokenValue = this.tokens.get(Properties.itemSpacing)
      if (tokenValue === undefined)
        console.error('You\'re using the gap property, but you haven\'t set the itemSpacing token.')
      else
        return `gap-$${tokenValue}`
    }

    return ''
  }

  /**
   * Determines the flex property based on the node's relationship to its parent.
   *
   * @returns A string representing the CSS class for flex.
   */
  private getFlex(): string {
    return this.node.parent
      && 'layoutMode' in this.node.parent
      && this.node.parent.layoutMode === this.autoLayout.layoutMode
      ? 'flex'
      : 'inline-flex'
  }

  /**
   * Builds a string of CSS class names based on the auto layout properties of the node.
   *
   * @returns A string of CSS class names.
   */
  public build(): string {
    return Object.values({
      flex: this.getFlex(),
      flexDirection: this.getFlexDirection(),
      justifyContent: this.getJustifyContent(),
      alignItems: this.getAlignItems(),
      gap: this.getGap(),
    })
      .filter(value => value !== '')
      .join(' ')
  }
}

export default AutoLayoutBuilder