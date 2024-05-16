<template>
  <div>
    <v-container>
      <v-alert
        v-show="finalCheckError"
        color="error"
        icon="$error"
        title="Menge nicht verfügbar"
        text="bitte neu einloggen und bestellen"
      ></v-alert>
      <v-alert
        v-show="finalCheckSuccess"
        color="success"
        icon="$success"
        title="Herzlichen Dank für Ihre Bestelung"
        :text="Bestaetigung"
      ></v-alert>
      <v-form v-model="formValidity" name="bestellung" ref="form"
        ><v-row>
          <v-col cols="12" md="6">{{ shippingDays }}
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
              Verfüegbare Menge: {{ verfuegbareMengeKistli }} Kistli ({{
                verfuegbareMenge
              }}
              Liter)
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
                      :max="verfuegbareMengeKistli"
                      :min="0"
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
                      :min="0"
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
                      :min="0"
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
                      :min="0"
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

                <tr>
                  <td>
                    <v-btn
                      color="primary"
                      elevation="2"
                      large
                      @click="order"
                      :disabled="!formValidity"
                      :loading="loading"
                    >
                      Jetzt bestellen</v-btn
                    >
                  </td>
                </tr>
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
let totalMengeOnShippinday = ref();
let nextPossibleShippingDay = ref();
let kistli = ref(2); //Voreinstellung
let konfi_gross = ref(0);
let konfi_klein = ref(0);
let tee = ref(0);
let verfuegbareMengeKistli = ref(2);
let finalCheckError = ref(false);
let finalCheckSuccess = ref(false);
let Bestaetigung = ref("");

const shippingDays = await $fetch(
  "/api/airtable_get?basis=Lieferdaten&view=b2b&sort=true"
);


async function checkPin() {
  let LadenURL =
    '/api/airtable_get/?basis=Verkaufsstellen&view=website&filter={Code}="' +
    pin.value +
    '"';
  let { Geschaeft } = await $fetch(LadenURL);

  if (Geschaeft) {
    firma.value = Geschaeft;
    nextPossibleShippingDay.value = await findNextPossibleShippingDay();
    showpin.value = false;
  }
}

async function getMenge(Datum) {
  let recordsURL =
    '/api/airtable_get/?basis=Table 1&view=verfuegbare_menge&filter=DATESTR({Lieferdatum})="' +
    Datum +
    '"';
  const recordsList = await $fetch(recordsURL);
  if (recordsList.length > 1) {
    const einzelmengen = await recordsList.map(
      (einzelmenge) => einzelmenge.Menge
    );
    return einzelmengen.reduce((acc, curr) => acc + curr);
    //erklärung für diese Formel hier: https://www.linkedin.com/pulse/how-sum-total-from-array-object-properties-javascript-schouwenaar
  } else if (recordsList.Menge > 0) {
    return recordsList.Menge;
  } else {
    return 0;
  }
}

async function findNextPossibleShippingDay() {
  let returnvalue = "";
  for (let i = 0; i < shippingDays.length; i++) {
    var current = new Date(shippingDays[i].Datum);
    if (current > store.heute) {
      let currentMenge = await getMenge(shippingDays[i].Datum);
      if (
        currentMenge < shippingDays[i].Menge &&
        shippingDays[i].Menge - currentMenge > store.liter_pro_kistli
      ) {
        returnvalue = shippingDays[i].Datum;
        verfuegbareMenge.value =
          shippingDays[i].Menge - currentMenge;
        verfuegbareMengeKistli.value = Math.floor(
          verfuegbareMenge.value / store.liter_pro_kistli
        );
        if (verfuegbareMengeKistli.value < 3) {
          kistli.value = verfuegbareMengeKistli.value;
        }
        totalMengeOnShippinday.value = shippingDays[i].Menge;
        break;
      }
    }
  }

  console.log("return");
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

async function order() {
  const finalCheckMenge = await getMenge(nextPossibleShippingDay.value);
  if (
    totalMengeOnShippinday.value <
    kistli.value * store.liter_pro_kistli + finalCheckMenge
  ) {
    finalCheckError.value = true;
    showpin.value = true;
    console.log(
      "---Log-Status fehlerhaft, Logik eventuell korrekt. Menge hat sich verändert, Eintrag nicht erstellt. Verfügbare Menge beim Start Bestellvorgang war: " +
        totalMengeOnShippinday.value +
        ", Verfügbare Menge Neu: " +
        finalCheckMenge
    );
  } else {
    const airtable = await $fetch("/api/airtable", {
      method: "POST",
      body: {
        Geschaeft: firma.value,
        Typ: "Laden",
        Status: "bestellt",
        Preis: total(),
        Menge: kistli.value * store.liter_pro_kistli,
        Lieferdatum: nextPossibleShippingDay.value, //formatiert in yyyy-mm-dd
        Konfi_gr: konfi_gross.value,
        Konfi_kl: konfi_klein.value,
        Tee: tee.value,
        Lieferpauschale: store.lieferpauschale,
      },
    });
    console.log(
      "Bestellung erfolgreich in Airtable eingetragen, ID: " + airtable.body
    );
    finalCheckSuccess.value = true;
    Bestaetigung.value = JSON.stringify({
      Lieferdatum: nextPossibleShippingDay.value, //formatiert in yyyy-mm-dd
      Geschaeft: firma.value,
      Preis: total(),
      Menge: kistli.value * store.liter_pro_kistli,
      KonfiGross: konfi_gross.value,
      KonfiKlein: konfi_klein.value,
      Tee: tee.value,
      Lieferpauschale: store.lieferpauschale,
    });
    showpin.value = true;
  }
}
</script>
