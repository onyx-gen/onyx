import type {
  HtmlPluginMessage,
  SelectedNode,
  SelectedPluginMessage,
  UnselectedPluginMessage,
} from '@onyx/types'

/**
 * This function sends a message to the Figma UI when no node is selected.
 * The message is of type UnselectedPluginMessage, which is defined in '@onyx/types'.
 * The event property of the message is set to 'unselected'.
 */
export function sendUnselectedMessage() {
  const pluginMessage: UnselectedPluginMessage = { event: 'unselected' }
  figma.ui.postMessage(pluginMessage)
}

/**
 * Sends a message to the Figma UI when a node is selected.
 *
 * The message contains the selected nodes.
 *
 * @param {SelectedNode[]} nodes - The selected nodes to send.
 * @param props
 *
 * @return {void}
 */
export function sendSelectedMessage(nodes: SelectedNode[]): void {
  const pluginMessage: SelectedPluginMessage = { event: 'selected', data: { nodes } }
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
