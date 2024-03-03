import type { Mode } from '@onyx/types'
import type { Theme } from '@unocss/preset-mini'

type Unit = 'px' | 'rem'

export interface Configuration {
  mode: Mode
  unit: Unit
  variantGroup: boolean
  nearestInference: boolean
  theme: Theme
}
