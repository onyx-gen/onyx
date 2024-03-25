import { type App, createApp, nextTick } from 'vue'
import type {
  RendererPluginMessage,
} from '@onyx/types'

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

  // Wait for Vue to finish updating the DOM
  await nextTick()

  // get #app element from dom and calculate scroll height
  const el = document.getElementById('app')!
  const height = el.scrollHeight

  const pluginMessage: RendererPluginMessage = { event: 'renderer', data: { height } }
  window.parent.postMessage(pluginMessage, '*')
})
