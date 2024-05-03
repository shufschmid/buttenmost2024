<template>
  <div>
    Admin 2 - sehr wichtig
    <v-btn>Admin</v-btn>
    {{ data }}
  </div>
</template>
<script setup>
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});

const store = useButtenmostStore();
let Datum = "2024-05-09";
const data = await useFetch(
  '/api/airtable_get/?basis=Table 1&view=b2b_lieferscheine&filter=DATESTR({Lieferdatum})="' +
    Datum +
    '"'
);
</script>
