<script setup lang="js">
const store = useButtenmostStore();
</script>

<template>
  <shop v-if="store.isSaison"></shop>
  <Signup v-if="!store.isSaison"></Signup>

  <!-- <Verkaufsstellen></Verkaufsstellen> -->
</template>
