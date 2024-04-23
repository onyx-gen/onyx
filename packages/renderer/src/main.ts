import type { App, Component } from 'vue'
import { createApp } from 'vue'
import type {
  GeneratedComponentsPluginMessageData,

  RendererPluginMessage,
} from '@onyx-gen/types'

// Load and activate UnoCSS runtime
import './unocss'

let app: App | null = null

// Listen for messages from the parent frame
window.addEventListener('message', async (event: MessageEvent & { data: GeneratedComponentsPluginMessageData }) => {
  if (app !== null)
    app.unmount()

  const data: GeneratedComponentsPluginMessageData = event.data

  const mainComponentName = data.mainComponent
  const mainComponentCode = data.components[mainComponentName]

  // Remove the main component from the list of components and create a Vue component for each
  const nonMainComponents: Record<string, Component> = Object.fromEntries(
    Object.entries(data.components)
      .filter(([name]) => name !== mainComponentName)
      .map(([name, code]) => [name, { template: code }]),
  )

  try {
    const vueComponent: Component = {
      template: mainComponentCode,
      components: nonMainComponents,
    }

    app = createApp(vueComponent)
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
