import generate from './generate'
import config from './config/config'
import { PluginMessages } from './messages'

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

// Generate HTML code when the plugin is opened
generate()

// Generate HTML code when the selection changes
figma.on('selectionchange', generate)

PluginMessages.on('mode-changed', async ({ mode }) => {
  config.mode = mode
  await generate()
})

PluginMessages.on('nearest-changed', async ({ nearestColor }) => {
  config.nearestInference = nearestColor
  await generate()
})

PluginMessages.on('variant-group-changed', async ({ variantGroup }) => {
  config.variantGroup = variantGroup
  await generate()
})

PluginMessages.on('unit-changed', async ({ unit }) => {
  config.unit = unit
  await generate()
})

PluginMessages.on('notification', ({ message }) => {
  figma.notify(message)
})
