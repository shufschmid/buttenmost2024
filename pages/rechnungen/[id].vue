<template>
  <Rechnung :data="data" />
</template>
<script setup>

const route = useRoute();
const { data } = await useFetch(
  "/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&recID=" + route.params.id
);

</script>