<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { codeToHtml } from 'shiki'
import type { PluginMessageEvent } from '@onyx/types'
import { computedAsync } from '@vueuse/core'
import { useTheme } from './useTheme'

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
</script>

<template>
  <div class="w-full max-h-full overflow-hidden" v-html="html" />
</template>

<style>
code {
  font-weight: 500 !important;
  font-family: "Roboto Mono", Monaco, "Courier New", monospace !important;
  font-size: 11px !important;
  font-feature-settings: "liga", "calt" !important;
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
