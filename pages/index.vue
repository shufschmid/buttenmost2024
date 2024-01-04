<script setup lang="ts">
const { data, error, pending } = await useFetch("/.netlify/functions/verkaufsstellen?view=website");
</script>

<template>
  <v-btn>test Page</v-btn>
  <span v-if="pending">Loading...</span>

<span v-else-if="data">Todos: {{ data }}</span>

<span v-else-if="error">Error: {{ error }}</span>
  <pre>{{ data }}</pre>
</template>
