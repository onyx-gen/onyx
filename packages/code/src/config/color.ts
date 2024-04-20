import type { Theme } from '@unocss/preset-mini'
import type { HEX } from '@onyx-gen/types'

export type InferenceColorMap = Record<HEX, string[]>

function isHEX(value: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(value)
}

/**
 * Maps colors to their corresponding names.
 *
 * @param {NonNullable<Theme['colors]>} colors - The colors object to be mapped.
 * @param {string} prefix - The prefix to append color name.
 * @return {InferenceColorMap} - The resulting object that maps HEX colors to their corresponding names.
 */
export function createColorLookup(
  colors: NonNullable<Theme['colors']>,
  prefix: string = '',
): InferenceColorMap {
  const result: InferenceColorMap = {}

  for (const colorName in colors) {
    const value = colors[colorName]
    if (typeof value === 'string') { // leaf node
      if (isHEX(value)) {
        if (!result[value])
          result[value] = []

        result[value].push(prefix + colorName)
      }
    }
    else { // object node
      const nestedResults = createColorLookup(value, `${prefix}${colorName}-`)
      Object.assign(result, nestedResults)
    }
  }

  return result
}
