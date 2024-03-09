import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Vue 3 composable for monitoring changes to document.documentElement.classList and handling them.
 */
export function useTheme() {
  // Refs to store the added and removed classes
  const addedClasses = ref<string[]>([])
  const removedClasses = ref<string[]>([])

  // Ref to store the current theme
  const theme = ref<string>('vitesse-light')

  // Observer instance
  let observer: MutationObserver | null = null

  // Function to handle mutations
  const handleMutation = (mutationsList: MutationRecord[]) => {
    mutationsList.forEach((mutation: MutationRecord) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const oldClassList = mutation.oldValue ? mutation.oldValue.split(' ') : []
        const newClassList = document.documentElement.classList.value.split(' ')

        // Update added and removed classes
        addedClasses.value = newClassList.filter(className => !oldClassList.includes(className))
        removedClasses.value = oldClassList.filter(className => !newClassList.includes(className))

        // Check if 'figma-light' or 'figma-dark' class is present and update theme accordingly
        if (newClassList.includes('figma-light'))
          theme.value = 'vitesse-light'
        else if (newClassList.includes('figma-dark'))
          theme.value = 'vitesse-dark'
      }
    })
  }

  // Start observing mutations when the component is mounted
  onMounted(() => {
    observer = new MutationObserver(handleMutation)
    const config: MutationObserverInit = {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    }
    observer.observe(document.documentElement, config)
  })

  // Stop observing mutations when the component is unmounted
  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  // Return current theme
  return { theme }
}
