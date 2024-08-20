import { h } from '@unocss/preset-mini/utils'
import { round } from '../utils'

export type InferenceDimensionMap = Record<number, string[]>

const values: number[] = [
  0,
  0.5,
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  14,
  16,
  20,
  24,
  28,
  32,
  36,
  40,
  44,
  48,
  52,
  56,
  60,
  64,
  72,
  80,
  96,
]

function remToUnitless(r: string): number {
  return Number.parseFloat(round(Number.parseFloat(r.replace('rem', ''))))
}

function createComputedDimensions() {
  const result: Record<string, string> = {}

  for (const value of values.map(String)) {
    const remValue = h.rem(value)
    if (remValue)
      result[value] = remValue
  }

  return result
}

export function createDimensionLookupPx(): InferenceDimensionMap {
  // iterate from 0 to 10
  const result: Record<number, string[]> = {}

  for (let i = 0; i <= 10; i++)
    result[i] = [`${i}`]

  return result
}

export function createDimensionLookup(
  _dimensions: Record<string, string>,
): InferenceDimensionMap {
  const result: Record<number, string[]> = {}

  const filteredRemDimensions = Object.fromEntries(
    Object.entries(_dimensions)
      .filter(([key, value]) => value.endsWith('rem') && key !== 'DEFAULT'),
  )

  function addToResults(d: Record<string, string>) {
    Object.entries(d).forEach(([key, value]) => {
      const unitlessValue = remToUnitless(value)

      if (!result[unitlessValue])
        result[unitlessValue] = []

      result[unitlessValue].push(key)
    })
  }

  addToResults(filteredRemDimensions)
  addToResults(createComputedDimensions())
  addToResults({
    px: '0.0625rem',
  })

  return result
}
