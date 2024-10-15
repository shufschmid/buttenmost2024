<template>
  <div>
    <v-form name="rechnung" ref="form">
      <adminbar :is-rechnung="true">
        <template #actions>
          <v-btn @click="changeStatus" :color="buttoncolor">
            Status auf "Rechnung" setzen</v-btn
          ><v-btn @click="loadImage(data[0])"> QR-Code laden</v-btn>
        </template>
      </adminbar>

      <v-container id="rechnungen">
        <v-row
          ><v-col cols="12"
            ><h1>Rechnung</h1>
            {{ bezeichnung(data[0], "Rechnung", "Name") }}</v-col
          ><v-col cols="8" align-self="center">
            Datum: {{ store.heute.toLocaleDateString() }}<br /><br />

            <div>
              {{ bezeichnung(data[0], "Rechnung", "Name") }}<br />
              {{ bezeichnung(data[0], "Rechnung", "Adresse") }}<br />
              {{ bezeichnung(data[0], "Rechnung", "Adresszusatz")
              }}<br v-show="bezeichnung(data[0], 'Rechnung', 'Adresszusatz')" />
              {{ bezeichnung(data[0], "Rechnung", "PLZundOrt") }}
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

                  <th class="text-right">Preis</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="einzelbestellung in data"
                  :key="einzelbestellung.Geschäft"
                >
                  <td valign="top">{{ einzelbestellung.Lieferdatum }}</td>
                  <td valign="top">
                    {{ einzelbestellung.Menge }} Liter Buttenmost<span
                      v-show="einzelbestellung.Typ == 'Laden'"
                    >
                      im Becher à CHF
                      {{ (store.PreisProLiter + store.PreisBecher).toFixed(2) }}
                    </span>
                    <span v-show="einzelbestellung.Konfi_gr > 0"
                      ><br />{{ einzelbestellung.Konfi_gr }} grosse Gläser
                      Konfitüre à CHF
                      {{ store.konfi_gross_preis.toFixed(2) }}</span
                    >
                    <span v-show="einzelbestellung.Konfi_kl > 0"
                      ><br />{{ einzelbestellung.Konfi_kl }} kleine Gläser
                      Konfitüre à CHF
                      {{ store.konfi_klein_preis.toFixed(2) }}</span
                    >
                    <span v-show="einzelbestellung.Tee > 0"
                      ><br />{{ einzelbestellung.Tee }} Päckli Tee à CHF
                      {{ store.tee_preis.toFixed(2) }}</span
                    >
                    <span v-if="einzelbestellung.Typ == 'Laden'"
                      ><br />{{ 1 }} x Lieferpauschale</span
                    >
                  </td>
                  <td valign="top" class="text-right">
                    CHF
                    {{
                      (
                        einzelbestellung.Menge *
                        (Number(store.PreisBecher) +
                          Number(store.PreisProLiter))
                      ).toFixed(2)
                    }}
                    <span v-show="einzelbestellung.Konfi_gr > 0"
                      ><br />CHF
                      {{
                        (
                          einzelbestellung.Konfi_gr * store.konfi_gross_preis
                        ).toFixed(2)
                      }}</span
                    >
                    <span v-show="einzelbestellung.Konfi_kl > 0"
                      ><br />CHF
                      {{
                        (
                          einzelbestellung.Konfi_kl * store.konfi_klein_preis
                        ).toFixed(2)
                      }}</span
                    >
                    <span v-show="einzelbestellung.Tee > 0"
                      ><br />CHF
                      {{
                        (einzelbestellung.Tee * store.tee_preis).toFixed(2)
                      }}</span
                    ><span v-if="einzelbestellung.Lieferpauschale"
                      ><br />CHF
                      {{ einzelbestellung.Lieferpauschale.toFixed(2) }}</span
                    >
                  </td>
                  <td class="text-right" valign="bottom">
                    <b>{{ einzelbestellung.Betrag.toFixed(2) }}</b>
                  </td>
                </tr>
                <tr>
                  <td><b>Gesamttotal</b></td>
                  <td></td>
                  <td></td>
                  <td class="text-right">
                    <b>{{ total().toFixed(2) }}</b>
                  </td>
                </tr>
              </tbody></v-table
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
let buttoncolor = ref("primary");

let image = ref();

const { data } = await useFetch(
  '/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&view=b2b_rechnungen&filter={Kunde}="' +
    route.params.kunde +
    '"'
);
function total() {
  return data.value
    .map((item) => item.Betrag)
    .reduce((prev, curr) => prev + curr, 0);
}
function printdate(datum) {
  return new Date(datum).toLocaleDateString();
}

async function loadImage(qrdata) {
  image.value = await $fetch(
    "/api/qrcode?betrag=" +
      total() +
      "&Name=" +
      bezeichnung(qrdata, "Rechnung", "Name") +
      "&Strasse=" +
      bezeichnung(qrdata, "Rechnung", "Adresse") +
      "&Ort=" +
      bezeichnung(qrdata, "Rechnung", "PLZundOrt") +
      "&Bemerkungen=" +
      bezeichnung(qrdata, "Rechnung", "Name").replace("|", "") + // dieses Sonderzeichen gibt bei einigen Banken Fehlermeldungen beim Einzahlen
      " Rechnung vom " +
      store.heute.toLocaleDateString() +
      "&Rechnung_Referenz_Nummer=122"
  );
}
let params = computed(() => {
  return data.value.map((item) => {
      const container = {}; //refactor array, damit es für jeden Eintrag den Vorgaben von Airtable entspricht: {    "id": "reckBfjBRf0an97CE", "fields": {"Status": "etikette" }}
      container.id = item.Id;
      container.fields = {};
      container.fields.Status = "Rechnung";
      return container;
    })
    .slice(0, 9); //Airtable kann nur 10 Einträge aufs Mal umstellen auf "verschickt"
});

async function changeStatus() {
  console.log(params.value)
  await $fetch("/api/airtable_update", {
  method: "POST",
  body: params.value,
  });
  buttoncolor.value = "green";

 navigateTo('/admin')
}


</script>
