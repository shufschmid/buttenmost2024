<template>
  <div class="ma-4">
    <h1>Post-Etiketten im Stapel (Brother QL-1110NWB)</h1>
    <p class="mb-4">Lieferdatum wählen. Es werden alle Post-Bestellungen dieses Datums aufgelistet.</p>
    <v-list v-if="tage.length">
      <v-list-item
        v-for="tag in tage"
        :key="tag.Datum"
        :to="'/etiketten/brother/stapel/' + tag.Datum"
        :title="tag.title || tag.Datum"
        :subtitle="tag.Datum"
        prepend-icon="mdi-label-multiple"
      />
    </v-list>
    <v-text-field
      v-model="eigenesDatum"
      label="Anderes Datum (JJJJ-MM-TT)"
      density="compact"
      style="max-width: 280px"
      class="mt-4"
    >
      <template #append>
        <v-btn :to="'/etiketten/brother/stapel/' + eigenesDatum" :disabled="!/^\d{4}-\d{2}-\d{2}$/.test(eigenesDatum)">
          Öffnen
        </v-btn>
      </template>
    </v-text-field>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
const eigenesDatum = ref("");
const { data } = await useFetch("/api/airtable_get?basis=Lieferdaten&view=post_alle&sort=true");
const tage = computed(() => {
  const d = data.value;
  return Array.isArray(d) ? d : d && d.Datum ? [d] : [];
});
</script>
