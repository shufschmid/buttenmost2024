<template>
    <v-app-bar v-if="mobile" class="d-print-none mx-auto" 
app fixed>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="ml-0 flex-grow-1  text-center"><NuxtLink to="/" style="display:inline-block"><v-img src="/logo.svg" width="150" class="mx-auto"></v-img></NuxtLink></v-toolbar-title>
      <!-- Platzhalter für Symmetrie -->
  <v-app-bar-nav-icon style="opacity:0; pointer-events:none;"></v-app-bar-nav-icon>

    </v-app-bar>
    <v-navigation-drawer v-model="drawer" class="d-print-none" style="padding-top:10px">
      <NuxtLink to="/" style="display:inline-block"><v-img v-if="!mobile" src="/logo.svg" style="padding-left:10px" width="250" class="mx-auto"></v-img></NuxtLink>
      <v-list-item title="Home" to="/"></v-list-item>
      <v-list-item title="Verkaufsstellen" to="/verkaufsstellen"></v-list-item>
      <v-list-item title="Rezepte" to="rezepte"></v-list-item>
      <v-list-item title="Medienberichte" to="media"></v-list-item>
      
      <v-list-item title="Wiederverkäufer" to="/b2b"></v-list-item>
      <v-list-item title="Facebook" href="https://www.facebook.com/buttenmost" target="_blank"></v-list-item>
      <v-list-item title="Instagram" href="https://www.instagram.com/buttenmost.ch/" target="_blank"></v-list-item>
      <v-list-item title="Datenschutzerklärung" to="datenschutz"></v-list-item>
      <v-list-item
        href="https://www.patrimoineculinaire.ch/Produkt/Buttenmost/242"
      >
        <v-img src="/logo_patrimoine.svg"></v-img>
      </v-list-item>
        <template #append>
    <div class="d-flex justify-center mb-4">
      
      <nuxt-link @click="logout" class="no-link-style"
        ><v-icon v-if="authenticated"class="half-opacity">mdi-lock-open</v-icon></nuxt-link
      >
      <nuxt-link to="/admin" class="no-link-style"
        ><v-icon v-if="authenticated" class="half-opacity" >mdi-receipt-text-plus</v-icon></nuxt-link
      >

      <nuxt-link to="/login" class="no-link-style"
        ><v-icon v-if="!authenticated" class="half-opacity">mdi-lock</v-icon></nuxt-link
      >
      
    </div>
  </template>
    </v-navigation-drawer>
    
    <v-main style="min-height: 600px" >
      <slot />
    </v-main>
</template>

<script setup>
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();

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
.half-opacity {
  opacity: 0.5;
}
.no-link-style {
  color: inherit;
  text-decoration: none;
}
.no-link-style:visited,
.no-link-style:active,
.no-link-style:hover {
  color: inherit;
  text-decoration: none;
}
</style>
