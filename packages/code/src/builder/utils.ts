import { getAppliedTokens } from '../tokens/tokens'
import type { Properties } from '../tokens/properties'

/**
 * Converts an RGB color value to HEX format.
 *
 * This function takes in three parameters representing the red, green, and blue
 * components of an RGB color, each in the range of 0 to 255. It then converts
 * these values to a hexadecimal color string.
 *
 * @param {number} r - The red component of the color, in the range 0-255.
 * @param {number} g - The green component of the color, in the range 0-255.
 * @param {number} b - The blue component of the color, in the range 0-255.
 * @param {boolean} scale - Whether to scale the RGB values to the 0-1 range.
 * @returns {string} The HEX representation of the color.
 */
export function rgbToHex(r: number, g: number, b: number, scale: boolean = false): string {
  if (scale) {
    // Scale from 0-1 to 0-255 if necessary
    r = Math.round(r * 255)
    g = Math.round(g * 255)
    b = Math.round(b * 255)
  }

  // Ensure values are within the correct range
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))

  // Convert the components to hexadecimal and return the formatted string
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

/**
 * Converts a HEX color value to RGB format.
 * @param hex - The HEX color value to convert (e.g. "#FF0000").
 * @param scale - Whether to scale the RGB values to the 0-1 range.
 * @returns The RGB representation of the color.
 */
export function hexToRGB(hex: string, scale: boolean = false): { r: number, g: number, b: number } {
  let r = 0
  let g = 0
  let b = 0

  if (hex.length == 7) {
    r = Number.parseInt(hex.substring(1, 3), 16)
    g = Number.parseInt(hex.substring(3, 5), 16)
    b = Number.parseInt(hex.substring(5, 7), 16)

    if (scale) {
      // Scale to 0-1 range
      r = r / 255
      g = g / 255
      b = b / 255
    }
  }
  else {
    throw new Error('Invalid HEX color format')
  }

  return { r, g, b }
}

/**
 * Retrieves the token value of a given type for a specified scene node.
 *
 * @param {SceneNode} node - The scene node from which to retrieve the token value.
 * @param {Properties} type - The type of token to retrieve.
 * @return {string|null} - The token value of the specified type if found, otherwise null.
 */
export function getToken(node: SceneNode, type: Properties): string | null {
  const tokens = getAppliedTokens(node)
  return tokens.get(type) || null
}

/**
 * Checks if a given node has a token of a specified type applied to it.
 * @param node - The node to check for the token.
 * @param type - The type of token to check for.
 */
export function hasToken(node: SceneNode, type: Properties): boolean {
  return getAppliedTokens(node).has(type)
}
