// import this after install `@mdi/font` package
// erstellt nach Anleitung hier: https://vuetifyjs.com/en/getting-started/installation/#using-nuxt-3
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    // ... your configuration
  })
  app.vueApp.use(vuetify)
})
