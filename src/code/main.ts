/**
 * This plugin generates HTML code that reflects the structure and styling
 * of components in Figma. It uses the UnoCSS framework to handle styling.
 * The plugin operates within the Figma environment and can process selected
 * components to output corresponding HTML structure.
 */

// Skip over invisible nodes and their descendants inside instances for faster performance.

figma.skipInvisibleInstanceChildren = true

figma.showUI(__html__)

figma.on('selectionchange', () => {
  figma.ui.postMessage(figma.currentPage.selection)
})
