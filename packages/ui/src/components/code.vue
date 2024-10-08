<script setup lang="ts">
import { codeToHtml } from 'shiki'
import { computedAsync, useClipboard } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { computed, ref, watch } from 'vue'
import type { ComponentTreeNode } from '@onyx-gen/types'
import { useTheme } from '@/composables/useTheme'
import { useNotification } from '@/composables/useNotification'
import { useCode } from '@/stores/useCode'
import Wrapper from '@/components/layout/wrapper.vue'

const { isLoading, executionTime, components } = storeToRefs(useCode())

const { theme } = useTheme()

const componentTree = computed(() => components.value?.componentTree)
const mainComponentCode = computed(() => componentTree.value?.code || '')

const { copy } = useClipboard({ source: mainComponentCode, legacy: true })
const { notify } = useNotification()

/**
 * Copies the value of the mainComponentCode input element to the clipboard and notifies the user.
 * The main component is the root component of the tree; not its instances.
 */
function onCopy() {
  copy(mainComponentCode.value)
  notify('Copied to clipboard!')
}

export type ComponentTreeNodeWithHTML = ComponentTreeNode & {
  html: string // Ensure that html is always present in this type
  instances: ComponentTreeNodeWithHTML[] // Make sure instances are of the same extended type
}

/**
 * Traverses a tree of `ComponentTreeNode` and adds an `html` property to each node.
 * The `html` property is generated from the `code` property of each node.
 * @param _node The root node of the tree or subtree to traverse and modify.
 * @returns The modified node with the `html` property added.
 */
async function addHtmlPropToTree(_node: ComponentTreeNode): Promise<ComponentTreeNodeWithHTML> {
  const node = { ..._node, html: '' } as ComponentTreeNodeWithHTML

  // Generate HTML from the code; this can be customized as needed.
  node.html = await generateHtmlFromCode(node.code)

  // Recursively apply this function to all child instances
  const instances = []
  for (const instance of node.instances)
    instances.push(await addHtmlPropToTree(instance))
  node.instances = instances

  return node
}

/**
 * Generates HTML from a given code string.
 * @param code The code to generate HTML from.
 * @returns The generated HTML.
 */
async function generateHtmlFromCode(code: string): Promise<string> {
  return await codeToHtml(code, {
    lang: 'vue-html',
    theme: theme.value,
  })
}

/**
 * Represents a flattened tree node.
 * @interface
 */
interface FlattenedTreeNode {
  name: string
  code: string
  html: string
}

/**
 * Flattens a tree of `ComponentTreeNodeWithHTML` into an array of `FlattenedTreeNode`.
 * Each node in the tree will be transformed into an object containing `name`, `code`, and `html`.
 * @param node The root node of the tree or subtree to flatten.
 * @param accumulator An array that accumulates the flattened results. It's used internally by the recursion.
 * @returns An array of `FlattenedTreeNode` containing the flattened tree nodes.
 */
function flattenTree(node: ComponentTreeNodeWithHTML, accumulator: FlattenedTreeNode[] = []): FlattenedTreeNode[] {
  // Create a simple object with the desired properties and add it to the accumulator
  const flatNode: FlattenedTreeNode = {
    name: node.name,
    code: node.code,
    html: node.html,
  }
  accumulator.push(flatNode)

  // Recursively flatten each child node
  node.instances.forEach(child => flattenTree(child, accumulator))

  return accumulator
}

const componentTreeWithHTML = computedAsync(async () => {
  if (!componentTree.value)
    return

  return await addHtmlPropToTree(componentTree.value)
})

const flattenedTree = computed(() => {
  if (!componentTreeWithHTML.value)
    return []

  return flattenTree(componentTreeWithHTML.value)
})

/**
 * Computed variable that returns a flattened and unduplicated tree.
 *
 * Duplications can occur when a component is used multiple times as instance nodes in Figma.
 * The backend sends the same component multiple times in its nested structure.
 * This function ensures that the tree is flattened and unduplicated.
 *
 * @returns {Array<FlattenedTreeNode>} The flattened and unduplicated tree as an array of FlattenedTreeNode objects.
 */
const flattenedUnduplicatedTree = computed(() => {
  const map = new Map<string, FlattenedTreeNode>()
  for (const node of flattenedTree.value)
    map.set(node.name, node)

  return Array.from(map.values())
})

const selectedTab = ref(0)

function changeTab(index) {
  selectedTab.value = index
}

watch(components, () => {
  selectedTab.value = 0
})
</script>

<template>
  <Wrapper headline="Generated Code" :loading="isLoading" class="!p-0 w-full mb-2">
    <TabGroup
      class="w-full h-full grid"
      as="div"
      :selected-index="selectedTab"
      @change="changeTab"
    >
      <TabList
        as="div"
        class="
          flex
          color-$figma-color-text-secondary
          border-b-1 border-l-1 border-color-$divider-color-code
          divide-x divide-$divider-color-code
          overflow-x-scroll
        "
      >
        <Tab
          v-for="c in flattenedUnduplicatedTree"
          :key="c.name"
          v-slot="{ selected }"
          as="template"
        >
          <button
            class="
              shrink-0
              font-sans text-xs font-medium
              px-4 py-2
              last:(!border-r-1 border-color-$divider-color-code)
              focus:outline-none
            "
            :class="{
              'bg-$figma-color-bg': selected,
            }"
          >
            {{ c.name }}.vue
          </button>
        </Tab>
      </TabList>

      <TabPanels class="w-full h-full overflow-scroll">
        <TabPanel v-for="c in flattenedTree" :key="c.name">
          <div class="w-full mx-3 mt-2 code-copy h-full" v-html="c.html" />
        </TabPanel>
      </TabPanels>
    </TabGroup>

    <template #action>
      <button id="copy" @click="onCopy">
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

.code-container:has(#copy:hover) {
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
