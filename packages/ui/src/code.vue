<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { codeToHtml } from 'shiki'

const code = ref('const a = 1')
const html = ref('')

onMounted(async () => {
  window.addEventListener('message', (m) => {
    console.log('message', m)
    code.value = m.data.pluginMessage
  })
})

watch(code, async () => {
  html.value = await codeToHtml(code.value, {
    lang: 'vue-html',
    theme: 'vitesse-light',
  })
})
</script>

<template>
  <div class="w-full overflow-hidden border border-black" v-html="html" />
</template>

<style>
.shiki {
  overflow-x: auto;
}
</style>
