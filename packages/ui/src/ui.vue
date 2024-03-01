<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import type {
  ComponentProps,
  Mode,
  ModeChangedPluginMessage,
  NearestChangedPluginMessage,
  PluginMessageEvent,
  SelectedNode,
  VariantGroupChangedPluginMessage,
} from '@onyx/types'
import MainLayout from './main-layout.vue'
import Code from './code.vue'
import Select from './select.vue'
import Switch from './switch.vue'
import type { SelectOption } from './select.vue'
import Layout from './layout.vue'

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

const model = ref<Mode>('variables')
watch(model, sendModeChangedMessage)

function sendModeChangedMessage(mode: Mode) {
  const pluginMessage: ModeChangedPluginMessage = {
    event: 'mode-changed',
    data: {
      mode,
    },
  }
  parent.postMessage({ pluginMessage }, '*')
}

const options: SelectOption[] = [
  {
    value: 'inferred',
    label: 'Inferred',
  },
  {
    value: 'variables',
    label: 'Variables',
  },
]

const nearestInference = ref(true)
watch(nearestInference, sendNearestChangedMessage)

function sendNearestChangedMessage(nearestColor: boolean) {
  const pluginMessage: NearestChangedPluginMessage = {
    event: 'nearest-changed',
    data: {
      nearestColor,
    },
  }
  parent.postMessage({ pluginMessage }, '*')
}

const variantGroup = ref(true)
watch(variantGroup, sendVariantGroupChangedMessage)

function sendVariantGroupChangedMessage(variantGroup: boolean) {
  const pluginMessage: VariantGroupChangedPluginMessage = {
    event: 'variant-group-changed',
    data: {
      variantGroup,
    },
  }
  parent.postMessage({ pluginMessage }, '*')
}
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
          <div>
            <h2 class="my-font font-semibold color-$figma-color-text">
              Mode
            </h2>

            <Select v-model="model" :options="options" />
          </div>

          <div>
            <h2 class="my-font font-semibold color-$figma-color-text">
              Nearest Inference
            </h2>

            <Switch v-model="nearestInference" class="mt-2" />
          </div>

          <div>
            <h2 class="my-font font-semibold color-$figma-color-text">
              Variant Group
            </h2>

            <Switch v-model="variantGroup" class="mt-2" />
          </div>
        </Layout>
      </div>

      <div v-show="hasSelection" class="divide-y divide-$figma-color-border">
        <Layout>
          <Code />
        </Layout>

        <Layout class="mt-4">
          <div class="pt-4 space-y-4">
            <div class="my-font font-semibold color-$figma-color-text">
              Selected Nodes
            </div>

            <table class="border-separate border-spacing-2">
              <thead>
                <tr>
                  <th class="opacity-0" />
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
                      class="opacity-0 p-2 rounded-sm bg-$figma-color-bg-secondary color-$figma-color-text-secondary my-font space-y-1"
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

                      <table class="border-separate border-spacing-x-1 text-left my-font -mx-1">
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
