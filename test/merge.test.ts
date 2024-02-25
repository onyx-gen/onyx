import { expect, it } from 'vitest'
import { conditionalTree, variantKey } from '../src/code/merge/utils'
import type { VariantPermutation } from '../src/code/set/types'
import type { TreeNode } from '../src/code/interfaces'

it('computes variant key from variant permutation', () => {
  const variantPermutation: VariantPermutation = {
    color: 'red',
    size: 'large',
  }

  expect(variantKey(variantPermutation)).toBe('color-red_size-large')
})

it('computes conditional tree', () => {
  const tree1: TreeNode = {
    data: {
      type: 'container',
    },
    children: [],
  }

  const tree2: TreeNode = {
    data: {
      type: 'container',
      if: ['foo'],
    },
    children: [],
  }

  const treeIf = {
    data: {
      type: 'container',
      if: ['foo', 'bar'],
    },
    children: [],
  }

  expect(conditionalTree(tree1, 'foo', 'bar')).toEqual(treeIf)
  expect(conditionalTree(tree2, 'bar')).toEqual(treeIf)
})
