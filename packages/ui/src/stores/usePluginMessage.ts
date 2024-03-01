import { defineStore } from 'pinia'
import { useEventBus, useEventListener } from '@vueuse/core'
import type { PluginMessage, PluginMessageEvent } from '@onyx/types'
import { onUnmounted } from 'vue'

export const usePluginMessage = defineStore('pluginMessageStore', () => {
  const bus = useEventBus<PluginMessage>('plugin-message')

  useEventListener(window, 'message', (event: PluginMessageEvent) => {
    const pluginMessage = event.data.pluginMessage
    bus.emit(pluginMessage)
  })

  function onPluginMessage<T extends PluginMessage['event']>(
    type: T,
    callback: (messageData: Extract<PluginMessage, { event: T }>['data']) => void,
  ) {
    const stop = bus.on((message: PluginMessage) => {
      if (message.event === type)
        callback((message as Extract<PluginMessage, { event: T }>).data)
    })
    onUnmounted(stop)
  }

  function emitPluginMessage<T extends PluginMessage['event']>(
    type: T,
    data: Extract<PluginMessage, { event: T }>['data'],
  ) {
    parent.postMessage({ pluginMessage: { event: type, data } }, '*')
  }

  return { onPluginMessage, emitPluginMessage }
})
