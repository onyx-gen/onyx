import type { HtmlPluginMessage, UnselectedPluginMessage } from '@unocss-variables/events'

/**
 * This function sends a message to the Figma UI when no node is selected.
 * The message is of type UnselectedPluginMessage, which is defined in '@unocss-variables/events'.
 * The event property of the message is set to 'unselected'.
 */
export function sendUnselectedMessage() {
  const pluginMessage: UnselectedPluginMessage = { event: 'unselected' }
  figma.ui.postMessage(pluginMessage)
}

export function sendHtmlMessage(html: string) {
  const pluginMessage: HtmlPluginMessage = { event: 'html', data: { html } }
  figma.ui.postMessage(pluginMessage)
}
