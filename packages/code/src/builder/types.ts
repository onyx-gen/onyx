/**
 * Represents the sides of a rectangle.
 * @interface RectSides
 * @property {string | null} top - The value of the top side of the rectangle.
 * @property {string | null} bottom - The value of the bottom side of the rectangle.
 * @property {string | null} left - The value of the left side of the rectangle.
 * @property {string | null} right - The value of the right side of the rectangle.
 */
export interface RectSides {
  top: string | null
  bottom: string | null
  left: string | null
  right: string | null
}

export interface RectSidesNew {
  top: number | null
  bottom: number | null
  left: number | null
  right: number | null
}

/**
 * Represents the corners of a rectangle.
 *
 * @interface RectCorners
 * @property {string | null} topLeft - The value of the top left corner of the rectangle.
 * @property {string | null} topRight - The value of the top right corner of the rectangle.
 * @property {string | null} bottomLeft - The value of the bottom left corner of the rectangle.
 * @property {string | null} bottomRight - The value of the bottom right corner of the rectangle.
 */
export interface RectCorners {
  topLeft: string | null
  topRight: string | null
  bottomLeft: string | null
  bottomRight: string | null
}

export interface RectCornersNew {
  topLeft: number | null
  topRight: number | null
  bottomLeft: number | null
  bottomRight: number | null
}

export interface BaseUtilityValue {
  mode: 'inferred' | 'arbitrary' | 'variable'
  type: string
  value: string
}

export function isColorUtility(utility: BaseUtilityValue): utility is ColorUtilityValue {
  return utility.type === 'color'
}

export interface ColorUtilityValue extends BaseUtilityValue {
  type: 'color'
  opacity?: number
}

export interface GenericUtilityValue extends BaseUtilityValue {
  type: 'generic'
}
