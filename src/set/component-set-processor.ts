import FigmaNodeParser from '../parsers/figma-node.parser'
import HTMLGenerator from '../generators/html.generator'
import { entries } from '../utils'
import type { TreeNode } from '../interfaces'
import TreeMerger from '../merge/tree-merger'
import type {
  ComponentCollection,
  ComponentPropsWithState,
  GroupedComponentCollection,
  Permutation,
  SinglePropertyObject,
} from './types'
import { getComponentProperties, groupComponentsByProp } from './utils'

class ComponentSetProcessor {
  private figmaNodeParser = new FigmaNodeParser()
  private htmlGenerator = new HTMLGenerator()

  private htmls: string[] = []

  /**
   * Processes a ComponentSetNode and generates HTML code.
   * This method orchestrates the parsing of Figma nodes, handling of component properties,
   * and HTML generation.
   *
   * @param node - The ComponentSetNode to process.
   * @returns The generated HTML string.
   */
  public process(node: ComponentSetNode): this {
    const [permutations, componentCollectionGroupedByState]
      = this.calculatePermutations(node)

    this.processWithPermutationsOrAsIs(permutations, componentCollectionGroupedByState)

    return this
  }

  /**
   * Calculates and returns all possible permutations of component properties along with the components grouped by state.
   * This method first maps components to their properties, filters out components with a 'state' property,
   * groups these components by their 'state', and then calculates all unique property permutations.
   * It's useful for generating different combinations of property values to create various component states.
   *
   * @param node - The ComponentSetNode from which to derive permutations.
   * @returns A tuple where the first element is an array of permutations (each permutation is an object of property-value pairs),
   *          and the second element is the collection of components grouped by their state property.
   */
  private calculatePermutations(node: ComponentSetNode): [
    Permutation[],
    GroupedComponentCollection<ComponentPropsWithState>,
  ] {
    const componentCollection = this.mapComponentsToProperties(node)
    const componentCollectionWithState = this.filterComponentsWithState(componentCollection)
    const componentCollectionGroupedByState = groupComponentsByProp(componentCollectionWithState, 'state')
    const uniquePropertiesGroupedByPropName = this.getUniquePropertiesGroupedByPropName(componentCollectionGroupedByState)
    const permutations: Permutation[] = this.generatePropertyPermutations(uniquePropertiesGroupedByPropName)

    return [permutations, componentCollectionGroupedByState]
  }

  /**
   * Processes the components with permutations if available, or continues with the processing as is.
   * This method determines whether permutations exist and accordingly processes each permutation or
   * defaults to processing the components without permutations.
   *
   * @param permutations - An array of permutations of property values.
   * @param groupedCollection - A collection of components grouped by a state property.
   */
  private processWithPermutationsOrAsIs(
    permutations: Permutation[],
    groupedCollection: GroupedComponentCollection<ComponentPropsWithState>,
  ): void {
    if (permutations.length === 0) {
      this.processAsIs(groupedCollection)
    }
    else {
      permutations.forEach((permutation) => {
        this.processPermutation(permutation, groupedCollection)
      })
    }
  }

  /**
   * Processes the components using the existing variant structure without any permutations.
   * This method is used when there are no permutations available, thereby using the components
   * as they are originally structured.
   *
   * @param groupedCollection - A collection of components grouped by a state property.
   */
  private processAsIs(
    groupedCollection: GroupedComponentCollection<ComponentPropsWithState>,
  ): void {
    const variants = Object.fromEntries(
      entries(groupedCollection).map(([state, collection]) => ([state, collection[0].component])),
    )
    this.processVariants(variants)
  }

