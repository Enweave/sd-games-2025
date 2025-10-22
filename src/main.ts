import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.sass'

import { createVuetify } from 'vuetify'

const vuetify = createVuetify({})
const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(vuetify)

app.mount('#app')
