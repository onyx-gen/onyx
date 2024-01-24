import FigmaNodeParser from '../parsers/figma-node.parser'
import HTMLGenerator from '../generators/html.generator'
import type { ComponentCollection, ComponentPropsWithState, SinglePropertyObject } from './types'
import { getComponentProperties, groupComponentsByProp } from './utils'

class ComponentSetProcessor {
  public process(node: ComponentSetNode): string {
    const parser = new FigmaNodeParser()
    const generator = new HTMLGenerator()
    let html = ''

    const components: ComponentNode[] = node.children as ComponentNode[]

    // Map each component to an object containing the component and its parsed properties.
    const componentCollection: ComponentCollection = components.map(component => ({
      component,
      props: getComponentProperties(component),
    }))

    const componentCollectionWithState: ComponentCollection<ComponentPropsWithState> = componentCollection
      .filter(componentData => 'state' in componentData.props) as ComponentCollection<ComponentPropsWithState>

    // Group components by their 'state' property.
    const componentCollectionGroupedByState = groupComponentsByProp(componentCollectionWithState, 'state')

    // Extracting unique properties excluding 'state' from each component.
    const propertyObjects: SinglePropertyObject[] = Object.values(componentCollectionGroupedByState).flatMap(group => group
      .flatMap(({ props }) =>
        Object.entries(props)
          .filter(([propName]) => propName !== 'state')
          .map(([propName, propValue]) => ({ [propName]: propValue } as SinglePropertyObject)),
      ),
    )

    // Eliminating duplicate property objects.
    const uniquePropertySet = new Set(propertyObjects.map(obj => JSON.stringify(obj)))
    const uniqueProperties: SinglePropertyObject[] = Array.from(uniquePropertySet).map(str => JSON.parse(str))

    // Reduce uniqueProperties to an object with keys as property names and values as arrays of those property values.
    const uniquePropertiesGroupedByPropName = uniqueProperties.reduce<{ [key: string]: string[] }>((acc, propObj) => {
      const propName = Object.keys(propObj)[0] as keyof SinglePropertyObject
      const propValue = propObj[propName]

      if (propValue !== undefined) {
        const propValueArray = acc[propName] || []
        return {
          ...acc,
          [propName]: [...propValueArray, propValue],
        }
      }
      return acc
    }, {})

    console.log(uniquePropertiesGroupedByPropName)

    // get unique objects and remove duplicates in test object

    console.log(componentCollectionGroupedByState)

    const children = node.children as ComponentNode[]
    const trees = children
      .map(child => parser.parse(child))
      .filter(tree => tree !== null)

    html += trees.map(tree => generator.generate(tree!)).join('\n\n')

    return html
  }
}

export default ComponentSetProcessor
