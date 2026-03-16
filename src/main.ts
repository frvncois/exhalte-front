import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/global.css'

import App from './App.vue'
import router from './router'
import lenis from './lib/lenis'

const app = createApp(App)


lenis.on('scroll', () => {});

app.use(createPinia())
app.use(router)

app.mount('#app')
