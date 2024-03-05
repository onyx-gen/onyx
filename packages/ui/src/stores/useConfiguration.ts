import { defineStore } from 'pinia'
import type { Configuration, Mode, Unit } from '@onyx/types'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { usePluginMessage } from './usePluginMessage'

export const useConfiguration = defineStore('configuration-store', () => {
  const isReady = ref(false)
  const configuration: Ref<Configuration> = ref<Configuration>({} as Configuration)

  async function init() {
    const { oncePluginMessage } = usePluginMessage()
    const { configuration: loadedConfiguration } = await oncePluginMessage('configuration')
    configuration.value = loadedConfiguration
    isReady.value = true
  }

  watch(isReady, () => {
    const { emitPluginMessage } = usePluginMessage()

    watch(() => configuration.value.unit, (unit: Unit) => emitPluginMessage('unit-changed', { unit }))
    watch(() => configuration.value.nearestInference, (nearestColor: boolean) => emitPluginMessage('nearest-changed', { nearestColor }))
    watch(() => configuration.value.variantGroup, (variantGroup: boolean) => emitPluginMessage('variant-group-changed', { variantGroup }))
    watch(() => configuration.value.mode, (mode: Mode) => emitPluginMessage('mode-changed', { mode }))
  })

  return {
    configuration,
    isReady,
    init,
  }
})
