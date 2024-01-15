<script setup lang="js">
const store = useButtenmostStore();
let selected = ref(store.possibleShippingDays[0])
</script>

<template>
  <ul>
    <li v-for="item in store.possibleShippingDays">
      {{ item.text }}
    </li>
  </ul>

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
