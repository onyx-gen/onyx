import { defineStore } from 'pinia'
import { useEventBus, useEventListener } from '@vueuse/core'
import type { PluginMessage, PluginMessageEvent, RendererMessageEvent } from '@onyx-gen/types'

import { onUnmounted } from 'vue'

export const usePluginMessage = defineStore('pluginMessageStore', () => {
  const bus = useEventBus<PluginMessage>('plugin-message')

  /**
   * Checks if a message event is a plugin message event.
   *
   * @param messageEvent - The message event to check.
   * @returns Whether the message event is a plugin message event.
   */
  function isPluginMessageEvent(messageEvent: MessageEvent): messageEvent is PluginMessageEvent {
    return 'pluginMessage' in messageEvent.data
  }

  /**
   * Listens to the 'message' event on the window object to handle plugin messages.
   * When a message is received, it emits the message data to the event bus.
   */
  useEventListener(window, 'message', (event: PluginMessageEvent | RendererMessageEvent) => {
    let pluginMessage: PluginMessage

    if (isPluginMessageEvent(event))
      pluginMessage = event.data.pluginMessage
    else
      pluginMessage = event.data

    bus.emit(pluginMessage)
  })

  /**
   * Registers a callback function to be executed when a plugin message of a specific type is received.
   * Automatically unsubscribes the callback when the component is unmounted.
   *
   * @param type - The event type of the plugin message to listen for.
   * @param callback - A function to be called with the message data when a message of the specified type is received.
   */
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

  /**
   * Returns a Promise that resolves once with the data of the first plugin message of a specific type received.
   * Automatically unsubscribes after receiving the first message of the specified type.
   *
   * @param type - The event type of the plugin message to wait for.
   * @returns Promise resolving with the message data of the first received message of the specified type.
   */
  function oncePluginMessage<T extends PluginMessage['event']>(
    type: T,
  ): Promise<Extract<PluginMessage, { event: T }>['data']> {
    return new Promise((resolve) => {
      const stop = bus.on((message: PluginMessage) => {
        if (message.event === type) {
          stop()
          resolve((message as Extract<PluginMessage, { event: T }>).data)
        }
      })
    })
  }

  /**
   * Emits a plugin message with the specified event type and data to the parent frame.
   *
   * @param type - The event type of the message to be emitted.
   * @param data - The data to be sent with the message.
   */
  function emitPluginMessage<T extends PluginMessage['event']>(
    type: T,
    data: Extract<PluginMessage, { event: T }>['data'],
  ) {
    console.log('emitPluginMessage', type, data)
    parent.postMessage({ pluginMessage: { event: type, data } }, '*')
  }

  return {
    onPluginMessage,
    oncePluginMessage,
    emitPluginMessage,
  }
})
