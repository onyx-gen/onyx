import { createIndent } from '../utils'
import type { VariantPermutation } from '../set/types'

type PermutationKey = string
type PermutationValue = string
type PermutationComputedPropertyName = string
interface ComputedProperties {
  [p: PermutationKey]: {
    [p: PermutationValue]: PermutationComputedPropertyName
  }
}

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

    const permutationCollection = permutations.reduce((acc, permutation) => {
      Object.entries(permutation).forEach(([key, value]) => {
        if (acc[key])
          acc[key].add(value)
        else
          acc[key] = new Set([value])
      })
      return acc
    }, {} as { [key: string]: Set<string> })

    const types = Object.fromEntries(
      Object.entries(permutationCollection)
        .map(
          ([key, values]) => {
            const valuesString = Array.from(values).map(value => `'${value}'`).join(' | ')
            return [key, valuesString]
          },
        ),
    )

    const interfacePropsBody = Object.entries(types)
      .map(
        ([key, value]) => `${key}: ${value}`,
      )
      .join(`\n${indent}`)

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
