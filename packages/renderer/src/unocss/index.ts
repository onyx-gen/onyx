import { type Theme, presetMini } from '@unocss/preset-mini'
import initUnocssRuntime from '@unocss/runtime'
import type { UserConfigDefaults } from '@unocss/core'
import { presetCustom } from './preset'

// Add some CSS reset to the bundle
import '@unocss/reset/tailwind.css'

const unocssDefaults: UserConfigDefaults<Theme> = {
  presets: [
    presetMini(),
    presetCustom(),
  ],
}

initUnocssRuntime({
  defaults: unocssDefaults,
})
