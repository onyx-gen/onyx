import { defineConfig, presetIcons, presetUno } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      autoInstall: false,
      extraProperties: {
        'display': 'inline-block',
        'width': '1.2em',
        'height': '1.2em',
        'vertical-align': 'middle',
      },
      collections: {
        onyx: () => import('@onyx/icons/onyx-icon-library.json'),
      },
    }),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
