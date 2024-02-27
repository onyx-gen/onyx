import { createIndent } from '../utils'
import type { VariantPermutation } from '../set/types'
import { variantKey } from '../merge/utils'

class ScriptSetupGenerator {
  generate(permutations: VariantPermutation[]) {
    const indent = createIndent(2)

    const variantKeys = permutations.map(permutation => variantKey(permutation))
    const props = variantKeys.map(key => `'${key}': boolean`).join(`\n${indent}`)

    const code = `
<script setup lang="ts">
  interface Props {
    ${props}
  }

  defineProps<Props>()
</script>
    `

    return code.trim()
  }
}

export default ScriptSetupGenerator
