/**
 * Determines if the given node has minimal fills properties.
 * @param node The scene node to check.
 * @returns True if the node has minimal fills properties; otherwise, false.
 */
export function isMinimalFillsMixin(node: SceneNode): node is SceneNode & MinimalFillsMixin {
  return 'fills' in node
}

/**
 * Determines if the given node has minimal strokes properties.
 * @param node The scene node to check.
 * @returns True if the node has minimal strokes properties; otherwise, false.
 */
export function isMinimalStrokesMixin(node: SceneNode): node is SceneNode & MinimalStrokesMixin {
  return 'strokes' in node
}

/**
 * Determines if the given node has dimension and position properties.
 * @param node The scene node to check.
 * @returns True if the node has dimension and position properties; otherwise, false.
 */
export function isDimensionAndPositionMixin(node: SceneNode): node is SceneNode & DimensionAndPositionMixin {
  return 'width' in node && 'height' in node && 'x' in node && 'y' in node
}

/**
 * Determines if the given node has layout properties.
 * @param node
 */
export function isLayoutMixin(node: SceneNode): node is SceneNode & LayoutMixin {
  return 'layoutSizingHorizontal' in node && 'layoutSizingVertical' in node
}

/**
 * Determines if the given node has properties related to non-resizable text.
 * @param node The scene node to check.
 * @returns True if the node has non-resizable text properties; otherwise, false.
 */
export function isNonResizableTextMixin(node: SceneNode): node is SceneNode & NonResizableTextMixin {
  return 'fontName' in node && 'fontSize' in node && 'letterSpacing' in node && 'lineHeight' in node
}

/**
 * Determines if the given node is a text node.
 * @param node
 */
export function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT'
}

/**
 * Determines if the given node has corner properties.
 * @param node The scene node to check.
 * @returns True if the node has corner properties; otherwise, false.
 */
export function isCornerMixin(node: SceneNode): node is SceneNode & CornerMixin {
  return 'cornerRadius' in node
}

/**
 * Determines if the given node has properties for rectangular corners.
 * @param node The scene node to check.
 * @returns True if the node has rectangular corner properties; otherwise, false.
 */
export function isRectangleCornerMixin(node: SceneNode) {
  return 'topLeftRadius' in node
    && 'topRightRadius' in node
    && 'bottomLeftRadius' in node
    && 'bottomRightRadius' in node
}

/**
 * Determines if the given node has auto layout properties.
 * @param node The scene node to check.
 * @returns True if the node has auto layout properties; otherwise, false.
 */
export function isAutoLayoutMixin(node: SceneNode): node is SceneNode & AutoLayoutMixin {
  return 'layoutMode' in node
}

/**
 * Determines if the given node has inferred auto layout properties.
 *
 * User has not explicitly set auto-layout, but Figma has inferred auto-layout
 * https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
 * @param node
 */
export function isInferredAutoLayout(node: SceneNode): node is SceneNode & AutoLayoutMixin {
  return 'inferredAutoLayout' in node && node.inferredAutoLayout !== null
}

/**
 * Determines if the given node has individual stroke properties.
 * @param node - The scene node to check.
 */
export function isIndividualStrokesMixin(node: SceneNode): node is SceneNode & IndividualStrokesMixin {
  return 'strokeTopWeight' in node
    && 'strokeBottomWeight' in node
    && 'strokeLeftWeight' in node
    && 'strokeRightWeight' in node
}
