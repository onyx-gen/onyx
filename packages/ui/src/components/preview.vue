<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCode } from '../stores/useCode'

const iframeRef = ref<HTMLIFrameElement | null>(null)

const { renderedHtml } = storeToRefs(useCode())

const blobUrl = computed(() => {
  if (!renderedHtml.value)
    throw new Error('No rendered html')

  const blob = new Blob([renderedHtml.value], { type: 'text/html' })
  return URL.createObjectURL(blob)
})

function updateIFrame() {
  if (iframeRef.value)
    iframeRef.value.src = blobUrl.value
}

onMounted(updateIFrame)
watch(blobUrl, updateIFrame)
</script>

<template>
  <iframe ref="iframeRef" />
</template>
