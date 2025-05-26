<script setup lang="js">
const store = useButtenmostStore();
let Lieferdatum = ref()

onMounted(() => {
  Lieferdatum.value = shippingDays[0] // <div>
})

let Menge = ref(store.StandardMenge)
let abholen = ref(false)

let Vorname = ref("")
let Nachname = ref("")
let Adresse = ref("")
let Adresszusatz = ref("")
let PLZ = ref("")
let Ort = ref("")
let Email = ref("")
let Bemerkungen = ref("")
let formValidity= ref(false)

let nichtLeer = [value => !!value || "Angabe wird benötigt"]
let PLZRules= [
        value => !!value || "Postleitzahl fehlt",
        value => /\d\d\d\d/.test(value) || "Postleitzahl ungültig"
      ]
let EmailRules= [
        value => !!value || "E-Mail-Adresse wird benötigt",
        value =>
          value.indexOf("@") !== 0 || "Gültige E-Mail-Adresse wird benötigt ",
        value => value.includes("@") || "Gültige E-Mail-Adresse wird benötigt",
        value => value.includes(".") || "Gültige E-Mail-Adresse wird benötigt",
        value =>
          value.indexOf(".") <= value.length - 2 ||
          "Gültige E-Mail-Adresse wird benötigt"
      ]

let ButtenmostPreis = computed(() => {
  return (Menge.value * store.preisDirektverkauf)
})

let Porto = computed(() => {
  if(abholen.value) return 0
  else{
  return Menge.value < 10 ? 17.5 : 27}
})

let Kleinmengenzuschlag = computed(() => {
  if(Menge.value<store.Kleinmengenzuschlag[0].Grenze && abholen.value==false){
    return {"Bezeichnung":"Kleinmengenzuschlag","value":store.Kleinmengenzuschlag[0].value}
  }
  else if(Menge.value<store.Kleinmengenzuschlag[1].Grenze){
    return {"Bezeichnung":"Kleinmengenzuschlag","value":store.Kleinmengenzuschlag[1].value}}
  else if(Menge.value > store.Rabatt[1].Grenze){
    return {"Bezeichnung":"Rabatt","value":ButtenmostPreis.value*store.Rabatt[1].value
}}
else if(Menge.value > store.Rabatt[0].Grenze){
    return {"Bezeichnung":"Rabatt","value":ButtenmostPreis.value*store.Rabatt[0].value
}}
  else return {"Bezeichnung":"Kleinmengenzuschlag","value":0}

})

let Verpackungsindex = computed(() =>{
  if(abholen.value) return 7 //der siebte index ist = 0
  
  let i = 0;
  while (store.Verpackung[i].Menge <= Menge.value) {
    i++;
  }
  return i
});

let Betrag = computed(() => {
  return(Porto.value + ButtenmostPreis.value + Kleinmengenzuschlag.value.value + store.Verpackung[Verpackungsindex.value].Preis)
})

const shippingDays = await $fetch(
  "/api/airtable_get?basis=Lieferdaten&view=post&sort=true")
;

async function order() {
  const airtable = await $fetch('/api/airtable', {
    method: 'POST',
    body: {
      Email: Email.value,
      Vorname: Vorname.value,
      Betrag: Betrag.value,
      Name: Nachname.value,
      Adresse: Adresse.value,
      Adresszusatz: Adresszusatz.value,
      PLZ: PLZ.value,
      Ort: Ort.value,
      Menge: Menge.value,
      Lieferdatum: Lieferdatum.value.value,
      Notes:Bemerkungen.value,
      Verpackung: store.Verpackung[Verpackungsindex.value].Preis,
      Porto:Porto.value,
      Lieferpauschale:Kleinmengenzuschlag.value.value,
      Gewicht: (store.Verpackung[Verpackungsindex.value].Gewicht+(Menge.value*1000)),
      Status: "bestellt",
      Typ: "Post"
    }
  })
  console.log("Bestellung erfolgreich in Airtable eingetragen, ID: "+airtable.body)

  const payrexx = await $fetch('/api/payrexx', {
    method: 'POST',
    body: {
      Email: Email.value,
      Vorname: Vorname.value,
      Name: Nachname.value,
      Betrag: Betrag.value,
      Menge: Menge.value,
      Adresse: Adresse.value,
      PLZ: PLZ.value,
      Ort: Ort.value,
      Lieferdatum: Lieferdatum.value.value,
      AirtableRecordID: airtable.body
    }
  })
  console.log("Payrexx Gateway erfolgreich eröffnet: "+payrexx.body)
  window.location.href = payrexx.body;
}
</script>

