import { createIndent } from '../utils'
import type { VariantPermutation } from '../set/types'
import { toPascalCase } from './utils'
import type { ComputedProperties, PermutationKey, PermutationUnionType, PermutationValue } from './types'

/**
 * This class generates the `script setup` code block for the generated Vue component output.
 */
class ScriptSetupGenerator {
  private readonly computedProperties: ComputedProperties
  private readonly types: { [key: PermutationKey]: PermutationUnionType }

  /**
   * Constructs a ScriptSetupGenerator instance with specified variant permutations.
   *
   * @param permutations - An array of variant permutations, where each permutation is represented by a key-value pair indicating the variant's name and value, respectively.
   */
  constructor(permutations: VariantPermutation[]) {
    const permutationCollection: {
      [key: PermutationKey]: Set<PermutationValue>
    } = this.collectUniquePermutationValues(permutations)

    this.types = this.generateUnionTypes(permutationCollection)

    this.computedProperties = this.generateComputedProperties(permutationCollection)
  }

  /**
   * Generates the script setup block for a Vue component, including TypeScript type unions for props and computed properties for each variant.
   *
   * @returns A string representing the complete script setup code block with type definitions and computed properties.
   */
  generate(): string {
    const indent = createIndent(2)
    const interfacePropsBody = this.generateInterfaceProperties(this.types, indent)
    const computedPropertiesBodies = this.generateComputedPropertiesBodies(this.computedProperties)

    return this.composeFinalScript(interfacePropsBody, computedPropertiesBodies)
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
   * Generates the properties of the Vue component's `Props` interface based on the generated union types, ensuring strong typing of component props.
   *
   * @param types - An object mapping each permutation key to its corresponding TypeScript union type.
   * @param indent - A string representing the indentation to be used in the generated code.
   * @returns A string representing the body of the `Props` interface for the component.
   * @private
   */
  private generateInterfaceProperties(types: { [key: PermutationKey]: PermutationUnionType }, indent: string): string {
    return Object.entries(types)
      .map(([key, value]) => `${key}: ${value}`)
      .join(`\n${indent}`)
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

  /**
   * Generates the code bodies for computed properties based on the mapping of computed property names, enabling reactive behavior based on prop values.
   *
   * @param computedProperties - An object representing the computed property names organized by permutation key and value.
   * @returns An array of strings, each representing the code for a computed property.
   * @private
   */
  private generateComputedPropertiesBodies(computedProperties: ComputedProperties): string[] {
    return Object.entries(computedProperties).flatMap(([key, values]) =>
      Object.entries(values).map(([value, name]) => `const ${name} = computed(() => ${key}.value === '${value}')`),
    )
  }

  /**
   * Composes the final script setup block by assembling the generated interface properties and computed properties bodies into a cohesive script.
   *
   * @param interfacePropsBody - A string representing the generated interface properties.
   * @param computedPropertiesBodies - An array of strings, each representing a computed property's code.
   * @returns A string representing the complete script setup block for the component.
   * @private
   */
  private composeFinalScript(interfacePropsBody: string, computedPropertiesBodies: string[]): string {
    return `
<script setup lang="ts">
  import { computed, toRefs } from 'vue'

  interface Props {
    ${interfacePropsBody}
  }

  ${computedPropertiesBodies.join(`\n${createIndent(1)}`)}
</script>
    `.trim()
  }
}

export default ScriptSetupGenerator
