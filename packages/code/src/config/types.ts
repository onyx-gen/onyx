import type { Mode, Unit } from '@onyx/types'
import type { Theme } from '@unocss/preset-mini'

export interface Configuration {
  mode: Mode
  unit: Unit
  variantGroup: boolean
  nearestInference: boolean
  theme: Theme
}