<template>
  <v-container class="pa-6" fluid>

    <!-- erstens Unterscheidung: per Post oder zum Abholen? Post: normales Formular
      Zum Abholen = zweite Unterscheidung: 
      kleinere Mengen in Bechern = vorbeikommen. 
      grössere Mengen: 14 x in 1-Liter Becher à CHF ... (oder ein mehrfaches davon): jeden DI/DO/SA
      beliebige Menge in einzelnem Gefäss: nur an folgenden Daten möglich: Post-Daten  -->


    Ab {{ store.SaisonStartString }} bis Anfangs November ist unser frischer
    Buttenmost wieder bei uns am
    <a href="https://goo.gl/maps/vfXWt5riNgEBkc5eA">Kirchrain 17 in Hochwald</a>
    erhältlich. Preis Direktverkauf:
    {{ store.preisDirektverkauf.toFixed(2) }} Franken pro Liter. Ebenfalls
    angeboten wird unser Buttenmost an diversen Märkten sowie
    <a href="verkaufsstellen/">in über 70 Läden in der ganzen Region.</a>

    <br /><br />
    <h2 id="onlineshop">Online-Shop</h2>
    Wir verschicken Buttenmost ab zwei Liter per A-Post gegen Vorauskasse, nach
    Eingabe Ihrer Bestellung können Sie mit Kreditkarte oder per Twint
    bezahlen. Sie können den Buttenmost auch vorbestellen und in Hochwald abholen (im Kessel).<br /><br />
    <v-alert
      closable
      text="Achtung: Die Buttenmost-Saison 2024 ist vorbei. Wir nehmen keine Online-Bestellungen mehr entgegen."
      type="info" v-show="false"
    ></v-alert>
    <v-alert
      closable
      text="Kleinstmengen können Sie bei uns ohne Vorbestellung und Vorauskasse abholen."
      type="info" v-show="abholen && Menge < 8"
    ></v-alert>
    <v-container class="pa-0 ma-0" v-show="true">
      <v-row
        ><v-col cols="12" md="5"
          ><v-spacer />Wählen Sie hier die gewünschte Menge aus:<br />
          <v-slider
            v-model="Menge"
            dense
            step="1"
            thumb-label="always"
            hint="Regler verstellen, um Menge anzupassen"
            :max="store.MaximumMenge"
            :min="store.MinimumMenge"
            :value="Menge"
            persistent-hint
          ></v-slider>

          <table style="table-layout: fixed; border: 1px" width="100%">
            <tbody>
              <tr>
                <td>Menge:</td>
                <td class="text-right">{{ Menge }}</td>
                <td>Liter</td>
              </tr>
              <tr>
                <td>Preis:</td>
                <td class="text-right">
                  {{ ButtenmostPreis.toFixed(2) }}
                </td>
                <td>CHF</td>
              </tr>
              <tr>
                <td>Porto/Verpackung:</td>
                <td class="text-right">
                  <!-- zeigt Porto/Verpackung einzeln an, kann gelöscht werden{{ porto.toFixed(2) }} + {{ verpackungneu.toFixed(2) }} = -->
                  {{
                    (Porto + store.Verpackung[Verpackungsindex].Preis).toFixed(
                      2
                    )
                  }}
                </td>
                <td>CHF</td>
              </tr>
              <tr :class="Menge > store.Rabatt[0].Grenze ? 'text-red' : ''">
                <td>{{ Kleinmengenzuschlag.Bezeichnung }}</td>
                <td class="text-right">
                  {{ Kleinmengenzuschlag.value.toFixed(2) }}
                </td>
                <td>CHF</td>
              </tr>
              <tr>
                <td>Total:</td>
                <td class="text-right">
                  {{ Betrag.toFixed(2) }}
                </td>
                <td>CHF</td>
              </tr>
            </tbody>
          </table> 
          <v-checkbox v-model="abholen" label="Ich hole den Buttenmost am ausgewählten Datum in Hochwald ab"></v-checkbox></v-col
        ><v-col cols="12" md="6">
          <!-- Buttenmost ist ein Frischprodukt. Wenn Sie jetzt bestellen,
          verschicken wir den Buttenmost am: -->
          <v-select
            label="Datum"
            :items="shippingDays"
            v-model="Lieferdatum"
            return-object
          ></v-select>
          
          <v-container>
            <v-form v-model="formValidity">
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
            </v-form>
          </v-container><v-alert
      closable
      text="Achtung, Sie haben die Option zum Selbstabholen gewählt. Das Porto entfällt, aber Sie müssen den Buttenmost am gewählten Datum am Kirchrain 17 in Hochwald abholen."
      type="info" v-show="abholen"
    ></v-alert>

          <v-spacer /> </v-col></v-row
      ><v-row
        ><v-spacer />
        <v-col>
          
          <v-btn
            color="success"
            elevation="2"
            size="x-large"
            @click="order"
            :disabled="!formValidity"
            :loading="loading"
          >
            Jetzt bestellen</v-btn
          > </v-col
        ><v-spacer
      /></v-row>
    </v-container>
  </v-container>
</template>
