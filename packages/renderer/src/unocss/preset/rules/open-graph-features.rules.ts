import type { Rule } from 'unocss'
import type { Theme } from '@unocss/preset-mini'

const openGraphFeatureRules: Rule<Theme>[] = [
  [
    'superscript',
    {
      'font-variant-position': 'super',
    },
  ],
  [
    'subscript',
    {
      'font-variant-position': 'sub',
    },
  ],
]

export default openGraphFeatureRules
