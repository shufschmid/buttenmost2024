<script setup lang="js">
import { setMapStoreSuffix } from 'pinia';

const store = useButtenmostStore();
</script>

<template>
 
  <v-btn >test Page</v-btn>
  <shop v-if="store.isSaison"></shop>
  <Signup v-if="!store.isSaison"></Signup>

  <Verkaufsstellen></Verkaufsstellen>
</template>
