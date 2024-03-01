<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { codeToHtml } from 'shiki'
import type { PluginMessageEvent } from '@onyx/types'
import { computedAsync, useClipboard } from '@vueuse/core'
import { useTheme } from './useTheme'
import { useNotification } from './composables/useNotification'

const code = ref('')

onMounted(async () => {
  window.addEventListener('message', (m: PluginMessageEvent) => {
    const pluginMessage = m.data.pluginMessage

    if (pluginMessage.event === 'html')
      code.value = pluginMessage.data.html
  })
})

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
    class="code-container flex flex-col w-full max-h-full bg-$figma-color-bg-secondary divide-y divide-$divider-color-code rounded-sm overflow-hidden"
  >
    <div class="flex justify-between items-center px-3 py-2 color-$figma-color-text-secondary">
      <span class="my-font">
        Generated Code
      </span>

      <button @click="onCopy">
        <i class="i-onyx-copy w-4 h-4" />
      </button>
    </div>

    <div class="code-copy">
      <div class="px-3 py-2 overflow-scroll">
        <div class="w-full max-h-full overflow-hidden" v-html="html" />
      </div>
    </div>
  </div>
</template>

<style>
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
