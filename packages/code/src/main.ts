import generate from './generate'

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

figma.ui.onmessage = (message) => {
  console.log('got this from the UI', message)
}
