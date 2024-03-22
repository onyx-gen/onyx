import type { FontNameUtilityValue } from '../types'

function getInferredFontName(fontNameFigma: string, nearestInference: boolean): FontNameUtilityValue {
  // if (nearestInference) {
  //   return {
  //     mode: 'inferred',
  //     type: 'font-name',
  //     value: fontNameFigma, // TODO
  //   }
  // }
  console.warn('[Builder] Nearest inference is not supported yet.', nearestInference)

  return {
    mode: 'arbitrary',
    type: 'font-name',
    value: fontNameFigma, // TODO
  }
}

export function createFontNameHandler(
  nearestInference: boolean,
): (font: string) => FontNameUtilityValue {
  return (fontNameFigma: string) => getInferredFontName(fontNameFigma, nearestInference)
}
