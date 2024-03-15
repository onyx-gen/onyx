import type { Mode } from '@onyx/types'
import type { BaseUtilityValue } from '../types'
import { isColorUtility } from '../types'
import type { Properties } from '../../tokens/properties'
import { getToken } from '../utils'
import { entries } from '../../utils'

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

type TokenPropertyUtilityClassPrefixMap<V> = {
  [key in RectSide]: UtilityClassPrefixTokenProperty<V>
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

export function getUtilityClassForSides<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  rectSideMap: TokenPropertyUtilityClassPrefixMap<V>,
  sideShortcuts: SideShortcuts,
  handler: (val: V) => T,
  mode: Mode,
) {
  const valuesForProperties: UtilityValuesRectSides = Object.fromEntries(
    entries(rectSideMap).map(([side, sideMapEntry]) => {
      return [side as RectSide, getUtilityValue(node, type, sideMapEntry.property, sideMapEntry.figmaValue, handler, mode)]
    }),
  ) as UtilityValuesRectSides

  const attributes: Set<string> = new Set()

  // Check if all sides are the same
  const allSidesEqual = Object.values(valuesForProperties).every(value => checkUtilityClassEquality(valuesForProperties.left, value))

  if (allSidesEqual) {
    attributes.add(`${sideShortcuts.allEqualUtilityClassPrefix}-${translateUtilityValue(valuesForProperties.left)}`)
    return attributes
  }

  // Check if one axis is the same
  const axisXEqual = checkUtilityClassEquality(valuesForProperties.left, valuesForProperties.right)
  const axisYEqual = checkUtilityClassEquality(valuesForProperties.top, valuesForProperties.bottom)

  if (axisXEqual)
    attributes.add(`${sideShortcuts.horizontalEqualUtilityClassPrefix}-${translateUtilityValue(valuesForProperties.left)}`)
  if (axisYEqual)
    attributes.add(`${sideShortcuts.verticalEqualUtilityClassPrefix}-${translateUtilityValue(valuesForProperties.top)}`)

  if (axisXEqual && axisYEqual)
    return attributes

  // Add individual sides
  if (!axisXEqual) {
    attributes.add(`${rectSideMap.left.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.left)}`)
    attributes.add(`${rectSideMap.right.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.right)}`)
  }

  if (!axisYEqual) {
    attributes.add(`${rectSideMap.top.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.top)}`)
    attributes.add(`${rectSideMap.bottom.utilityClassPrefix}-${translateUtilityValue(valuesForProperties.bottom)}`)
  }

  return attributes
}
