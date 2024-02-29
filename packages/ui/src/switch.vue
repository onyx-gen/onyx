<script setup lang="ts">
import { Switch } from '@headlessui/vue'

const enabled = defineModel<boolean>()
</script>

<template>
  <Switch
    v-model="enabled"
    :class="enabled ? 'bg-teal-900' : 'bg-teal-700'"
    class="relative inline-flex h-5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
  >
    <span class="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      :class="enabled ? 'translate-x-3' : 'translate-x-0'"
      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
    />
  </Switch>
</template>
