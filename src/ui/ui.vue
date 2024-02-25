<script lang="ts" setup>
import { ref } from 'vue'

const counter = ref(0)
</script>

<template>
  <button @click="counter--">
    Decrement
  </button>
  {{ counter }}
  <button @click="counter++">
    Increment
  </button>
</template>
