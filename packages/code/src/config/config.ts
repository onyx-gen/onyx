import { defu } from 'defu'
import type { IConfiguration } from '@onyx/types'
import { theme } from '@unocss/preset-mini'
import type { InferenceColorMap } from './color'
import { createColorLookup } from './color'
import type { InferenceDimensionMap } from './dimension'
import { createDimensionLookup } from './dimension'

interface LookupCache {
  color: InferenceColorMap | null
  dimensions: InferenceDimensionMap | null
  borderDimensions: InferenceDimensionMap | null
}

const defaultConfig: IConfiguration = {
  mode: 'variables',
  unit: 'px',
  variantGroup: true,
  nearestInference: true,
  theme,
  newBuilder: true,
}

export class Configuration implements IConfiguration {
  public mode: IConfiguration['mode']
  public unit: IConfiguration['unit']
  public variantGroup: IConfiguration['variantGroup']
  public nearestInference: IConfiguration['nearestInference']
  public theme: IConfiguration['theme']
  public newBuilder: IConfiguration['newBuilder']

  public readonly config: IConfiguration

  private lookupCache: LookupCache = {
    color: null,
    dimensions: null,
    borderDimensions: null,
  }

  constructor(
    config: Partial<IConfiguration> | undefined,
    ..._defaults: (IConfiguration | undefined)[]
  ) {
    const defaults: IConfiguration[] = _defaults.filter(c => !!c) as IConfiguration[]
    if (config)
      this.config = defu(config, ...defaults, defaultConfig) as IConfiguration
    else
      this.config = defu(defaults[0], ...defaults.slice(1), defaultConfig) as IConfiguration

    this.mode = this.config.mode
    this.unit = this.config.unit
    this.variantGroup = this.config.variantGroup
    this.nearestInference = this.config.nearestInference
    this.theme = this.config.theme
    this.newBuilder = this.config.newBuilder
  }

  public get colorLookup(): InferenceColorMap {
    if (this.lookupCache.color)
      return this.lookupCache.color

    const lookup = createColorLookup(this.theme.colors || {})
    this.lookupCache.color = lookup

    return lookup
  }

  public get dimensionsLookup(): InferenceDimensionMap {
    if (this.lookupCache.dimensions)
      return this.lookupCache.dimensions

    const lookup = createDimensionLookup(this.theme.spacing || {})
    this.lookupCache.dimensions = lookup

    return lookup
  }
}
