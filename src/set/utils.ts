import type { ComponentCollection, ComponentPropsWithState, GroupedComponentCollection } from './types'

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
 * Groups a collection of components by their state property.
 *
 * The function iterates over a collection of component objects, each containing
 * a `props` object with a `state` property. It groups these components by their
 * state, returning an object where each key is a state value and each value is
 * an array of components that share that state.
 *
 * @param componentCollection - Array of components with properties.
 * @returns An object with keys as state values and values as arrays of components.
 */
export function groupComponentsByState(componentCollection: ComponentCollection<ComponentPropsWithState>): GroupedComponentCollection {
  return componentCollection.reduce<GroupedComponentCollection>((acc, component) => {
    const state = component.props.state

    // Get the existing group for the state, or initialize it as an empty array.
    const componentGroup = acc[state] || []

    // Return the accumulator with the new component added to the appropriate state group.
    return {
      ...acc,
      [state]: [...componentGroup, component],
    }
  }, {}) // Using GroupedComponentCollection as the type for the accumulator
}
