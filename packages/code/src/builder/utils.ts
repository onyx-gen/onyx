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
 * @returns {string} The HEX representation of the color.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  // Ensure values are within the correct range
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))

  // Convert the components to hexadecimal and return the formatted string
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}
