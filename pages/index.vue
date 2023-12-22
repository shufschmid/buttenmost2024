<script setup lang="ts">
const { data } = await useFetch("/api/hello");
</script>

<template>
  <v-btn>test Page</v-btn>
  <pre>{{ data }}</pre>
</template>
