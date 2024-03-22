import type { Unit } from '@onyx/types'
import type { GenericUtilityValue } from '../types'
import type { InferenceDimensionMap } from '../../config/dimension'
import { createDimensionHandler } from './dimension'

export function createLineHeightHandler(
  lineHeightUnit: LineHeight['unit'],
  dimensionMap: InferenceDimensionMap,
  nearestInference: boolean,
  unit: Unit,
): (lineHeight: number) => GenericUtilityValue {
  if (lineHeightUnit === 'PIXELS') {
    return createDimensionHandler(dimensionMap, nearestInference, unit)
  }
  else {
    // TODO: Inference & tokens mode
    return v => ({
      mode: 'arbitrary',
      type: 'generic',
      value: `${Math.round(v)}%`,
    })
  }
}
