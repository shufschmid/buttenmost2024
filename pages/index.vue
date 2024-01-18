<script setup lang="js">
import { setMapStoreSuffix } from 'pinia';

const store = useButtenmostStore();
let selected = ref(store.possibleShippingDays[0])
let menge = ref(store.defaultMenge)

let preis = computed(() => {
  return (menge.value * store.preis)
})


let porto = computed(() => {
  return menge < 10 ? 15 : 27
})

let verpackung = computed(() =>{
  let i = 0;
  while (store.verpackungsPreise[i].menge < menge.value) {
    i++;
  }
  return store.verpackungsPreise[i].preis
});




let total = computed(() => {
  return 100
})
</script>

<template>
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
        <td class="text-right">{{ total.toFixed(2) }}</td>
        <td>CHF</td>
      </tr>
    </tbody>
  </v-simple-table>
  <hr />

  sel: {{ selected }}
  <v-select
    label="Select"
    :items="store.possibleShippingDays"
    v-model="selected"
    return-object
  ></v-select>

  <v-btn>test Page</v-btn>
  <Signup v-show="store.isSaison"></Signup>

  possible shipping days:
  {{ store.possibleShippingDays }}
  Saisonstartdate:

  {{ store.saisonStartString }}, isSaison: {{ store.isSaison }}

  <Verkaufsstellen></Verkaufsstellen>
</template>
