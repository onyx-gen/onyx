import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

interface PreviewRendererConfig {
  path: string
}

export default function previewRenderer(config: PreviewRendererConfig): Plugin {
  const virtualModuleId = 'virtual:preview-renderer'

  return {
    name: 'preview-renderer',

    resolveId(source) {
      if (source === virtualModuleId)
        return source

      return null
    },

    load(id) {
      if (id === virtualModuleId) {
        const html = readFileSync(config.path, 'utf-8')

        return `export default ${JSON.stringify(html)};`
      }

      return null
    },
  }
}
