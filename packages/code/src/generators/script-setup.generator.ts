import { createIndent } from '../utils'
import type { VariantPermutation } from '../set/types'
import type { ComputedProperties, PermutationKey, PermutationUnionType } from './types'

/**
 * This class generates the `script setup` code block for the generated Vue component output.
 */
class ScriptSetupGenerator {
  /**
   * Constructs a ScriptSetupGenerator instance with specified variant permutations.
   *
   * @param permutations - An array of variant permutations, where each permutation is represented by a key-value pair indicating the variant's name and value, respectively.
   */
  constructor(
    permutations: VariantPermutation[],
    private readonly computedProperties: ComputedProperties,
    private readonly types: { [key: PermutationKey]: PermutationUnionType },
  ) { }

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
  
  const { ${Object.keys(this.types).join(', ')} } = toRefs(defineProps<Props>())

  ${computedPropertiesBodies.join(`\n${createIndent(1)}`)}
</script>
    `.trim()
  }
}

export default ScriptSetupGenerator
