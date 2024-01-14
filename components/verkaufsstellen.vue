<script setup lang="ts">

const data = await useFetch(
  "/api/verkaufsstellen?view=website"
);

</script>

<template>
  <span>{{ data }} hallo</span>
</template>
