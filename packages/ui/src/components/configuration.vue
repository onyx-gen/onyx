<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Switch from './inputs/switch.vue'
import type { SelectOption } from './inputs/select.vue'
import Select from './inputs/select.vue'
import { useConfiguration } from '@/stores/useConfiguration'
import Disclosure from '@/components/disclosure.vue'

const { configuration } = storeToRefs(useConfiguration())

const isRem = computed({
  get: () => configuration.value.unit === 'rem',
  set: (isRem) => {
    configuration.value.unit = isRem ? 'rem' : 'px'
  },
})

const shouldLowercaseVariableNames = computed({
  get: () => configuration.value.variableNameTransformations.lowercase,
  set: (lowercaseVariableNames) => {
    configuration.value.variableNameTransformations.lowercase = lowercaseVariableNames
  },
})

const ignoredComponentInstancesModel = computed({
  get: () => configuration.value.ignoredComponentInstances.join(', '),
  set: (ignoredComponentInstances) => {
    configuration.value.ignoredComponentInstances = ignoredComponentInstances.split(',').map(name => name.trim()).filter(name => name.length > 0)
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
  <Disclosure headline="Configuration">
    <div class="font-sans text-xs font-semibold color-$figma-color-text flex gap-4 overflow-x-scroll w-full">
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
          Unit (px/rem)
        </h2>

        <Switch v-model="isRem" class="mt-2" />
      </div>

      <div>
        <h2>
          Lowercase Variable Names
        </h2>

        <Switch v-model="shouldLowercaseVariableNames" class="mt-2" />
      </div>

      <div>
        <h2>Old/New Builder</h2>

        <Switch v-model="configuration.newBuilder" class="mt-2" />
      </div>

      <div>
        <h2>
          Ignored Component Instances
        </h2>

        <input
          v-model="ignoredComponentInstancesModel"
          class="w-32 mt-2 p-2 border border-$figma-color-border rounded"
          placeholder="Comma separated list of component instance names"
        >
      </div>
    </div>
  </Disclosure>
</template>
