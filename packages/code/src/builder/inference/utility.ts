import type { BaseUtilityValue } from '../types'
import { isColorUtility } from '../types'
import type { Properties } from '../../tokens/properties'
import config from '../../config/config'
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

export function getUtilityClass<T extends BaseUtilityValue, V>(
  node: SceneNode,
  type: T['type'],
  property: Properties,
  utilityClassPrefix: string,
  figmaValue: V,
  handler: (val: V) => T,
): string {
  let utilityValue: BaseUtilityValue | null = null

  if (config.mode === 'variables') {
    const token = getToken(node, property)

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

  const value = translateUtilityValue(utilityValue)
  return `${utilityClassPrefix}-${value}`
}
