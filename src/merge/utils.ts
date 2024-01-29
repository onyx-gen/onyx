import type { TreeNode } from '../interfaces'
import type { VariantPermutation } from '../set/types'

/**
 * Merges an array of conditionals into the `if` property of a tree node's `data` object.
 *
 * This function accepts a tree node and a variable number of string arguments representing conditionals.
 * It returns a new tree node, which is a copy of the input tree node, with the conditionals merged into the `if` property of the `data` object.
 * If the `if` property does not exist on the input node's `data`, it is initialized as an empty array before merging the new conditionals.
 *
 * @param {TreeNode} tree - The tree node to which the conditionals will be merged.
 * @param {...string[]} conditional - A variable number of string arguments representing conditionals to be merged into the tree node.
 * @returns {TreeNode} A new tree node with the conditionals merged into the `data.if` property.
 */
export function conditionalTree(tree: TreeNode, ...conditional: string[]): TreeNode {
  return {
    ...tree,
    data: {
      ...tree.data,
      if: [...(tree.data.if || []), ...conditional],
    },
  }
}

/**
 * Returns a string representing a variant permutation.
 * @param variantPermutation
 */
export function variantKey(variantPermutation: VariantPermutation): string {
  return Object.entries(variantPermutation).map(([key, value]) => `${key}-${value}`).join('_')
}
