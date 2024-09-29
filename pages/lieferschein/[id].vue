<template>
  <div>
    <v-form name="rechnung" ref="form">
      <v-toolbar class="d-print-none">
        <template v-slot:prepend>
          <v-btn icon="mdi-table-edit"></v-btn>
        </template>
        <v-btn :color="buttoncolor" @click="changeStatus">
          Eintrag als "verschickt" markieren</v-btn
        >
      </v-toolbar>

      <v-container id="rechnungen">
        <v-row
          ><v-col cols="12"
            ><h1>Lieferschein</h1>
            {{ bezeichnung(data, "Lieferung", "Name") }}</v-col
          ><v-col cols="8" align-self="center">
            Datum: {{ printdate(data.Lieferdatum) }}<br /><br />

            <!-- <div v-if="Kunde[0].b2b_Rechnungsadresse">
              <span v-html="Kunde[0].b2b_Rechnungsadresse[0]"></span>
            </div> -->

            <div>
              {{ bezeichnung(data, "Lieferung", "Name") }}<br />
              {{ bezeichnung(data, "Lieferung", "Adresse") }}<br />
              {{ bezeichnung(data, "Lieferung", "Adresszusatz")
              }}<br v-show="bezeichnung(data, 'Lieferung', 'Adresszusatz')" />
              {{ bezeichnung(data, "Lieferung", "PLZundOrt") }}
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
                <td valign="top">{{ data.Lieferdatum }}</td>
                <td valign="top">
                  {{ data.Menge }} Liter Buttenmost
                  <span v-show="data.Konfi_gr > 0"
                    ><br />{{ data.Konfi_gr }} grosse Gläser Konfitüre à CHF
                    {{ store.konfi_gross_preis.toFixed(2) }}</span
                  >
                  <span v-show="data.Konfi_kl > 0"
                    ><br />{{ data.Konfi_kl }} kleine Gläser Konfitüre à CHF
                    {{ store.konfi_klein_preis.toFixed(2) }}</span
                  >
                  <span v-show="data.Tee > 0"
                    ><br />{{ data.Tee }} Päckli Tee à CHF
                    {{ store.tee_preis.toFixed(2) }}</span
                  >
                  <span v-show="data.Typ == 'Laden'"
                    ><br />{{ 1 }} x Lieferpauschale</span
                  >
                </td>
                <td valign="top" class="text-right">
                  <span v-show="data.Typ == 'Laden'">
                    CHF
                    {{
                      (
                        data.Menge *
                        (Number(store.PreisBecher) +
                          Number(store.PreisProLiter))
                      ).toFixed(2)
                    }}</span
                  >
                  <span v-show="data.Konfi_gr > 0"
                    ><br />CHF
                    {{
                      (data.Konfi_gr * store.konfi_gross_preis).toFixed(2)
                    }}</span
                  >
                  <span v-show="data.Konfi_kl > 0"
                    ><br />CHF
                    {{
                      (data.Konfi_kl * store.konfi_klein_preis).toFixed(2)
                    }}</span
                  >
                  <span v-show="data.Tee > 0"
                    ><br />CHF
                    {{ (data.Tee * store.tee_preis).toFixed(2) }}</span
                  ><br />
                  <span v-show="data.Typ == 'Laden'"
                    >CHF {{ data.Lieferpauschale.toFixed(2) }}</span
                  >
                </td>
              </tr>
              <tr>
                <td><b>Total</b></td>
                <td></td>
                <td class="text-right">
                  <b>{{ data.Betrag.toFixed(2) }}</b>
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
let buttoncolor = ref("primary");
const store = useButtenmostStore();
const route = useRoute();

const { data } = await useFetch(
  "/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&recID=" + route.params.id
);

function printdate(datum) {
  return new Date(datum).toLocaleDateString();
}

async function changeStatus() {
  await $fetch("/api/airtable_update", {
    method: "POST",
    body: [{ id: route.params.id, fields: { Status: "verschickt" } }], //muss zwingend als array übergeben werden, auch wenn einzelner eintrag
  });
  buttoncolor.value = "green";
}
</script>
