export type PluginMessageEvent = MessageEvent<{ pluginMessage: PluginMessage }>

export interface ComponentProps {
  [key: string]: string
}

/**
 * Represents a base plugin message.
 *
 * Each plugin message must have an `event` property
 * which is a unique string identifying the message type.
 *
 * @interface
 */
interface BasePluginMessage {
  event: string
}

/**
 * Represents a message sent when HTML code is
 * generated for the selected nodes.
 *
 * @interface
 * @extends BasePluginMessage
 */
export interface HtmlPluginMessage extends BasePluginMessage {
  event: 'html'
  data: {
    html: string
  }
}

/**
 * Interface representing a plugin message emitted
 * when the user unselects all nodes.
 */
export interface UnselectedPluginMessage extends BasePluginMessage {
  event: 'unselected'
}

export interface SelectedNode {
  id: string
  props?: ComponentProps
}

/**
 * Represents a message sent when the user selects nodes.
 * @interface
 * @extends BasePluginMessage
 */
export interface SelectedPluginMessage extends BasePluginMessage {
  event: 'selected'
  data: {
    nodes: SelectedNode[]
  }
}

export type PluginMessage =
  | HtmlPluginMessage
  | UnselectedPluginMessage
  | SelectedPluginMessage
