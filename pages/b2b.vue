<template>
  <div>
    Firma: {{ firma }}<br />
    <hr />
    Nächster möglicher Versandtag: {{ nextPossibleShippingDay }}
    <hr />
    Verfüegbarkeit: {{ verfuegbareMenge }}
    <v-container class="pt-12">
      <v-form v-model="formValidity" name="bestellung" ref="form"
        ><v-row v-show="showpin"
          ><v-spacer />
          <v-col cols="6" md="6" v-show="store.isSaisonFirmen">
            Dieser Bereich ist unseren bestehenden Firmenkunden vorbehalten.
            Bitte identifizieren Sie sich mit dem vierstelligen PIN-Code, den
            wir Ihnen mitgeteilt haben. Bei Fragen: Tel 061 751 48 21.
            Saisonstart: {{ store.SaisonStartStringFirmen }}. </v-col
          ><v-col cols="6" md="6" v-show="!store.isSaisonFirmen">
            Dieser Bereich ist während der Buttenmost-Saison unseren bestehenden
            Firmenkunden vorbehalten. Diese können sich mittels eines PIN-Codes,
            den wir Ihnen vor Saisonstart zustellen, identifizieren. Bei Fragen:
            Tel 061 751 48 21.
          </v-col>
          <v-spacer
        /></v-row>
        <v-row v-show="store.isSaisonFirmen && showpin"
          ><v-spacer />
          <v-col cols="6" md="2">
            <v-text-field
              dense
              v-model="pin"
              label="PIN"
              Name="PIN"
              :rules="PINRules"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="2">
            <v-btn
              color="primary"
              elevation="2"
              large
              @click="checkPin"
              :disabled="!formValidity"
              :loading="loading"
            >
              Anmelden</v-btn
            > </v-col
          ><v-spacer
        /></v-row>
        <v-row
          ><v-col cols="12" md="12">
            <v-simple-table>
              <tbody>
                <tr>
                  <td>
                    <v-text-field
                      v-model="kistli"
                      Name="Konfi gross"
                      type="number"
                      dense
                    ></v-text-field>
                  </td>
                  <td>
                    Kistli Buttenmost ({{ store.liter_pro_kistli }} Liter) à CHF
                    {{
                      (
                        (store.PreisProLiter + store.PreisBecher) *
                        store.liter_pro_kistli
                      ).toFixed(2)
                    }}
                  </td>
                  <td class="text-right">
                    {{
                      (
                        (store.PreisProLiter + store.PreisBecher) *
                        store.liter_pro_kistli *
                        kistli
                      ).toFixed(2)
                    }}
                  </td>
                  <td>CHF</td>
                </tr>
                <tr>
                  <td>
                    <v-text-field
                      dense
                      v-model="konfi_klein"
                      label=""
                      Name="Konfi klein"
                      type="number"
                    ></v-text-field>
                  </td>
                  <td>
                    Gläser Konfi klein à CHF
                    {{ store.konfi_klein_preis.toFixed(2) }}
                  </td>

                  <td class="text-right">
                    {{ (konfi_klein * store.konfi_klein_preis).toFixed(2) }}
                  </td>
                  <td>CHF</td>
                </tr>
                <tr>
                  <td>
                    <v-text-field
                      dense
                      v-model="konfi_gross"
                      label=""
                      Name="Konfi gross"
                      type="number"
                    ></v-text-field>
                  </td>
                  <td>
                    Gläser Konfi gross à CHF
                    {{ store.konfi_gross_preis.toFixed(2) }}
                  </td>

                  <td class="text-right">
                    {{ (konfi_gross * store.konfi_gross_preis).toFixed(2) }}
                  </td>
                  <td>CHF</td>
                </tr>
                <tr>
                  <td>
                    <v-text-field
                      dense
                      v-model="tee"
                      Name="Tee"
                      type="number"
                    ></v-text-field>
                  </td>
                  <td>Säckli Tee à CHF {{ store.tee_preis.toFixed(2) }}</td>

                  <td class="text-right">
                    {{ (tee * store.tee_preis).toFixed(2) }}
                  </td>
                  <td>CHF</td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>Lieferpauschale</td>

                  <td class="text-right">
                    {{ store.lieferpauschale.toFixed(2) }}
                  </td>
                  <td>CHF</td>
                </tr>
                <tr>
                  <td>Total:</td>
                  <td></td>
                  <td class="text-right">
                    {{ total() }}
                  </td>
                  <td>CHF</td>
                </tr>
                <!-- <tr>
                      <td>Total vor Einheitspreis:</td>
                      <td></td>
                      <td class="text-right">{{ total_alt.toFixed(2) }}</td>
                      <td>CHF</td>
                    </tr> -->
              </tbody>
            </v-simple-table> </v-col
          ></v-row>
        </v-form
    ></v-container>
  </div>
</template>

<script setup>
const store = useButtenmostStore();
const showpin = ref(true);
let PINRules = [
  (value) => !!value || "PIN fehlt",
  (value) => /\d\d\d\d/.test(value) || "PIN ungültig",
];
let formValidity = ref(false);
let pin = ref();
let firma = ref();
let verfuegbareMenge = ref();
let nextPossibleShippingDay = ref();
let kistli = ref(2); //Voreinstellung
let konfi_gross = ref(0);
let konfi_klein = ref(0);
let tee = ref(0);

async function checkPin() {
  let LadenURL =
    '/api/airtable_get/?basis=Verkaufsstellen&view=website&filter={Code}="' +
    pin.value +
    '"';
  const { Laden } = await $fetch(LadenURL);
  firma.value = Laden;

  nextPossibleShippingDay.value = store.MoeglicheLieferdatenFirmen;

  let MengeURL =
    '/api/airtable_get/?basis=Table 1&view=verfuegbare_menge&filter=DATESTR({Lieferdatum})="' +
    store.MoeglicheLieferdaten[0].value +
    '"&specialfields=verfuegbare_menge';

  const Menge = await $fetch(MengeURL);

  //total bereits an diesem Tag ausgegebene Menge
  const einzelmengen = Menge.map((einzelmenge) => einzelmenge.Menge);
  if (einzelmengen.length > 0) {
    verfuegbareMenge.value = einzelmengen.reduce((acc, curr) => acc + curr);
  } else {
    verfuegbareMenge.value = "max";
  }

  //erklärung für diese Formel hier: https://www.linkedin.com/pulse/how-sum-total-from-array-object-properties-javascript-schouwenaar
}

let bestellung = computed(() => {
  return "das ist der nächste Tag unabhängig von Menge/Verfügbarkeit";
});

function preis() {
  return (
    kistli.value *
    store.liter_pro_kistli *
    (store.PreisProLiter + store.PreisBecher)
  );
}

function calculateBooksMessage() {
  return author.books.length > 0 ? "Yes" : "No";
}

function total() {
  return (
    kistli.value *
      store.liter_pro_kistli *
      (store.PreisProLiter + store.PreisBecher) +
    konfi_gross.value * store.konfi_gross_preis +
    konfi_klein.value * store.konfi_klein_preis +
    tee.value * store.tee_preis +
    store.lieferpauschale
  );
}
</script>
