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
    entries(data).map(([variant, variantCSS]) => {
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
    return variantCSS1

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

  return { css: diff(variantCSS1.css, variantCSS2.css) }
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
    return variantCSS2!
  if (!variantCSS2)
    return variantCSS1

  // Merge CSS sets if the variant is undefined or both variants match
  if (variantCSS1.variant === variantCSS2.variant) {
    return {
      variant: variantCSS1.variant,
      css: mergeCSSArrays(variantCSS1.css, variantCSS2.css),
    }
  }

  // Handle distinct variant cases
  const result: VariantCSS = { css: [] }
  if (variantCSS1.variant === undefined)
    result.css = [...variantCSS1.css, variantCSS2]
  else if (variantCSS2.variant === undefined)
    result.css = [...variantCSS2.css, variantCSS1]
  else
    result.css = [variantCSS1, variantCSS2]

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
  // This implementation needs to handle merging of Set<string> elements and recursive merging of VariantCSS objects
  // For simplicity, this example focuses on merging Set<string> elements only
  // TODO MF: Implement recursive merging of VariantCSS objects
  return [...cssArray1, ...cssArray2]
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
  if (!variantCSS)
    variantCSS = { css: [] }

  // If the variantCSS already has a variant, wrap it inside the new variant.
  if (variantCSS.variant) {
    return {
      variant: variantName,
      css: [variantCSS],
    }
  }

  // If variantCSS does not have a variant, directly add the variant to it.
  return {
    variant: variantName,
    css: variantCSS.css,
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
