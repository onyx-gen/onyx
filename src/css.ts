import { cloneDeep } from 'lodash-es'
import type { ContainerNodeCSSData, VariantCSS } from './interfaces'
import { difference } from './set/utils'
import type { VariantKey } from './set/types'
import { entries } from './utils'

/**
 * Translates a VariantCSS object into a string representation.
 * The function handles nested VariantCSS objects recursively, creating a string
 * that represents the CSS classes and their respective variants.
 *
 * @param variantCSS - The VariantCSS object to be translated.
 * @returns A string representing the translated VariantCSS object.
 */
export function translateVariantCSS(variantCSS: VariantCSS): string {
  const translated = variantCSS.css.map((css) => {
    return isVariantCSS(css) ? translateVariantCSS(css) : [...css.values()].join(' ')
  }).join(' ')

  const variant = variantCSS.variant
  const requiresParentheses = translated.includes(' ') && variant !== undefined

  return `${variant ? `${variant}:` : ''}${requiresParentheses ? '(' : ''}${translated}${requiresParentheses ? ')' : ''}`
}

/**
 * Translates the CSS data of a container node into a record structure where each pair represents a variant
 * and each value is a CSS class string representation of the corresponding VariantCSS object.
 *
 * @param data - The ContainerNodeCSSData to be translated. It is an object where each key is a
 *               VariantKey and each value is a VariantCSS object. This structure represents the
 *               CSS data associated with a container node, with support for various variants.
 * @returns A record (object) where each key is a VariantKey and each value is a string
 *          representation of the corresponding VariantCSS object. This record is a flat
 *          representation of the input CSS data, with each variant's CSS stringified and
 *          appropriately formatted.
 */
export function translateContainerNodeCSSData(data: ContainerNodeCSSData): Record<VariantKey, string> {
  return Object.fromEntries(
    entries(data)
      .filter(([, variantCSS]) => variantCSS.css.length > 0)
      .map(([variant, variantCSS]) => {
        return [variant, translateVariantCSS(variantCSS)]
      }),
  )
}

// Type predicate to check if an item is VariantCSS
function isVariantCSS(item: VariantCSS | Set<string>): item is VariantCSS {
  return (item as VariantCSS).css !== undefined
}

/**
 * Calculates the difference between two VariantCSS objects, with handling for undefined inputs.
 * The difference is computed recursively for each CSS class set and variant.
 *
 * - If variantCSS1 is undefined, returns an empty VariantCSS.
 * - If variantCSS2 is undefined, returns variantCSS1.
 * - If both are defined, calculates the difference.
 *
 * @param variantCSS1 - The first VariantCSS object or undefined.
 * @param variantCSS2 - The second VariantCSS object or undefined.
 * @returns A VariantCSS object representing the difference, variantCSS1, or an empty VariantCSS.
 */
export function calculateVariantCSSDifference(variantCSS1: VariantCSS | undefined, variantCSS2: VariantCSS | undefined): VariantCSS {
  if (!variantCSS1)
    return { css: [] }

  if (!variantCSS2)
    return makeCopy(variantCSS1)!

  function diff(css1: VariantCSS['css'], css2: VariantCSS['css']): VariantCSS['css'] {
    const diffCSS: VariantCSS['css'] = []

    for (const item1 of css1) {
      if (item1 instanceof Set) {
        const item2 = css2.find(item => item instanceof Set) as Set<string> | undefined
        if (item2) {
          const diffSet = difference(item1, item2)
          if (diffSet.size > 0)
            diffCSS.push(diffSet)
        }
        else {
          diffCSS.push(item1)
        }
      }
      else {
        const correspondingVariant = css2.find(item => isVariantCSS(item) && item.variant === item1.variant) as VariantCSS | undefined
        if (correspondingVariant) {
          const variantDiff = diff(item1.css, correspondingVariant.css)
          if (variantDiff.length > 0)
            diffCSS.push({ variant: item1.variant, css: variantDiff })
        }
        else {
          diffCSS.push(item1)
        }
      }
    }

    return diffCSS
  }

  const copyVariantCSS1 = makeCopy(variantCSS1)!
  const copyVariantCSS2 = makeCopy(variantCSS2)!
  return { css: diff(copyVariantCSS1.css, copyVariantCSS2.css) }
}

