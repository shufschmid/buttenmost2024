<template>
  <div>


    <v-form name="rechnung" ref="form">
      <v-btn
        block
        color="primary"
        elevation="2"
        large
        @click="changeStatus"
        class="d-print-none"
      >
        Die ersten zehn Einträge als "verschickt" markieren</v-btn
      >
      <v-container
        id="rechnungen"
        style="page-break-after: always"
      >
        <v-row
          ><v-col cols="12"
            ><h1>Lieferschein</h1>
            to do: Name {{ lieferscheine.data.value.Name }} {{ lieferscheine.data.value.Vorname }} </v-col
          ><v-col cols="8" align-self="center">
            Datum: {{ printdate }}<br /><br />

            <!-- <div v-if="Kunde[0].b2b_Rechnungsadresse">
              <span v-html="Kunde[0].b2b_Rechnungsadresse[0]"></span>
            </div> -->

            <div>
              todo: Adresse etc
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
                <td valign="top">{{ lieferscheine.data.value.Lieferdatum }}</td>
                <td valign="top">
                  {{ lieferscheine.data.value.Menge }} Liter Buttenmost im Becher à CHF
                  {{ (store.PreisProLiter + store.PreisProBecher).toFixed(2) }}
                  <span v-show="lieferscheine.data.value.Konfi_gr > 0"
                    ><br />{{ lieferscheine.data.value.Konfi_gr }} grosse Gläser Konfitüre à
                    CHF {{ store.konfi_gross_preis.toFixed(2) }}</span
                  >
                  <span v-show="lieferscheine.data.value.Konfi_kl > 0"
                    ><br />{{ lieferscheine.data.value.Konfi_kl }} kleine Gläser Konfitüre à
                    CHF {{ store.konfi_klein_preis.toFixed(2) }}</span
                  >
                  <span v-show="lieferscheine.data.value.Tee > 0"
                    ><br />{{ lieferscheine.data.value.Tee }} Päckli Tee à CHF
                    {{ store.tee_preis.toFixed(2) }}</span
                  >
                  <span><br />{{ 1 }} x Lieferpauschale</span>
                </td>
                <td valign="top" class="text-right">
                  CHF
                  {{
                    (
                      lieferscheine.data.value.Menge *
                      (Number(store.PreisProBecher) +
                        Number(store.PreisProLiter))
                    ).toFixed(2)
                  }}
                  <span v-show="lieferscheine.data.value.Konfi_gr > 0"
                    ><br />CHF
                    {{
                      (lieferscheine.data.value.Konfi_gr * store.konfi_gross_preis).toFixed(2)
                    }}</span
                  >
                  <span v-show="lieferscheine.data.value.Konfi_kl > 0"
                    ><br />CHF
                    {{
                      (lieferscheine.data.value.Konfi_kl * store.konfi_klein_preis).toFixed(2)
                    }}</span
                  >
                  <span v-show="lieferscheine.data.value.Tee > 0"
                    ><br />CHF
                    {{ (lieferscheine.data.value.Tee * store.tee_preis).toFixed(2) }}</span
                  ><span
                    ><br />CHF {{ lieferscheine.data.value.Lieferpauschale.toFixed(2) }}</span
                  >
                </td>
              </tr>
              <tr>
                <td><b>Total</b></td>
                <td></td>
                <td class="text-right">
                  <b>{{ lieferscheine.data.value.Betrag.toFixed(2) }}</b>
                </td>
              </tr></v-table
            >
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    {{ lieferscheine.data }}
    {{ route.params.datum }}
  </div>
</template>
<script setup>
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});

function Bezeichnung(Bestellung) {
  if (Bestellung.Lieferung_Bezeichnung[0]) {
    return Bestellung.Lieferung_Bezeichnung[0];
  } else if (Bestellung.b2b_Geschaeft[0]) {
    return Bestellung.b2b_Geschaeft[0];
  } else {
    return Bestellung.Vorname + " " + Bestellung.Name;
  }
}

function Adresse(Bestellung) {
  if (Bestellung.Lieferung_Adresse[0]) {
    return Bestellung.Lieferung_Adresse[0];
  } else if (Bestellung.b2b_Adresse[0]) {
    return Bestellung.b2b_Adresse[0];
  } else {
    return Bestellung.Adresse;
  }
}

function PLZundOrt(Bestellung) {
  if (Bestellung.Lieferung_PLZ[0]) {
    return Bestellung.Lieferung_PLZ[0] + " " + Bestellung.Rechnung_Ort[0];
  } else if (Bestellung.b2b_PLZ[0]) {
    return Bestellung.b2b_PLZ[0] + " " + Bestellung.b2b_Ort[0];
  } else {
    return Bestellung.PLZ + " " + Bestellung.Ort;
  }
}

const store = useButtenmostStore();
const route = useRoute();

const lieferscheine = await useFetch(
  "/api/airtable_get/?basis=Table 1&recID=" + route.params.id
);

const printdate = computed(() => {
  return new Date(route.params.datum).toLocaleDateString();
});
</script>
