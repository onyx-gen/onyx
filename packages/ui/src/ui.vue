<script lang="ts" setup>
import Layout from './layout.vue'
import Code from './code.vue'
</script>

<template>
  <Layout>
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">
        UnoCSS Variables
      </h1>

      <div class="flex flex-col w-full bg-$figma-color-bg-secondary divide-y divide-[#4c4c4c] rounded-sm overflow-hidden">
        <div class="px-3 py-2 color-$figma-color-text-secondary my-font">
          Generated Code
        </div>

        <div class="px-3 py-2">
          <Code />
        </div>
      </div>
    </div>
  </Layout>
</template>

<style>
.my-font {
  font-weight: 500;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-feature-settings: "liga", "calt";
}
</style>
