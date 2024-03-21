<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCode } from '../stores/useCode'
import Layout from './layout/layout.vue'
import SelectedNodes from './selection.vue'
import Configuration from './configuration.vue'
import Code from './code.vue'
import Preview from './preview.vue'

const { selectedNodes, hasSelection, hasPreview } = storeToRefs(useCode())
</script>

<template>
  <div>
    <div class="border-b border-color-$figma-color-border mb-4">
      <Layout>
        <h1 class="text-2xl font-bold mb-4">
          Onyx
        </h1>
      </Layout>
    </div>

    <div class="border-b border-color-$figma-color-border mb-4">
      <Layout>
        <Preview v-if="hasPreview" />
      </Layout>
    </div>

    <div class="border-b border-color-$figma-color-border mb-4">
      <Layout class="mb-4">
        <Configuration />
      </Layout>
    </div>

    <div v-if="hasSelection" class="divide-y divide-$figma-color-border">
      <Layout>
        <Code />
      </Layout>

      <Layout v-if="hasSelection && selectedNodes?.length" class="mt-4">
        <SelectedNodes :nodes="selectedNodes" />
      </Layout>
    </div>

    <Layout v-else>
      <div
        class="bg-$figma-color-bg-secondary w-max divide-y divide-[#4c4c4c] rounded-sm overflow-hidden"
      >
        <div class="px-3 py-2 color-$figma-color-text-secondary font-sans text-xs font-medium">
          Please select a node!
        </div>
      </div>
    </Layout>
  </div>
</template>

<style scoped>

</style>
