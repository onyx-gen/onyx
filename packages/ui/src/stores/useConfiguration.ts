import { defineStore } from 'pinia'
import type { IConfiguration, Mode, Unit, VariableNameTransformations } from '@onyx-gen/types'
import type { Ref } from 'vue'
import { ref, toRaw, watch } from 'vue'
import { usePluginMessage } from './usePluginMessage'

export const useConfiguration = defineStore('configuration-store', () => {
  const isReady = ref(false)
  const configuration: Ref<IConfiguration> = ref<IConfiguration>({} as IConfiguration)

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
    watch(() => configuration.value.variableNameTransformations, (variableNameTransformations: VariableNameTransformations) => emitPluginMessage('variable-name-transformations-changed', { variableNameTransformations: toRaw(variableNameTransformations) }), { deep: true })
    watch(() => configuration.value.newBuilder, (newBuilder: boolean) => emitPluginMessage('new-builder-changed', { newBuilder }))
  })

  return {
    configuration,
    isReady,
    init,
  }
})
