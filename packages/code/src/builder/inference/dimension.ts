import type { InferenceDimensionMap } from '../../config/dimension'
import config from '../../config/config'
import { round } from '../../utils'

const nearestDimensionCache = new Map<number, string>()

function addDimensionToUnit(dimensionWithoutUnit: number): string {
  if (config.unit === 'rem')
    return `${round(dimensionWithoutUnit / 16)}rem`

  return `${dimensionWithoutUnit}px`
}

/**
 * Finds the nearest dimension in the `dimensions` object based on the given pixel value.
 *
 * @param {number} dimensionWithoutUnit - The dimension without unit to search for the nearest dimension.
 * @param dimensions - The dimension map to search for the nearest dimension.
 * @returns {string} The nearest dimension found in the `dimensions` object.
 */
export function findNearestDimension(
  dimensionWithoutUnit: number,
  dimensions: InferenceDimensionMap,
): string {
  const cacheKey = getDimensionCacheKey(dimensionWithoutUnit)

  if (nearestDimensionCache.has(cacheKey))
    return nearestDimensionCache.get(cacheKey)!

  const dimension = addDimensionToUnit(dimensionWithoutUnit)

  const keys = Object.keys(dimensions).map(Number)
  const nearest = keys.reduce((prev, curr) => Math.abs(curr - dimensionWithoutUnit) < Math.abs(prev - dimensionWithoutUnit) ? curr : prev)

  const nearestDimension = dimensions[nearest][0]
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
