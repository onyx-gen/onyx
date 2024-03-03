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
 * Retrieves the selected nodes in the Figma document.
 *
 * @returns {SceneNode[]} The first selected node if any, null otherwise.
 */
export function getSelectedNodes(): SceneNode[] {
  return [...figma.currentPage.selection]
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

/**
 * Zips two arrays together, creating pairs of corresponding elements.
 *
 * @template T - The type of elements in the arrays.
 * @param {T[]} arr1 - The first array to zip.
 * @param {T[]} arr2 - The second array to zip.
 * @returns {Generator<[T, T]>} A generator yielding pairs of corresponding elements.
 *
 * @example
 * // Example usage:
 * const array1 = [1, 2, 3];
 * const array2 = ['a', 'b', 'c'];
 * const zipped = zip(array1, array2);
 *
 * // Iterating over the generator
 * for (const [element1, element2] of zipped) {
 *     console.log(`(${element1}, ${element2})`);
 * }
 * // Output:
 * // (1, 'a')
 * // (2, 'b')
 * // (3, 'c')
 */
export function* zip<T>(arr1: T[], arr2: T[]): Generator<[T, T]> {
  const length = Math.min(arr1.length, arr2.length)
  for (let i = 0; i < length; i++)
    yield [arr1[i], arr2[i]]
}

/**
 * Transforms the input object into a more printable format.
 * If the object is a Set, it is converted to an array.
 * If the object is an array or a non-null object, it is recursively transformed.
 * In the case of an array, a new array is returned with the same elements.
 * In the case of an object, a new object is returned with the same properties.
 * If the object is neither a Set, an array, nor a non-null object, it is returned as is.
 *
 * @param {any} obj - The object to transform.
 * @returns {any} The transformed object.
 */
export function printObject(obj: any): any {
  if (obj instanceof Set) {
    return Array.from(obj)
  }
  else if (typeof obj === 'object' && obj !== null) {
    const transformedObj: any = Array.isArray(obj) ? [] : {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key))
        transformedObj[key] = printObject(obj[key])
    }
    return transformedObj
  }
  else {
    return obj
  }
}

export function round(n: number) {
  return n
    .toFixed(10)
    .replace(/\.0+$/, '')
    .replace(/(\.\d+?)0+$/, '$1')
}
