<script setup lang="js">

const emits = defineEmits(["formValidity"])


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
</script>

<template>
  Test : Validty: {{ formValidity }}
  <v-container>
    <v-form v-model="formValidity" @update:modelValue="$emit('formValidity',formValidity)">
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
</template>
