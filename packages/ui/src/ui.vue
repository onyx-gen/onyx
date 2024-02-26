<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { PluginMessageEvent } from '@unocss-variables/events'
import Layout from './layout.vue'
import Code from './code.vue'

const hasSelection = ref(false)

onMounted(async () => {
  window.addEventListener('message', (m: PluginMessageEvent) => {
    hasSelection.value = m.data.pluginMessage.event !== 'unselected'
  })
})
</script>

<template>
  <Layout>
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">
        UnoCSS Variables
      </h1>

      <div
        v-show="hasSelection"
        class="flex flex-col w-full bg-$figma-color-bg-secondary divide-y divide-[rgba(0, 0, 0, 0.898)] rounded-sm overflow-hidden"
      >
        <div class="px-3 py-2 color-$figma-color-text-secondary my-font">
          Generated Code
        </div>

        <div class="px-3 py-2">
          <Code />
        </div>
      </div>

      <div
        v-show="!hasSelection"
        class="bg-$figma-color-bg-secondary w-max divide-y divide-[#4c4c4c] rounded-sm overflow-hidden"
      >
        <div class="px-3 py-2 color-$figma-color-text-secondary my-font">
          Please select a node!
        </div>
      </div>
    </div>
  </Layout>
</template>

<style>
.my-font {
  font-weight: 500;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-feature-settings: "liga", "calt";
}
</style>
