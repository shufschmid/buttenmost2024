<script setup lang="ts">
const { data } = await useFetch("/.netlify/functions/verkaufsstellen?view=website");
</script>

<template>
  <v-btn>test Page</v-btn>
  <pre>{{ data }}</pre>
</template>
