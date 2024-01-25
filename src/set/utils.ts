import type { ComponentCollection, ComponentProps, GroupedComponentCollection } from './types'

/**
 * Extracts and parses properties from a component's name.
 *
 * This function takes a ComponentNode and parses its name to extract properties.
 * The name of the component is expected to be a string formatted as key-value pairs,
 * separated by spaces, and each pair is separated by an equals sign. For instance,
 * if the component's name is "size=large color=blue shape=circle", this function
 * will parse it into an object: { size: "large", color: "blue", shape: "circle" }.
 * This is useful for converting a descriptive string into a more structured and
 * accessible data format.
 *
 * @param component - A ComponentNode whose name is to be parsed. The name should follow
 * the key=value pair format.
 * @returns An object representing the properties extracted from the component's name.
 */
export function getComponentProperties(component: ComponentNode): { [key: string]: string } {
  return Object.fromEntries(
    component.name
      .replaceAll(',', '')
      .split(' ')
      .map(pair => pair.split('=')),
  )
}

/**
 * Groups a collection of components by a specified property.
 *
 * The function iterates over a collection of component objects, each containing
 * a `props` object with various properties. It groups these components by the specified
 * property, returning an object where each key is a value of that property and each value
 * is an array of components that share that property value.
 *
 * @param componentCollection - Array of components with properties.
 * @param propName - The property name to group by.
 * @returns An object with keys as property values and values as arrays of components.
 */
export function groupComponentsByProp<T extends ComponentProps>(componentCollection: ComponentCollection<T>, propName: keyof T): GroupedComponentCollection<T> {
  return componentCollection.reduce<GroupedComponentCollection<T>>((acc, component) => {
    const propValue = component.props[propName]

    if (!propValue)
      return acc

    const componentGroup = acc[propValue] || []

    return {
      ...acc,
      [propValue]: [...componentGroup, component],
    }
  }, {} as GroupedComponentCollection<T>)
}

/**
 * Calculates the difference between two sets of strings.
 * The difference is a new Set containing all the elements that exist in the first set
 * but not in the second set.
 *
 * @param {Set<string>} setA The first set.
 * @param {Set<string>} setB The second set, whose items will be subtracted from the first set.
 * @returns {Set<string>} A new Set representing the difference between setA and setB.
 */
export function difference(setA: Set<string>, setB: Set<string>): Set<string> {
  const _difference = new Set(setA)
  for (const elem of setB)
    _difference.delete(elem)

  return _difference
}

/**
 * Composes a CSS string for a specific variant by combining CSS classes.
 *
 * @param variantName - The name of the variant (e.g., 'hover', 'focus').
 * @param cssClasses - A set of CSS class names to be combined for the variant.
 * @returns {string} - The CSS string for the specified variant. If multiple classes are present,
 *                      they are wrapped in parentheses. Returns an empty string if no classes are provided.
 */
export function composeVariantCss(variantName: string, cssClasses: Set<string>): string {
  if (cssClasses.size === 0)
    return ''

  const allClasses = [...cssClasses.values()]
  const requiresParentheses = cssClasses.size > 1 || allClasses[0].includes(' ')

  return `${variantName}:${requiresParentheses ? '(' : ''}${allClasses.join(' ')}${requiresParentheses ? ')' : ''}`
}
