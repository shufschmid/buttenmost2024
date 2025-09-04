<template>
    <v-container
        id="rechnungen"
        class="page-break"
        v-for="Rechnung in rechnungen.data.value"
        :key="rechnungen.data.value.Kunde"
      >
    
    <Rechnung :data="Rechnung" />

    </v-container>
  
</template>
<script setup>

const route = useRoute();
const { data } = await useFetch(
  "/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&recID=" + route.params.id
);

const rechnungen = await useFetch(
  '/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&view=rechnungen&filter=DATESTR({Lieferdatum})="' +
    route.params.datum +
    '"'
);

</script>

<style>
.page-break {
  page-break-after: always;
}

.page-break:last-child {
  page-break-after: avoid;
}
</style>