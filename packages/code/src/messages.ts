import type { HtmlPluginMessage, UnselectedPluginMessage } from '@onyx/events'

/**
 * This function sends a message to the Figma UI when no node is selected.
 * The message is of type UnselectedPluginMessage, which is defined in '@onyx/events'.
 * The event property of the message is set to 'unselected'.
 */
export function sendUnselectedMessage() {
  const pluginMessage: UnselectedPluginMessage = { event: 'unselected' }
  figma.ui.postMessage(pluginMessage)
}

/**
 * Sends an HTML message to the UI plugin.
 *
 * @param {string} html - The HTML content to send.
 *
 * @return {void}
 */
export function sendHtmlMessage(html: string): void {
  const pluginMessage: HtmlPluginMessage = { event: 'html', data: { html } }
  figma.ui.postMessage(pluginMessage)
}
