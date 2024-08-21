import FigmaNodeParser from '../parsers/figma-node.parser'
import { entries, printObject } from '../utils'
import type { TreeNode } from '../interfaces'
import StateTreeMerger from '../merge/state/state-tree-merger'
import VariantTreeMerger from '../merge/variant/variant-tree-merger'
import CssTraverser from '../traverser/css.traverser'
import VueGenerator from '../generators/vue.generator'
import { variantKey } from '../merge/utils'
import type { Configuration } from '../config/config'
import { Log } from '../decoratos/log'
import { appendToVariantCSS } from '../css'
import { getComponentProperties, groupComponentsByProp } from './utils'
import type {
  ComponentCollection,
  ComponentPropsWithState,
  GroupedComponentCollection,
  SinglePropertyObject,
  VariantPermutation,
  VariantTree,
  VariantTrees,
} from './types'

/**
 * A class that processes a component set or multiple selected components.
 * The class is responsible for orchestrating the entire process of
 * generating code from the given set of components.
 */
@Log
class ComponentSetProcessor {
  /**
   * Constructs an instance of ComponentSetProcessor.
   */
  constructor(private readonly config: Configuration) {}

  /**
   * Processes the given data, which can be either a ComponentSetNode or an array of SceneNodes.
   * Calculates permutations and groups components by state, then performs further processing on the permutations.
   *
   * @param {ComponentSetNode | SceneNode[]} data - The data to be processed.
   * @return {Promise<string>} - A promise that resolves to a string.
   */
  public async process(data: ComponentSetNode | SceneNode[]): Promise<string> {
    const nodes = Array.isArray(data) ? data : [...data.children]

    const [permutations, componentCollectionGroupedByState]
      = this.calculatePermutations(nodes)

    return await this.processPermutations(permutations, componentCollectionGroupedByState)
  }

  /**
   * Processes permutations of component collections grouped by state to generate a variant tree.
   *
   * @param {VariantPermutation[]} permutations - An array of component permutations.
   * @param {GroupedComponentCollection<ComponentPropsWithState>} componentCollectionGroupedByState - Component collections grouped by state.
   *
   * @throws {Error} If the array of permutations is empty.
   * @throws {Error} If no variant trees were generated.
   *
   * @returns {Promise<string>} A promise that resolves to the generated Vue code.
   */
  private async processPermutations(
    permutations: VariantPermutation[],
    componentCollectionGroupedByState: GroupedComponentCollection<ComponentPropsWithState>,
  ): Promise<string> {
    if (permutations.length === 0)
      throw new Error('Handling of components without permutations is not possible.')

    console.log('permutations', printObject(permutations))

    const variantTreesPromises: Promise<VariantTree>[] = permutations.map(async (permutation) => {
      const stateMergedTree = await this.processPermutation(permutation, componentCollectionGroupedByState)

      const variantTree: VariantTree = {
        permutation,
        tree: stateMergedTree,
      }

      return variantTree
    })

    const variantTrees: VariantTrees = await Promise.all(variantTreesPromises)

    if (variantTrees.length === 0 || variantTrees.filter(tree => tree.tree !== null).length === 0) {
      console.error('[ComponentSetProcessor] There are no variantTrees to process.')
      throw new Error('No variant trees were generated.')
    }

    const componentSetTree = this.mergeVariantTrees(variantTrees)

    // Remove duplicate permutations
    const filteredPermutations = Object.values(
      Object.fromEntries(
        permutations.map(permutation => ([variantKey(permutation), permutation])),
      ),
    )

    const vueGenerator = new VueGenerator(filteredPermutations, componentSetTree, this.config)
    return await vueGenerator.generate()
  }

  /**
   * Calculates and returns all possible permutations of component properties along with the components grouped by state.
   * This method first maps components to their properties, filters out components with a 'state' property,
   * groups these components by their 'state', and then calculates all unique property permutations.
   * It's useful for generating different combinations of property values to create various component states.
   *
   * @param nodes - The ComponentSetNode from which to derive permutations.
   * @returns A tuple where the first element is an array of permutations (each permutation is an object of property-value pairs),
   *          and the second element is the collection of components grouped by their state property.
   */
  private calculatePermutations(nodes: SceneNode[]): [
    VariantPermutation[],
    GroupedComponentCollection<ComponentPropsWithState>,
  ] {
    const componentCollection = this.mapComponentsToProperties(nodes)
    let componentCollectionWithState = this.filterComponentsWithState(componentCollection)

    if (componentCollectionWithState.length === 0) {
      componentCollection.forEach((componentData) => {
        componentData.props.state = 'default'
      })
      componentCollectionWithState = this.filterComponentsWithState(componentCollection)
    }

    console.log('componentCollectionWithState', componentCollectionWithState)

    const componentCollectionGroupedByState = groupComponentsByProp(componentCollectionWithState, 'state')

    const componentCollectionGroupedByStateWithDefaultVariantIfNecessary: typeof componentCollectionGroupedByState = Object.fromEntries(
      Object.entries(componentCollectionGroupedByState).map(
        ([state, components]) => {
          return [state, components.map((component) => {
            const hasVariant = 'variant' in component.props

            if (!hasVariant) {
              return { ...component, props: { ...component.props, variant: 'default' },
              }
            }

            return component
          })]
        },
      ),
    )

    console.log('componentCollectionGroupedByStateWithDefaultVariantIfNecessary', componentCollectionGroupedByStateWithDefaultVariantIfNecessary)

    const uniquePropertiesGroupedByPropName = this.getUniquePropertiesGroupedByPropName(componentCollectionGroupedByStateWithDefaultVariantIfNecessary)
    const permutations: VariantPermutation[] = this.generatePropertyPermutations(uniquePropertiesGroupedByPropName)

    return [permutations, componentCollectionGroupedByStateWithDefaultVariantIfNecessary]
  }

