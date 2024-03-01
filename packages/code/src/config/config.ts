import type { Mode } from '@onyx/types'
import type { InferenceColorMap } from './colors'
import { colorMap } from './colors'
import { dimensionMap } from './dimension-map'
import type { InferenceDimensionMap } from './dimension-map'

interface OnyxConfiguration {
  mode: Mode
  inference: {
    nearest: boolean
  }
  tailwind: {
    colorMap: InferenceColorMap
    dimensionMap: InferenceDimensionMap
    variantGroup: boolean
  }
}

const config: OnyxConfiguration = {
  mode: 'variables',
  inference: {
    nearest: true,
  },
  tailwind: {
    colorMap,
    dimensionMap,
    variantGroup: true,
  },
}

export default config
