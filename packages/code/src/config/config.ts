import { theme } from '@unocss/preset-mini'
import { defu } from 'defu'
import type { Configuration } from '@onyx/types'
import type { InferenceColorMap } from './color'
import { createColorLookup } from './color'
import type { InferenceDimensionMap } from './dimension'
import { createDimensionLookup, createDimensionLookupPx } from './dimension'

const defaultConfig: Configuration = {
  mode: 'variables',
  unit: 'px',
  variantGroup: true,
  nearestInference: true,
  theme,
}

let config!: Configuration

export async function loadConfig(): Promise<Configuration> {
  const savedConfig: Partial<Configuration> | undefined = await figma.clientStorage.getAsync('config')
  config = defu({}, savedConfig, defaultConfig) // Adjust as necessary
  return config
}

export async function updateConfig(newConfig: Partial<Configuration>): Promise<void> {
  config = defu(newConfig, config)
  await figma.clientStorage.setAsync('config', config)
}

interface LookupCache {
  color: InferenceColorMap | null
  dimensions: InferenceDimensionMap | null
  borderDimensions: InferenceDimensionMap | null
}

const lookupCache: LookupCache = {
  color: null,
  dimensions: null,
  borderDimensions: null,
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

  get borderDimensions() {
    if (lookupCache.borderDimensions)
      return lookupCache.borderDimensions

    const lookup = createDimensionLookupPx()
    lookupCache.borderDimensions = lookup

    return lookup
  },
}

export default config
