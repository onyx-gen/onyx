/**
 * This plugin generates HTML code that reflects the structure and styling
 * of components in Figma. It uses the UnoCSS framework to handle styling.
 * The plugin operates within the Figma environment and can process selected
 * components to output corresponding HTML structure.
 */

// Skip over invisible nodes and their descendants inside instances for faster performance.
import FigmaNodeParser from './parsers/figma-node.parser'
import HTMLGenerator from './generators/html.generator'
import { getSelectedNode } from './utils'

figma.skipInvisibleInstanceChildren = true

interface GroupedComponentCollection {
  [key: string]: {
    component: ComponentNode
    props: { [key: string]: string }
  }[]
}

interface ComponentProps {
  [key: string]: string
}

interface ComponentPropsWithState extends ComponentProps {
  state: string
}

type ComponentCollection<T extends ComponentProps = ComponentProps> = {
  component: ComponentNode
  props: T
}[]

/**
 * Event listener for the 'generate' event in Figma.
 * Processes the selected node and generates HTML code.
 * The generated code is displayed in the dev tools panel
 * inside Figma.
 */
figma.codegen.on('generate', async () => {
  const node = getSelectedNode()

  // Early return if no node is selected
  if (!node)
    return []

  const parser = new FigmaNodeParser()
  const generator = new HTMLGenerator()

  let html = ''

  if (node.type === 'COMPONENT_SET') {
    const components: ComponentNode[] = node.children as ComponentNode[]

    // Map each component to an object containing the component and its parsed properties.
    const componentCollection: ComponentCollection = components.map(component => ({
      component,
      props: getComponentProperties(component),
    }))

    const componentCollectionWithState: ComponentCollection<ComponentPropsWithState> = componentCollection
      .filter(component => !!component.props.state) as ComponentCollection<ComponentPropsWithState>

    // Group components by their 'state' property.
    const componentCollectionGroupedByState = groupComponentsByState(componentCollectionWithState)

    console.log(componentCollectionGroupedByState)
  }

  if (node.type === 'COMPONENT_SET') {
    const children = node.children as ComponentNode[]
    const trees = children
      .map(child => parser.parse(child))
      .filter(tree => tree !== null)

    html += trees.map(tree => generator.generate(tree!)).join('\n\n')
  }
  else {
    const tree = parser.parse(node)

    if (tree)
      html = generator.generate(tree)
    else
      console.error('It was not possible to generate HTML code for the selected node.')
  }

  return [
    {
      language: 'HTML',
      code: html,
      title: 'UnoCSS & Tokens Studio for Figma',
    },
  ]
})

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
function getComponentProperties(component: ComponentNode): { [key: string]: string } {
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
function groupComponentsByState(componentCollection: ComponentCollection<ComponentPropsWithState>): GroupedComponentCollection {
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
