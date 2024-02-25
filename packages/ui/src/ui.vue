<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

import { codeToHtml } from 'shiki'
import { sum } from './util'

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
  <div class="w-screen h-full overflow-hidden bg-blue">
    <div>
      <button class="bg-red" @click="counter--">
        Decrement
      </button>
      {{ counter }} / {{ sum(counter, counter) }}
      <button @click="counter++">
        Increment
      </button>
    </div>

    <h1>HTML</h1>

    <div class="w-full px-8 overflow-hidden" v-html="html" />
  </div>
</template>

<style>
.shiki {
  overflow-x: auto;
}
</style>
