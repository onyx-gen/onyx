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
        onyx: () => import('@onyx-gen/icons/onyx-icon-library.json'),
      },
    }),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.6875rem', '1rem'],
    },
  },
})
