<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import MainLayout from './components/main-layout.vue'
import { useConfiguration } from './stores/useConfiguration'
import { useCode } from './stores/useCode'
import LoadingSpinner from './components/loading-spinner.vue'
import Content from './components/content.vue'

const { listen } = useCode()
listen()

const { init } = useConfiguration()
init()

const { isReady } = storeToRefs(useConfiguration())
</script>

<template>
  <MainLayout>
    <Content v-if="isReady" />
    <LoadingSpinner v-else />
  </MainLayout>
</template>
