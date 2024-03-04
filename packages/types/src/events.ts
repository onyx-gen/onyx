import type { ComponentProps, Mode, Unit } from './types'

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

export type HtmlPluginMessage = BasePluginMessage<'html', HtmlPluginMessageData>

interface HtmlPluginMessageData {
  html: string
}

export type ModeChangedPluginMessage = BasePluginMessage<'mode-changed', ModeChangedPluginMessageData>

interface ModeChangedPluginMessageData {
  mode: Mode
}

export type UnitChangedPluginMessage = BasePluginMessage<'unit-changed', UnitChangedPluginMessageData>

interface UnitChangedPluginMessageData {
  unit: Unit
}

export type NearestChangedPluginMessage = BasePluginMessage<'nearest-changed', NearestChangedPluginMessageData>

interface NearestChangedPluginMessageData {
  nearestColor: boolean
}

export type VariantGroupChangedPluginMessage = BasePluginMessage<'variant-group-changed', VariantGroupChangedPluginMessageData>

interface VariantGroupChangedPluginMessageData {
  variantGroup: boolean
}

export type NotificationPluginMessage = BasePluginMessage<'notification', NotificationPluginMessageData>

interface NotificationPluginMessageData {
  message: string
}

export type UnselectedPluginMessage = BasePluginMessage<'unselected', any>

export interface SelectedNode {
  id: string
  props?: ComponentProps
}

export type SelectedPluginMessage = BasePluginMessage<'selected', SelectedPluginMessageData>

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
  | UnitChangedPluginMessage
