<template>
    <v-toolbar class="d-print-none">
        <template v-slot:prepend>
        <v-btn icon="mdi-table-edit"></v-btn>
        <p v-if="!isRechnung">zu den Rechnungen></p>
        </template>
        <slot name="actions"></slot>
    </v-toolbar>
</template>
<script setup lang="ts">
defineProps({
    isRechnung: {
        type: Boolean,
        default: false
    }
})
</script>