  /**
   * Maps each component of a node to an object containing the component and its parsed properties.
   *
   * @param nodes - The nodes.
   * @returns A collection of components with their properties.
   */
  private mapComponentsToProperties(nodes: SceneNode[]): ComponentCollection {
    return nodes.map(component => ({
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
  ): { [key: string]: ComponentNode | undefined } { // mapping of state to component for permutation
    try {
      const allEntries = entries(groupedCollection)
        .map(([state, collection]) => {
          const componentWrapper = collection.find(
            (component) => {
              return Object.entries(permutation)
                .every(
                  ([permutationKey, permutationValue]) => {
                    return permutationKey in component.props && component.props[permutationKey] === permutationValue
                  },
                )
            },
          )

          const component = componentWrapper?.component

          return [state as string, component]
        })

      return Object.fromEntries(allEntries)
    }
    catch (e) {
      console.error('Error finding variants for permutation', e, { permutation, groupedCollection })
      return {}
    }
  }

  /**
   * Processes a single permutation of component properties and generates HTML for that permutation.
   * It finds variants for the permutation, parses the component nodes, merges the trees based on states,
   * and generates the HTML.
   *
   * @param permutation - An object representing a permutation of property values.
   * @param groupedCollection - A collection of components grouped by a state property.
   */
  private async processPermutation(
    permutation: VariantPermutation,
    groupedCollection: GroupedComponentCollection<ComponentPropsWithState>,
  ): Promise<TreeNode | null> {
    const variants: { [p: string]: ComponentNode | undefined } = this.findVariantsForPermutation(permutation, groupedCollection)
    console.log('variants', printObject(variants), permutation)
    const treesForPermutationByState = await this.parseVariantsToTrees(variants, permutation)
    return this.mergeTreesBasedOnStates(treesForPermutationByState, permutation)
  }

  /**
   * Merges all the accumulated trees from different permutations and generates HTML.
   * It iterates over all stored trees, merges them, and generates the final HTML.
   */
  private mergeVariantTrees(variantTrees: VariantTrees): TreeNode | null {
    let mergedTree: TreeNode | null = null

    console.log('variantTrees', printObject(variantTrees))

    variantTrees.forEach(({ permutation, tree }) => {
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
   * @param permutation - An object representing a permutation of property values.
   * @returns An object with states as keys and the parsed TreeNode or undefined.
   */
  private async parseVariantsToTrees(
    variants: { [key: string]: ComponentNode | undefined },
    permutation: VariantPermutation,
  ): Promise<{ [key: string]: TreeNode | null }> {
    const allEntries = entries(variants)

    // Map over the entries and process each component asynchronously
    const processedEntriesPromises = allEntries
      .filter(([, component]) => component !== undefined)
      .map(async ([state, component]) => {
        const figmaNodeParser = new FigmaNodeParser(permutation, this.config)
        const parsedComponent = await figmaNodeParser.parse(component!)
        return [state, parsedComponent]
      })

    // Wait for all asynchronous operations to complete
    const processedEntries = await Promise.all(processedEntriesPromises)

    // Construct and return the object from the processed entries
    return Object.fromEntries(processedEntries)
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
    const allStates = Object.keys(trees)

    if (allStates.length === 0) {
      console.error('[ComponentSetProcessor] No states found')
      return null
    }

    let defaultState = allStates[0]
    if (allStates.includes('default'))
      defaultState = 'default'

    console.log('[Component Set Processor] All found states', { allStates, defaultState })

    if (defaultState !== 'default') {
      const cssTraverser = new CssTraverser(defaultState)
      trees[defaultState] = cssTraverser.traverse(trees[defaultState]!)
    }

    let mergedTree = trees[defaultState]
    const previousStates = [defaultState]

    if (!mergedTree)
      return null

    Object.entries(trees).forEach(([state, tree]) => {
      if (tree && state !== defaultState) {
        const treeMerger = new StateTreeMerger(state, permutation, previousStates)
        mergedTree = treeMerger.merge(mergedTree!, tree)
        previousStates.push(state)
      }
    })

    // root tree node should have the 'group' CSS class
    if (mergedTree && mergedTree.data.type === 'container' && mergedTree.data.css) {
      Object.keys(mergedTree.data.css).forEach((variant) => {
        if (mergedTree && mergedTree.data.type === 'container' && mergedTree.data.css)
          mergedTree.data.css[variant] = appendToVariantCSS(mergedTree.data.css[variant], 'group')
      })
    }

    return mergedTree
  }
}

export default ComponentSetProcessor
