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
