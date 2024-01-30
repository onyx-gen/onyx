import { describe, expect, it } from 'vitest'
import type { ContainerNodeCSSData, VariantCSS } from '../src/interfaces'
import {
  appendSetToVariantCSS,
  appendToVariantCSS,
  calculateVariantCSSDifference,
  calculateVariantCSSIntersection,
  calculateVariantCSSSymmetricDifference,
  calculateVariantCSSUnion,
  translateContainerNodeCSSData,
  translateVariantCSS,
  wrapInVariant,
  wrapInVariants,
} from '../src/css'

describe('css', () => {
  describe('translateVariantCSS', () => {
    const singleClassVariantCSS: VariantCSS = {
      variant: 'hover',
      css: [new Set(['bg-red'])],
    }

    const multiClassVariantCSS: VariantCSS = {
      variant: 'hover',
      css: [new Set(['bg-red', 'px-4'])],
    }

    const complexVariantCSS: VariantCSS = {
      css: [
        new Set(['bg-red', 'px-4']),
        {
          variant: 'hover',
          css: [new Set(['bg-blue', 'px-8'])],
        },
        {
          variant: 'focus',
          css: [
            new Set(['bg-green', 'px-12']),
            {
              variant: 'disabled',
              css: [new Set(['bg-gray-300'])],
            },
          ],
        },
      ],
    }

    it('translates single class without parentheses', () => {
      expect(translateVariantCSS(singleClassVariantCSS)).toBe('hover:bg-red')
    })

    it('translates multiple classes with parentheses', () => {
      expect(translateVariantCSS(multiClassVariantCSS)).toBe('hover:(bg-red px-4)')
    })

    it('translates nested variant CSS structures', () => {
      expect(translateVariantCSS(complexVariantCSS)).toBe('bg-red px-4 hover:(bg-blue px-8) focus:(bg-green px-12 disabled:bg-gray-300)')
    })
  })

  describe('translateContainerNodeCSSData', () => {
    it('translates variant CSS data', () => {
      const data: ContainerNodeCSSData = {
        primary: {
          css: [new Set(['bg-red'])],
        },
        secondary: {
          css: [new Set(['bg-gray-300'])],
        },
      }

      const translated = {
        primary: 'bg-red',
        secondary: 'bg-gray-300',
      }

      expect(translateContainerNodeCSSData(data)).toEqual(translated)
    })

    it('ignores empty variant CSS data', () => {
      const data: ContainerNodeCSSData = {
        primary: {
          css: [new Set(['bg-red'])],
        },
        secondary: {
          css: [],
        },
      }

      const translated = {
        primary: 'bg-red',
      }

      expect(translateContainerNodeCSSData(data)).toStrictEqual(translated)
    })
  })

  describe('set composition', () => {
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

    describe('calculateVariantCSSUnion', () => {
      it('can optimize', () => {
        const variantCSS1: VariantCSS = {
          css: [
            new Set(['bg-red', 'px-4', 'py-6']),
            {
              variant: 'hover',
              css: [
                new Set(['bg-blue', 'px-8']),
              ],
            },
          ],
        }

        const variantCSS2: VariantCSS = {
          css: [
            new Set(['bg-red', 'px-4', 'py-6']),
            {
              variant: 'hover',
              css: [
                new Set(['bg-blue', 'px-8', 'py-2']),
              ],
            },
            {
              variant: 'focus',
              css: [
                new Set(['bg-green', 'px-12']),
              ],
            },
          ],
        }

        const expectedUnion: VariantCSS = {
          css: [
            new Set(['bg-red', 'px-4', 'py-6']),
            {
              variant: 'hover',
              css: [
                new Set(['bg-blue', 'px-8', 'py-2']),
              ],
            },
            {
              variant: 'focus',
              css: [
                new Set(['bg-green', 'px-12']),
              ],
            },
          ],
        }

        expect(calculateVariantCSSUnion(variantCSS1, variantCSS2)).toEqual(expectedUnion)
      })
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
          new Set(['bg-red', 'px-4']),
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

    describe('calculateVariantCSSSymmetricDifference', () => {
      it('calculates symmetric difference between two variant CSS objects', () => {
        const variantCSS1: VariantCSS = {
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

        const variantCSS2: VariantCSS = {
          css: [
            new Set(['bg-yellow', 'px-4']),
            {
              variant: 'focus',
              css: [
                new Set(['bg-green', 'px-12']),
              ],
            },
          ],
        }

        const expectedSymmetricDifference: VariantCSS = {
          css: [
            new Set(['bg-red', 'bg-yellow']),
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
              ],
            },
          ],
        }

        expect(calculateVariantCSSSymmetricDifference(variantCSS1, variantCSS2)).toEqual(expectedSymmetricDifference)
      })

      it('handles undefined inputs correctly', () => {
        const variantCSS: VariantCSS = {
          css: [
            new Set(['bg-red', 'px-4']),
          ],
        }

        expect(calculateVariantCSSSymmetricDifference(variantCSS, undefined)).toEqual(variantCSS)
        expect(calculateVariantCSSSymmetricDifference(undefined, variantCSS)).toEqual(variantCSS)
        expect(calculateVariantCSSSymmetricDifference(undefined, undefined)).toEqual({ css: [] })
      })
    })

    describe('calculateVariantCSSIntersection', () => {
      it('calculates intersection between two variant CSS objects', () => {
        const variantCSS1: VariantCSS = {
          css: [
            new Set(['bg-red', 'px-4', 'py-4']),
            {
              variant: 'hover',
              css: [
                new Set(['bg-blue', 'px-8']),
              ],
            },
          ],
        }

        const variantCSS2: VariantCSS = {
          css: [
            new Set(['bg-red', 'px-4', 'py-6']),
            {
              variant: 'hover',
              css: [
                new Set(['bg-blue', 'px-8', 'py-2']),
              ],
            },
            {
              variant: 'focus',
              css: [
                new Set(['bg-green', 'px-12']),
              ],
            },
          ],
        }

        const expectedIntersection: VariantCSS = {
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

        const intersection = calculateVariantCSSIntersection(variantCSS1, variantCSS2)
        expect(intersection).toEqual(expectedIntersection)
      })

      it('handles undefined inputs correctly', () => {
        const variantCSS: VariantCSS = {
          css: [
            new Set(['bg-red', 'px-4']),
          ],
        }

        expect(calculateVariantCSSIntersection(variantCSS, undefined)).toEqual({ css: [] })
        expect(calculateVariantCSSIntersection(undefined, variantCSS)).toEqual({ css: [] })
        expect(calculateVariantCSSIntersection(undefined, undefined)).toEqual({ css: [] })
      })
    })
  })

  describe('wraps variant css', () => {
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
  })

  describe('appends variant css', () => {
    describe('set', () => {
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

      it('appends css set to undefined variant css and set multiple variants', () => {
        const map0Appended = {
          variant: 'hover',
          css: [
            {
              variant: 'focus',
              css: [
                new Set(['px-4']),
              ],
            },
          ],
        }
        expect(
          appendSetToVariantCSS(
            undefined,
            new Set(['px-4']),
            ['hover', 'focus'],
          ),
        ).toEqual(map0Appended)
      })

      it('appends css set to variant css and set multiple variants', () => {
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

        const map3: VariantCSS = {
          variant: 'hover',
          css: [
            new Set(['bg-red']),
            {
              variant: 'focus',
              css: [
                new Set(['bg-blue']),
              ],
            },
          ],
        }

        const map4: VariantCSS = {
          variant: 'hover',
          css: [
            new Set(['bg-red']),
            {
              variant: 'focus',
              css: [
                {
                  variant: 'disabled',
                  css: [
                    new Set(['bg-gray-300']),
                  ],
                },
                new Set(['bg-blue']),
              ],
            },
            new Set(['my-8']),
          ],
        }

        const map4Appended: VariantCSS = {
          variant: 'hover',
          css: [
            new Set(['bg-red']),
            {
              variant: 'focus',
              css: [
                {
                  variant: 'disabled',
                  css: [
                    new Set(['bg-gray-300']),
                    new Set(['mx-4']),
                  ],
                },
                new Set(['bg-blue']),
              ],
            },
            new Set(['my-8']),
          ],
        }

        const map1Appended: VariantCSS = {
          variant: 'hover',
          css: [
            new Set(['bg-red']),
            {
              variant: 'focus',
              css: [
                new Set(['px-4']),
              ],
            },
          ],
        }

        const map2Appended: VariantCSS = {
          css: [
            new Set(['bg-red']),
            {
              variant: 'hover',
              css: [
                {
                  variant: 'focus',
                  css: [
                    new Set(['px-4']),
                  ],
                },
              ],
            },
          ],
        }

        const map3Appended = {
          variant: 'hover',
          css: [
            new Set(['bg-red']),
            {
              variant: 'focus',
              css: [
                new Set(['bg-blue']),
                new Set(['px-4']),
              ],
            },
          ],
        }

        expect(appendSetToVariantCSS(map1, new Set(['px-4']), ['hover', 'focus'])).toEqual(map1Appended)
        expect(appendSetToVariantCSS(map2, new Set(['px-4']), ['hover', 'focus'])).toEqual(map2Appended)
        expect(appendSetToVariantCSS(map3, new Set(['px-4']), ['hover', 'focus'])).toEqual(map3Appended)

        function toString(variantCSS: VariantCSS) {
          return JSON.stringify(
            variantCSS,
            (_key, value) => (value instanceof Set ? [...value] : value),
            0,
          )
        }

        const transformed = appendSetToVariantCSS(map4, new Set(['mx-4']), ['hover', 'focus', 'disabled'])
        expect(toString(transformed)).toEqual(toString(map4Appended))
      })
    })

    describe('string', () => {
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
  })
})
