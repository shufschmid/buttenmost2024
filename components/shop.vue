<script setup lang="js">
import { setMapStoreSuffix } from 'pinia';

const store = useButtenmostStore();
let selected = ref(store.possibleShippingDays[0])
let menge = ref(store.defaultMenge)
let formValidity = ref(false)

let preis = computed(() => {
  return (menge.value * store.preis)
})

let porto = computed(() => {
  return menge.value < 10 ? 15 : 27
})

let kleinmengenzuschlag = computed(() => {
  if(menge.value<store.kleinmengenzuschlag.grenze){
    return {"bezeichnung":"Kleinmengenzuschlag","value":store.kleinmengenzuschlag.betrag}
  }
  else if(menge.value < store.kleinmengenzuschlag.grenzeReduziert){
  return {"bezeichnung":"Kleinmengenzuschlag","value":store.kleinmengenzuschlag.betragReduziert}}
  else if(menge.value > store.rabatt.grenze){
    return {"bezeichnung":"Rabatt","value":(menge.value * store.preisDirektverkauf)*store.rabatt.value
}}
  else return {"bezeichnung":"Kleinmengenzuschlag","value":0}

})

let verpackung = computed(() =>{
  let i = 0;
  while (store.verpackungsPreise[i].menge <= menge.value) {
    i++;
  }
  return store.verpackungsPreise[i].preis
});

let verpackungneu = computed(() =>{
  let i = 0;
  while (store.verpackungsPreiseNeu[i].menge <= menge.value) {
    i++;
  }
  return store.verpackungsPreiseNeu[i].preis
});

let total = computed(() => {
  return (porto + verpackung + preis + store.versandpauschale)
})
</script>

<template>
  <h2 id="onlineshop">Online-Shop (Versand nur CH):</h2>
  Jeweils am Dienstag verschicken wir den Buttenmost ab zwei Liter per Post. Wir
  verschicken den Buttenmost gegen Vorauskasse, nach Ihrer Bestellung können Sie
  mit Kreditkarte oder Twint bezahlen.
  <v-container>
    <v-row
      ><v-spacer /><v-col cols="12" md="6"
        >Wählen Sie hier die gewünschte Menge aus:<br />
        <v-slider
          v-model="menge"
          dense
          :step="1"
          thumb-label="always"
          hint="Regler verstellen, um Menge anzupassen"
          :max="store.maximalMenge"
          :min="store.minimalMenge"
          :value="menge"
          persistent-hint
        ></v-slider>
        <v-simple-table dense class="pt-4">
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
        <hr />

        <v-simple-table dense class="pt-4">
          <tbody>
            <tr>
              <td>Menge:</td>
              <td class="text-right">{{ menge }}</td>
              <td>Liter</td>
            </tr>
            <tr>
              <td>Preis neu:</td>
              <td class="text-right">
                {{ (menge * store.preisDirektverkauf).toFixed(2) }}
              </td>
              <td>CHF</td>
            </tr>
            <tr>
              <td>Porto/Verpackung:</td>
              <td class="text-right">
                {{ porto.toFixed(2) }} + {{ verpackungneu.toFixed(2) }} =
                {{ (porto + verpackungneu).toFixed(2) }}
              </td>
              <td>CHF</td>
            </tr>
            <tr :class="menge > store.rabatt.grenze ? 'text-red' : ''">
              <td>{{ kleinmengenzuschlag.bezeichnung }}</td>
              <td class="text-right">
                {{ kleinmengenzuschlag.value.toFixed(2) }}
              </td>
              <td>CHF</td>
            </tr>
            <tr>
              <td>Total:</td>
              <td class="text-right">
                {{
                  (
                    porto +
                    verpackungneu +
                    menge * store.preisDirektverkauf +
                    kleinmengenzuschlag.value
                  ).toFixed(2)
                }}
              </td>
              <td>CHF</td>
            </tr>
          </tbody>
        </v-simple-table> </v-col
      ><v-spacer /><v-col cols="12" md="6">
        Buttenmost ist ein Frischprodukt. Wenn Sie jetzt bestellen, verschicken
        wir den Buttenmost am:
        <v-select
          label="Select"
          :items="store.possibleShippingDays"
          v-model="selected"
          return-object
        ></v-select>

        <adress
          @formValidity="(status) => (formValidity = status)"
        ></adress> </v-col></v-row
    ><v-row>
      <v-col cols="12" md="12">
        <v-btn
          color="primary"
          elevation="2"
          large
          @click="createPayrexxGataway"
          :disabled="!formValidity"
          :loading="loading"
        >
          Jetzt bestellen</v-btn
        ></v-col
      ></v-row
    >
  </v-container>

  <v-btn>test Page</v-btn>
  sel: {{ selected }}
</template>
