<template>
  <div>
    <v-form name="rechnung" ref="form">
<adminbar :is-rechnung="true">
  <template #actions>
    <v-btn
      @click="changeStatus"
      :color="buttoncolor"
    >
      Status auf "Rechnung" setzen</v-btn
    ><v-btn
      @click="loadImage(data)"
    >
      QR-Code laden</v-btn
    >
  </template>
</adminbar>

      <v-container id="rechnungen" style="page-break-after: always">
        <v-row
          ><v-col cols="12"
            ><h1>Rechnung</h1>
            {{ bezeichnung(data, "Lieferung", "Name") }}</v-col
          ><v-col cols="8" align-self="center">
            Datum: {{ printdate(data.Lieferdatum) }}<br /><br />

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
            info@buttenmost.ch<br />
            MWST-Nr. {{ store.mehrwertsteuernummer }}</v-col
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
                  {{ data.Menge }} Liter Buttenmost<span
                    v-show="data.Typ == 'Laden'"
                    >im Becher à CHF
                    {{ (store.PreisProLiter + store.PreisBecher).toFixed(2) }}
                  </span>
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
                <td
                  valign="top"
                  class="text-right"
                  v-show="data.Typ == 'Laden'"
                >
                  CHF
                  {{
                    (
                      data.Menge *
                      (Number(store.PreisBecher) + Number(store.PreisProLiter))
                    ).toFixed(2)
                  }}
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
                  ><span><br />CHF {{ data.Lieferpauschale.toFixed(2) }}</span>
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
          <v-col cols="12"
            >Inkl. {{ store.mehrwertsteuersatz }} % MWST. Zahlbar innert 10
            Tagen. <br /><br
          /></v-col>
        </v-row>
        <img
          v-bind:src="'data:image/png;base64,' + image"
          class="qrcode"
          width="100%"
        />
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

let image = ref();

const { data } = await useFetch(
  "/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&recID=" + route.params.id
);

function printdate(datum) {
  return new Date(datum).toLocaleDateString();
}

async function loadImage(data) {
  image.value = await $fetch(
    "/api/qrcode?betrag=" +
      data.Betrag +
      "&Name=" +
      bezeichnung(data, "Lieferung", "Name") +
      "&Strasse=" +
      bezeichnung(data, "Lieferung", "Adresse") +
      "&Ort=" +
      bezeichnung(data, "Lieferung", "PLZundOrt") +
      "&Bemerkungen=" +
      bezeichnung(data, "Lieferung", "Name").replace("|", "") + // dieses Sonderzeichen gibt bei einigen Banken Fehlermeldungen beim Einzahlen
      " Rechnung vom " +
      printdate(data.Lieferdatum) +
      "&Rechnung_Referenz_Nummer=122"
  );
}

async function changeStatus() {
  await $fetch("/api/airtable_update", {
    method: "POST",
    body: [{ id: route.params.id, fields: { Status: "Rechnung" } }], //muss zwingend als array übergeben werden, auch wenn einzelner eintrag
  });
  buttoncolor.value="green"
}
</script>
