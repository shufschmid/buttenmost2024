<script setup lang="ts">

const data = await useFetch(
  "/api/airtable_get?basis=Verkaufsstellen&view=website"
);

</script>

<template>
  <span>{{ data }} hallo</span>
</template>
