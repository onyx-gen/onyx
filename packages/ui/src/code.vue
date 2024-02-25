<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { codeToHtml } from 'shiki'

const code = ref('const a = 1')
const html = ref('')

onMounted(async () => {
  window.addEventListener('message', (m) => {
    console.log('message', m)

    if (m.data.pluginMessage.event === 'html')
      code.value = m.data.pluginMessage.html
    else if (m.data.pluginMessage.event === 'unselected')
      console.log('unselected')
  })
})

watch(code, async () => {
  html.value = await codeToHtml(code.value, {
    lang: 'vue-html',
    theme: 'vitesse-dark',
  })
})
</script>

<template>
  <div class="w-full overflow-hidden" v-html="html" />
</template>

<style>
code {
  font-weight: 500 !important;
  font-family: "Roboto Mono", Monaco, "Courier New", monospace !important;
  font-size: 11px !important;
  font-feature-settings: "liga", "calt" !important;
}

.shiki {
  font-weight: 500 !important;
  font-family: "Roboto Mono", Monaco, "Courier New", monospace !important;
  font-size: 11px !important;
  font-feature-settings: "liga", "calt" !important;
  overflow-x: auto;
  background-color: transparent !important;
}
</style>
