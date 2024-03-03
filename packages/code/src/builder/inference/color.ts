import type { InferenceColorMap } from '../../config/color'

const nearestColorCache = new Map<string, string>()

/**
 * Finds the nearest color in the colors based on the RGB value provided.
 *
 * @param {RGB} rgb - The RGB value to find the nearest color for.
 * @param {InferenceColorMap} colorMap - The color map to search for the nearest color.
 * @return {string} The closest color in the colors represented as a hexadecimal value.
 */
export function findNearestColor(
  rgb: RGB,
  colorMap: InferenceColorMap,
): string {
  const cacheKey = getRGBCacheKey(rgb)

  if (nearestColorCache.has(cacheKey))
    return colorMap[nearestColorCache.get(cacheKey)!][0]

  const { r, g, b } = rgb
  const r1 = Math.floor(r * 256)
  const g1 = Math.floor(g * 256)
  const b1 = Math.floor(b * 256)

  let minDistance = Number.POSITIVE_INFINITY
  let closestColorHEX = ''

  for (const hex of Object.keys(colorMap)) {
    // The hex must be converted back to dec values [r, g, b]
    const [r2, g2, b2] = hex2Dec(hex)

    const distance = Math.sqrt(
      (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2,
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColorHEX = hex
    }
  }

  nearestColorCache.set(cacheKey, closestColorHEX)

  return colorMap[closestColorHEX][0]
}

/**
 * Returns the cache key for the given RGB object.
 *
 * @param {RGB} rgb - The RGB object.
 * @returns {string} The cache key.
 */
function getRGBCacheKey(rgb: RGB): string {
  return `${rgb.r},${rgb.g},${rgb.b}`
}

/**
 * Converts a hexadecimal color code to its RGB representation.
 *
 * @param {string} hex - The hexadecimal color code to convert.
 * @returns {Array.<number,number,number>} - The RGB representation of the hexadecimal color code.
 *   The array contains three values: the red (r), green (g), and blue (b) components of the color.
 */
function hex2Dec(hex: string): [number, number, number] {
  let r = 0
  let g = 0
  let b = 0

  // 3 digits
  if (hex.length === 4) {
    r = Number.parseInt(hex.charAt(1) + hex.charAt(1), 16)
    g = Number.parseInt(hex.charAt(2) + hex.charAt(2), 16)
    b = Number.parseInt(hex.charAt(3) + hex.charAt(3), 16)
  }
  // 6 digits
  else if (hex.length === 7) {
    r = Number.parseInt(hex.slice(1, 3), 16)
    g = Number.parseInt(hex.slice(3, 5), 16)
    b = Number.parseInt(hex.slice(5, 7), 16)
  }

  return [r, g, b]
}
