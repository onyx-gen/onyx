<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import html from 'virtual:preview-renderer'
import { storeToRefs } from 'pinia'
import { useCode } from '@/stores/useCode'
import Wrapper from '@/components/layout/wrapper.vue'
import { usePluginMessage } from '@/stores/usePluginMessage'

const iframeRef = ref<HTMLIFrameElement | null>(null)

const blob = new Blob([html], { type: 'text/html' })
const blobUrl = URL.createObjectURL(blob)

const { code } = storeToRefs(useCode())
watch(code, sendCode)

function sendCode() {
  const iframe = iframeRef.value

  if (iframe) {
    const targetOrigin = '*'

    // Message you want to send to the iframe
    const message = {
      vue: code.value,
    }

    // Sending the message
    iframe.contentWindow?.postMessage(message, targetOrigin)
  }
}

onMounted(() => {
  // Adapt the height of the iframe to the content
  const { onPluginMessage } = usePluginMessage()
  onPluginMessage('renderer', (d) => {
    iframeRef.value!.style.height = `${d.height}px`
  })

  // Send code to the iframe when it's loaded.
  // Necessary, as the iframe is not ready when the code
  // is sent via the code reference variable watcher.
  const iframe = iframeRef.value
  if (iframe) {
    iframe.onload = () => {
      sendCode()
    }
  }
})
</script>

<template>
  <Wrapper headline="Preview" class="mb-4">
    <iframe
      ref="iframeRef"
      :src="blobUrl"
      class="w-full min-h-24 bg-$figma-color-bg-secondary rounded-sm"
    />
  </Wrapper>
</template>
