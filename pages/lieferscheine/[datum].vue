<template>
  <div>
    <v-form name="rechnung" ref="form">
      <!--<v-toolbar class="d-print-none">
        <template v-slot:prepend>
          <v-btn icon="mdi-table-edit"></v-btn>
        </template>
        <v-btn
        :color=buttoncolor
          @click="changeStatus"
        >
        Die ersten zehn Einträge als "verschickt" markieren</v-btn
        >
      </v-toolbar>-->
      <adminbar>
        <template #actions>
          <v-btn :color="buttoncolor" @click="changeStatus">
            Die ersten zehn Einträge als "verschickt" markieren</v-btn
          >
        </template>
      </adminbar>
      <v-container
        id="rechnungen"
        class="page-break brief"
        v-for="Bestellung in lieferscheineListe"
        :key="Bestellung.Id"
      >
        <v-row
          ><v-col cols="8" class="kopf">
            <h1>Lieferschein</h1>
            Lieferart: {{ Bestellung.vertrieb }} | Kunde:
            {{ bezeichnung(Bestellung, "Lieferung", "Name") }}<br />
            Datum: {{ printdate }}<br /><br />

            <Adressfeld :data="Bestellung" art="Lieferung" />
          </v-col>
          <v-col cols="4"
            ><img src="/logo.png" width="200px" /><br />Verena Ming<br />
            Mattenweg 17<br />
            4146 Hochwald<br />
            Tel. 061 751 48 21<br />
            info@buttenmost.ch</v-col
          ><v-col cols="12">
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Lieferdatum</th>

                  <th class="text-left">Menge/Produkt</th>

                  <th class="text-right">Betrag</th>
                </tr>
              </thead>
              <tbody></tbody>
              <tr>
                <td valign="top">{{ Bestellung.Lieferdatum }}</td>
                <td valign="top">
                  {{ Bestellung.Menge }} Liter Buttenmost im Becher à CHF
                  {{ (store.PreisProLiter + store.PreisBecher).toFixed(2) }}
                  <span v-show="Bestellung.Konfi_gr > 0"
                    ><br />{{ Bestellung.Konfi_gr }} grosse Gläser Konfitüre à
                    CHF {{ store.konfi_gross_preis.toFixed(2) }}</span
                  >
                  <span v-show="Bestellung.Konfi_kl > 0"
                    ><br />{{ Bestellung.Konfi_kl }} kleine Gläser Konfitüre à
                    CHF {{ store.konfi_klein_preis.toFixed(2) }}</span
                  >
                  <span v-show="Bestellung.Lieferpauschale"
                    ><br />{{ 1 }} x Lieferpauschale</span
                  >
                </td>
                <td valign="top" class="text-right">
                  CHF
                  {{
                    (
                      Bestellung.Menge *
                      (Number(store.PreisBecher) + Number(store.PreisProLiter))
                    ).toFixed(2)
                  }}
                  <span v-show="Bestellung.Konfi_gr > 0"
                    ><br />CHF
                    {{
                      (Bestellung.Konfi_gr * store.konfi_gross_preis).toFixed(2)
                    }}</span
                  >
                  <span v-show="Bestellung.Konfi_kl > 0"
                    ><br />CHF
                    {{
                      (Bestellung.Konfi_kl * store.konfi_klein_preis).toFixed(2)
                    }}</span
                  >
                  <span v-show="Bestellung.Lieferpauschale"
                    ><br />CHF {{ Bestellung.Lieferpauschale }}.00</span
                  >
                </td>
              </tr>
              <tr>
                <td><b>Total</b></td>
                <td></td>
                <td class="text-right">
                  <b>{{ Bestellung.Betrag.toFixed(2) }}</b>
                </td>
              </tr></v-table
            >
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>
<script setup>
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});

const store = useButtenmostStore();
const route = useRoute();
let buttoncolor = ref("primary");
const tour = route.query.tour;

console.log(route.params.datum);
const lieferscheine = await useFetch(
  '/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&view=b2b_lieferscheine&filter=DATESTR({Lieferdatum})="' +
    route.params.datum +
    '"'
);
// airtable_get liefert bei genau einem Treffer ein Objekt, bei keinem [] -> immer Array
const lieferscheineListe = computed(() => {
  const d = lieferscheine.data.value;
  return Array.isArray(d) ? d : d ? [d] : [];
});

const printdate = computed(() => {
  return new Date(route.params.datum).toLocaleDateString();
});

let params = computed(() => {
  return lieferscheineListe.value
    .map((item) => {
      const container = {}; //refactor array, damit es für jeden Eintrag den Vorgaben von Airtable entspricht: {    "id": "reckBfjBRf0an97CE", "fields": {"Status": "etikette" }}
      container.id = item.Id;
      container.fields = {};
      container.fields.Status = "verschickt";
      return container;
    })
    .slice(0, 10); //Airtable kann nur 10 Einträge aufs Mal umstellen auf "verschickt"
});

async function changeStatus() {
  await $fetch("/api/airtable_update", {
    method: "POST",
    body: params.value,
  });
  buttoncolor.value = "green";

  reloadNuxtApp();
}
</script>
<style>
.page-break {
  page-break-after: always;
}

.page-break:last-child {
  page-break-after: avoid;
}
</style>
