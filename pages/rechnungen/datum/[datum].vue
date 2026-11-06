<template>
    <v-container
        id="rechnungen"
        class="page-break brief"
        v-for="(Rechnung, i) in rechnungenListe"
        :key="Rechnung.Id || i"
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
// airtable_get liefert bei genau einem Treffer ein Objekt, bei keinem [] -> immer Array
const rechnungenListe = computed(() => {
  const d = rechnungen.data.value;
  return Array.isArray(d) ? d : d ? [d] : [];
});

</script>

<style>
.page-break {
  page-break-after: always;
}

.page-break:last-child {
  page-break-after: avoid;
}
</style>