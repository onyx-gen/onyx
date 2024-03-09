/**
 * Represents a tree node.
 *
 * @template T - The type of tree data stored in the node.
 */
export interface TreeNode<T extends TreeNodeData = TreeNodeData> {
  data: T
  children: TreeNode[]
}

/**
 * Data stored in a tree node.
 *
 * This is a generic type including all possible node data types.
 * You might want to use a more specific type when traversing the
 * tree and working with the data.
 */
export type TreeNodeData =
  | ContainerNodeData
  | InstanceNodeData
  | IconNodeData
  | TextNodeData

/**
 * Represents a VariantCSS object with variant and css properties.
 *
 * VariantCSS is a recursive type, allowing for nested variant CSS.
 */
export interface VariantCSS {
  variant?: string
  css: (VariantCSS | Set<string>)[]
}

/**
 * CSS data associated with a node.
 */
export interface NodeCSSData {
  [key: string]: VariantCSS
}

/**
 * Interface representing an object that has NodeCSSData.
 *
 * Acts as a mixin for TreeNodeData and its subtypes.
 */
export interface HasNodeCSSData {
  css?: NodeCSSData
}

/**
 * Each tree node data type must implement this interface.
 *
 * @param {string} type - The unique type identifier of a specific type/subtype of tree node data.
 */
export interface AbstractNodeData {
  type: string
  if?: string[]
}

/**
 * Represents the data for a container node in a document.
 *
 * Container nodes can be styled using the `css` property.
 *
 * @param {string} element - The HTML element to use for the container.
 */
export interface ContainerNodeData extends AbstractNodeData, HasNodeCSSData {
  type: 'container'
  element?: string
}

/**
 * Represents the data for a text node in a document.
 *
 * @param {string} text - The text content of the node.
 */
export interface TextNodeData extends AbstractNodeData {
  type: 'text'
  text: string
}

/**
 * Represents data for an instance node.
 *
 * @type {string} name - The name of the instance.
 * @type {ComponentProperties} props - The properties of the instance.
 */
export interface InstanceNodeData extends AbstractNodeData {
  type: 'instance'
  name: string
  props: ComponentProperties
}

/**
 * Interface representing the data structure for an Icon Node.
 *
 * Icon nodes can be styled using the `css` property.
 *
 * @type {string} name - The name of the icon.
 */
export interface IconNodeData extends AbstractNodeData, HasNodeCSSData {
  type: 'icon'
  name: string
}
