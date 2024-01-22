import type { DesignTokens } from '../tokens'
import { Properties } from '../properties'

function getFlexDirection(node: InferredAutoLayoutResult): string {
  return node.layoutMode === 'HORIZONTAL' ? '' : 'flex-col'
}

function getJustifyContent(node: InferredAutoLayoutResult): string {
  switch (node.primaryAxisAlignItems) {
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

function getAlignItems(node: InferredAutoLayoutResult): string {
  switch (node.counterAxisAlignItems) {
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

function getGap(node: InferredAutoLayoutResult, tokens: DesignTokens): string {
  const hasGap = node.itemSpacing > 0 && node.primaryAxisAlignItems !== 'SPACE_BETWEEN'

  if (hasGap) {
    console.log(tokens)
    const tokenValue = tokens.get(Properties.itemSpacing)
    if (tokenValue === undefined)
      console.error('You\'re using the gap property, but you haven\'t set the itemSpacing token.')
    else
      return `gap-$${tokenValue}`
  }

  return ''
}

function getFlex(node: SceneNode, autoLayout: InferredAutoLayoutResult): string {
  return node.parent
    && 'layoutMode' in node.parent
    && node.parent.layoutMode === autoLayout.layoutMode
    ? 'flex'
    : 'inline-flex'
}

export function getUnoCSSAutoLayoutProps(
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult,
  tokens: DesignTokens,
): string {
  return Object.values({
    flex: getFlex(node, autoLayout),
    flexDirection: getFlexDirection(autoLayout),
    justifyContent: getJustifyContent(autoLayout),
    alignItems: getAlignItems(autoLayout),
    gap: getGap(autoLayout, tokens),
  })
    .filter(value => value !== '')
    .join(' ')
}
