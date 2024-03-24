


<template>
  <div>Admin 2 - sehr wichtig
  <v-btn>Admin</v-btn></div>
</template>
<script setup>
  definePageMeta({
    middleware: 'auth' // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
})

const store = useButtenmostStore();
</script>

