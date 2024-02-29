<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { ComponentProps, PluginMessageEvent, SelectedNode } from '@onyx/events'
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

const selectedNodeProps = computed(() => {
  return selectedNodes.value
    .filter(node => node.props)
    .map((node) => {
      return node.props as ComponentProps
    })
})

const states = computed(() => selectedNodes.value.reduce((acc, node) => {
  if (node.props) {
    Object.keys(node.props)
      .filter(prop => prop === 'state').forEach((key) => {
        acc.add(node.props![key])
      })
  }

  return acc
}, new Set<string>()))

const permutationKeys = computed(() => selectedNodes.value.reduce((acc, node) => {
  if (node.props) {
    Object.keys(node.props)
      .filter(prop => prop !== 'state').forEach((key) => {
        acc.add(key)
      })
  }

  return acc
}, new Set<string>()))

const permutationMapping = computed(() => {
  return Array.from(permutationKeys.value).reduce((acc, key) => {
    if (!acc[key])
      acc[key] = new Set<string>()

    selectedNodeProps.value.map(props => props[key]).forEach((permutationValue) => {
      acc[key].add(permutationValue)
    })
    return acc
  }, {} as Record<string, Set<string>>)
})

function getPermutationNode(permutationKey: string, permutationValue: string, state: string) {
  return selectedNodes.value.find(node => node.props?.state === state && node.props?.[permutationKey] === permutationValue)
}
</script>

<template>
  <Layout>
    <div>
      <h1 class="text-2xl font-bold mb-4">
        Onyx
      </h1>

      <div v-show="hasSelection" class="divide-y divide-$figma-color-border">
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

        <div class="mt-4 pt-4 space-y-4">
          <div class="my-font font-semibold color-$figma-color-text">
            Selected Nodes
          </div>

          <table class="border-separate border-spacing-2">
            <thead>
              <tr>
                <th class="p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary my-font">
                  Variant
                </th>
                <th
                  v-for="state in states"
                  :key="state"
                  class="p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary my-font"
                >
                  {{ state }}
                </th>
              </tr>
            </thead>

            <tbody>
              <template
                v-for="permutationKey in permutationKeys"
                :key="permutationKey"
              >
                <tr
                  v-for="(permutationValue, idx) in permutationMapping[permutationKey]"
                  :key="permutationValue"
                >
                  <th
                    v-if="idx === 0"
                    class="p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary my-font"
                    :rowspan="permutationMapping[permutationKey].size"
                  >
                    {{ permutationKey }}
                  </th>
                  <td
                    v-for="state in states"
                    :key="state"
                    class="opacity-0 p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary my-font"
                    :class="{
                      'opacity-100': !!getPermutationNode(permutationKey, permutationValue, state),
                    }"
                  >
                    {{ getPermutationNode(permutationKey, permutationValue, state)?.props?.[permutationKey] }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

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
