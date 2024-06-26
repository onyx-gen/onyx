import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import UnoCSS from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import previewRenderer from './src/plugins/preview-renderer.vite-plugin'

export default defineConfig({
  plugins: [
    previewRenderer({
      path: '../renderer/dist/index.html',
    }),
    vue(),
    viteSingleFile(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    emptyOutDir: false,
  },
})
