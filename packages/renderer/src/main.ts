import { type App, createApp } from 'vue'
import type {
  RendererPluginMessage,
} from '@onyx-gen/types'

// Load and activate UnoCSS runtime
import './unocss'

let app: App | null = null

// Listen for messages from the parent frame
window.addEventListener('message', async (event) => {
  if (app !== null)
    app.unmount()

  try {
    app = createApp({ template: event.data.vue })
  }
  catch (e) {
    console.error('[iFrame] Error creating Vue app', e)
    return
  }

  app.mount('#app')
})

function observeHeight() {
  const targetElement = document.getElementById('app')!

  // Using ResizeObserver to directly observe size changes
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.contentRect.height
      const pluginMessage: RendererPluginMessage = { event: 'renderer', data: { height } }
      window.parent.postMessage(pluginMessage, '*')
    }
  })

  // Start observing the target element
  resizeObserver.observe(targetElement)
}

observeHeight()
