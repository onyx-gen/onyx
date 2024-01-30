import { describe, expect, it } from 'vitest'
import { simplifyConditionalString } from '../src/generators/utils'

describe('html', () => {
  it('simplifies simple conditional', () => {
    const conditionals1 = 'condition1-true'
    const expected1 = 'condition1'

    const conditionals2 = 'condition1-false'
    const expected2 = '!condition1'

    expect(simplifyConditionalString(conditionals1)).toBe(expected1)
    expect(simplifyConditionalString(conditionals2)).toBe(expected2)
  })

  it('simplifies complex conditionals', () => {
    const conditionals = '!condition1-false'
    const expected = 'condition1'

    expect(simplifyConditionalString(conditionals)).toBe(expected)
  })

  it('removes unnecessary symbols', () => {
    const conditionals1 = '!!!!!!!condition1-false'
    const expected1 = 'condition1'

    const conditionals2 = '!!!!!!!!condition1-false'
    const expected2 = '!condition1'

    expect(simplifyConditionalString(conditionals1)).toBe(expected1)
    expect(simplifyConditionalString(conditionals2)).toBe(expected2)
  })

  it('simplifies multiple conditionals', () => {
    const conditionals = 'condition1-true && !condition2-false && (size-large || !unselected)'
    const expected = 'condition1 && condition2 && (size-large || !unselected)'
    expect(simplifyConditionalString(conditionals)).toBe(expected)
  })
})
