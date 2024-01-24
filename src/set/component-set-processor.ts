import FigmaNodeParser from '../parsers/figma-node.parser'
import HTMLGenerator from '../generators/html.generator'
import type { ComponentCollection, ComponentPropsWithState, SinglePropertyObject } from './types'
import { getComponentProperties, groupComponentsByProp } from './utils'

class ComponentSetProcessor {
  private figmaNodeParser = new FigmaNodeParser()
  private htmlGenerator = new HTMLGenerator()

  /**
   * Processes a ComponentSetNode and generates HTML code.
   * This method orchestrates the parsing of Figma nodes, handling of component properties,
   * and HTML generation.
   *
   * @param node - The ComponentSetNode to process.
   * @returns The generated HTML string.
   */
  public process(node: ComponentSetNode): string {
    let html = ''

    const componentCollection = this.mapComponentsToProperties(node)
    const componentCollectionWithState = this.filterComponentsWithState(componentCollection)
    const componentCollectionGroupedByState = groupComponentsByProp(componentCollectionWithState, 'state')
    const uniquePropertiesGroupedByPropName = this.getUniquePropertiesGroupedByPropName(componentCollectionGroupedByState)
    const permutations = this.generatePropertyPermutations(uniquePropertiesGroupedByPropName)

    console.log('uniquePropertiesGroupedByPropName', uniquePropertiesGroupedByPropName)
    console.log('permutations', permutations)

    const trees = this.parseNodeChildren(node)
    html += this.generateHTMLFromTrees(trees)

    return html
  }

  /**
   * Maps each component of a node to an object containing the component and its parsed properties.
   *
   * @param node - The node containing components.
   * @returns A collection of components with their properties.
   */
  private mapComponentsToProperties(node: ComponentSetNode): ComponentCollection {
    return node.children.map(component => ({
      component: component as ComponentNode,
      props: getComponentProperties(component as ComponentNode),
    }))
  }

  /**
   * Filters a collection of components, keeping only those with a 'state' property.
   *
   * @param collection - The collection of components to filter.
   * @returns A collection of components that contain a 'state' property.
   */
  private filterComponentsWithState(collection: ComponentCollection): ComponentCollection<ComponentPropsWithState> {
    return collection.filter(componentData => 'state' in componentData.props) as ComponentCollection<ComponentPropsWithState>
  }

  /**
   * Extracts unique properties from a collection of components grouped by state,
   * and groups these properties by their names.
   *
   * @param groupedCollection - A collection of components grouped by their 'state' property.
   * @returns An object with property names as keys and arrays of unique property values.
   */
  private getUniquePropertiesGroupedByPropName(groupedCollection: { [key: string]: ComponentCollection<ComponentPropsWithState> }): { [key: string]: string[] } {
    const propertyObjects = Object.values(groupedCollection).flatMap(group => group
      .flatMap(({ props }) =>
        Object.entries(props)
          .filter(([propName]) => propName !== 'state')
          .map(([propName, propValue]) => ({ [propName]: propValue } as SinglePropertyObject)),
      ),
    )

    const uniquePropertySet = new Set(propertyObjects.map(obj => JSON.stringify(obj)))
    const uniqueProperties: SinglePropertyObject[] = Array.from(uniquePropertySet).map(str => JSON.parse(str))

    return uniqueProperties.reduce<{ [key: string]: string[] }>((acc, propObj) => {
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
  }

  /**
   * Parses the children of a node using the FigmaNodeParser.
   *
   * @param node - The node whose children are to be parsed.
   * @returns An array of parsed trees from the node's children.
   */
  private parseNodeChildren(node: ComponentSetNode): any[] { // Replace 'any[]' with the appropriate type for your tree structure
    return node.children
      .map(child => this.figmaNodeParser.parse(child as ComponentNode))
      .filter(tree => tree !== null)
  }

  /**
   * Generates HTML code from an array of parsed trees.
   *
   * @param trees - An array of parsed trees.
   * @returns A string of concatenated HTML code.
   */
  private generateHTMLFromTrees(trees: any[]): string { // Replace 'any[]' with the appropriate type for your tree structure
    return trees.map(tree => this.htmlGenerator.generate(tree!)).join('\n\n')
  }

  /**
   * Generates all possible permutations of properties from a given object where each key has an array of possible values.
   *
   * This method iterates over each property in the provided object, progressively building up permutations. For each key,
   * it maps through its associated array of values, combining each value with the current permutations to form new permutations.
   * This approach ensures every combination of property values is included.
   *
   * @param groupedProperties - An object with property names as keys and arrays of possible values as values.
   * @returns An array of objects, each representing a unique permutation of property values.
   */
  private generatePropertyPermutations(groupedProperties: { [key: string]: string[] }): { [key: string]: string }[] {
    // Initialize an array to store the permutations
    let permutations: { [key: string]: string }[] = [{}]

    // Iterate through each property key
    Object.keys(groupedProperties).forEach((key) => {
      // For each property, expand the permutations array by the number of values for this key
      permutations = permutations.flatMap(permutation =>
        groupedProperties[key].map(value => ({
          ...permutation,
          [key]: value,
        })),
      )
    })

    return permutations
  }
}

export default ComponentSetProcessor
