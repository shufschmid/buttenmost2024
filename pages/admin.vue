<template>
  <v-toolbar class="d-print-none">
    <template v-slot:prepend>
      <v-btn icon="mdi-table-edit"></v-btn>
    </template>
    <v-toolbar-title>Admin-Bereich</v-toolbar-title>
    <v-btn href="https://www.payrexx.ch" variant="outlined" class="ml-2"
      >Payrexx</v-btn
    >
    <v-btn
      href="https://airtable.com/app8cUEZWBvWHDfaN/tblbU1zmZ2kumAXEY/viwEmeSz33ziajVUp?blocks=hide"
      variant="outlined"
      class="ml-2"
      >Airtable: Bestellungen</v-btn
    >
    <v-btn href="https://www.rapidmail.de/" variant="outlined" class="ml-2"
      >Rapidmail</v-btn
    >
  </v-toolbar>
  <v-container
    ><v-row
      ><v-col cols="12">
        <v-card
          ><v-autocomplete
            v-model="Code"
            :items="Laeden"
            outlined
            placeholder="Start typing to Search"
            return-object
            label="Läden suchen"
          ></v-autocomplete></v-card></v-col
    ></v-row>
    <v-row
      ><v-col cols="12" md="4">
        <h2>Lieferscheine</h2>
        <ul class="ml-4">
          <li v-for="Liefertag in shippingDays">
            <nuxt-link :to="'/lieferscheine/' + Liefertag.Datum">{{ Liefertag.Datum }}
              </nuxt-link
            >
          </li>
        </ul></v-col
      ><v-col cols="12" md="8"
        ><h2>aktuelle Bestellungen</h2>
        <ul class="ml-4">
          <li v-for="Bestellung in Bestellungen">
            {{ Bestellung.Lieferdatum }} | {{ Bestellung.Kunde }} |
            <nuxt-link :to="'/rechnungen/' + Bestellung.Id">Rechnung</nuxt-link
            > | <nuxt-link :to="'/lieferschein/' + Bestellung.Id"
              >Lieferschein</nuxt-link> | <nuxt-link :to="'/etiketten/' + Bestellung.Id"
              >Etikette</nuxt-link 
            >
          </li>
        </ul></v-col
      ><v-col cols="12" md="4"></v-col
    ></v-row>
  </v-container>
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
const Bestellungen = await $fetch(
  "/api/airtable_get?basis=Bestellungen&view=admin"
);
const items = await JSON.parse(JSON.stringify(data.value));
let Laeden = items.map((data) => ({ title: data.Laden, value: data.Code }));
let Code = ref();

let search = ref();

const store = useButtenmostStore();
</script>
