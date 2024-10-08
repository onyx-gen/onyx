import type { Theme } from '@unocss/preset-mini'

export type Mode = 'inferred' | 'variables'

export interface VariableNameTransformations {
  lowercase: boolean
}

export type Unit = 'px' | 'rem'

export interface ComponentProps {
  [key: string]: string
}

export type HEX = string

export interface IConfiguration {
  mode: Mode
  unit: Unit
  variantGroup: boolean
  nearestInference: boolean
  theme: Theme
  variableNameTransformations: VariableNameTransformations
  ignoredComponentInstances: string[]
}

export interface ComponentTreeNode {
  name: string
  rawName: string
  code: string
  figmaNode: ComponentNode
  instances: ComponentTreeNode[]
}
