export function typedObjectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
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
