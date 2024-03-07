import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { SelectedNode } from '@onyx/types'
import { usePluginMessage } from './usePluginMessage'

export const useCode = defineStore('code', () => {
  const code = ref('')
  const selectedNodes = ref<SelectedNode[] | null>(null)
  const hasSelection = computed(() => selectedNodes.value !== null)
  const isLoading = ref(false)

  function listen() {
    console.log('Listening for generated code changes')

    const { onPluginMessage } = usePluginMessage()

    onPluginMessage('html', ({ html }) => {
      code.value = html
    })

    onPluginMessage('unselected', () => {
      selectedNodes.value = null
    })

    onPluginMessage('selected', ({ nodes }) => {
      selectedNodes.value = nodes
    })

    onPluginMessage('loading', ({ state }) => {
      if (!state) {
        setTimeout(() => {
          isLoading.value = state
        }, 1000)
        return
      }
      isLoading.value = state
    })
  }

  return {
    listen,
    code,
    selectedNodes,
    hasSelection,
    isLoading,
  }
})
