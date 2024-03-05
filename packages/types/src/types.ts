import type { Theme } from '@unocss/preset-mini'

export type Mode = 'inferred' | 'variables'

export type Unit = 'px' | 'rem'

export interface ComponentProps {
  [key: string]: string
}

export type HEX = string

export interface Configuration {
  mode: Mode
  unit: Unit
  variantGroup: boolean
  nearestInference: boolean
  theme: Theme
}
