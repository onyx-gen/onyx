import { describe, expect, it } from 'vitest'
import { rgbToHex } from '../../src/builder/utils'

describe('builder', () => {
  describe('utils', () => {
    it('converts rgb to hex', () => {
      expect(rgbToHex(255, 165, 0)).toBe('#FFA500')
    })
  })
})
