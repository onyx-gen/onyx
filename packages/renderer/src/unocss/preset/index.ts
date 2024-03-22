import type { Preset } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import rules from './rules'

export function presetCustom(): Preset<Theme> {
  return {
    name: 'unocss-preset-custom',
    rules,
  }
}
