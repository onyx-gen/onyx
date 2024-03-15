import type { GenericUtilityValue } from '../types'

function getInferredFontName(fontNameFigma: string, nearestInference: boolean): GenericUtilityValue {
  if (nearestInference) {
    return {
      mode: 'inferred',
      type: 'generic',
      value: fontNameFigma, // TODO
    }
  }

  return {
    mode: 'arbitrary',
    type: 'generic',
    value: fontNameFigma, // TODO
  }
}

export function createFontNameHandler(
  nearestInference: boolean,
): (font: string) => GenericUtilityValue {
  return (fontNameFigma: string) => getInferredFontName(fontNameFigma, nearestInference)
}
