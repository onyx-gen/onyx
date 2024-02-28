<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { PluginMessageEvent, SelectedNode } from '@onyx/events'
import Layout from './layout.vue'
import Code from './code.vue'

const hasSelection = ref(false)

const selectedNodes = ref<SelectedNode[]>([])

onMounted(async () => {
  window.addEventListener('message', (m: PluginMessageEvent) => {
    hasSelection.value = m.data.pluginMessage.event !== 'unselected'

    if (m.data.pluginMessage.event === 'unselected')
      selectedNodes.value = []

    if (m.data.pluginMessage.event === 'selected')
      selectedNodes.value = m.data.pluginMessage.data.nodes
  })
})
</script>

<template>
  <Layout>
    <div>
      <h1 class="text-2xl font-bold mb-4">
        Onyx
      </h1>

      <div v-show="hasSelection" class="space-y-4">
        <div
          class="flex flex-col w-full max-h-full bg-$figma-color-bg-secondary divide-y divide-[rgba(0, 0, 0, 0.898)] rounded-sm overflow-hidden"
        >
          <div class="px-3 py-2 color-$figma-color-text-secondary my-font">
            Generated Code
          </div>

          <div class="px-3 py-2 overflow-scroll">
            <Code />
          </div>
        </div>

        <div>
          <div class="py-2 color-$figma-color-text-secondary my-font">
            Selected Nodes
          </div>

          <ol class="flex gap-4">
            <li
              v-for="selectedNode in selectedNodes"
              :key="selectedNode.id"
              class="p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary my-font"
            >
              <ul v-if="selectedNode.props">
                <li v-for="(value, key) in selectedNode.props" :key="key">
                  {{ key }}: {{ value }}
                </li>
              </ul>
            </li>
          </ol>
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
