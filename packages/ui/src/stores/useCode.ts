import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { GeneratedComponentsPluginMessageData, SelectedNode } from '@onyx-gen/types'
import { whenever } from '@vueuse/core'
import { usePluginMessage } from './usePluginMessage'

export const useCode = defineStore('code', () => {
  const components = ref<GeneratedComponentsPluginMessageData | null>(null)

  const selectedNodes = ref<SelectedNode[] | null>(null)
  const hasSelection = computed(() => selectedNodes.value !== null)
  const isLoading = ref(false)
  const executionTime = ref<number | null>(null)

  whenever(isLoading, () => executionTime.value = null)

  function listen() {
    console.log('Listening for generated code changes')

    const { onPluginMessage } = usePluginMessage()

    onPluginMessage('generated-components', (_components) => {
      components.value = _components
      console.log('Received generated components', _components)
    })

    onPluginMessage('unselected', () => {
      selectedNodes.value = null
    })

    onPluginMessage('selected', ({ nodes }) => {
      selectedNodes.value = nodes
    })

    onPluginMessage('execution-time', ({ time }) => {
      executionTime.value = time
    })

    onPluginMessage('loading', ({ state }) => {
      isLoading.value = state
    })
  }

  return {
    listen,
    selectedNodes,
    hasSelection,
    isLoading,
    executionTime,
    components,
  }
})
