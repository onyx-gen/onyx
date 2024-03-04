import type { GenericUtilityValue, UtilityValue } from '../types'
import type { Properties } from '../../tokens/properties'
import config from '../../config/config'
import { getToken } from '../utils'

export function translateUtilityValue(utilityValue: UtilityValue): string {
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

  if (utilityValue.type === 'color' && utilityValue.opacity && utilityValue.opacity < 100)
    value += `/${utilityValue.opacity}`

  return value
}

export function getUtilityClass(
  node: SceneNode,
  property: Properties,
  utilityClassPrefix: string,
  figmaValue: number,
  handler: (unitlessValue: number) => GenericUtilityValue,
): string {
  let utilityValue: GenericUtilityValue | null = null

  if (config.mode === 'variables') {
    const token = getToken(node, property)

    if (token) {
      utilityValue = {
        mode: 'variable',
        type: 'generic',
        value: token,
      }
    }
  }

  if (!utilityValue)
    utilityValue = handler(figmaValue)

  const value = translateUtilityValue(utilityValue)
  return `${utilityClassPrefix}-${value}`
}
