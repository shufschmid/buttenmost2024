<template>
  <div>
      <v-toolbar class="d-print-none">
        <template v-slot:prepend>
          <v-btn icon="mdi-table-edit"></v-btn>
        </template>
        <v-btn
          @click="loadImage(data)" variant="outlined"
        >
          Etikette laden und Status auf "Etikette" setzen</v-btn
        >
      </v-toolbar>

      
        <img
          v-bind:src="'data:image/png;base64,' + image"
          class="qrcode"
          width="100%"
        />
  </div>
</template>
<script setup>
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});

const store = useButtenmostStore();
const route = useRoute();
let buttoncolor = ref("primary")

let image = ref();

const { data } = await useFetch(
  "/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&recID=" + route.params.id
);

function printdate(datum) {
  return new Date(datum).toLocaleDateString();
}

async function loadImage() {
  image.value = await $fetch(
    "/api/etikette?id=" +route.params.id);
}

</script>
