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

watch(code, (c) => {
  const iframe = iframeRef.value

  if (iframe) {
    const targetOrigin = '*'

    // Message you want to send to the iframe
    const message = {
      vue: c,
    }

    // Sending the message
    iframe.contentWindow?.postMessage(message, targetOrigin)
  }
})

onMounted(() => {
  // Adapt the height of the iframe to the content
  const { onPluginMessage } = usePluginMessage()
  onPluginMessage('renderer', (d) => {
    iframeRef.value!.style.height = `${d.height}px`
  })
})
</script>

<template>
  <Wrapper headline="Preview" class="mb-4">
    <iframe
      ref="iframeRef"
      :src="blobUrl"
      class="w-full bg-$figma-color-bg-secondary rounded-sm"
    />
  </Wrapper>
</template>
