import { createIndent } from '../utils'

class ScriptSetupGenerator {
  generate(variantKeys: string[]) {
    const indent = createIndent(2)

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
