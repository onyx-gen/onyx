import { createIndent } from '../utils'
import type { VariantPermutation } from '../set/types'

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
        .map(([key, values]) => {
          const valuesString = Array.from(values).map(value => `'${value}'`).join(' | ')
          return [key, valuesString]
        }),
    )

    const interfacePropsBody = Object.entries(types).map(([key, value]) => `${key}: ${value}`).join(`\n${indent}`)

    const code = `
<script setup lang="ts">
  interface Props {
    ${interfacePropsBody}
  }

  defineProps<Props>()
</script>
    `

    return code.trim()
  }
}

export default ScriptSetupGenerator
