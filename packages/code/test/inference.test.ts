import { describe, expect, it } from 'vitest'
import { findNearestColor } from '../src/builder/inference/color'
import { colorMap } from '../src/config/colors'
import { findNearestDimension } from '../src/builder/inference/dimension'
import { dimensionMap } from '../src/config/dimension-map'

describe('colors', () => {
  describe('findNearestColor', () => {
    it('should return closest color in the colorMap for provided RGB', () => {
      const result = findNearestColor({ r: 227, g: 233, b: 239 }, colorMap) // A color that is not in the map
      expect(result).toBe('slate-200')
    })

    it('should handle exact match', () => {
      const result = findNearestColor({ r: 226, g: 232, b: 240 }, colorMap) // An exact color from the map
      expect(result).toBe('slate-200')
    })
  })

  describe('findNearestDimension', () => {
    it('should return closest dimension in the dimensionMap for provided pixel value', () => {
      const result = findNearestDimension(19, dimensionMap) // A pixel value that is not in the map
      expect(result).toBe('5')
    })

    it('should handle exact match', () => {
      const result = findNearestDimension(16, dimensionMap) // An exact pixel value from the map
      expect(result).toBe('4')
    })
  })
})
