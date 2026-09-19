<template>
    <v-toolbar class="d-print-none" :height="height">
        <template v-slot:prepend>
        <v-btn icon="mdi-table-edit"></v-btn>
        
        </template>
        <slot name="actions"></slot>
    </v-toolbar>
</template>
<script setup lang="ts">
defineProps({
    isRechnung: {
        type: Boolean,
        default: false
    },
    // undefined = Vuetify-Standardhöhe, damit bestehende Verwendungen unverändert bleiben
    height: {
        type: [Number, String],
        default: undefined
    }
})
</script>