function makeCopy(variantCSS: VariantCSS | undefined): VariantCSS | undefined {
  if (!variantCSS)
    return undefined

  return cloneDeep(variantCSS)
}

/**
 * Calculates the symmetric difference between two VariantCSS objects.
 * The symmetric difference is a set of CSS classes that are present in either `variantCSS1` or `variantCSS2` but not in both.
 * This method effectively combines the unique elements from both VariantCSS objects, excluding the elements that are common to both.
 * The process is recursive for nested VariantCSS objects and CSS class sets.
 *
 * - If either input is undefined, the method treats it as an empty VariantCSS.
 * - The symmetric difference is computed by combining the differences between `variantCSS1` and `variantCSS2` and vice versa.
 *
 * @param variantCSS1 - The first VariantCSS object or undefined.
 * @param variantCSS2 - The second VariantCSS object or undefined.
 * @returns A VariantCSS object representing the symmetric difference between the input VariantCSS objects.
 */
export function calculateVariantCSSSymmetricDifference(
  variantCSS1: VariantCSS | undefined,
  variantCSS2: VariantCSS | undefined,
): VariantCSS {
  const copyVariantCSS1: VariantCSS | undefined = makeCopy(variantCSS1)
  const copyVariantCSS2: VariantCSS | undefined = makeCopy(variantCSS2)

  // Diff(1,2) + Diff(2,1)
  return calculateVariantCSSUnion(
    calculateVariantCSSDifference(copyVariantCSS1, copyVariantCSS2),
    calculateVariantCSSDifference(copyVariantCSS2, copyVariantCSS1),
  )
}

/**
 * Calculates the intersection of two VariantCSS objects.
 * The intersection is a set of CSS classes that are present in both `variantCSS1` and `variantCSS2`.
 * This method finds the common CSS classes and structure between the two VariantCSS objects.
 * The process is recursive for nested VariantCSS objects and CSS class sets.
 *
 * - If either input is undefined, the method treats it as an empty VariantCSS.
 * - The intersection is computed by first merging the CSS classes of both VariantCSS objects and then subtracting the symmetric difference.
 *
 * @param variantCSS1 - The first VariantCSS object or undefined.
 * @param variantCSS2 - The second VariantCSS object or undefined.
 * @returns A VariantCSS object representing the intersection between the input VariantCSS objects.
 */
export function calculateVariantCSSIntersection(variantCSS1: VariantCSS | undefined, variantCSS2: VariantCSS | undefined): VariantCSS {
  const copyVariantCSS1: VariantCSS | undefined = makeCopy(variantCSS1)
  const copyVariantCSS2: VariantCSS | undefined = makeCopy(variantCSS2)

  const union12 = calculateVariantCSSUnion(copyVariantCSS1, copyVariantCSS2)
  const symmetricDifference12 = calculateVariantCSSSymmetricDifference(copyVariantCSS1, copyVariantCSS2)

  // Union(1,2) - SymDiff(1,2)
  return calculateVariantCSSDifference(
    union12,
    symmetricDifference12,
  )
}

/**
 * Merges two VariantCSS objects to create a new VariantCSS object that combines the CSS properties from both input objects.
 *
 * - If either of the objects has an undefined variant, the CSS sets from this object are merged with those of the other object.
 * - If both objects have defined and different variants, the resulting object contains separate entries for each variant.
 * - If both objects have the same defined variant, their CSS sets are merged.
 *
 * @param variantCSS1 The first VariantCSS object.
 * @param variantCSS2 The second VariantCSS object.
 * @returns A new VariantCSS object representing the union of the two input objects.
 */
