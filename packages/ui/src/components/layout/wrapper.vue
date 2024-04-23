<script setup lang="ts">
import { useAttrs } from 'vue'
import LoadingSpinner from '@/components/loading-spinner.vue'

withDefaults(defineProps<{
  loading?: boolean
  headline: string
}>(), {
  loading: false,
})

const attrs = useAttrs()
</script>

<template>
  <div
    class="
      code-container
      flex flex-col
      w-full
      bg-$figma-color-bg-secondary
      divide-y divide-$divider-color-code
      rounded-sm
      overflow-hidden
    "
  >
    <div class="flex justify-between items-center px-3 py-2 color-$figma-color-text-secondary">
      <span class="font-sans text-xs font-medium">
        {{ headline }}
      </span>

      <slot name="action" />
    </div>

    <div class="max-h-82 overflow-scroll relative">
      <div
        v-bind="attrs"
        class="px-3 py-2"
        :class="{
          'opacity-50': loading,
        }"
      >
        <slot />
      </div>

      <div
        v-show="loading"
        class="absolute inset-0 flex justify-center items-center pointer-events-none"
      >
        <LoadingSpinner />
      </div>
    </div>
  </div>
</template>

<style>
.figma-dark {
  --divider-color-code: rgb(76, 76, 76);
}

.figma-light {
  --divider-color-code: rgb(220, 220, 220);
}
</style>
