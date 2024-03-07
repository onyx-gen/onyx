import type { Unit } from '@onyx/types'
import type { InferenceDimensionMap } from '../../config/dimension'
import type { GenericUtilityValue } from '../types'

const nearestDimensionCache = new Map<number, string>()

export function createDimensionHandler(
  dimensionMap: InferenceDimensionMap,
  nearestInference: boolean,
  unit: Unit,
): (widthOrHeight: number) => GenericUtilityValue {
  return (widthOrHeight: number) => getInferredDimension(widthOrHeight, dimensionMap, nearestInference, unit)
}

/**
 * Gets the inferred dimension based on the provided width or height value.
 * @param {number} widthOrHeight - The width or height value.
 * @param {InferenceDimensionMap} dimensionMap - The dimension map to use for inference.
 * @param {boolean} nearestInference - Whether to use the nearest inference or not.
 * @param {Unit} unit - The unit to use for the inferred dimension.
 * @return {GenericUtilityValue} - The inferred dimension object.
 */
export function getInferredDimension(
  widthOrHeight: number,
  dimensionMap: InferenceDimensionMap,
  nearestInference: boolean,
  unit: Unit,
): GenericUtilityValue {
  if (nearestInference) {
    const themeDimension: string | undefined = dimensionMap[widthOrHeight]?.[0]
    if (themeDimension) {
      return {
        mode: 'inferred',
        type: 'generic',
        value: themeDimension,
      }
    }

    const nearestDimension = findNearestDimension(widthOrHeight, dimensionMap)
    return {
      mode: 'inferred',
      type: 'generic',
      value: nearestDimension,
    }
  }

  if (unit === 'rem') {
    return {
      mode: 'arbitrary',
      type: 'generic',
      value: `${widthOrHeight / 16}rem`,
    }
  }
  else {
    return {
      mode: 'arbitrary',
      type: 'generic',
      value: `${widthOrHeight}px`,
    }
  }
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
