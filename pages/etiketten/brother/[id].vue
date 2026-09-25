<template>
  <div>
    <v-toolbar class="d-print-none">
      <v-btn
        @click="loadLabel(false)"
        variant="outlined"
        :loading="loading"
        :disabled="loading"
      >
        Etikette laden und Status auf "Etikette" setzen
      </v-btn>
      <v-btn
        @click="loadLabel(true)"
        variant="text"
        class="ml-2"
        :loading="loading"
        :disabled="loading"
      >
        Testetikette (SPECIMEN, ohne Airtable)
      </v-btn>
      <v-btn
        v-if="result"
        :href="binUrl"
        :download="result.filename"
        color="primary"
        class="ml-2"
        prepend-icon="mdi-download"
      >
        .bin für Drucker speichern
      </v-btn>
    </v-toolbar>

    <v-alert v-if="error" type="error" class="ma-4">{{ error }}</v-alert>
    <v-alert v-if="result && result.warning" type="warning" class="ma-4">
      {{ result.warning }}
    </v-alert>

    <div v-if="result" class="ma-4">
      <p>
        Sendungsnummer <strong>{{ result.sendungsnummer }}</strong>
        · {{ result.width }} × {{ result.height }} Punkte
        · {{ Math.round(result.bytes / 1024) }} KB
        <span v-if="result.specimen"> · SPECIMEN (Testetikette)</span>
      </p>
      <p class="text-caption">
        Drucken ohne Treiber (Brother QL-1110NWB, Endlosrolle 102 mm):
        Drucker ausschalten, Wi-Fi- und Ein/Aus-Taste einige Sekunden gedrückt halten
        (Massenspeicher-Modus), USB-Kabel anschliessen, die .bin ins Laufwerk des Druckers
        kopieren, WPS-Taste drücken. Zum Beenden Drucker ausschalten.
      </p>
      <img :src="result.previewImage" class="qrcode" width="100%" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const result = ref(null);
const error = ref("");
const loading = ref(false);
const binUrl = ref("");
let objectUrl = "";

function setBin(base64) {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  objectUrl = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
  binUrl.value = objectUrl;
}

async function loadLabel(specimen) {
  loading.value = true;
  error.value = "";
  result.value = null;
  try {
    const data = await $fetch("/api/etikette_brother", {
      query: { id: route.params.id, preview: specimen ? 1 : 0 },
    });
    setBin(data.bin);
    result.value = data;
  } catch (e) {
    const d = e?.data;
    error.value = d?.error
      ? `${d.error}${d.details ? " – " + JSON.stringify(d.details) : ""}`
      : e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

onBeforeUnmount(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});
</script>
