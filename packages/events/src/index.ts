export type PluginMessageEvent = MessageEvent<{ pluginMessage: PluginMessage }>

export interface ComponentProps {
  [key: string]: string
}

interface BasePluginMessage {
  event: string
}

export interface HtmlPluginMessage extends BasePluginMessage {
  event: 'html'
  data: {
    html: string
  }
}

export interface UnselectedPluginMessage extends BasePluginMessage {
  event: 'unselected'
}

export interface SelectedNode {
  id: string
  props?: ComponentProps
}

export interface SelectedPluginMessage extends BasePluginMessage {
  event: 'selected'
  data: {
    nodes: SelectedNode[]
  }
}

export type PluginMessage = HtmlPluginMessage | UnselectedPluginMessage | SelectedPluginMessage
