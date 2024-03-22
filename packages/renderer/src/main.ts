import { type App, createApp } from 'vue'

// Load and activate UnoCSS runtime
import './unocss'

let app: App | null = null

// Listen for messages from the parent frame
window.addEventListener('message', (event) => {
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
