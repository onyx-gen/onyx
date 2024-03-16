import { describe, expect, it } from 'vitest'
import { hexToRGB, rgbToHex } from '../../src/builder/utils'

describe('builder', () => {
  describe('utils', () => {
    it('converts rgb to hex', () => {
      expect(rgbToHex(255, 165, 0)).toBe('#FFA500')
    })

    it('converts hex to rgb', () => {
      expect(hexToRGB('#FFA500')).toEqual({ r: 255, g: 165, b: 0 })
    })
  })
})
