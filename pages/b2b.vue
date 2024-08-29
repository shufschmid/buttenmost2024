<template>
  <div>
    <v-container>
      <template v-if="store.authenticated">
        <v-card color="indigo" variant="flat"
          ><v-autocomplete
            v-model="Code"
            :items="Laeden"
            outlined
            placeholder="Start typing to Search"
            return-object
            label="Läden suchen"
          ></v-autocomplete></v-card
      ></template>
      <v-table v-if="store.authenticated">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Menge</th>
            <th>bereits bestellt</th>
            <th>noch verfügbar</th>
            <th>Menge Lieferwagen</th>
            <th>bereits bestellt Lieferwagen</th>
            <th>verfügbar Lieferwagen</th>
            <th>verfügbar Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="Details in AdminInfos" :key="Details.Datum">
            <td>{{ Details.Datum }}</td>
            <td>{{ Details.Menge }}</td>
            <td>{{ Details.bestellt }}</td>
            <td>{{ Details.verfuegbar }}</td>
            <td>{{ Details.MengeLieferwagen }}</td>
            <td>{{ Details.bestelltLieferwagen }}</td>
            <td>{{ Details.verfuegbarLieferwagen }}</td>
            <td>{{ Details.verfuegbarTotal }}</td>
          </tr>
        </tbody>
      </v-table>

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
      >test</v-alert>
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
            <div v-else-if="showpin && finalCheckError==false && finalCheckSuccess==false">
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
            <div v-else-if="finalCheckError==false && finalCheckSuccess==false">
              <v-banner
                class="m-0"
                color="pink-darken-1"
                icon="mdi-store"
                lines="one"
              >
                <v-banner-text> {{ firma }} <br /></v-banner-text>
              </v-banner>
              <v-banner
                class="m-0"
                color="pink-darken-1"
                icon="mdi-calendar"
                lines="one"
              >
                <v-banner-text class="bg-pink-darken-1">
                  Nächster möglicher Liefertermin:
                  {{ lieferdatum_angezeigt(nextPossibleShippingDay, tour)
                  }}<br />
                </v-banner-text>
              </v-banner>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-table v-if="!showpin">
              <tbody>
                <tr>
                  <td>
                    <v-text-field
                      variant="outlined"
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
                      variant="outlined"
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
                      variant="outlined"
                      v-model="konfi_gross"
                      label=""
                      Name="Konfi gross"
                      type="number"
                      :min="0"
                      max-width="20"
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
                  <td width="120px">
                    <v-text-field
                      dense
                      variant="outlined"
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
                  <td colspan="4">
                    <v-btn
                      color="success"
                      elevation="2"
                      block
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
const route = useRoute();
let showpin = ref(true);
let PINRules = [
  (value) => !!value || "PIN fehlt",
  (value) => /\d\d\d\d/.test(value) || "PIN ungültig",
];
let formValidity = ref(false);
let pin = ref();
let firma = ref();
let tour = ref();
let verfuegbareMenge = ref();
let verfuegbareMengeTour = ref();
let totalMengeOnShippingday = ref();
let totalMengeOnShippingdayTour = ref();
let nextPossibleShippingDay = ref();
let kistli = ref(2); //Voreinstellung
let konfi_gross = ref(0);
let konfi_klein = ref(0);
let tee = ref(0);
let verfuegbareMengeKistli = ref(2);
let finalCheckError = ref(false);
let finalCheckSuccess = ref(false);
let Bestaetigung = ref("");
let AdminInfos = ref([]);
const shippingDays = await $fetch(
  "/api/airtable_get?basis=Lieferdaten&view=b2b&sort=true"
);

async function checkPin() {
  let LadenURL =
    '/api/airtable_get/?basis=Verkaufsstellen&view=alle&filter={Code}="' +
    pin.value +
    '"';
  let { Geschaeft, Tour } = await $fetch(LadenURL);

  if (Geschaeft) {
    firma.value = Geschaeft;
    tour.value = Tour;
    nextPossibleShippingDay.value = await findNextPossibleShippingDay();
    showpin.value = false;
  }
}

