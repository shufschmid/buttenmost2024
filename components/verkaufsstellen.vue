<script setup lang="ts">
const { data } = await useFetch("/.netlify/functions/verkaufsstellen?view=website");
</script>

<template>
  <pre>{{ data }}</pre>
</template>
