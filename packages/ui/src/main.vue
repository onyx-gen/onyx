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

<style>
.figma-dark {
  --divider-color-code: rgb(76, 76, 76);
}

.figma-light {
  --divider-color-code: rgb(220, 220, 220);
}

.my-font {
  font-weight: 500;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-feature-settings: "liga", "calt";
}
</style>
