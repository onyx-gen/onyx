import type { Mode } from '@onyx/types'
import type { TailwindColorMap } from './colors'
import { colorMap } from './colors'
import type { TailwindDimensionMap } from './dimension-map'
import { dimensionMap } from './dimension-map'

interface OnyxConfiguration {
  mode: Mode
  inference: {
    nearest: boolean
  }
  tailwind: {
    colorMap: TailwindColorMap
    dimensionMap: TailwindDimensionMap
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
