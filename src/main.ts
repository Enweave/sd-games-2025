import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.sass'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

const vuetify = createVuetify({})
const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(vuetify)
app.use(router)

app.mount('#app')
