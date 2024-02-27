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
  /**
   * Generate the script code block.
   *
   * Each unique value of each key in the permutations will be a type union in the generated code.
   *
   * @param permutations - The set of permutations to generate TypeScript interface from.
   * @returns - The generated script setup string.
   */
  generate(permutations: VariantPermutation[]) {
    const indent = createIndent(2)

    // Create a collection of all unique permutation values for each permutation key in the permutations
    const permutationCollection: {
      [p: PermutationKey]: Set<PermutationValue>
    } = permutations.reduce((acc, permutation) => {
      Object.entries(permutation).forEach(
        ([permutationKey, permutationValue]) => {
          if (acc[permutationKey])
            acc[permutationKey].add(permutationValue)
          else
            acc[permutationKey] = new Set([permutationValue])
        },
      )

      return acc
    }, {} as { [key: PermutationKey]: Set<PermutationValue> })

    // Create a Union Type for each key in the permutations
    const types: {
      [p: PermutationKey]: PermutationUnionType
    } = Object.fromEntries(
      Object.entries(permutationCollection)
        .map(
          ([key, values]) => {
            const valuesString = Array.from(values).map(value => `'${value}'`).join(' | ')
            return [key, valuesString]
          },
        ),
    )

    // Create the interface properties body
    const interfacePropsBody = Object.entries(types)
      .map(
        ([key, value]) => `${key}: ${value}`,
      )
      .join(`\n${indent}`)

    // Create the computed properties
    const computedProperties: ComputedProperties = Object.fromEntries(
      Object.entries(permutationCollection)
        .map(([key, value]) => {
          const namesMap = Object.fromEntries(
            Array.from(value)
              .map((permutationValue) => {
                const name = `is${key[0].toUpperCase()}${key.slice(1)}${permutationValue[0].toUpperCase()}${permutationValue.slice(1)}`
                return [permutationValue, name]
              }),
          )
          return [key, namesMap]
        }),
    ) as ComputedProperties

    const computedPropertyNames = Object.keys(types)

    const computedPropertiesBodies = Object.entries(computedProperties)
      .flatMap(
        ([permutationKey, permutationValueMapping]: [PermutationKey, { [p: PermutationValue]: PermutationComputedPropertyName }]) => {
          return Object.entries(permutationValueMapping)
            .map(
              ([permutationValue, computedPropertyName]) => {
                return `const ${computedPropertyName} = computed(() => ${permutationKey}.value === '${permutationValue}')`
              },
            )
        },
      )

    const code = `
<script setup lang="ts">
  import { computed, toRefs } from 'vue'

  interface Props {
    ${interfacePropsBody}
  }

  const { ${computedPropertyNames.join(', ')} } = toRefs(defineProps<Props>())
  
  ${computedPropertiesBodies.join(`\n${createIndent(1)}`)}
</script>
    `

    return code.trim()
  }
}

export default ScriptSetupGenerator
