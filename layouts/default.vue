<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar class="d-print-none mx-auto">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="ml-0"><v-img src="/logo.png" width="200"></v-img></v-toolbar-title>
      <nuxt-link @click="logout"
        ><v-icon v-if="authenticated">mdi-lock-open</v-icon></nuxt-link
      >
      <nuxt-link to="/admin"
        ><v-icon v-if="authenticated">mdi-receipt-text-plus</v-icon></nuxt-link
      >

      <nuxt-link to="/login"
        ><v-icon v-if="!authenticated">mdi-lock</v-icon></nuxt-link
      >
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" class="d-print-none">
      <v-list-item title="Home" to="/"></v-list-item>
      <v-list-item title="Verkaufsstellen" to="/verkaufsstellen"></v-list-item>
      <v-list-item title="Rezepte" to="rezepte"></v-list-item>
      <v-list-item title="Medienberichte" to="media"></v-list-item>
      
      <v-list-item title="Login für Firmenkunden" to="/b2b"></v-list-item>
      <v-list-item title="Facebook" href="https://www.facebook.com/buttenmost" target="_blank"></v-list-item>
      <v-list-item title="Instagram" href="https://www.instagram.com/buttenmost.ch/" target="_blank"></v-list-item>
      <v-list-item title="Datenschutzerklärung" to="datenschutz"></v-list-item>
      <v-list-item
        href="https://www.patrimoineculinaire.ch/Produkt/Buttenmost/242"
      >
        <v-img src="/logo_patrimoine.svg"></v-img>
      </v-list-item>
    </v-navigation-drawer>
    <v-main style="min-height: 600px" >
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup>
let drawer = ref(null);
const router = useRouter();

const { logUserOut } = useButtenmostStore(); // use authenticateUser action from  auth store
const { authenticated } = storeToRefs(useButtenmostStore()); // make authenticated state reactive with storeToRefs

const logout = () => {
  logUserOut();
  router.push("/login");
};
</script>

<style scoped>
@media print{
    .v-main {
        padding: 0 !important;
    }
}   
</style>