  /**
   * Retrieves the generated HTML as a single string.
   * This method combines the HTML strings for all processed permutations into one string.
   * Each permutation's HTML is separated by two newline characters for clear separation.
   *
   * @returns A single string containing the combined HTML of all processed permutations.
   */
  public getHTML(): string {
    return this.htmls.join('\n\n')
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
  private getUniquePropertiesGroupedByPropName(
    groupedCollection: { [key: string]: ComponentCollection<ComponentPropsWithState> },
  ): { [key: string]: string[] } {
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
   * Generates all possible permutations of properties from a given object where each key has an array of possible values.
   *
   * This method iterates over each property in the provided object, progressively building up permutations. For each key,
   * it maps through its associated array of values, combining each value with the current permutations to form new permutations.
   * This approach ensures every combination of property values is included.
   *
   * @param groupedProperties - An object with property names as keys and arrays of possible values as values.
   * @returns An array of objects, each representing a unique permutation of property values.
   */
  private generatePropertyPermutations(groupedProperties: { [key: string]: string[] }): Permutation[] {
    // Initialize an array to store the permutations
    let permutations: Permutation[] = [{}]

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

    // Remove empty permutations
    if (Object.keys(permutations[0]).length === 0)
      permutations.shift()

    return permutations
  }

  /**
   * Finds variants for a given permutation by matching components in the grouped collection.
   * For each permutation, this method iterates through the component collection grouped by state,
   * and finds a component whose properties match the key-value pairs in the permutation.
   *
   * @param permutation - An object representing a permutation of property values.
   * @param groupedCollection - A collection of components grouped by a state property.
   * @returns An object representing the variants found for the given permutation,
   *          where each key is a state and each value is the corresponding ComponentNode or undefined.
   */
  private findVariantsForPermutation(
    permutation: Permutation,
    groupedCollection: GroupedComponentCollection<ComponentPropsWithState>,
  ): { [key: string]: ComponentNode | undefined } {
    const permutationKey = Object.keys(permutation)[0]
    const permutationValue = permutation[permutationKey]

    return Object.fromEntries(
      Object.entries(groupedCollection).map(([state, collection]) => ([
        state,
        collection.find(component => permutationKey in component.props && component.props[permutationKey] === permutationValue)?.component,
      ])),
    )
  }

  /**
   * Processes a single permutation of component properties and generates HTML for that permutation.
   * It finds variants for the permutation, parses the component nodes, merges the trees based on states,
   * and generates the HTML.
   *
   * @param permutation - An object representing a permutation of property values.
   * @param groupedCollection - A collection of components grouped by a state property.
   */
  private processPermutation(
    permutation: Permutation,
    groupedCollection: GroupedComponentCollection<ComponentPropsWithState>,
  ): void {
    const variants: { [p: string]: ComponentNode | undefined } = this.findVariantsForPermutation(permutation, groupedCollection)
    this.processVariants(variants, permutation)
  }

  /**
   * Processes the variants of a component set based on the given permutations.
   * It generates a tree representation for each variant, merges these trees based on their states,
   * and generates HTML for the merged tree. The HTML is then stored for later retrieval.
   *
   * @param variants - An object representing the variants found for a given permutation,
   *                   where each key is a state and each value is the corresponding ComponentNode or undefined.
   * @param permutation - An optional object representing a permutation of property values.
   *                      Used for generating variant-specific comments in the HTML output.
   */
  private processVariants(
    variants: { [key: string]: ComponentNode | undefined },
    permutation?: Permutation,
  ): void {
    const treesForPermutationByState = this.parseVariantsToTrees(variants)
    const mergedTree = this.mergeTreesBasedOnStates(treesForPermutationByState)

    if (!mergedTree) {
      console.error('No valid merged tree found for component set')
      return
    }

    let variantHTML = ''

    if (permutation)
      variantHTML += `<!-- Variant: ${JSON.stringify(permutation)} -->\n`

    variantHTML += this.htmlGenerator.generate(mergedTree)
    this.htmls.push(variantHTML)
  }

  /**
   * Parses variants to trees for each state.
   *
   * @param variants - An object with states as keys and corresponding ComponentNodes or undefined.
   * @returns An object with states as keys and the parsed TreeNode or undefined.
   */
  private parseVariantsToTrees(
    variants: { [key: string]: ComponentNode | undefined },
  ): { [key: string]: TreeNode | null } {
    return Object.fromEntries(
      entries(variants)
        .filter(([, component]) => component !== undefined)
        .map(([state, component]) => [state, this.figmaNodeParser.parse(component!)]),
    )
  }

  /**
   * Merges trees based on their states to create a single tree representing all states.
   *
   * @param trees - An object with states as keys and the corresponding TreeNode or undefined.
   * @returns The merged TreeNode representing all states, or undefined if no default state is found.
   */
  private mergeTreesBasedOnStates(
    trees: { [key: string]: TreeNode | null },
  ): TreeNode | null {
    let mergedTree = trees.default
    const previousStates = ['default']

    if (!mergedTree)
      return null

    Object.entries(trees).forEach(([state, tree]) => {
      if (tree && state !== 'default') {
        const treeMerger = new TreeMerger(state, previousStates)
        mergedTree = treeMerger.merge(mergedTree!, tree)
        previousStates.push(state)
      }
    })

    return mergedTree
  }
}

export default ComponentSetProcessor
