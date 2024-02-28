export type PluginMessageEvent = MessageEvent<{ pluginMessage: PluginMessage }>

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
}

export interface SelectedPluginMessage extends BasePluginMessage {
  event: 'selected'
  data: {
    nodes: SelectedNode[]
  }
}

export type PluginMessage = HtmlPluginMessage | UnselectedPluginMessage | SelectedPluginMessage
