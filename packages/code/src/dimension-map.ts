export type TailwindDimensionMap = Record<number, string>

export const dimensionMap: TailwindDimensionMap = {
  0: '0',
  1: 'px',
  2: '0.5',
  4: '1',
  6: '1.5',
  8: '2',
  10: '2.5',
  12: '3',
  14: '3.5',
  16: '4',
  20: '5',
  24: '6',
  28: '7',
  32: '8',
  36: '9',
  40: '10',
  44: '11',
  48: '12',
  56: '14',
  64: '16',
  80: '20',
  96: '24',
  112: '28',
  128: '32',
  144: '36',
  160: '40',
  176: '44',
  192: '48',
  208: '52',
  224: '56',
  240: '60',
  256: '64',
  288: '72',
  320: '80',
  384: '96',
}

const nearestDimensionCache = new Map<number, string>()

/**
 * Finds the nearest dimension in the `dimensions` object based on the given pixel value.
 *
 * @param {number} px - The pixel value to search for nearest dimension.
 * @returns {string} The nearest dimension found in the `dimensions` object.
 */
export function findNearestDimension(px: number): string {
  const cacheKey = getDimensionCacheKey(px)

  if (nearestDimensionCache.has(cacheKey))
    return nearestDimensionCache.get(cacheKey)!

  const keys = Object.keys(dimensionMap).map(Number)
  const nearest = keys.reduce((prev, curr) => Math.abs(curr - px) < Math.abs(prev - px) ? curr : prev)

  const nearestDimension = dimensionMap[nearest]
  nearestDimensionCache.set(cacheKey, nearestDimension)

  return nearestDimension
}

function getDimensionCacheKey(px: number): number {
  return px
}
