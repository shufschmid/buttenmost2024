<script setup lang="js">
const store = useButtenmostStore();
</script>

<template>
  <v-parallax src="/titelbild.jpg" height="450">
    <div
      class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h4 font-weight-thin mb-4">Buttenmost aus Hochwald</h1>
        <h4 class="subheading">Die Buttenmost-Saison beginnt am {{ store.SaisonStartString }}.</h4>
    </div>
  </v-parallax>
  <shop v-if="store.isSaison"></shop>
  <Signup v-if="!store.isSaison"></Signup>

  <Verkaufsstellen></Verkaufsstellen>
</template>
