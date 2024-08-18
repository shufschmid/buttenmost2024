<template>
  <div>
    <v-toolbar class="d-print-none">
      <template v-slot:prepend>
        <v-btn icon="mdi-table-edit"></v-btn>
      </template>
      <v-btn @click="changeStatus" :color="buttoncolor">
        Status auf "Rechnung" setzen</v-btn
      ><v-btn @click="loadImage(data)"> QR-Code laden</v-btn>
    </v-toolbar>

    <ul>
      <li v-for="Liefertag in shippingDays">
        <nuxt-link :to="'/lieferscheine/' + Liefertag.Datum">
          {{ Liefertag.Datum }}</nuxt-link
        >
      </li>
    </ul>

    <v-container>
      <v-row>
        <v-col col="12" lg="8"
          >{{ Code }}
          <template>
            <v-card
              ><v-autocomplete
                v-model="Code"
                :items="Laeden"
                outlined
                placeholder="Start typing to Search"
                return-object
                label="Läden suchen"
              ></v-autocomplete></v-card
          ></template>
          <!-- <v-data-iterator
          :items="items"
          :page="page"
          items-per-page="100"
          :search="search"
          item-value="Laden"
          :sort-desc.sync="false"
        >
          <template v-slot:header>
            <v-toolbar class="px-2">
              <v-toolbar-title
                ><a name="Verkaufsstellen"></a>Verkaufsstellen</v-toolbar-title
              >
              <v-spacer></v-spacer>

              <v-text-field
                v-model="search"
                density="comfortable"
                placeholder="Suchen"
                prepend-inner-icon="mdi-magnify"
                style="max-width: 300px"
                variant="solo"
                clearable
                hide-details
              ></v-text-field>
            </v-toolbar>
          </template>
          
          <template v-slot:default="{ items, isExpanded, toggleExpand }">
            <template v-for="item in items" :key="item.raw.Id">
              <v-card class="pl-3" link @click="() => toggleExpand(item)"
                ><b>{{ item.raw.Ort }}</b> {{ item.raw.Laden }}
                  
                    {{}} {{ item.raw.Adresse }}, {{ item.raw.PLZ }}
                    {{ item.raw.Ort }}. Kontakt:
                    <a
                      v-if="item.raw.Kontakt && item.raw.Kontakt.length > 15"
                      :href="item.raw.Kontakt"
                      target="_blank"
                      >Website</a
                    >
                    <span v-else>{{ item.raw.Tel }}</span>
                    <span v-if="item.raw.Bemerkungen">
                      | Bemerkungen: {{ item.raw.Bemerkungen }}.</span
                    >
                    &#160;👉<NuxtLink
                      :to="{
                        name: 'Verkaufsstellen-id',
                        params: { id: item.raw.Id },
                      }"
                      >Details</NuxtLink
                    >
                    <hr />
              </v-card>
            </template>
          </template>
          <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
            <div class="d-flex align-center justify-center pa-4">
              <v-btn
                :disabled="page === 1"
                density="comfortable"
                icon="mdi-arrow-left"
                variant="tonal"
                rounded
                @click="prevPage"
              ></v-btn>

              <div class="mx-2 text-caption">
                Seite {{ page }} von {{ pageCount }}
              </div>

              <v-btn
                :disabled="page >= pageCount"
                density="comfortable"
                icon="mdi-arrow-right"
                variant="tonal"
                rounded
                @click="nextPage"
              ></v-btn>
            </div>
          </template>
        </v-data-iterator> -->
        </v-col>
        <v-col col="4" class="d-none d-lg-block">
          <v-img height="100%" src="/abfuellen.jpg" cover /></v-col></v-row
    ></v-container>
  </div>
</template>
<script setup>
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});
const { data } = await useFetch(
  "/api/airtable_get?basis=Verkaufsstellen&view=website&verkaufsstellensort=true"
);
const shippingDays = await $fetch(
  "/api/airtable_get?basis=Lieferdaten&view=b2b&sort=true"
);
const items = await JSON.parse(JSON.stringify(data.value));
let Laeden = items.map((data) => ({ title: data.Laden, value: data.Code }));
let Code = ref();

let search = ref();

const store = useButtenmostStore();
</script>
