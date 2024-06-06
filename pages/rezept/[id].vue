<template>
  <v-card class="mx-auto my-12" max-width="500">
    <v-img height="350" :src="data.Bild ? data.Bild[0].url : ''" cover></v-img>

    <v-card-item>
      <v-card-title>{{ data.Rezept }}</v-card-title>

      <v-card-subtitle>
        <span class="me-1">{{ data.Beschreibung }}</span>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <div class="my-4 text-subtitle-1"></div>

      <div>
        <pre v-if="data.Zutaten.length > 10">Zutaten:
{{ data.Zutaten }}<hr/>
      </pre>
        <pre style="white-space: pre-wrap" v-if="data.Zubereitung.length > 10">Zubereitung:
{{ data.Zubereitung }}<hr/>
    </pre>
       
        {{ data.Zusatzangaben }}
      
      </div>
    </v-card-text>

    <v-divider class="mx-4 mb-1"></v-divider>

    <v-card-actions>
      <v-btn
        to="/Rezepte"
        color="deep-purple-lighten-2"
        text="weitere Rezepte"
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
  "/api/airtable_get/?basis=Rezepte&recID=" + route.params.id
);
</script>