async function getMenge(Datum) {
  let recordsURL =
    '/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&view=verfuegbare_menge&filter=DATESTR({Lieferdatum})="' +
    Datum +
    '"';
  const recordsList = await $fetch(recordsURL);
  if (recordsList.length > 0) {
    const einzelmengen = await recordsList.map(
      (einzelmenge) => einzelmenge.Menge
    );
    const einzelmengen_tour = await recordsList.map((einzelmenge) => {
      if (einzelmenge.Tour == tour.value) {
        return einzelmenge.Menge;
      } else {
        return 0;
      }
    });
    let einzelmengen_total = einzelmengen.reduce((acc, curr) => acc + curr);
    let einzelmengen_tour_total = einzelmengen_tour.reduce(
      (acc, curr) => acc + curr
    );

    return { total: einzelmengen_total, tour: einzelmengen_tour_total };
    //erklärung für diese Formel hier: https://www.linkedin.com/pulse/how-sum-total-from-array-object-properties-javascript-schouwenaar
  } else if (recordsList.Menge > 0) {
    return { total: recordsList.Menge, tour: recordsList.Menge };
  } else {
    return { total: 0, tour: 0 };
  }
}

async function findNextPossibleShippingDay() {
  let returnvalue = "";
  for (let i = 0; i < shippingDays.length; i++) {
    var current = new Date(shippingDays[i].Datum);
    if (current > store.heute) {
      let currentMenge = await getMenge(shippingDays[i].Datum); //liefert zurück: currentMenge.total & currentMenge.tour
      let verfuegbar = {
        total: shippingDays[i].Menge - currentMenge.total,
        tour: store.KapazitaetLieferwagen - currentMenge.tour,
      };
      let verfuegbarMaximal =
        verfuegbar.total > verfuegbar.tour ? verfuegbar.tour : verfuegbar.total;

      AdminInfos.value.push({
        Datum: shippingDays[i].Datum,
        Menge: shippingDays[i].Menge,
        bestellt: currentMenge.total,
        verfuegbar: verfuegbar.total,
        MengeLieferwagen: store.KapazitaetLieferwagen,
        bestelltLieferwagen: currentMenge.tour,
        verfuegbarLieferwagen: verfuegbar.tour,
        verfuegbarTotal: verfuegbarMaximal,
      });
      if (verfuegbarMaximal > store.liter_pro_kistli) {
        returnvalue = shippingDays[i].Datum;
        verfuegbareMengeKistli.value = Math.floor(
          verfuegbarMaximal / store.liter_pro_kistli
        );
        if (verfuegbareMengeKistli.value < 3) {
          kistli.value = verfuegbareMengeKistli.value;
        }
        break;
      }
    }
  }
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

function lieferdatum_angezeigt(nextPossibleShippingDay, tour) {
  let date = new Date(nextPossibleShippingDay);
  return date.toLocaleDateString("de-DE");
}
async function order() {
  const finalCheckMenge = await getMenge(nextPossibleShippingDay.value);
  
  if (
    (kistli.value * store.liter_pro_kistli)>finalCheckMenge.total || (kistli.value * store.liter_pro_kistli)>finalCheckMenge.tour
  ) {
    finalCheckError.value = true;
    showpin.value = true;

    console.log(
      "---Log-Status fehlerhaft, Logik eventuell korrekt. Menge hat sich verändert, Eintrag nicht erstellt. Verfügbare Menge beim Start Bestellvorgang war: " +
        totalMengeOnShippingday.value +
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
        Betrag: total(),
        Menge: kistli.value * store.liter_pro_kistli,
        Lieferdatum: nextPossibleShippingDay.value, //formatiert in yyyy-mm-dd
        Konfi_gr: konfi_gross.value,
        Konfi_kl: konfi_klein.value,
        Tee: tee.value,
        Lieferpauschale: store.lieferpauschale,
        Tour: tour.value,
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
      Tour: tour.value,
    });
    showpin.value = true;
  }
}

const { data } = await useFetch(
  "/api/airtable_get?basis=Verkaufsstellen&view=website&verkaufsstellensort=true"
);
const items = await JSON.parse(JSON.stringify(data.value));
let Laeden = items.map((data) => ({ title: data.Laden, value: data.Code }));
let Code = ref();

watch(Code, (newCode) => {
  pin.value = newCode.value;
});
</script>
