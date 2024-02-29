import type { Mode } from '@onyx/types'
import type { TailwindColorMap } from './colors'
import { colorMap } from './colors'

interface OnyxConfiguration {
  mode: Mode
  inference: {
    nearestColor: boolean
  }
  tailwind: {
    colorMap: TailwindColorMap
  }
}

const config: OnyxConfiguration = {
  mode: 'variables',
  inference: {
    nearestColor: true,
  },
  tailwind: {
    colorMap,
  },
}

export default config
