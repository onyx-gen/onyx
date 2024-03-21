import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { SelectedNode } from '@onyx/types'
import { whenever } from '@vueuse/core'
import useRenderer from '../composables/useRenderer'
import { usePluginMessage } from './usePluginMessage'

export const useCode = defineStore('code', () => {
  const code = ref('')
  const selectedNodes = ref<SelectedNode[] | null>(null)
  const hasSelection = computed(() => selectedNodes.value !== null)
  const isLoading = ref(false)
  const executionTime = ref<number | null>(null)

  const renderedHtml = ref<string | null>(null)
  const hasPreview = computed(() => !!renderedHtml.value)

  watch(code, async (vueTemplateString) => {
    const { render } = useRenderer()
    renderedHtml.value = await render({ vue: vueTemplateString })
  })

  whenever(isLoading, () => executionTime.value = null)

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

    onPluginMessage('execution-time', ({ time }) => {
      executionTime.value = time
    })

    onPluginMessage('loading', ({ state }) => {
      isLoading.value = state
    })
  }

  return {
    listen,
    code,
    selectedNodes,
    hasSelection,
    isLoading,
    executionTime,
    renderedHtml,
    hasPreview,
  }
})
