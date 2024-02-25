export interface PluginMessage {
  event: string
}

export interface HtmlPluginMessage extends PluginMessage {
  event: 'html'
  data: {
    html: string
  }
}

export interface UnselectedPluginMessage extends PluginMessage {
  event: 'unselected'
}
