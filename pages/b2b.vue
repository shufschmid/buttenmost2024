<template>
  <div>
    <v-container class="pt-12">
      Firma: {{ firma }}<br /><hr/>
      Nächster möglicher Versandtag: {{ bestellung }}<hr/>
      Verfüegbarkeit: {{ verfuegbareMenge }}
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
          <v-col cols="6" md="1">
            <v-text-field
              dense
              v-model="pin"
              label="PIN"
              Name="PIN"
              :rules="PINRules"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="1">
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
        /></v-row> </v-form
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

async function checkPin() {

  
  const {Laden}  = await $fetch(
    '/api/airtable_get/?basis=Verkaufsstellen&view=website&filter={Code}="' +
      pin.value +
      '"');

  // let antwort = await fetch(
  //   '/api/airtable_get/?basis=Verkaufsstellen&view=website&filter={Code}="' +
  //     pin.value +
  //     '"'
  // ).then((res) => res.json());

  // firma.value = antwort.body[0].Laden
  firma.value= Laden
  console.log(Laden)

  //console.log(firma.value.body);
  const Menge = await $fetch(
    '/api/airtable_get/?basis=Table 1&view=verfuegbare_menge&filter=DATESTR({Lieferdatum})="2023-09-26"&specialfields=verfuegbare_menge'
  );

  //total bereits an diesem Tag ausgegebene Menge
  const einzelmengen = Menge.map((einzelmenge) => einzelmenge.Menge)
  verfuegbareMenge.value = einzelmengen.reduce((acc, curr) => acc + curr)
  
  //erklärung für diese Formel hier: https://www.linkedin.com/pulse/how-sum-total-from-array-object-properties-javascript-schouwenaar

}

let bestellung = computed(() => {
  return "das ist der nächste Tag unabhängig von Menge/Verfügbarkeit";
});
</script>
