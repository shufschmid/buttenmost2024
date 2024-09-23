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
  
          <v-btn
        :color=buttoncolor
          @click="changeStatus"
        >
        Die ersten zehn Einträge als "verschickt" markieren</v-btn
        >

          </template>
        </adminbar>
      <v-container
        id="rechnungen"
        style="page-break-after: always"
        v-for="Bestellung in lieferscheine.data.value"
        :key="lieferscheine.data.value.Kunde"
        v-show="tour == Bestellung.Tour"
      >
        <v-row 
          ><v-col cols="12">
            <h1>Lieferschein</h1>
            {{ bezeichnung(Bestellung, "Lieferung", "Name") }} </v-col
          ><v-col cols="8" align-self="center">
            Datum: {{ printdate }}<br /><br />

            <!-- <div v-if="Kunde[0].b2b_Rechnungsadresse">
              <span v-html="Kunde[0].b2b_Rechnungsadresse[0]"></span>
            </div> -->

            <div>
              {{ bezeichnung(Bestellung, "Lieferung", "Name") }}<br />
              {{ bezeichnung(Bestellung, "Lieferung", "Adresse") }}<br />
              {{ bezeichnung(Bestellung, "Lieferung", "Adresszusatz")
              }}<br
                v-show="bezeichnung(Bestellung, 'Lieferung', 'Adresszusatz')"
              />
              {{ bezeichnung(Bestellung, "Lieferung", "PLZundOrt") }}
            </div>
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
                  <span v-show="Bestellung.Tee > 0"
                    ><br />{{ Bestellung.Tee }} Päckli Tee à CHF
                    {{ store.tee_preis.toFixed(2) }}</span
                  >
                  <span v-show="Bestellung.Lieferpauschale"><br />{{ 1 }} x Lieferpauschale</span>
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
                  <span v-show="Bestellung.Tee > 0"
                    ><br />CHF
                    {{ (Bestellung.Tee * store.tee_preis).toFixed(2) }}</span
                  ><span v-show="Bestellung.Lieferpauschale"
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
let buttoncolor = ref("primary")
const tour = route.query.tour 

console.log("t"+tour+"t")
const lieferscheine = await useFetch(
  '/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&view=b2b_lieferscheine&filter=DATESTR({Lieferdatum})="' +
    route.params.datum +
    '"'
);

const printdate = computed(() => {
  return new Date(route.params.datum).toLocaleDateString();
});

let params = computed(() => {
  return lieferscheine.data.value
    .map((item) => {
      const container = {}; //refactor array, damit es für jeden Eintrag den Vorgaben von Airtable entspricht: {    "id": "reckBfjBRf0an97CE", "fields": {"Status": "etikette" }}
      container.id = item.Id;
      container.fields = {};
      container.fields.Status = "verschickt";
      return container;
    })
    .slice(0, 9); //Airtable kann nur 10 Einträge aufs Mal umstellen auf "verschickt"
});

async function changeStatus() {
  await $fetch("/api/airtable_update", {
    method: "POST",
    body: params.value
  });
  buttoncolor.value="green"

  reloadNuxtApp()
}
</script>
