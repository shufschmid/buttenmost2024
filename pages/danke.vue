<template>
  <v-container
    ><v-row
      ><v-col cols="12">
        <v-alert
        v-show="route.query.fehler"
        color="error"
        icon="$error"
        title="Fehler bei der Bezahlung"
      >Die Bezahlung ist fehlgeschlagen. Bitte versuchen Sie es erneut.</v-alert>
      <v-alert
        v-show="route.query.success"
        color="success"
        icon="$success"
        title="Bestellung erfolgreich"
      >Die Bestellung wurde entgegengenommen. <div v-show="route.query.kunde">Sie erhalten in Kürze eine Bestätigung an die E-Mail-Adresse {{ route.query.kunde }}. Herzlichen Dank!</div>
        </v-alert>
        </v-col
    ></v-row>
  </v-container>
  
</template>
<script setup>
const route = useRoute()
</script>
