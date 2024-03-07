import type {
  ConfigurationPluginMessage,
  ExecutionTimePluginMessage,
  HtmlPluginMessage,
  IConfiguration,
  IsLoadingPluginMessage,
  PluginMessage,
  SelectedNode,
  SelectedPluginMessage,
  UnselectedPluginMessage,
} from '@onyx/types'
import EventBus from './event-bus'

/**
 * This function sends a message to the Figma UI when no node is selected.
 * The message is of type UnselectedPluginMessage, which is defined in '@onyx/types'.
 * The event property of the message is set to 'unselected'.
 */
export function sendUnselectedMessage() {
  const pluginMessage: UnselectedPluginMessage = { event: 'unselected', data: undefined }
  figma.ui.postMessage(pluginMessage)
}

/**
 * Sends a message to the Figma UI when the loading state changes.
 * @param state - The new loading state.
 */
export function sendIsLoadingMessage(state: boolean) {
  const pluginMessage: IsLoadingPluginMessage = { event: 'loading', data: { state } }
  figma.ui.postMessage(pluginMessage)
}

/**
 * Sends a message to the Figma UI when the execution time is available.
 * @param time - The execution time in milliseconds.
 */
export function sendExecutionTimeMessage(time: number) {
  const pluginMessage: ExecutionTimePluginMessage = { event: 'execution-time', data: { time } }
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
export function sendSelectedMessage(nodes: SelectedNode[] | null): void {
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

export function sendConfigurationMessage(configuration: IConfiguration) {
  const pluginMessage: ConfigurationPluginMessage = { event: 'configuration', data: { configuration } }
  figma.ui.postMessage(pluginMessage)
}

export const PluginMessages = new EventBus()

figma.ui.onmessage = (message: PluginMessage) => {
  PluginMessages.emit(message)
}
