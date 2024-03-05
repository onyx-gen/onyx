<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfiguration } from '../stores/useConfiguration'
import Switch from './inputs/switch.vue'
import Select from './inputs/select.vue'
import type { SelectOption } from './inputs/select.vue'

const { configuration } = storeToRefs(useConfiguration())

const isRem = computed({
  get: () => configuration.value.unit === 'rem',
  set: (isRem) => {
    configuration.value.unit = isRem ? 'rem' : 'px'
  },
})

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
  <div class="font-sans text-xs font-semibold color-$figma-color-text flex gap-4">
    <div>
      <h2>
        Mode
      </h2>

      <Select v-model="configuration.mode" :options="options" />
    </div>

    <div>
      <h2>
        Nearest Inference
      </h2>

      <Switch v-model="configuration.nearestInference" class="mt-2" />
    </div>

    <div>
      <h2>
        Variant Group
      </h2>

      <Switch v-model="configuration.variantGroup" class="mt-2" />
    </div>

    <div>
      <h2>
        Unit (rem/px)
      </h2>

      <Switch v-model="isRem" class="mt-2" />
    </div>
  </div>
</template>
