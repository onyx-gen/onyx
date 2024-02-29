import type { Mode } from '@onyx/types'
import type { TailwindColorMap } from './colors'
import { colorMap } from './colors'

interface OnyxConfiguration {
  mode: Mode
  tailwind: {
    colorMap: TailwindColorMap
  }
}

const config: OnyxConfiguration = {
  mode: 'variables',
  tailwind: {
    colorMap,
  },
}

export default config
