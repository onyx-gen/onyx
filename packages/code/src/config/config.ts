import { theme } from '@unocss/preset-mini'
import { defu } from 'defu'
import type { Configuration } from './types'
import type { InferenceColorMap } from './color'
import { createColorLookup } from './color'
import type { InferenceDimensionMap } from './dimension'
import { createDimensionLookup } from './dimension'

const defaultConfig: Configuration = {
  mode: 'variables',
  unit: 'px',
  variantGroup: true,
  nearestInference: true,
  theme,
}

function defineConfig(config: Partial<Configuration>): Configuration {
  return defu(config, defaultConfig)
}

const config = defineConfig({})

interface LookupCache {
  color: InferenceColorMap | null
  dimensions: InferenceDimensionMap | null
}

const lookupCache: LookupCache = {
  color: null,
  dimensions: null,
}

export const lookups = {
  get colors() {
    if (lookupCache.color)
      return lookupCache.color

    const lookup = createColorLookup(config.theme.colors || {})
    lookupCache.color = lookup

    return lookup
  },

  get dimensions() {
    if (lookupCache.dimensions)
      return lookupCache.dimensions

    const lookup = createDimensionLookup(config.theme.spacing || {})
    lookupCache.dimensions = lookup

    return lookup
  },
}

export default config
