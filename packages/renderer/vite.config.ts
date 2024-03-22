import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      /**
       * Necessary to be able to use the full Vue build
       * including runtime compiler of template strings.
       *
       * See https://github.com/vuejs/core/tree/main/packages/vue#which-dist-file-to-use
       */
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  build: {
    target: 'es6',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    emptyOutDir: false,
  },
})