export function calculateVariantCSSUnion(variantCSS1: VariantCSS | undefined, variantCSS2: VariantCSS | undefined): VariantCSS {
  if (!variantCSS1)
    return makeCopy(variantCSS2) || { css: [] }
  if (!variantCSS2)
    return makeCopy(variantCSS1)!

  const copyVariantCSS1 = makeCopy(variantCSS1)!
  const copyVariantCSS2 = makeCopy(variantCSS2)!

  // Merge CSS sets if the variant is undefined or both variants match
  if (copyVariantCSS1.variant === copyVariantCSS2.variant) {
    const result: VariantCSS = {
      css: mergeCSSArrays(copyVariantCSS1.css, copyVariantCSS2.css),
    }

    if (copyVariantCSS1.variant !== undefined)
      result.variant = copyVariantCSS1.variant

    return result
  }

  // Handle distinct variant cases
  const result: VariantCSS = { css: [] }
  if (copyVariantCSS1.variant === undefined)
    result.css = [...copyVariantCSS1.css, copyVariantCSS2]
  else if (copyVariantCSS2.variant === undefined)
    result.css = [...copyVariantCSS2.css, copyVariantCSS1]
  else
    result.css = [copyVariantCSS1, copyVariantCSS2]

  return result
}

/**
 * Merges two arrays of CSS sets, handling VariantCSS objects and Set<string> elements.
 *
 * @param cssArray1 The first array of CSS sets.
 * @param cssArray2 The second array of CSS sets.
 * @returns A merged array of CSS sets.
 */
function mergeCSSArrays(cssArray1: (VariantCSS | Set<string>)[], cssArray2: (VariantCSS | Set<string>)[]): (VariantCSS | Set<string>)[] {
  const merged: (VariantCSS | Set<string>)[] = [...cssArray1]

  // TODO MF: Do some refactoring work here
  cssArray2.forEach((css2) => {
    if (isVariantCSS(css2)) {
      const matchingVariant = merged.find(css1 =>
        (css1 as VariantCSS).variant === css2.variant) as VariantCSS | undefined

      if (matchingVariant)
        matchingVariant.css = mergeCSSArrays(matchingVariant.css, css2.css)
      else
        merged.push(css2)
    }
    else {
      const set1Index = merged.findIndex(css1 => !isVariantCSS(css1))
      if (set1Index !== -1) {
        merged[set1Index] = new Set([
          ...(merged[set1Index] as Set<string>),
          ...(css2 as Set<string>),
        ])
      }
      else {
        merged.push(css2)
      }
    }
  })

  return merged
}

/**
 * Wraps a VariantCSS object with another variant.
 * This function takes a variant name and a VariantCSS object,
 * then wraps the VariantCSS object inside another VariantCSS object
 * with the given variant name.
 *
 * @param variantName - The variant name to wrap the VariantCSS object with.
 * @param variantCSS - The VariantCSS object to be wrapped.
 * @returns A new VariantCSS object wrapped with the given variant name.
 */
export function wrapInVariant(variantName: string, variantCSS: VariantCSS | undefined): VariantCSS {
  let copyVariantCSS = makeCopy(variantCSS)

  if (!copyVariantCSS)
    copyVariantCSS = { css: [] }

  // If the variantCSS already has a variant, wrap it inside the new variant.
  if (copyVariantCSS.variant) {
    return {
      variant: variantName,
      css: [copyVariantCSS],
    }
  }

  // If variantCSS does not have a variant, directly add the variant to it.
  return {
    variant: variantName,
    css: copyVariantCSS.css,
  }
}

/**
 * Wraps a VariantCSS object within multiple variant layers specified by an array of variant names.
 *
 * This function applies each variant name to the VariantCSS object, effectively nesting it within
 * multiple variant layers. If the input VariantCSS object is undefined, it initializes it with an empty
 * css array. The wrapping is performed in the order of the variant names provided in the array.
 *
 * @param variantNames An array of strings representing the variant names to wrap the VariantCSS object in.
 * @param variantCSS The VariantCSS object to be wrapped. If undefined, an empty VariantCSS object is initialized.
 * @returns A new VariantCSS object wrapped within the specified variant layers.
 */
