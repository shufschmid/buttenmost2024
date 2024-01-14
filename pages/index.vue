<script setup lang="js">

const store = useButtenmostStore();


</script>

<template>
  <v-btn>test Page</v-btn> 
  <Signup v-show="store.isSaison"></Signup>
  Saisonstartdate: 
  
  {{ store.saisonStartString }}, isSaison: {{ store.isSaison }}

  <Verkaufsstellen></Verkaufsstellen>

  
</template>
