import type { Rule } from 'unocss'
import type { Theme } from '@unocss/preset-mini'
import openGraphFeatureRules from './open-graph-features.rules'

/**
 * Contains all custom rules of the Unocss preset.
 */
const rules: Rule<Theme>[] = [
  openGraphFeatureRules,
].flat(1)

export default rules
