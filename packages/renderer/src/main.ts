import type { App, ComponentOptions } from 'vue'
import { createApp, defineComponent } from 'vue'
import type {
  ComponentTreeNode,
  GeneratedComponentsPluginMessageData,

  RendererPluginMessage,
} from '@onyx-gen/types'

// Load and activate UnoCSS runtime
import './unocss'

let app: App | null = null

// Listen for messages from the parent frame
window.addEventListener('message', async (event: MessageEvent & { data: GeneratedComponentsPluginMessageData }) => {
  console.log('[iFrame] Received message', event.data)

  // Unmount the previous app
  if (app !== null)
    app.unmount()

  const data: GeneratedComponentsPluginMessageData = event.data

  // Construct Vue components recursively from the component tree
  const rootComponentOptions = createVueComponent(data.componentTree)

  // Create the Vue app and mount it to the root element
  try {
    app = createApp(rootComponentOptions)
    app.mount('#app')
  }
  catch (e) {
    console.error('[iFrame] Error creating Vue app', e)
  }
})

/**
 * Recursively creates a Vue component from a component tree node.
 *
 * @param node - The current node of the component tree.
 * @returns A Vue component options object representing the node and its children.
 */
function createVueComponent(node: ComponentTreeNode): ComponentOptions {
  const childComponents: Record<string, ComponentOptions> = {}
  node.instances.forEach((instance) => {
    childComponents[instance.name] = createVueComponent(instance)
  })

  const options: ComponentOptions = {
    name: node.name,
    template: node.code,
    components: childComponents,
  }

  return defineComponent(options as any) as any
}

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
