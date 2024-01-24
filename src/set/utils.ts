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
