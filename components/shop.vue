<script setup lang="js">
const store = useButtenmostStore();
let Lieferdatum = ref(store.MoeglicheLieferdaten[0])
let Menge = ref(store.StandardMenge)

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
  return (Menge.value * store.PreisProLiter)
})

let Porto = computed(() => {
  return Menge.value < 10 ? 15 : 27
})

let Kleinmengenzuschlag = computed(() => {
  if(Menge.value<store.Kleinmengenzuschlag.Grenze){
    return {"Bezeichnung":"Kleinmengenzuschlag","value":store.Kleinmengenzuschlag.Betrag}
  }
  else if(Menge.value < store.Kleinmengenzuschlag.GrenzeReduziert){
  return {"Bezeichnung":"Kleinmengenzuschlag","value":store.Kleinmengenzuschlag.BetragReduziert}}
  else if(Menge.value > store.Rabatt.Grenze){
    return {"Bezeichnung":"Rabatt","value":ButtenmostPreis.value*store.Rabatt.value
}}
  else return {"Bezeichnung":"Kleinmengenzuschlag","value":0}

})

let Verpackungsindex = computed(() =>{
  let i = 0;
  while (store.Verpackung[i].Menge <= Menge.value) {
    i++;
  }
  return i
});

let Betrag = computed(() => {
  return(Porto.value + ButtenmostPreis.value + Kleinmengenzuschlag.value.value + store.Verpackung[Verpackungsindex.value].Preis)
})

async function order() {
  console.log(Verpackung.Preis)
  const order = await $fetch('/api/order', {
    method: 'POST',
    body: { 
      Email: Email.value,
      Vorname: Vorname.value,
      Betrag: Betrag.value,
      Name: Nachname.value,
      Adresse: Adresse,
      Adresszusatz: Adresszusatz,
      PLZ: PLZ,
      Ort: Ort,
      Menge: Menge,
      Lieferdatum: Lieferdatum,
      Notes:Bemerkungen,
      Verpackung: Verpackung.Preis,
      Porto:Porto.value,
      Lieferpauschale:Kleinmengenzuschlag.value,
      Gewicht: Verpackung.Gewicht,
      Status: "bestellt",
      Typ: "Post"
    }
  })
}
</script>

<template>
  <h2 id="onlineshop">Online-Shop (Versand nur CH):</h2>
  Jeweils am Dienstag verschicken wir den Buttenmost ab zwei Liter per Post. Wir
  verschicken den Buttenmost gegen Vorauskasse, nach Ihrer Bestellung können Sie
  mit Kreditkarte oder Twint bezahlen.
  <v-container>
    <v-row
      ><v-col cols="12" md="5"
        ><v-spacer />Wählen Sie hier die gewünschte Menge aus:<br />
        <v-slider
          v-model="Menge"
          dense
          :step="1"
          thumb-label="always"
          hint="Regler verstellen, um Menge anzupassen"
          :max="store.MaximumMenge"
          :min="store.MinimumMenge"
          :value="Menge"
          persistent-hint
        ></v-slider>
        <!-- Vergleich zu Preismodell 2023, kann gelöscht werden <v-simple-table dense class="pt-4">
          <tbody>
            <tr>
              <td>Menge:</td>
              <td class="text-right">{{ menge }}</td>
              <td>Liter</td>
            </tr>
            <tr>
              <td>Preis:</td>
              <td class="text-right">{{ preis.toFixed(2) }}</td>
              <td>CHF</td>
            </tr>
            <tr>
              <td>Porto/Verpackung:</td>
              <td class="text-right">
                {{ porto.toFixed(2) }} + {{ verpackung.toFixed(2) }} =
                {{ (porto + verpackung).toFixed(2) }}
              </td>
              <td>CHF</td>
            </tr>
            <tr>
              <td>Bearbeitungspauschale*:</td>
              <td class="text-right">
                {{ store.versandpauschale.toFixed(2) }}
              </td>
              <td>CHF</td>
            </tr>
            <tr>
              <td>Total:</td>
              <td class="text-right">
                {{
                  (porto + verpackung + preis + store.versandpauschale).toFixed(
                    2
                  )
                }}
              </td>
              <td>CHF</td>
            </tr>
          </tbody>
        </v-simple-table>
        <hr /> -->

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
                {{ ButtenmostPreis }}
              </td>
              <td>CHF</td>
            </tr>
            <tr>
              <td>Porto/Verpackung:</td>
              <td class="text-right">
                <!-- zeigt Porto/Verpackung einzeln an, kann gelöscht werden{{ porto.toFixed(2) }} + {{ verpackungneu.toFixed(2) }} = -->
                {{ (Porto + store.Verpackung[Verpackungsindex].Preis) }}
              </td>
              <td>CHF</td>
            </tr>
            <tr :class="Menge > store.Rabatt.Grenze ? 'text-red' : ''">
              <td>{{ Kleinmengenzuschlag.Bezeichnung }}</td>
              <td class="text-right">
                {{ Kleinmengenzuschlag.value }}
              </td>
              <td>CHF</td>
            </tr>
            <tr>
              <td>Total:</td>
              <td class="text-right">
                {{
                  Betrag
                }}
              </td>
              <td>CHF</td>
            </tr>
          </tbody>
        </table> </v-col
      ><v-col cols="12" md="5">
        Buttenmost ist ein Frischprodukt. Wenn Sie jetzt bestellen, verschicken
        wir den Buttenmost am:
        <v-select
          label="Select"
          :items="store.MoeglicheLieferdaten"
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
        </v-container>

        <v-spacer /> </v-col></v-row
    ><v-row>
      <v-col cols="12" md="12">
        <v-btn
          color="primary"
          elevation="2"
          large
          @click="order"
          :disabled="!formValidity"
          :loading="loading"
        >
          Jetzt bestellen</v-btn
        ></v-col
      ></v-row
    >
  </v-container>
</template>
