<template>
  <v-card class="mx-auto my-12" max-width="374">
    <v-img
      height="250"
      src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
      cover
    ></v-img>

    <v-card-item>
      <v-card-title>{{ data.Laden }}</v-card-title>

      <v-card-subtitle>
        <span class="me-1">{{ data.Adresse }}, {{ data.Ort }}</span>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <div class="my-4 text-subtitle-1"></div>

      <div>
        Kontakt:
        <a
          v-if="data.Kontakt && data.Kontakt.length > 15"
          :href="data.Kontakt"
          target="_blank"
          >Website</a
        >
        <span v-else>{{ data.Tel }}</span>
        <span v-if="data.Bemerkungen">
          | Bemerkungen: {{ data.Bemerkungen }}.</span
        >
      </div>
    </v-card-text>

    <v-divider class="mx-4 mb-1"></v-divider>

    <v-card-actions>
      <v-btn
        to="/Verkaufsstellen"
        color="deep-purple-lighten-2"
        text="weitere Verkaufsstellen"
        block
        border
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>
<script setup>
const store = useButtenmostStore();
const route = useRoute();
const { data } = await useFetch(
  "/api/airtable_get/?basis=Verkaufsstellen&recID=" + route.params.id
);
</script>
