import type { TreeNode, TreeNodeData } from '../interfaces'

type StaticAttributeValue = string
export interface DynamicAttributeValue { [key: string]: string }

type AttributeValue = StaticAttributeValue | DynamicAttributeValue
export interface Attributes { [key: string]: AttributeValue }

export interface CSSAttributes {
  'static'?: StaticAttributeValue
  'dynamic'?: DynamicAttributeValue
}

type MaybePromise<T> = T | Promise<T>

type AttrsFunction<T extends TreeNodeData> = (node: TreeNode<T>) => MaybePromise<Attributes>
type ConditionalFunction<T extends TreeNodeData> = (node: TreeNode<T>) => string | undefined
type TagFunction<T extends TreeNodeData> = ((node: TreeNode<T>) => string) | string

type ExtractedNodeDataType<K extends TreeNodeData['type']> = Extract<TreeNodeData, { type: K }>

/**
 * Maps each 'type' of TreeNodeData to its corresponding HTML tag configuration.
 * For each type (e.g., 'container', 'text'), it defines the HTML start and end tags,
 * and a function to generate the HTML attributes appropriate for that type.
 * This mapping leverages TypeScript's conditional types and mapped types to automatically
 * associate the correct subtype of TreeNodeData with its tag configuration, ensuring type safety.
 */
export type NodeTypeToTagMap = {
  [K in TreeNodeData['type']]: {
    tag?: TagFunction<ExtractedNodeDataType<K>>
    attrs?: AttrsFunction<ExtractedNodeDataType<K>>
    if?: ConditionalFunction<ExtractedNodeDataType<K>>
  }
}

/**
 * Type representing a permutation key.
 *
 * Permutation key is for example a variant name, like `size` or `color`.
 */
export type PermutationKey = string

/**
 * Type representing a permutation value.
 *
 * Permutation value is for example a variant value, like `small` or `red`.
 */
export type PermutationValue = string

/**
 * Type representing a computed property name.
 *
 * Computed property name is a string representing a computed property name for a permutation key/value pair.
 *
 * An example of a computed property name is `isSizeSmall` or `isColorRed`.
 */
export type PermutationComputedPropertyName = string

/**
 * Type representing a collection of computed property names.
 *
 * Collection is structured for easy access to computed property names for a permutation key/value pair.
 * Collection is also structured for easy iteration.
 */
export interface ComputedProperties {
  [p: PermutationKey]: {
    [p: PermutationValue]: PermutationComputedPropertyName
  }
}

/**
 * Type representing a permutation union type.
 *
 * Permutation union type is a string representing a TypeScript union type for a permutation key.
 * An example of a permutation union type is `'small' | 'medium' | 'large'`.
 */
export type PermutationUnionType = string
