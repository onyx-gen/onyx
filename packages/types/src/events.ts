import type { ComponentProps, IConfiguration, Mode, Unit, VariableNameTransformations } from './types'

export type PluginMessageEvent = MessageEvent<{ pluginMessage: PluginMessage }>

export type RendererMessageEvent = MessageEvent<PluginMessage>

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

export type RendererPluginMessage = BasePluginMessage<'renderer', RendererPluginMessageData>

interface RendererPluginMessageData {
  height: number
}

export type HtmlPluginMessage = BasePluginMessage<'html', HtmlPluginMessageData>

interface HtmlPluginMessageData {
  html: string
}

export type ConfigurationPluginMessage = BasePluginMessage<'configuration', ConfigurationPluginMessageData>

interface ConfigurationPluginMessageData {
  configuration: IConfiguration
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

export type VariableNameTransformationsChangedPluginMessage = BasePluginMessage<'variable-name-transformations-changed', VariableNameTransformationsChangedPluginMessageData>

interface VariableNameTransformationsChangedPluginMessageData {
  variableNameTransformations: VariableNameTransformations
}

export type NewBuilderChangedPluginMessage = BasePluginMessage<'new-builder-changed', NewBuilderChangedPluginMessageData>

interface NewBuilderChangedPluginMessageData {
  newBuilder: boolean
}

export type NotificationPluginMessage = BasePluginMessage<'notification', NotificationPluginMessageData>

interface NotificationPluginMessageData {
  message: string
}

interface IsLoadingPluginMessageData {
  state: boolean
}

export type UnselectedPluginMessage = BasePluginMessage<'unselected', any>

export type IsLoadingPluginMessage = BasePluginMessage<'loading', IsLoadingPluginMessageData>

export type ExecutionTimePluginMessage = BasePluginMessage<'execution-time', ExecutionTimePluginMessageData>

interface ExecutionTimePluginMessageData {
  time: number
}

export interface SelectedNode {
  id: string
  props?: ComponentProps
}

export type SelectedPluginMessage = BasePluginMessage<'selected', SelectedPluginMessageData>

interface SelectedPluginMessageData {
  nodes: SelectedNode[] | null
}

export type PluginMessage =
  | RendererPluginMessage
  | HtmlPluginMessage
  | UnselectedPluginMessage
  | ExecutionTimePluginMessage
  | IsLoadingPluginMessage
  | SelectedPluginMessage
  | ModeChangedPluginMessage
  | NearestChangedPluginMessage
  | VariantGroupChangedPluginMessage
  | VariableNameTransformationsChangedPluginMessage
  | NotificationPluginMessage
  | UnitChangedPluginMessage
  | ConfigurationPluginMessage
  | NewBuilderChangedPluginMessage
