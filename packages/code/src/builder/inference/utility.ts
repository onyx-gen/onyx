import type { Mode } from '@onyx/types'
import type { BaseUtilityValue } from '../types'
import { isColorUtility } from '../types'
import type { Properties } from '../../tokens/properties'
import { getToken } from '../utils'

export function translateUtilityValue(utilityValue: BaseUtilityValue): string {
  let value = ''
  switch (utilityValue.mode) {
    case 'inferred':
      value = utilityValue.value
      break
    case 'arbitrary':
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

function getUtilityValue<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  property: Properties,
  figmaValue: V,
  handler: (val: V) => T,
  mode: Mode,
): BaseUtilityValue {
  console.log('property', property)

  let utilityValue: BaseUtilityValue | null = null

  if (mode === 'variables') {
    const token = getToken(node, property)
    console.log('token', token)

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

export function getUtilityClass<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  property: Properties,
  utilityClassPrefix: string,
  figmaValue: V,
  handler: (val: V) => T,
  mode: Mode,
): string {
  const utilityValue = getUtilityValue(node, type, property, figmaValue, handler, mode)

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

export function getUtilityClassForSides<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  rectSideMap: TokenPropertyUtilityClassPrefixMap<V>,
  sideShortcuts: SideShortcuts,
  handler: (val: V) => T,
  mode: Mode,
) {
  const valuesForProperties: UtilityValuesRectSides = Object.fromEntries(
    Object.entries(rectSideMap).map(([side, sideMapEntry]) => {
      return [side as RectSide, getUtilityValue(node, type, sideMapEntry.property, sideMapEntry.figmaValue, handler, mode)]
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
