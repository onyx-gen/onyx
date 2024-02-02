import FigmaNodeParser from '../parsers/figma-node.parser'
import HTMLGenerator from '../generators/html.generator'
import { entries } from '../utils'
import type { TreeNode } from '../interfaces'
import StateTreeMerger from '../merge/state/state-tree-merger'
import VariantTreeMerger from '../merge/variant/variant-tree-merger'
import { variantKey } from '../merge/utils'
import ScriptSetupGenerator from '../generators/script-setup.generator'
import type {
  ComponentCollection,
  ComponentPropsWithState,
  GroupedComponentCollection,
  SinglePropertyObject,
  VariantPermutation,
  VariantTrees,
} from './types'
import { getComponentProperties, groupComponentsByProp } from './utils'

class ComponentSetProcessor {
  private htmlGenerator = new HTMLGenerator()
  private scriptSetupGenerator = new ScriptSetupGenerator()

  public process(node: ComponentSetNode): string {
    // TODO MF: componentCollectionGroupedByState should be a class property
    const [permutations, componentCollectionGroupedByState]
      = this.calculatePermutations(node)

    if (permutations.length === 0)
      throw new Error('[ComponentSetProcessor] Handling of components without permutations not yet implemented.')

    const variantTrees: VariantTrees = permutations.map((permutation) => {
      const stateMergedTree = this.processPermutation(permutation, componentCollectionGroupedByState)

      return {
        permutation,
        tree: stateMergedTree,
      }
    })

    const variantKeys = permutations.map(permutation => variantKey(permutation))

    const componentSetTree = this.mergeVariantTrees(variantTrees)

    const code: string[] = []

    code.push(this.generateScriptSetup(variantKeys))
    code.push(this.generateHTML(componentSetTree))

    return code.join('\n\n')
  }

  private generateScriptSetup(variantKeys: string[]): string {
    return this.scriptSetupGenerator.generate(variantKeys)
  }

  /**
   * Generates HTML from a given tree.
   * @param tree - The tree to generate HTML from.
   * @returns The generated HTML.
   * @private
   */
  private generateHTML(tree: TreeNode | null): string {
    if (!tree)
      return ''

    return this.htmlGenerator.generate(tree)
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
    VariantPermutation[],
    GroupedComponentCollection<ComponentPropsWithState>,
  ] {
    const componentCollection = this.mapComponentsToProperties(node)
    const componentCollectionWithState = this.filterComponentsWithState(componentCollection)
    const componentCollectionGroupedByState = groupComponentsByProp(componentCollectionWithState, 'state')
    const uniquePropertiesGroupedByPropName = this.getUniquePropertiesGroupedByPropName(componentCollectionGroupedByState)
    const permutations: VariantPermutation[] = this.generatePropertyPermutations(uniquePropertiesGroupedByPropName)

    return [permutations, componentCollectionGroupedByState]
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
  private generatePropertyPermutations(groupedProperties: { [key: string]: string[] }): VariantPermutation[] {
    // Initialize an array to store the permutations
    let permutations: VariantPermutation[] = [{}]

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
    permutation: VariantPermutation,
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
    permutation: VariantPermutation,
    groupedCollection: GroupedComponentCollection<ComponentPropsWithState>,
  ): TreeNode | null {
    const variants: { [p: string]: ComponentNode | undefined } = this.findVariantsForPermutation(permutation, groupedCollection)
    const treesForPermutationByState = this.parseVariantsToTrees(variants, permutation)
    return this.mergeTreesBasedOnStates(treesForPermutationByState, permutation)
  }

  /**
   * Merges all the accumulated trees from different permutations and generates HTML.
   * It iterates over all stored trees, merges them, and generates the final HTML.
   */
  private mergeVariantTrees(variantTrees: VariantTrees): TreeNode | null {
    let mergedTree: TreeNode | null = null

    variantTrees.reverse().forEach(({ permutation, tree }) => {
      if (tree) {
        const variantTreeMerger = new VariantTreeMerger(permutation)
        mergedTree = variantTreeMerger.merge(mergedTree || tree, tree)
      }
    })

    if (!mergedTree) {
      console.error('No valid merged variants tree found after merging all permutations')
      return null
    }

    return mergedTree
  }

  /**
   * Parses variants to trees for each state.
   *
   * @param variants - An object with states as keys and corresponding ComponentNodes or undefined.
   * @returns An object with states as keys and the parsed TreeNode or undefined.
   */
  private parseVariantsToTrees(
    variants: { [key: string]: ComponentNode | undefined },
    permutation: VariantPermutation,
  ): { [key: string]: TreeNode | null } {
    return Object.fromEntries(
      entries(variants)
        .filter(([, component]) => component !== undefined)
        .map(([state, component]) => {
          const figmaNodeParser = new FigmaNodeParser(permutation)
          return [state, figmaNodeParser.parse(component!)]
        }),
    )
  }

  /**
   * Merges trees based on their states to create a single tree representing all states.
   *
   * @param trees - An object with states as keys and the corresponding TreeNode or undefined.
   * @param permutation - An object representing a permutation of property values.
   * @returns The merged TreeNode representing all states, or undefined if no default state is found.
   */
  private mergeTreesBasedOnStates(
    trees: { [key: string]: TreeNode | null },
    permutation: VariantPermutation,
  ): TreeNode | null {
    let mergedTree = trees.default
    const previousStates = ['default']

    if (!mergedTree)
      return null

    Object.entries(trees).forEach(([state, tree]) => {
      if (tree && state !== 'default') {
        const treeMerger = new StateTreeMerger(state, permutation, previousStates)
        mergedTree = treeMerger.merge(mergedTree!, tree)
        previousStates.push(state)
      }
    })

    return mergedTree
  }
}

export default ComponentSetProcessor
