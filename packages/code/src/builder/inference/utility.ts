import type { Mode, VariableNameTransformations } from '@onyx-gen/types'
import type { BaseUtilityValue } from '../types'
import { isColorUtility } from '../types'
import type { Properties } from '../../tokens/properties'
import { getToken } from '../utils'

/**
 * Translates a `BaseUtilityValue` to a string representation based on its mode.
 * - If the mode is `inferred`, it directly uses the value.
 * - If the mode is `arbitrary`, it wraps the value in brackets.
 * - If the mode is `variable`, it prefixes the value with a `$`.
 * Additionally, if the utility value represents a color and has an opacity less than 100, it appends the opacity.
 * @param utilityValue The utility value to translate.
 * @returns The string representation of the utility value.
 */
export function translateUtilityValue(utilityValue: BaseUtilityValue): string {
  let value = ''
  switch (utilityValue.mode) {
    case 'inferred':
      value = utilityValue.value
      break
    case 'arbitrary':
      if (utilityValue.type === 'font-name')
        value = `[${utilityValue.value.replaceAll(' ', '_')}]`
      else
        value = `[${utilityValue.value}]`
      break
    case 'variable':
      value = `$${utilityValue.value}`
      break
  }

  if (isColorUtility(utilityValue) && utilityValue.opacity && utilityValue.opacity < 100)
    value += `/${utilityValue.opacity}`

  return value
}

interface UtilityClassPrefixTokenProperty<V> {
  property: Properties
  utilityClassPrefix: string
  figmaValue: V
}

type RectSide = 'left' | 'right' | 'top' | 'bottom'

export type TokenPropertyUtilityClassPrefixMap<V> = {
  [key in RectSide]?: UtilityClassPrefixTokenProperty<V>
}

interface SideShortcuts {
  allEqualUtilityClassPrefix: string
  horizontalEqualUtilityClassPrefix: string
  verticalEqualUtilityClassPrefix: string
}

type UtilityValuesRectSides = {
  [key in RectSide]: BaseUtilityValue
}

/**
 * Retrieves a utility value for a specific property from a Figma node.
 * This function supports different modes, such as using predefined variables or handling custom values through a handler function.
 * @param node The Figma node to retrieve the value from.
 * @param type The type of utility value being handled.
 * @param property The specific property to handle.
 * @param figmaValue The raw value from Figma to be processed.
 * @param handler A function to process the figmaValue into a utility value.
 * @param mode Specifies how to handle the utility value (e.g., as a variable).
 * @param variableNameTransformations The transformations to apply to the variable name.
 * @returns The resulting utility value after processing.
 * @throws If no utility value can be found or processed.
 */
function getUtilityValue<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  property: Properties,
  figmaValue: V,
  handler: (val: V) => T,
  mode: Mode,
  variableNameTransformations: VariableNameTransformations,
): BaseUtilityValue {
  let utilityValue: BaseUtilityValue | null = null

  if (mode === 'variables') {
    const token = getToken(node, property, variableNameTransformations)

    if (token) {
      utilityValue = {
        mode: 'variable',
        type,
        value: token,
      }
    }
  }

  if (!utilityValue)
    utilityValue = handler(figmaValue)

  if (!utilityValue)
    throw new Error(`No utility value found for ${property}`)

  return utilityValue
}

/**
 * Constructs a utility class string for a given property on a Figma node.
 * This function utilizes `getUtilityValue` to retrieve the utility value and then prefixes it with a class prefix.
 * @param node The Figma node to retrieve the value from.
 * @param type The type of utility value being handled.
 * @param property The specific property to handle.
 * @param utilityClassPrefix The prefix for the utility class.
 * @param figmaValue The raw value from Figma to be processed.
 * @param handler A function to process the figmaValue into a utility value.
 * @param mode Specifies how to handle the utility value (e.g., as a variable).
 * @param variableNameTransformations The transformations to apply to the variable name.
 * @returns The full utility class string.
 */
export function getUtilityClass<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  property: Properties,
  utilityClassPrefix: string,
  figmaValue: V,
  handler: (val: V) => T,
  mode: Mode,
  variableNameTransformations: VariableNameTransformations,
): string {
  const utilityValue = getUtilityValue(node, type, property, figmaValue, handler, mode, variableNameTransformations)

  return `${utilityClassPrefix}-${translateUtilityValue(utilityValue)}`
}

function checkUtilityClassEquality<T extends BaseUtilityValue, V extends BaseUtilityValue>(
  utilityValue1: T,
  utilityValue2: V,
): boolean {
  const canBeEqual = utilityValue1.type === utilityValue2.type
    && utilityValue1.value === utilityValue2.value
    && utilityValue1.mode === utilityValue2.mode

  if (!canBeEqual)
    return false
  else if (isColorUtility(utilityValue1) && isColorUtility(utilityValue2))
    return utilityValue1.opacity === utilityValue2.opacity

  return true
}

