import {TreeNode, TreeNodeData} from "../interfaces";

type StaticAttributeValue = string
type DynamicAttributeValue = { [key: string]: string }

type AttributeValue = StaticAttributeValue | DynamicAttributeValue
export interface Attributes { [key: string]: AttributeValue }

export interface CSSAttributes {
  "static"?: StaticAttributeValue
  "dynamic"?: DynamicAttributeValue
}

type AttrsFunction<T extends TreeNodeData> = (node: TreeNode<T>) => Attributes
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