<script setup lang="ts">
const { data } = await useFetch("/api/verkaufsstellen?view=website");
</script>

<template>
  <pre>{{ data }}</pre>
</template>
