<script setup lang="ts">
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/vue'

defineProps<{
  headline: string
}>()
</script>

<template>
  <Disclosure v-slot="{ open }" as="div" class="space-y-4">
    <div class="flex justify-between">
      <div class="font-sans text-xs font-semibold color-$figma-color-text">
        {{ headline }}
      </div>

      <DisclosureButton>
        <i
          class="w-4 h-4"
          :class="{
            'i-onyx-eye-slash': open,
            'i-onyx-eye': !open,
          }"
        />
      </DisclosureButton>
    </div>

    <div v-show="open">
      <DisclosurePanel static>
        <slot />
      </DisclosurePanel>
    </div>
  </Disclosure>
</template>
