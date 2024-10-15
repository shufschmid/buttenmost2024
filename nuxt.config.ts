// https://nuxt.com/docs/api/configuration/nuxt-config
// ergänzt durch vuetify-integration wie hier beschrieben: https://vuetifyjs.com/en/getting-started/installation/#using-nuxt-3
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  
  
  devtools: { enabled: true },
  build: {
    transpile: ["vuetify"],
  },
  routeRules: {
    '/': {prerender:true},
    '/rezepte': {prerender:true},
    '/rezepte/**': {prerender:true},
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@pinia/nuxt",
    //...
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  imports: {
    dirs: ['store'],
  },
});
