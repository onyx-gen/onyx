<script setup lang="ts">
import { codeToHtml } from 'shiki'
import { computedAsync, useClipboard } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useTheme } from '../composables/useTheme'
import { useNotification } from '../composables/useNotification'
import { useCode } from '../stores/useCode'

const { code, isLoading } = storeToRefs(useCode())

const { theme } = useTheme()

const html = computedAsync(
  async () => codeToHtml(code.value, {
    lang: 'vue-html',
    theme: theme.value,
  }),
  '',
)

const { copy } = useClipboard({ source: code, legacy: true })
const { notify } = useNotification()

function onCopy() {
  copy(code.value)
  notify('Copied to clipboard!')
}
</script>

<template>
  <div
    class="code-container flex flex-col w-full bg-$figma-color-bg-secondary divide-y divide-$divider-color-code rounded-sm overflow-hidden"
  >
    <div class="flex justify-between items-center px-3 py-2 color-$figma-color-text-secondary">
      <span class="font-sans text-xs font-medium">
        Generated Code
      </span>

      <button @click="onCopy">
        <i class="i-onyx-copy w-4 h-4" />
      </button>
    </div>

    <div class="code-copy max-h-82 overflow-scroll">
      <div class="px-3 py-2">
        <div v-show="!isLoading" class="w-full" v-html="html" />
        <div v-show="isLoading">
          Loading...
        </div>
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

code {
  font-weight: 500 !important;
  font-family: "Roboto Mono", Monaco, "Courier New", monospace !important;
  font-size: 11px !important;
  font-feature-settings: "liga", "calt" !important;
}

.code-container:has(button:hover) {
  .code-copy {
    background-color: var(--figma-color-bg-selected-tertiary);
    box-shadow: 0 0 0 1px var(--figma-color-border-selected) inset;
  }
}

.shiki {
  font-weight: 500 !important;
  font-family: "Roboto Mono", Monaco, "Courier New", monospace !important;
  font-size: 11px !important;
  font-feature-settings: "liga", "calt" !important;
  overflow-x: auto;
  background-color: transparent !important;
}
</style>