export function wrapInVariants(variantNames: string[], variantCSS: VariantCSS | undefined): VariantCSS {
  if (!variantCSS)
    variantCSS = { css: [] }

  return variantNames.reduce((variantCSS, variantName) => wrapInVariant(variantName, variantCSS), variantCSS)
}

/**
 * Appends a set of CSS class strings to a VariantCSS object.
 *
 * This function adds a new set of CSS classes to the css array of a VariantCSS object. If the input VariantCSS
 * object is undefined, it initializes a new object with the css array containing only the provided cssSet.
 * The new set is appended at the end of the existing css array, preserving any existing structures within
 * the VariantCSS object.
 *
 * @param variantCSS - The VariantCSS object to append the cssSet to. If undefined, a new VariantCSS object is created.
 * @param cssSet - A set of strings representing CSS classes to be added to the VariantCSS object.
 * @param variant - The variant name to be added to the VariantCSS object. If undefined, the variant is not added.
 * @returns A VariantCSS object with the new set of CSS classes appended.
 */
export function appendSetToVariantCSS(
  variantCSS: VariantCSS | undefined,
  cssSet: Set<string>,
  variant?: string | string[],
): VariantCSS {
  if (!variantCSS) {
    if (!variant)
      return { css: [cssSet] }

    if (Array.isArray(variant)) {
      return variant.reduceRight(
        (variantCSS, variantName) => wrapInVariant(variantName, variantCSS),
        { css: [cssSet] } as VariantCSS,
      )
    }
    else {
      return { variant, css: [cssSet] }
    }
  }

  if (variant && Array.isArray(variant)) {
    if (variant[0] !== variantCSS.variant) {
      const reduced = variant.reduceRight(
        (variantCSS, variantName) => wrapInVariant(variantName, variantCSS),
        { css: [cssSet] } as VariantCSS,
      )

      if (variantCSS.css.some(item => isVariantCSS(item) && item.variant === variant[0])) {
        return variantCSS
      }
      else {
        return {
          variant: variantCSS.variant,
          css: [...variantCSS.css, reduced],
        }
      }
    }

    if (variant.length > 1) {
      const index = variantCSS.css.findIndex(item => isVariantCSS(item) && item.variant === variant[1])
      if (index !== -1)
        variantCSS.css[index] = appendSetToVariantCSS(variantCSS.css[index] as VariantCSS, cssSet, variant.slice(1))
    }

    if (variant.length === 1) {
      return {
        variant: variantCSS.variant,
        css: [...variantCSS.css, cssSet],
      }
    }

    return appendSetToVariantCSS(variantCSS, cssSet, variant.slice(1))
  }
  else {
    // If the variant is defined and does not match the variant of the VariantCSS object,
    // wrap the VariantCSS object
    if (variant && variant !== variantCSS.variant) {
      return {
        variant: variantCSS.variant,
        css: [...variantCSS.css, { variant, css: [cssSet] }],
      }
    }

    // If the variant is defined and matches the variant of the VariantCSS object,
    // append the cssSet to the VariantCSS object
    else {
      return {
        variant: variantCSS.variant,
        css: [...variantCSS.css, cssSet],
      }
    }
  }
}

/**
 * Appends a CSS class string to a VariantCSS object.
 *
 * @param variantCSS - The VariantCSS object to append the cssSet to. If undefined, a new VariantCSS object is created.
 * @param css - A string representing a CSS class to be added to the VariantCSS object.
 * @param variant - The variant name to be added to the VariantCSS object. If undefined, the variant is not added.
 */
export function appendToVariantCSS(
  variantCSS: VariantCSS | undefined,
  css: string,
  variant?: string | string[],
): VariantCSS {
  return appendSetToVariantCSS(variantCSS, new Set([css]), variant)
}
