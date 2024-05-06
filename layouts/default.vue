<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar class="d-print-none mx-auto">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Buttenmost aus Hochwald</v-toolbar-title>
      <nuxt-link @click="logout"
        ><v-icon v-if="authenticated">mdi-lock-open</v-icon></nuxt-link
      >

      <nuxt-link to="/login"
        ><v-icon v-if="!authenticated">mdi-lock</v-icon></nuxt-link
      >
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <v-list-item title="Home" to="/"></v-list-item>
      <v-list-item title="Admin" to="/admin"></v-list-item>
      <v-list-item
        title="Lieferscheine"
        to="/lieferscheine/2024-05-09"
      ></v-list-item>
      <v-list-item title="Login" to="/login"></v-list-item>

      <v-list-item title="b2b" to="/b2b"></v-list-item>
    </v-navigation-drawer>
    <v-main style="min-height: 300px">
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
