<script setup lang="ts">
const data = await useFetch(
  "/api/verkaufsstellen?view=website"
);
</script>

<template>
  <v-btn>test Page</v-btn>

  <span> {{ data }}</span>
</template>
