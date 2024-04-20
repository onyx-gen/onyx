import type { PluginMessage } from '@onyx-gen/types'

/**
 * A simple event bus for managing events in Figma plugins.
 */
class EventBus {
  private listeners: { [key: string]: Function[] } = {}

  /**
   * Registers an event listener for a specific event type.
   *
   * @template T - A type that extends from the 'event' property of the PluginMessage type.
   *
   * @param {T} type - The type of the event to listen for.
   * @param {Function} listener - The listener function to call when the event is emitted.
   */
  public on<T extends PluginMessage['event']>(
    type: T,
    listener: (data: Extract<PluginMessage, { event: T }>['data']) => void,
  ): void {
    if (!this.listeners[type])
      this.listeners[type] = []

    this.listeners[type].push(listener)
  }

  /**
   * Emits an event to all registered listeners of that event type.
   *
   * @param {PluginMessage} message - The message to emit.
   */
  public emit(message: PluginMessage): void {
    const listeners = this.listeners[message.event]
    if (listeners)
      listeners.forEach(listener => listener(message.data))
  }
}

export default EventBus
