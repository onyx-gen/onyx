import type { ComponentProps, Mode } from './types'

export type PluginMessageEvent = MessageEvent<{ pluginMessage: PluginMessage }>

/**
 * Represents a base plugin message.
 *
 * Each plugin message must have an `event` property
 * which is a unique string identifying the message type.
 *
 * @interface
 */
interface BasePluginMessage<E, T> {
  event: E
  data: T
}

type HtmlPluginMessage = BasePluginMessage<'html', HtmlPluginMessageData>

interface HtmlPluginMessageData {
  html: string
}

type ModeChangedPluginMessage = BasePluginMessage<'mode-changed', ModeChangedPluginMessageData>

interface ModeChangedPluginMessageData {
  mode: Mode
}

type NearestChangedPluginMessage = BasePluginMessage<'nearest-changed', NearestChangedPluginMessageData>

interface NearestChangedPluginMessageData {
  nearestColor: boolean
}

type VariantGroupChangedPluginMessage = BasePluginMessage<'variant-group-changed', VariantGroupChangedPluginMessageData>

interface VariantGroupChangedPluginMessageData {
  variantGroup: boolean
}

type NotificationPluginMessage = BasePluginMessage<'notification', NotificationPluginMessageData>

interface NotificationPluginMessageData {
  message: string
}

type UnselectedPluginMessage = BasePluginMessage<'unselected', any>

export interface SelectedNode {
  id: string
  props?: ComponentProps
}

type SelectedPluginMessage = BasePluginMessage<'selected', SelectedPluginMessageData>

interface SelectedPluginMessageData {
  nodes: SelectedNode[]
}

export type PluginMessage =
  | HtmlPluginMessage
  | UnselectedPluginMessage
  | SelectedPluginMessage
  | ModeChangedPluginMessage
  | NearestChangedPluginMessage
  | VariantGroupChangedPluginMessage
  | NotificationPluginMessage
