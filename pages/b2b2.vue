<template>
  <div>
    <v-container>
      
      <v-form v-model="formValidity" name="bestellung" ref="form"
        >
            
  <template v-show="tab == 'one'">
    <v-card title="Step One" flat>Bestehende Wiederverkäufer beliefern wir dreimal pro Woche mit frischem Buttenmost gegen Rechnung. Bitte identifizieren Sie sich mit dem PIN-Code, den wir ihnen per Post zugestellt haben. Bei Fragen: Tel 061 751 48 21.<br/><br/> Alle anderen Grosskunden können Buttenmost in Kistli à 14 Liter gegen Vorauskasse zum Abholen hier bestellen. Bitte wählen Sie das Abholdatum sowie die Anzahl Kistli und bezahlen Sie im Anschluss per Twint oder Kreditkarte.  
              <v-alert v-show="no" closable text="Achtung: die letzten Bestellungen nehmen wir bis am 7. November entgegen mit Liefertermin am 11. oder 12. November." type="info"></v-alert>
              
             
              
              <v-banner
                class="m-0"
                color="pink-darken-1"
                icon="mdi-calendar"
                lines="one"
              >
              <v-select
            label="Datum"
            :items="shippingDays"
            v-model="Lieferdatum"
            return-object
          ></v-select>
                
              </v-banner>
            
          
            <v-table>
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
                      hint="Achtung, Konfi gibt es nur noch in Kartons à 6 Gläser"
                    ></v-text-field>
                  </td>
                  <td>
                    Karton Konfi klein (6 Gläser) à CHF à CHF
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
                      max-width="5"
                      hint="Achtung, Konfi gibt es nur noch in Kartons à 6 Gläser"
                    ></v-text-field>
                  </td>
                  <td>
                    Karton Konfi gross (6 Gläser) à CHF
                    {{ store.konfi_gross_preis.toFixed(2) }}
                  </td>

                  <td class="text-right">
                    {{ (konfi_gross * store.konfi_gross_preis).toFixed(2) }}
                  </td>
                  <td>CHF</td>
                </tr>
              
                <!-- <tr>
                  <td>1</td>
                  <td>Lieferpauschale</td>

                  <td class="text-right">
                    {{ store.lieferpauschale.toFixed(2) }}
                  </td>
                  <td>CHF</td>
                </tr> -->
                <tr>
                  <td>Zwischentotal:</td>
                  <td></td>
                  <td class="text-right">
                    {{ total().toFixed(2) }}
                  </td>
                  <td>CHF</td>
                </tr>
                </tbody></v-table>





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
                    <v-btn
                      color="success"
                      elevation="2"
                      block
                      @click="tab = 'two'"
                    >weiter</v-btn>
                  </v-card>
  </template>
<template v-show="tab == 'two'">
    <v-card title="Step Two" flat>Läden, die regelmässig von uns beliefert werden und auf Rechnung bestellen möchten, bitte Code eingeben. Für Bestellungen auf Vorauskasse und zum Abholen Code-Feld leer lassen und "weiter" klicken.
      
      
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
                <v-btn
                      color="success"
                      elevation="2"
                      block
                      @click="tab = 'three'"
                    >weiter ohne Anmeldung</v-btn>
              </v-container></v-card>
  </template>
  <template v-show="tab == 'three'">
    <v-card title="Step Three" flat>
<v-row>
    
                <v-col cols="6">
                  <v-text-field
                    dense
                    v-model="Vorname"
                    label="Vorname"
                    name="Vorname"
                    :rules="nichtLeer"
                    required
                  ></v-text-field></v-col
                ><v-col cols="6">
                  <v-text-field
                    dense
                    v-model="Nachname"
                    label="Name"
                    name="Nachname"
                    :rules="nichtLeer"
                  ></v-text-field>
                </v-col> </v-row
              ><v-row dense>
                <v-col cols="12">
                  <v-text-field
                    dense
                    v-model="Adresse"
                    label="Adresse"
                    name="Adresse"
                    :rules="nichtLeer"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    dense
                    v-model="Adresszusatz"
                    label="Adresszusatz"
                    name="Adresszusatz"
                  ></v-text-field>
                </v-col> </v-row
              ><v-row dense>
                <v-col cols="3" md="3">
                  <v-text-field
                    dense
                    v-model="PLZ"
                    label="PLZ"
                    Name="PLZ"
                    :rules="PLZRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="9" md="9">
                  <v-text-field
                    dense
                    v-model="Ort"
                    label="Ort"
                    name="Ort"
                    :rules="nichtLeer"
                    required
                  ></v-text-field> </v-col></v-row
              ><v-row dense>
                <v-col cols="12">
                  <v-text-field
                    dense
                    v-model="Email"
                    label="E-mail"
                    name="Email"
                    :rules="EmailRules"
                    required
                  ></v-text-field>
                  <v-textarea
                    dense
                    v-model="Bemerkungen"
                    name="Bemerkungen"
                    label="Bemerkungen"
                    auto-grow
                    rows="1"
                  ></v-textarea> </v-col
              ></v-row>
            
            
            </v-card>
  </template>
  <template v-show="tab == 'four'">
     <v-card title="Step four" flat></v-card>
    {{firma}} 
  </template>
  <v-btn
                      color="success"
                      elevation="2"
                      block
                      @click="tab = 'two'"
                    >Bestellen</v-btn>

  
            
              
              
        
      </v-form></v-container
    >
  </div>
             
  
   
</template>
<script setup>
const store = useButtenmostStore();
const route = useRoute();
let tab = ref("one");
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
    tab.value="four";
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
  } else if (recordsList.Menge > 0 && recordsList.Menge > 0) {
    return { total: recordsList.Menge, tour: recordsList.Menge };
  } else {
    return { total: 0, tour: 0 };
  }
}

async function findNextPossibleShippingDay() {
  let returnvalue = "";
  for (let i = 0; i < shippingDays.length; i++) {
    var current = new Date(shippingDays[i].Datum);
    console.log("current", current);
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
let Lieferdatum = ref();
Lieferdatum.value = shippingDays[0].Datum;
function lieferdatum_angezeigt(nextPossibleShippingDay, tour) {
  let date = new Date(nextPossibleShippingDay);
  return date.toLocaleDateString("de-DE");
}
async function order() {
  const finalCheckMenge = await getMenge(nextPossibleShippingDay.value);

  console.log(
    "kistli:" + kistli.value + "finalcheckmenge" + finalCheckMenge.total+"verfuegbare kistli total:"+verfuegbareMengeKistli.value
  );
  // if (
  //   kistli.value * store.liter_pro_kistli >
  //     verfuegbareMengeKistli.value * store.liter_pro_kistli -
  //       finalCheckMenge.total ||
  //   kistli.value * store.liter_pro_kistli >
  //     verfuegbareMengeKistli.value * store.liter_pro_kistli -
  //       finalCheckMenge.tour
  // ) {
  //   finalCheckError.value = true;
  //   showpin.value = true;

  //   console.log(
  //     "---Log-Status fehlerhaft, Logik eventuell korrekt. Menge hat sich verändert, Eintrag nicht erstellt. Verfügbare Menge beim Start Bestellvorgang war: " +
  //       totalMengeOnShippingday.value +
  //       ", Verfügbare Menge Neu: " +
  //       finalCheckMenge.total
  //   );
  // } else {
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
  //}
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
