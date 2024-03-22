<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import html from 'virtual:preview-renderer'
import { storeToRefs } from 'pinia'
import { useCode } from '@/stores/useCode'
import Wrapper from '@/components/layout/wrapper.vue'

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
  const iframe = iframeRef.value

  if (iframe)
    iframe.src = blobUrl
})
</script>

<template>
  <Wrapper headline="Preview" class="mb-4">
    <iframe ref="iframeRef" class="w-full h-16 bg-$figma-color-bg-secondary rounded-sm" />
  </Wrapper>
</template>
