<template>
  <div>
    <v-container>
      <v-form v-model="formValidity" name="bestellung" ref="form"
        ><v-row>
          <v-col cols="12" md="6">
            <div v-if="!store.isSaisonFirmen">
              Dieser Bereich ist während der Buttenmost-Saison unseren
              bestehenden Firmenkunden vorbehalten. Diese können sich mittels
              eines PIN-Codes, den wir Ihnen vor Saisonstart zustellen,
              identifizieren. Bei Fragen: Tel 061 751 48 21. Saisonstart:
              {{ store.SaisonStartStringFirmen }}.
            </div>
            <div v-else-if="showpin">
              Dieser Bereich ist unseren bestehenden Firmenkunden vorbehalten.
              Bitte identifizieren Sie sich mit dem vierstelligen PIN-Code, den
              wir Ihnen mitgeteilt haben. Bei Fragen: Tel 061 751 48 21.
              <v-container>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model="pin"
                      label="PIN"
                      Name="PIN"
                      :rules="PINRules"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="8">
                    <v-btn
                      color="success"
                      elevation="2"
                      block
                      @click="checkPin"
                      :disabled="!formValidity"
                    >
                      Anmelden</v-btn
                    ></v-col
                  >
                </v-row>
              </v-container>
            </div>
            <div v-else>
              Firma: {{ firma }}<br />
              <hr />
              Nächster möglicher Versandtag: {{ nextPossibleShippingDay }}
              <hr />
              Verfüegbarkeit: {{ verfuegbareMenge }}
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-table v-if="!showpin">
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
                    {{ total().toFixed(2) }}
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
            </v-table>
          </v-col></v-row
        >
      </v-form></v-container
    >
  </div>
</template>

<script setup>
const store = useButtenmostStore();
let showpin = ref(true);
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

const shippingDays = await useFetch(
  "/api/airtable_get?basis=Lieferdaten&view=b2b"
);

async function checkPin() {
  let LadenURL =
    '/api/airtable_get/?basis=Verkaufsstellen&view=website&filter={Code}="' +
    pin.value +
    '"';
  const { Laden } = await $fetch(LadenURL);

  if (Laden) {
    firma.value = Laden;
    nextPossibleShippingDay = await findNextPossibleShippingDay();

    showpin.value = false;

    //erklärung für diese Formel hier: https://www.linkedin.com/pulse/how-sum-total-from-array-object-properties-javascript-schouwenaar
  }
}

async function getMenge(Datum) {
  let recordsURL =
    '/api/airtable_get/?basis=Table 1&view=verfuegbare_menge&filter=DATESTR({Lieferdatum})="' +
    Datum +
    '"';
  const recordsList = await $fetch(recordsURL);
  if (recordsList.length > 0) {
    const einzelmengen = await recordsList.map(
      (einzelmenge) => einzelmenge.Menge
    );
    if (einzelmengen.length > 0) {
      return einzelmengen.reduce((acc, curr) => acc + curr);
    } else {
      return 0;
    }
  }
}

async function findNextPossibleShippingDay() {
  let returnvalue = "";
  for (let i = 0; i < shippingDays.data.value.length; i++) {
    var current = new Date(shippingDays.data.value[i].Datum);

    if (current > store.heute) {
      let currentMenge = await getMenge(shippingDays.data.value[i].Datum);
      if (currentMenge > 0) {
        returnvalue = shippingDays.data.value[i].Datum;
        break;
      }
    }
  }

  console.log(returnvalue);
  return returnvalue;
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
