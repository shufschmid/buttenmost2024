


<template>
  <div>
    <v-toolbar class="d-print-none">
        <template v-slot:prepend>
          <v-btn icon="mdi-table-edit"></v-btn>
        </template>
        <v-btn
          @click="changeStatus"
          :color="buttoncolor"
        >
          Status auf "Rechnung" setzen</v-btn
        ><v-btn
          @click="loadImage(data)"
        >
          QR-Code laden</v-btn
        >
      </v-toolbar>
      
  <v-btn>Admin</v-btn></div>
</template>
<script setup>
  definePageMeta({
    middleware: 'auth' // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
})

const store = useButtenmostStore();
</script>

