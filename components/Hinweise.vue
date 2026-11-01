<script setup>
// Kundenhinweise aus Airtable (Tabelle "Hinweise", Endpoint /api/hinweise) fuer einen Ort.
// server:false -> wird erst im Browser nach der Hydration geladen, damit die vorgerenderte
//                 Startseite keinen Build-Stand zeigt und kein Hydration-Mismatch entsteht
//                 (Server-HTML und Client starten beide mit []).
// lazy:true    -> blockiert auch bei Client-Navigation nicht. Bei einem Fehler bleibt die
//                 Liste leer, die Seite laeuft normal weiter.
const props = defineProps({
  ort: { type: String, required: true }, // Startseite | Shop Privatkunden | Shop Firmenkunden
});
const { data: hinweise } = useFetch("/api/hinweise", {
  query: { ort: props.ort },
  server: false,
  lazy: true,
  default: () => [],
});
</script>

<template>
  <div class="hinweise">
    <v-alert
      v-for="h in hinweise"
      :key="h.id"
      :type="h.typ"
      :title="h.titel || undefined"
      :closable="h.schliessbar"
      variant="tonal"
      border="start"
      class="my-4"
      style="font-size: 1rem; font-weight: 500"
    >
      <div class="hinweis-text" v-html="h.html"></div>
    </v-alert>
  </div>
</template>

<style scoped>
.hinweis-text :deep(p:last-child) {
  margin-bottom: 0;
}
.hinweis-text :deep(a),
.hinweis-text :deep(a:visited) {
  color: #0065b7;
  text-decoration: underline;
}
</style>
