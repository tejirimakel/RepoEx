import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Last-resort handler so unexpected errors are logged rather than swallowed.
app.config.errorHandler = (err, _instance, info) => {
  console.error(`[app error] ${info}:`, err)
}

app.use(router)
app.mount('#app')

