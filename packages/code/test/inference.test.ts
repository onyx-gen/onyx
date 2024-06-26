import { describe, expect, it } from 'vitest'
import { findNearestColor } from '../src/builder/inference/color'
import { findNearestDimension } from '../src/builder/inference/dimension'
import { Configuration } from '../src/config/config'

describe('colors', () => {
  const config = new Configuration({})

  describe('findNearestColor', () => {
    it('should return closest color in the colorMap for provided RGB', () => {
      const result = findNearestColor({ r: 227, g: 233, b: 239 }, config.colorLookup) // A color that is not in the map
      expect(result).toBe('light-50')
    })

    it('should handle exact match', () => {
      const result = findNearestColor({ r: 226, g: 232, b: 240 }, config.colorLookup) // An exact color from the map
      expect(result).toBe('light-50')
    })
  })

  describe('findNearestDimension', () => {
    it('should return closest dimension in the dimensionMap for provided pixel value', () => {
      const result = findNearestDimension(19, config.dimensionsLookup) // A pixel value that is not in the map
      expect(result).toBe('lg')
    })

    it('should handle exact match', () => {
      const result = findNearestDimension(16, config.dimensionsLookup) // An exact pixel value from the map
      expect(result).toBe('4')
    })
  })
})
