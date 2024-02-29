import { describe, expect, it } from 'vitest'
import { findNearestColor } from '../src/colors'

describe('colors', () => {
  describe('findNearestColor', () => {
    it('should return closest color in the colorMap for provided RGB', () => {
      const result = findNearestColor({ r: 227, g: 233, b: 239 })
      expect(result).toBe('slate-200')
    })

    it('should handle exact match', () => {
      const result = findNearestColor({ r: 226, g: 232, b: 240 }) // An exact color from the map
      expect(result).toBe('slate-200')
    })
  })
})
