<script setup lang="ts">
import { codeToHtml } from 'shiki'
import { computedAsync, useClipboard } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { useTheme } from '@/composables/useTheme'
import { useNotification } from '@/composables/useNotification'
import { useCode } from '@/stores/useCode'
import Wrapper from '@/components/layout/wrapper.vue'

const { code, isLoading, executionTime, components } = storeToRefs(useCode())

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

const componentList = computedAsync(async () => {
  const promises = Object.entries((components.value?.components as Record<string, string> || {})).map(async ([componentName, componentCode]) => {
    return {
      name: componentName,
      code: componentCode,
      html: await codeToHtml(componentCode, {
        lang: 'vue-html',
        theme: theme.value,
      }),
    }
  })

  return await Promise.all(promises)
})
</script>

<template>
  <Wrapper headline="Generated Code" :loading="isLoading">
    <TabGroup class="w-full" as="div">
      <TabList>
        <Tab v-for="c in componentList" :key="c.name">
          Component {{ c.name }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="c in componentList" :key="c.name">
          <div class="w-full" v-html="c.html" />
        </TabPanel>
      </TabPanels>
    </TabGroup>

    <template #action>
      <button @click="onCopy">
        <i class="i-onyx-copy w-4 h-4" />
      </button>
    </template>
  </Wrapper>

  <div v-if="!isLoading" class="font-sans text-xs font-medium w-full text-right pt-0.5 color-$figma-color-text-secondary">
    {{ executionTime }}ms
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
