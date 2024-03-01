import type { InferenceDimensionMap } from '../../config/dimension-map'

const nearestDimensionCache = new Map<number, string>()

/**
 * Finds the nearest dimension in the `dimensions` object based on the given pixel value.
 *
 * @param {number} px - The pixel value to search for nearest dimension.
 * @param inferenceDimensionMap - The dimension map to search for the nearest dimension.
 * @returns {string} The nearest dimension found in the `dimensions` object.
 */
export function findNearestDimension(
  px: number,
  inferenceDimensionMap: InferenceDimensionMap,
): string {
  const cacheKey = getDimensionCacheKey(px)

  if (nearestDimensionCache.has(cacheKey))
    return nearestDimensionCache.get(cacheKey)!

  const keys = Object.keys(inferenceDimensionMap).map(Number)
  const nearest = keys.reduce((prev, curr) => Math.abs(curr - px) < Math.abs(prev - px) ? curr : prev)

  const nearestDimension = inferenceDimensionMap[nearest]
  nearestDimensionCache.set(cacheKey, nearestDimension)

  return nearestDimension
}

/**
 * Returns the cache key for the given pixel value.
 * @param px - The pixel value.
 */
function getDimensionCacheKey(px: number): number {
  return px
}
