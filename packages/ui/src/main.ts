import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ui from './main.vue'

// UnoCSS utility classes
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

const pinia = createPinia()
const app = createApp(ui)

app.use(pinia)
app.mount('#ui')