/**
 * Checks if the map has a specific side.
 * @param side {RectSide} - The side to check for.
 * @param map {TokenPropertyUtilityClassPrefixMap} - The map to check.
 */
function has<V>(side: 'left', map: TokenPropertyUtilityClassPrefixMap<V>): map is TokenPropertyUtilityClassPrefixMap<V> & { left: UtilityClassPrefixTokenProperty<V> }
function has<V>(side: 'right', map: TokenPropertyUtilityClassPrefixMap<V>): map is TokenPropertyUtilityClassPrefixMap<V> & { right: UtilityClassPrefixTokenProperty<V> }
function has<V>(side: 'top', map: TokenPropertyUtilityClassPrefixMap<V>): map is TokenPropertyUtilityClassPrefixMap<V> & { top: UtilityClassPrefixTokenProperty<V> }
function has<V>(side: 'bottom', map: TokenPropertyUtilityClassPrefixMap<V>): map is TokenPropertyUtilityClassPrefixMap<V> & { bottom: UtilityClassPrefixTokenProperty<V> }
function has<V>(side: RectSide, map: TokenPropertyUtilityClassPrefixMap<V>): boolean {
  return map[side] !== undefined
}

/**
 * Generates a set of utility classes for each side of a node, based on provided side maps and shortcuts.
 *
 * @param node - The Figma node to generate utility classes for.
 * @param type - The type of the base utility value.
 * @param rectSideMap - A map of utility class prefixes for each rect side.
 * @param sideShortcuts - Shortcuts for generating classes when values are equal on all sides, or on horizontal/vertical axes.
 * @param handler - A handler function to transform Figma values into utility values.
 * @param mode - The mode to use for generating utility values.
 * @param variableNameTransformations - The transformations to apply to the variable name.
 * @returns A set of utility class strings.
 */
export function getUtilityClassForSides<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  rectSideMap: TokenPropertyUtilityClassPrefixMap<V>,
  sideShortcuts: SideShortcuts,
  handler: (val: V) => T,
  mode: Mode,
  variableNameTransformations: VariableNameTransformations,
) {
  const valuesForProperties: UtilityValuesRectSides = Object.fromEntries(
    Object.entries(rectSideMap).map(([side, sideMapEntry]) => {
      return [side as RectSide, getUtilityValue(node, type, sideMapEntry.property, sideMapEntry.figmaValue, handler, mode, variableNameTransformations)]
    }),
  ) as UtilityValuesRectSides

  const attributes: Set<string> = new Set()

  const sides: RectSide[] = ['top', 'right', 'bottom', 'left']

  const hasAllSides = sides.every(side => rectSideMap[side] !== undefined)

  // Check if all sides are the same
  if (hasAllSides) {
    const allSidesEqual = Object.values(valuesForProperties).every(value => checkUtilityClassEquality(valuesForProperties.left, value))

    if (allSidesEqual) {
      attributes.add(`${sideShortcuts.allEqualUtilityClassPrefix}-${translateUtilityValue(valuesForProperties.left)}`)
      return attributes
    }
  }

  // Check if one axis is the same
  const xAxisSides: RectSide[] = ['left', 'right']
  const yAxisSides: RectSide[] = ['top', 'bottom']

  const hasXAxis = xAxisSides.every(side => rectSideMap[side] !== undefined)
  const hasYAxis = yAxisSides.every(side => rectSideMap[side] !== undefined)

  let axisXEqual = false
  let axisYEqual = false

  if (hasXAxis) {
    axisXEqual = checkUtilityClassEquality(valuesForProperties.left, valuesForProperties.right)
    if (axisXEqual)
      attributes.add(`${sideShortcuts.horizontalEqualUtilityClassPrefix}-${translateUtilityValue(valuesForProperties.left)}`)
  }

  if (hasYAxis) {
    axisYEqual = checkUtilityClassEquality(valuesForProperties.top, valuesForProperties.bottom)
    if (axisYEqual)
      attributes.add(`${sideShortcuts.verticalEqualUtilityClassPrefix}-${translateUtilityValue(valuesForProperties.top)}`)
  }

  if (axisXEqual && axisYEqual)
    return attributes

  // Add individual sides
  if (!axisXEqual) {
    if (has('left', rectSideMap))
      attributes.add(`${rectSideMap.left.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.left)}`)

    if (has('right', rectSideMap))
      attributes.add(`${rectSideMap.right.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.right)}`)
  }

  if (!axisYEqual) {
    if (has('top', rectSideMap))
      attributes.add(`${rectSideMap.top.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.top)}`)

    if (has('bottom', rectSideMap))
      attributes.add(`${rectSideMap.bottom.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.bottom)}`)
  }

  return attributes
}
