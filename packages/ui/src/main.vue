<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { SelectedNode } from '@onyx/types'
import MainLayout from './components/main-layout.vue'
import Code from './components/code.vue'
import Layout from './components/layout.vue'
import { usePluginMessage } from './stores/usePluginMessage'
import SelectedNodes from './components/selection.vue'
import Configuration from './components/configuration.vue'

const selectedNodes = ref<SelectedNode[] | null>(null)
const hasSelection = computed(() => selectedNodes.value !== null)

const { onPluginMessage } = usePluginMessage()

onPluginMessage('unselected', () => {
  console.log('unselected')
  selectedNodes.value = null
})
onPluginMessage('selected', ({ nodes }) => {
  console.log('selected', nodes)
  selectedNodes.value = nodes
})
</script>

<template>
  <MainLayout>
    <div>
      <div class="border-b border-color-$figma-color-border mb-4">
        <Layout>
          <h1 class="text-2xl font-bold mb-4">
            Onyx
          </h1>
        </Layout>
      </div>

      <div class="border-b border-color-$figma-color-border mb-4">
        <Layout class="mb-4 flex gap-4">
          <Configuration />
        </Layout>
      </div>

      <div v-show="hasSelection" class="divide-y divide-$figma-color-border">
        <Layout>
          <Code />
        </Layout>

        <Layout v-if="hasSelection && selectedNodes?.length" class="mt-4">
          <SelectedNodes :nodes="selectedNodes" />
        </Layout>
      </div>

      <Layout v-show="!hasSelection">
        <div
          class="bg-$figma-color-bg-secondary w-max divide-y divide-[#4c4c4c] rounded-sm overflow-hidden"
        >
          <div class="px-3 py-2 color-$figma-color-text-secondary my-font">
            Please select a node!
          </div>
        </div>
      </Layout>
    </div>
  </MainLayout>
</template>

<style>
.figma-dark {
  --divider-color-code: rgb(76, 76, 76);
}

.figma-light {
  --divider-color-code: rgb(220, 220, 220);
}

.my-font {
  font-weight: 500;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-feature-settings: "liga", "calt";
}
</style>
