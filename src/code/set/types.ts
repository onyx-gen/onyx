import type { TreeNode } from '../interfaces'

export interface GroupedComponentCollection<T extends ComponentProps> {
  [key: string]: {
    component: ComponentNode
    props: T
  }[]
}

export interface ComponentProps {
  [key: string]: string
}

export interface ComponentPropsWithState extends ComponentProps {
  state: string
}

export type ComponentCollection<T extends ComponentProps = ComponentProps> = {
  component: ComponentNode
  props: T
}[]

// Assuming ComponentProps is a type with string keys and string values.
export type ExcludedStateProps = Omit<ComponentProps, 'state'>

// This will represent an object with a single key-value pair,
// which can be any of the keys from ExcludedStateProps.
export type SinglePropertyObject = {
  [K in keyof ExcludedStateProps]: {
    [P in K]: ExcludedStateProps[P];
  }
}[keyof ExcludedStateProps]

export interface VariantPermutation { [key: string]: string }

export type VariantKey = string

export type VariantTrees = { permutation: VariantPermutation, tree: TreeNode | null }[]
