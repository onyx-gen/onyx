<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import MainLayout from './components/layout/main-layout.vue'
import { useConfiguration } from './stores/useConfiguration'
import { useCode } from './stores/useCode'
import Content from './components/content.vue'
import LoadingSpinner from './components/loading-spinner.vue'
import Preview from './components/preview.vue'

const { listen } = useCode()
listen()

const { init } = useConfiguration()
init()

const { isReady } = storeToRefs(useConfiguration())

const { hasPreview } = storeToRefs(useCode())
</script>

<template>
  <MainLayout v-if="isReady">
    <Preview v-if="hasPreview" />

    <Content />
  </MainLayout>

  <div v-else class="w-screen h-full flex items-center justify-center">
    <LoadingSpinner />
  </div>
</template>
