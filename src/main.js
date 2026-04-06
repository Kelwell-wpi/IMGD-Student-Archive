import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router' // Make sure this path is correct
import './style.css'

const app = createApp(App)

app.use(router) // This is the line that connects the plumbing

app.mount('#app')