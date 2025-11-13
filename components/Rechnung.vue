<template>
  <div>
    <v-form name="rechnung" ref="form">
<adminbar :is-rechnung="true">
  <template #actions>
    <v-switch color="primary" v-model="isLieferschein" label="Lieferschein" density="compact" class="mr-4"></v-switch><v-switch color="primary" v-model="isBetragErhalten" label="Betrag erhalten" density="compact" class="mr-4"></v-switch>
    <v-text-field v-model="customdate" label="Datum" density="compact" width="10"></v-text-field>
    <v-btn
      @click="loadImage(data)"
    >
    

      QR-Code laden</v-btn
    >
    <v-btn
      @click="changeStatus"
      :color="buttoncolor"
    >
      Status auf "Rechnung" setzen</v-btn
    >
  </template>
</adminbar>


      <v-container id="rechnungen">
        <v-row
          ><v-col cols="12"
            ><h1>{{isLieferschein ? "Lieferschein" : "Rechnung"}}</h1>
            Datum: {{ printdate(data.Lieferdatum) }} | {{ bezeichnung(data, "Rechnung", "Name") }}</v-col
          ><v-col cols="8" align-self="center">
            

            <div>
              {{ bezeichnung(data, "Rechnung", "Name") }}<br />
              {{ bezeichnung(data, "Rechnung", "Adresse") }}<br />
              {{ bezeichnung(data, "Rechnung", "Adresszusatz")
              }}<br v-show="bezeichnung(data, 'Rechnung', 'Adresszusatz')" />
              {{ bezeichnung(data, "Rechnung", "PLZundOrt") }}
            </div>
          </v-col>
          <v-col cols="4"
            ><Firmenadresse /></v-col
          ><v-col cols="12">
            <BestellungTable :data="data" />
            
          </v-col>
        <v-col cols="12" v-show="!image">
  <div class="betrag-erhalten" v-show="isBetragErhalten">
    Betrag erhalten am {{ customdate ? customdate : printdate(data.Erstellt)}} : ____________________________
  </div>
</v-col>
          
        </v-row>
        <img
          v-bind:src="'data:image/png;base64,' + image"
          class="qrcode"
          width="100%"
          v-show="image"
        />
      </v-container>
    </v-form>
  </div>
</template>
<script setup>
const props = defineProps({
  data: { type: Object, required: true }
})
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});

const store = useButtenmostStore();
let buttoncolor = ref("primary")

let image = ref();

let isLieferschein = ref(false);
let isBetragErhalten = ref(true);
let customdate = ref("");
function printdate(datum) {
  return new Date(datum).toLocaleDateString();
}

async function loadImage(data) {
  image.value = await $fetch(
    "/api/qrcode?betrag=" +
      data.Betrag +
      "&Name=" +
      bezeichnung(data, "Rechnung", "Name") +
      "&Strasse=" +
      bezeichnung(data, "Rechnung", "Adresse") +
      "&Ort=" +
      bezeichnung(data, "Rechnung", "PLZundOrt") +
      "&Bemerkungen=" +
      bezeichnung(data, "Rechnung", "Name").replace("|", "") + // dieses Sonderzeichen gibt bei einigen Banken Fehlermeldungen beim Einzahlen
      " Rechnung vom " +
      printdate(data.Lieferdatum) +
      "&Rechnung_Referenz_Nummer=122"
  );
}

async function changeStatus() {
  await $fetch("/api/airtable_update", {
    method: "POST",
    body: [{ id: route.params.id, fields: { Status: "Rechnung" } }], //muss zwingend als array übergeben werden, auch wenn einzelner eintrag
  });
  buttoncolor.value="green"
}


</script>
<style scoped>
.betrag-erhalten {
  text-align: right;
  margin-top: 100px;
}
</style>