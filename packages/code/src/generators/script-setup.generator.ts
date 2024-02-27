import { createIndent } from '../utils'
import type { VariantPermutation } from '../set/types'

/**
 * Type representing a permutation key.
 *
 * Permutation key is for example a variant name, like `size` or `color`.
 */
type PermutationKey = string

/**
 * Type representing a permutation value.
 *
 * Permutation value is for example a variant value, like `small` or `red`.
 */
type PermutationValue = string

/**
 * Type representing a computed property name.
 *
 * Computed property name is a string representing a computed property name for a permutation key/value pair.
 *
 * An example of a computed property name is `isSizeSmall` or `isColorRed`.
 */
type PermutationComputedPropertyName = string

/**
 * Type representing a collection of computed property names.
 *
 * Collection is structured for easy access to computed property names for a permutation key/value pair.
 * Collection is also structured for easy iteration.
 */
interface ComputedProperties {
  [p: PermutationKey]: {
    [p: PermutationValue]: PermutationComputedPropertyName
  }
}

/**
 * Type representing a permutation union type.
 *
 * Permutation union type is a string representing a TypeScript union type for a permutation key.
 * An example of a permutation union type is `'small' | 'medium' | 'large'`.
 */
type PermutationUnionType = string

/**
 * This class generates the `script setup` code block for the generated Vue component output.
 */
class ScriptSetupGenerator {
  constructor(private readonly permutations: VariantPermutation[]) {}

  /**
   * Generate the script code block.
   *
   * Each unique value of each key in the permutations will be a type union in the generated code.
   *
   * @returns - The generated script setup string.
   */
  generate(): string {
    const indent = createIndent(2)
    const permutationCollection = this.collectUniquePermutationValues(this.permutations)
    const types = this.generateUnionTypes(permutationCollection)
    const interfacePropsBody = this.generateInterfaceProperties(types, indent)
    const computedProperties = this.generateComputedProperties(permutationCollection)
    const computedPropertiesBodies = this.generateComputedPropertiesBodies(computedProperties)
    return this.composeFinalScript(interfacePropsBody, computedPropertiesBodies, indent)
  }

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

  private generateUnionTypes(permutationCollection: { [key: PermutationKey]: Set<PermutationValue> }): { [key: PermutationKey]: PermutationUnionType } {
    return Object.fromEntries(
      Object.entries(permutationCollection).map(([key, values]) => {
        const valuesString = Array.from(values).map(value => `'${value}'`).join(' | ')
        return [key, valuesString]
      }),
    )
  }

  private generateInterfaceProperties(types: { [key: PermutationKey]: PermutationUnionType }, indent: string): string {
    return Object.entries(types)
      .map(([key, value]) => `${key}: ${value}`)
      .join(`\n${indent}`)
  }

  private generateComputedProperties(permutationCollection: { [key: PermutationKey]: Set<PermutationValue> }): ComputedProperties {
    return Object.fromEntries(
      Object.entries(permutationCollection).map(([key, values]) => {
        const namesMap = Object.fromEntries(
          Array.from(values).map((value) => {
            const name = `is${key[0].toUpperCase()}${key.slice(1)}${value[0].toUpperCase()}${value.slice(1)}`
            return [value, name]
          }),
        )
        return [key, namesMap]
      }),
    )
  }

  private generateComputedPropertiesBodies(computedProperties: ComputedProperties): string[] {
    return Object.entries(computedProperties).flatMap(([key, values]) =>
      Object.entries(values).map(([value, name]) => `const ${name} = computed(() => ${key}.value === '${value}')`),
    )
  }

  private composeFinalScript(interfacePropsBody: string, computedPropertiesBodies: string[], indent: string): string {
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
