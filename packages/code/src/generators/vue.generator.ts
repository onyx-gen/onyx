import type { VariantPermutation } from '../set/types'
import type { TreeNode } from '../interfaces'
import HTMLGenerator from './html.generator'
import ScriptSetupGenerator from './script-setup.generator'
import type { ComputedProperties, PermutationKey, PermutationUnionType, PermutationValue } from './types'
import { toPascalCase } from './utils'

/**
 * A class that generates Vue code for a given tree node.
 */
class VueGenerator {
  private readonly scriptSetupGenerator: ScriptSetupGenerator
  private readonly htmlGenerator: HTMLGenerator

  constructor(
    permutations: VariantPermutation[],
    private readonly treeNode: TreeNode | null,
  ) {
    const permutationCollection: {
      [key: PermutationKey]: Set<PermutationValue>
    } = this.collectUniquePermutationValues(permutations)

    const computedProperties: ComputedProperties = this.generateComputedProperties(permutationCollection)
    const types: { [key: PermutationKey]: PermutationUnionType } = this.generateUnionTypes(permutationCollection)

    this.scriptSetupGenerator = new ScriptSetupGenerator(permutations, computedProperties, types)
    this.htmlGenerator = new HTMLGenerator(permutations, computedProperties)
  }

  /**
   * Generates a string representation of the code.
   *
   * @returns {string} The generated code.
   */
  public generate(): string {
    const code: string[] = []

    code.push(this.scriptSetupGenerator.generate())

    if (this.treeNode)
      code.push(this.htmlGenerator.generate(this.treeNode))

    return code.join('\n\n')
  }

  /**
   * Collects unique permutation values for each key from the provided permutations, facilitating the generation of type unions and computed properties.
   *
   * @param permutations - An array of variant permutations to process.
   * @returns An object mapping each permutation key to a Set of unique values.
   * @private
   */
  private collectUniquePermutationValues(permutations: VariantPermutation[]): { [key: PermutationKey]: Set<PermutationValue> } {
    return permutations.reduce((acc, permutation) => {
      Object.entries(permutation).forEach(([key, value]) => {
        if (!acc[key])
          acc[key] = new Set()

        acc[key].add(value)
      })
      return acc
    }, {} as { [key: PermutationKey]: Set<PermutationValue> })
  }

  /**
   * Generates TypeScript union types for each permutation key based on collected unique values, aiding in the typing of component props.
   *
   * @param permutationCollection - An object mapping each permutation key to a Set of unique values.
   * @returns An object mapping each permutation key to its corresponding TypeScript union type as a string.
   * @private
   */
  private generateUnionTypes(permutationCollection: { [key: PermutationKey]: Set<PermutationValue> }): { [key: PermutationKey]: PermutationUnionType } {
    return Object.fromEntries(
      Object.entries(permutationCollection).map(([key, values]) => {
        const valuesString = Array.from(values).map(value => `'${value}'`).join(' | ')
        return [key, valuesString]
      }),
    )
  }

  /**
   * Generates a mapping of computed property names for each variant permutation, facilitating the definition of reactive computed properties in the component.
   *
   * @param permutationCollection - An object mapping each permutation key to a Set of unique values.
   * @returns An object representing the computed property names organized by permutation key and value.
   * @private
   */
  private generateComputedProperties(permutationCollection: { [key: PermutationKey]: Set<PermutationValue> }): ComputedProperties {
    return Object.fromEntries(
      Object.entries(permutationCollection).map(([key, values]) => {
        const namesMap = Object.fromEntries(
          Array.from(values).map((value) => {
            const name = `is${toPascalCase(key)}${toPascalCase(value)}`
            return [value, name]
          }),
        )
        return [key, namesMap]
      }),
    )
  }
}

export default VueGenerator
