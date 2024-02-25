<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const counter = ref(0)
const message = ref('')

onMounted(() => {
  window.addEventListener('message', (m) => {
    console.log('message', m)
    message.value = JSON.stringify(m.data.pluginMessage)
  })
})
</script>

<template>
  <div>
    <button @click="counter--">
      Decrement
    </button>
    {{ counter }}
    <button @click="counter++">
      Increment
    </button>
  </div>

  <div>
    Message: {{ message }}
  </div>
</template>
