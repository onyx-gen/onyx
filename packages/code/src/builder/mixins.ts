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
