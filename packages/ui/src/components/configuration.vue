<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Mode } from '@onyx/types'
import { usePluginMessage } from '../stores/usePluginMessage'
import Switch from './switch.vue'
import Select from './select.vue'
import type { SelectOption } from './select.vue'

const { emitPluginMessage } = usePluginMessage()

const nearestInference = ref(true)
watch(nearestInference, (nearestColor: boolean) => emitPluginMessage('nearest-changed', { nearestColor }))

const variantGroup = ref(true)
watch(variantGroup, (variantGroup: boolean) => emitPluginMessage('variant-group-changed', { variantGroup }))

const isRem = ref(false)
watch(isRem, isRem => emitPluginMessage('unit-changed', { unit: isRem ? 'rem' : 'px' }))

const model = ref<Mode>('variables')
watch(model, (mode: Mode) => emitPluginMessage('mode-changed', { mode }))

const options: SelectOption[] = [
  {
    value: 'inferred',
    label: 'Inferred',
  },
  {
    value: 'variables',
    label: 'Variables',
  },
]
</script>

<template>
  <div>
    <h2 class="my-font font-semibold color-$figma-color-text">
      Mode
    </h2>

    <Select v-model="model" :options="options" />
  </div>

  <div>
    <h2 class="my-font font-semibold color-$figma-color-text">
      Nearest Inference
    </h2>

    <Switch v-model="nearestInference" class="mt-2" />
  </div>

  <div>
    <h2 class="my-font font-semibold color-$figma-color-text">
      Variant Group
    </h2>

    <Switch v-model="variantGroup" class="mt-2" />
  </div>

  <div>
    <h2 class="my-font font-semibold color-$figma-color-text">
      Unit (rem/px)
    </h2>

    <Switch v-model="isRem" class="mt-2" />
  </div>
</template>

<style scoped>

</style>
