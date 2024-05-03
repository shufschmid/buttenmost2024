<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar class="d-print-none">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Buttenmost aus Hochwald</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <v-list-item title="Home" to="/"></v-list-item>
      <v-list-item title="Admin" to="/admin"></v-list-item>
      <v-list-item title="Lieferscheine" to="/lieferscheine"></v-list-item>
      <v-list-item title="Login" to="/login"></v-list-item>
      <v-list-item title="b2b" to="/b2b"></v-list-item>
    </v-navigation-drawer>
    <v-main
      style="min-height: 300px"
    >
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup>
let drawer = ref(null);
</script>
