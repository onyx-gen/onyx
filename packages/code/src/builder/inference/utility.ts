import type { UtilityValue } from '../types'

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
