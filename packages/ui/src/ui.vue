<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

import { codeToHtml } from 'shiki'

const counter = ref(0)
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
    lang: 'vue',
    theme: 'vitesse-light',
  })
})
</script>

<template>
  <div>
    <button class="bg-red" @click="counter--">
      Decrement
    </button>
    {{ counter }}
    <button @click="counter++">
      Increment
    </button>
  </div>

  <h1>HTML</h1>

  <div class="code" v-html="html" />
</template>

<style scoped>
.code {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
