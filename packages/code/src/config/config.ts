import { defu } from 'defu'
import type { IConfiguration } from '@onyx-gen/types'
import { theme } from '@unocss/preset-mini'
import type { InferenceColorMap } from './color'
import { createColorLookup } from './color'
import type { InferenceDimensionMap } from './dimension'
import { createDimensionLookup } from './dimension'

interface LookupCache {
  color: InferenceColorMap | null
  dimensions: InferenceDimensionMap | null
  borderRadiusDimensions: InferenceDimensionMap | null
}

const defaultConfig: IConfiguration = {
  mode: 'variables',
  unit: 'px',
  variantGroup: true,
  nearestInference: true,
  theme,
  variableNameTransformations: {
    lowercase: false,
  },
  ignoredComponentInstances: [],
}

/**
 * The Configuration class represents the configuration settings for the application.
 *
 * @class Configuration
 * @implements IConfiguration
 */
export class Configuration implements IConfiguration {
  public mode: IConfiguration['mode']
  public unit: IConfiguration['unit']
  public variantGroup: IConfiguration['variantGroup']
  public nearestInference: IConfiguration['nearestInference']
  public theme: IConfiguration['theme']
  public variableNameTransformations: IConfiguration['variableNameTransformations']
  public ignoredComponentInstances: IConfiguration['ignoredComponentInstances']

  public readonly config: IConfiguration

  // The lookupCache object is used to store cached values for quick lookup.
  private lookupCache: LookupCache = {
    color: null,
    dimensions: null,
    borderRadiusDimensions: null,
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

    this.config.ignoredComponentInstances = config?.ignoredComponentInstances || defaultConfig.ignoredComponentInstances

    this.mode = this.config.mode
    this.unit = this.config.unit
    this.variantGroup = this.config.variantGroup
    this.nearestInference = this.config.nearestInference
    this.theme = this.config.theme
    this.variableNameTransformations = this.config.variableNameTransformations
    this.ignoredComponentInstances = this.config.ignoredComponentInstances
  }

  /**
   * Retrieves the color lookup object for the current theme.
   * If the color lookup object is already cached, it will be returned.
   * If not, a new color lookup object will be created based on the theme colors and cached.
   *
   * @return {InferenceColorMap} The color lookup object for the current theme.
   */
  public get colorLookup(): InferenceColorMap {
    if (this.lookupCache.color)
      return this.lookupCache.color

    const lookup = createColorLookup(this.theme.colors || {})
    this.lookupCache.color = lookup

    return lookup
  }

  /**
   * Retrieves the dimensions lookup from the cache if it exists.
   * Otherwise, creates a new dimensions lookup and stores it in the cache before returning it.
   *
   * @return {InferenceDimensionMap} The dimensions lookup.
   *
   */
  public get dimensionsLookup(): InferenceDimensionMap {
    if (this.lookupCache.dimensions)
      return this.lookupCache.dimensions

    const lookup = createDimensionLookup(this.theme.spacing || {})
    this.lookupCache.dimensions = lookup

    return lookup
  }

  /**
   * Retrieves the border radius lookup for the component.
   * If the lookup cache already contains the border dimensions, it returns the cached value.
   * Otherwise, it creates and caches the border dimensions using the theme's border radius.
   * @return {InferenceDimensionMap} - The border radius lookup
   */
  public get borderRadiusLookup(): InferenceDimensionMap {
    if (this.lookupCache.borderRadiusDimensions)
      return this.lookupCache.borderRadiusDimensions

    const lookup = createDimensionLookup(this.theme.borderRadius || {})
    this.lookupCache.borderRadiusDimensions = lookup

    return lookup
  }
}
