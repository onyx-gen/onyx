<script setup lang="ts">
import type { ComponentProps, SelectedNode } from '@onyx-gen/types'
import { computed, toRefs } from 'vue'
import Disclosure from '@/components/disclosure.vue'

interface Props {
  nodes: SelectedNode[]
}

const props = defineProps<Props>()
const { nodes } = toRefs(props)

const selectedNodeProps = computed(() => {
  return nodes.value
    .filter(node => node.props)
    .map((node) => {
      return node.props as ComponentProps
    })
})

const states = computed(() => nodes.value.reduce((acc, node) => {
  if (node.props) {
    Object.keys(node.props)
      .filter(prop => prop === 'state').forEach((key) => {
        acc.add(node.props![key])
      })
  }

  return acc
}, new Set<string>()))

const permutationKeys = computed(() => nodes.value.reduce((acc, node) => {
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
  return nodes.value.find(node => node.props?.state === state && node.props?.[permutationKey] === permutationValue)
}
</script>

<template>
  <Disclosure headline="Selection">
    <div class="space-y-4">
      <table class="border-separate border-spacing-2">
        <thead>
          <tr>
            <th class="opacity-0" />
            <th
              v-for="state in states"
              :key="state"
              class="p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary font-sans text-xs font-medium"
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
                class="p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary font-sans text-xs font-medium"
                :rowspan="permutationMapping[permutationKey].size"
              >
                {{ permutationKey }}
              </th>
              <td
                v-for="state in states"
                :key="state"
                class="opacity-0 p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary font-sans text-xs font-medium space-y-1"
                :class="{
                  'opacity-100': !!getPermutationNode(permutationKey, permutationValue, state),
                }"
              >
                <div class="flex gap-1 items-center color-$figma-color-text-component mt-0.5">
                  <svg
                    class="fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                  >
                    <path
                      fill-opacity="1"
                      fill-rule="nonzero"
                      stroke="none"
                      d="M1.207 6 6 1.207 10.793 6 6 10.793 1.207 6z"
                    />
                  </svg>

                  <span class="font-normal">Variant</span>
                </div>

                <table class="border-separate border-spacing-x-1 text-left font-sans text-xs font-medium -mx-1">
                  <tr
                    v-for="(value, key) in getPermutationNode(permutationKey, permutationValue, state)?.props"
                    :key="key"
                  >
                    <th class="color-$figma-color-text-secondary">
                      {{ key }}
                    </th>
                    <td class="color-$figma-color-text">
                      {{ value }}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </Disclosure>
</template>
