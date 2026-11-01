<template>
  <v-app>
    <div>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </v-app>
</template>
<script setup>
// Die Startseite ist vorgerendert: store.heute waere dort die Build-Zeit und bliebe es
// bei Client-Navigation fuer die ganze Sitzung (falsche Saison-Anzeigen). Nach der
// Hydration auf die echte Zeit setzen; isSaison/isSaisonOver rechnen reaktiv nach.
const store = useButtenmostStore();
onMounted(() => {
  store.heute = new Date();
});

useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
    { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ]
})
</script>