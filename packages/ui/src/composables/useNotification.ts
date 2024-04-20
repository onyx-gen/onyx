import type { NotificationPluginMessage } from '@onyx-gen/types'

export function useNotification() {
  function notify(message: string) {
    const pluginMessage: NotificationPluginMessage = {
      event: 'notification',
      data: {
        message,
      },
    }
    parent.postMessage({ pluginMessage }, '*')
  }

  return {
    notify,
  }
}
