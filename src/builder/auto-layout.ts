// TODO MF
function pxToLayoutSize(value: number): string {
  return `${value}px`
}

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

function getGap(node: InferredAutoLayoutResult): string {
  return node.itemSpacing > 0 && node.primaryAxisAlignItems !== 'SPACE_BETWEEN'
    ? `gap-${pxToLayoutSize(node.itemSpacing)}`
    : ''
}

function getFlex(node: SceneNode, autoLayout: InferredAutoLayoutResult): string {
  return node.parent
    && 'layoutMode' in node.parent
    && node.parent.layoutMode === autoLayout.layoutMode
    ? 'flex'
    : 'inline-flex'
}

export function getUnoCSSAutoLayoutProps(node: SceneNode, autoLayout: InferredAutoLayoutResult): string {
  return Object.values({
    flexDirection: getFlexDirection(autoLayout),
    justifyContent: getJustifyContent(autoLayout),
    alignItems: getAlignItems(autoLayout),
    gap: getGap(autoLayout),
    flex: getFlex(node, autoLayout),
  })
    .filter(value => value !== '')
    .join(' ')
}
