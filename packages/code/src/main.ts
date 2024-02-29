import type { PluginMessage } from '@onyx/types'
import generate from './generate'
import config from './config'

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

figma.ui.onmessage = async (message: PluginMessage) => {
  if (message.event === 'mode-changed') {
    console.log('Mode changed:', message.data.mode)
    config.mode = message.data.mode
    await generate()
  }
  else if (message.event === 'nearest-color-changed') {
    console.log('Nearest color changed:', message.data.nearestColor)
    config.inference.nearestColor = message.data.nearestColor
    await generate()
  }
}
