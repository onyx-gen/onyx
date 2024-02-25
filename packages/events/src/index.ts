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

export type PluginMessage = HtmlPluginMessage | UnselectedPluginMessage
