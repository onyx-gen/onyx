export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * Creates an indentation string.
 *
 * @param {number} depth - The number of indentation levels.
 * @returns {string} A string containing two spaces repeated 'depth' times.
 */
export function createIndent(depth: number): string {
  return '  '.repeat(depth)
}

/**
 * Retrieves the first selected node in the Figma document.
 *
 * @returns {SceneNode | null} The first selected node if any, null otherwise.
 */
export function getSelectedNode(): SceneNode | null {
  const selection = figma.currentPage.selection

  if (selection.length > 0)
    return selection[0]

  return null
}
