import { describe, expect, it } from 'vitest'
import type { VariantCSS } from '../src/interfaces'
import {
  appendSetToVariantCSS,
  appendToVariantCSS,
  calculateVariantCSSDifference,
  calculateVariantCSSUnion,
  translateVariantCSS,
  wrapInVariant,
  wrapInVariants,
} from '../src/css'

describe('css', () => {
  it('translates variant css', () => {
    const variantCSS: VariantCSS = {
      css: [
        new Set(['bg-red', 'px-4']),
        {
          variant: 'hover',
          css: [
            new Set(['bg-blue', 'px-8']),
          ],
        },
        {
          variant: 'focus',
          css: [
            new Set(['bg-green', 'px-12']),
            {
              variant: 'disabled',
              css: [
                new Set(['bg-gray-300']),
              ],
            },
          ],
        },
      ],
    }

    const translated = 'bg-red px-4 hover:(bg-blue px-8) focus:(bg-green px-12 disabled:(bg-gray-300))'

    expect(translateVariantCSS(variantCSS)).toBe(translated)
  })

  it('calculates the difference between two variant css maps', () => {
    const map1: VariantCSS = {
      css: [
        new Set(['bg-red', 'px-4']),
        {
          variant: 'hover',
          css: [
            new Set(['bg-blue', 'px-8']),
          ],
        },
        {
          variant: 'focus',
          css: [
            new Set(['bg-green', 'px-12']),
            {
              variant: 'disabled',
              css: [
                new Set(['bg-gray-300']),
              ],
            },
          ],
        },
      ],
    }

    const map2: VariantCSS = {
      css: [
        new Set(['bg-red', 'px-4']),
        {
          variant: 'hover',
          css: [
            new Set(['bg-blue', 'px-8']),
          ],
        },
        {
          variant: 'focus',
          css: [
            new Set(['bg-green', 'px-12']),
            {
              variant: 'disabled',
              css: [
                new Set(['bg-gray-300']),
              ],
            },
          ],
        },
      ],
    }

    const map3: VariantCSS = {
      css: [
        {
          variant: 'focus',
          css: [
            new Set(['bg-green', 'px-12']),
            {
              variant: 'disabled',
              css: [
                new Set(['bg-gray-300']),
              ],
            },
          ],
        },
      ],
    }

    const map4: VariantCSS = {
      css: [
        {
          variant: 'hover',
          css: [
            new Set(['bg-blue']),
          ],
        },
      ],
    }

    const map5: VariantCSS = {
      css: [
        new Set(['bg-yellow', 'px-6']),
        {
          variant: 'hover',
          css: [
            new Set(['bg-red', 'px-4']),
          ],
        },
        {
          variant: 'focus',
          css: [
            new Set(['bg-blue', 'px-8']),
            {
              variant: 'disabled',
              css: [
                new Set(['bg-gray-400']),
              ],
            },
          ],
        },
      ],
    }

    const diffMap1Map2: VariantCSS = { css: [] }
    expect(calculateVariantCSSDifference(map1, map2)).toEqual(diffMap1Map2)

    const diffMap1Map3: VariantCSS = {
      css: [
        new Set(['bg-red', 'px-4']),
        {
          variant: 'hover',
          css: [
            new Set(['bg-blue', 'px-8']),
          ],
        },
      ],
    }
    expect(calculateVariantCSSDifference(map1, map3)).toEqual(diffMap1Map3)

    const diffMap1Map4: VariantCSS = {
      css: [
        new Set(['bg-red', 'px-4']),
        {
          variant: 'hover',
          css: [
            new Set(['px-8']),
          ],
        },
        {
          variant: 'focus',
          css: [
            new Set(['bg-green', 'px-12']),
            {
              variant: 'disabled',
              css: [
                new Set(['bg-gray-300']),
              ],
            },
          ],
        },
      ],
    }
    expect(calculateVariantCSSDifference(map1, map4)).toEqual(diffMap1Map4)

    expect(calculateVariantCSSDifference(map1, map5)).toEqual(map1)

    // If variantCSS1 is undefined, returns an empty VariantCSS.
    expect(calculateVariantCSSDifference(undefined, map1)).toEqual({ css: [] })

    expect(calculateVariantCSSDifference(undefined, undefined)).toEqual({ css: [] })

    expect(calculateVariantCSSDifference(map1, undefined)).toEqual(map1)
  })

  it('wraps variant css with other variant', () => {
    const map1: VariantCSS = {
      css: [
        new Set(['bg-red']),
      ],
    }

    const map2: VariantCSS = {
      variant: 'focus',
      css: [
        new Set(['bg-red']),
      ],
    }

    const wrappedMap1: VariantCSS = {
      variant: 'hover',
      css: [
        new Set(['bg-red']),
      ],
    }

    const wrappedMap2: VariantCSS = {
      variant: 'hover',
      css: [
        {
          variant: 'focus',
          css: [
            new Set(['bg-red']),
          ],
        },
      ],
    }

    expect(wrapInVariant('hover', map1)).toEqual(wrappedMap1)
    expect(wrapInVariant('hover', map2)).toEqual(wrappedMap2)
  })

  it('wraps variant css with multiple other variant', () => {
    const map: VariantCSS = {
      css: [
        new Set(['bg-red']),
      ],
    }

    const wrappedMap: VariantCSS = {
      variant: 'focus',
      css: [
        {
          variant: 'hover',
          css: [
            new Set(['bg-red']),
          ],
        },
      ],
    }

    expect(wrapInVariants(['hover', 'focus'], map)).toEqual(wrappedMap)
  })

  it('calculates the union of the variant css maps', () => {
    const map1: VariantCSS = {
      css: [
        new Set(['bg-red']),
      ],
    }

    const map2: VariantCSS = {
      css: [
        new Set(['px-4']),
      ],
    }

    const map3: VariantCSS = {
      variant: 'focus',
      css: [
        new Set(['bg-blue']),
      ],
    }

    const map4: VariantCSS = {
      css: [
        new Set(['bg-red', 'px-6']),
        {
          variant: 'hover',
          css: [
            new Set(['my-4']),
          ],
        },
      ],
    }

    const map5: VariantCSS = {
      variant: 'hover',
      css: [
        new Set(['bg-blue']),
      ],
    }

    const unionMap3Map5: VariantCSS = {
      css: [
        {
          variant: 'focus',
          css: [
            new Set(['bg-blue']),
          ],
        },
        {
          variant: 'hover',
          css: [
            new Set(['bg-blue']),
          ],
        },
      ],
    }

    const unionMap1Map2: VariantCSS = {
      css: [
        new Set(['bg-red']), // directly from map1
        new Set(['px-4']), // directly from map2
      ],
    }

    const unionMap1Map3: VariantCSS = {
      css: [
        // directly from map1
        new Set(['bg-red']),

        // directly from map3
        {
          variant: 'focus',
          css: [
            new Set(['bg-blue']),
          ],
        },
      ],
    }

    const unionMap1Map4: VariantCSS = {
      css: [
        // directly from map1
        new Set(['bg-red']),

        // next two directly from map4
        new Set(['bg-red', 'px-6']),
        {
          variant: 'hover',
          css: [
            new Set(['my-4']),
          ],
        },
      ],
    }

    expect(calculateVariantCSSUnion(map1, map2)).toEqual(unionMap1Map2)
    expect(calculateVariantCSSUnion(map1, map3)).toEqual(unionMap1Map3)
    expect(calculateVariantCSSUnion(map1, map4)).toEqual(unionMap1Map4)
    expect(calculateVariantCSSUnion(map3, map5)).toEqual(unionMap3Map5)
  })

  it('appends css set to variant css', () => {
    const map = {
      css: [
        new Set(['bg-red']),
      ],
    }

    const mapAppended = {
      css: [
        new Set(['bg-red']),
        new Set(['px-4']),
      ],
    }

    expect(appendSetToVariantCSS(map, new Set(['px-4']))).toEqual(mapAppended)
  })

  it('appends css set to variant css and sets variant', () => {
    const map1: VariantCSS = {
      variant: 'hover',
      css: [
        new Set(['bg-red']),
      ],
    }

    const map2: VariantCSS = {
      css: [
        new Set(['bg-red']),
      ],
    }

    const map1Appended = {
      variant: 'hover',
      css: [
        new Set(['bg-red']),
        new Set(['px-4']),
      ],
    }

    const map2Appended = {
      css: [
        new Set(['bg-red']),
        {
          variant: 'hover',
          css: [
            new Set(['px-4']),
          ],
        },
      ],
    }

    expect(appendSetToVariantCSS(map1, new Set(['px-4']), 'hover')).toEqual(map1Appended)
    expect(appendSetToVariantCSS(map2, new Set(['px-4']), 'hover')).toEqual(map2Appended)
  })

  it('appends css string to variant set', () => {
    const map = {
      css: [
        new Set(['bg-red']),
      ],
    }

    const mapAppended = {
      css: [
        new Set(['bg-red']),
        new Set(['px-4']),
      ],
    }

    expect(appendToVariantCSS(map, 'px-4')).toEqual(mapAppended)
  })

  it('appends css string to variant set and sets variant', () => {
    const map1: VariantCSS = {
      variant: 'hover',
      css: [
        new Set(['bg-red']),
      ],
    }

    const map2: VariantCSS = {
      css: [
        new Set(['bg-red']),
      ],
    }

    const map1Appended = {
      variant: 'hover',
      css: [
        new Set(['bg-red']),
        new Set(['px-4']),
      ],
    }

    const map2Appended = {
      css: [
        new Set(['bg-red']),
        {
          variant: 'hover',
          css: [
            new Set(['px-4']),
          ],
        },
      ],
    }

    expect(appendToVariantCSS(map1, 'px-4', 'hover')).toEqual(map1Appended)
    expect(appendToVariantCSS(map2, 'px-4', 'hover')).toEqual(map2Appended)
  })
})
