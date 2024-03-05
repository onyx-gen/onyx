import generate from './generate'
import { PluginMessages, sendConfigurationMessage } from './messages'
import { loadConfig, updateConfig } from './config/config'

// Skip over invisible nodes and their descendants inside instances for faster performance.
figma.skipInvisibleInstanceChildren = true

/**
 * Show the UI of the plugin.
 *
 * Notes:
 * __html__ is a global variable that is injected by the build process.
 * The global variable shows the UI that can be found
 * in the `packages/ui?  package of this repository.
 */
figma.showUI(__html__, { themeColors: true })

loadConfig()
  .then(async (loadedConfig) => {
    console.log('[Code] Config loaded from figma client storage', loadedConfig)

    sendConfigurationMessage(loadedConfig)

    // Generate HTML code when the plugin is opened
    await generate()

    // Generate HTML code when the selection changes
    figma.on('selectionchange', generate)
  })
  .catch((error) => {
    console.error('error loading config', error)
  })

PluginMessages.on('mode-changed', async ({ mode }) => {
  updateConfig({ mode }).then(generate)
})

PluginMessages.on('nearest-changed', async ({ nearestColor }) => {
  updateConfig({ nearestInference: nearestColor }).then(generate)
})

PluginMessages.on('variant-group-changed', async ({ variantGroup }) => {
  updateConfig({ variantGroup }).then(generate)
})

PluginMessages.on('unit-changed', async ({ unit }) => {
  updateConfig({ unit }).then(generate)
})

PluginMessages.on('notification', ({ message }) => {
  figma.notify(message)
})
