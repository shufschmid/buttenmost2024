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

    <div class="d-flex flex-wrap align-center ga-4 ma-4 d-print-none">
      <v-select
        v-model="media"
        :items="mediaItems"
        item-title="label"
        item-value="key"
        label="Eingelegte Rolle im QL-1110NWB"
        density="compact"
        hide-details
        style="max-width: 420px"
      />
      <v-switch
        v-model="check"
        label="Medienprüfung im Drucker (nur für Diagnose ausschalten)"
        density="compact"
        hide-details
        color="primary"
      />
    </div>

    <v-alert v-if="error" type="error" class="ma-4">{{ error }}</v-alert>
    <v-alert v-if="result && result.warning" type="warning" class="ma-4">
      {{ result.warning }}
    </v-alert>

    <div v-if="result" class="ma-4">
      <p>
        Sendungsnummer <strong>{{ result.sendungsnummer }}</strong>
        · {{ result.mediaLabel }}
        · {{ result.width }} × {{ result.height }} Punkte
        · {{ Math.round(result.bytes / 1024) }} KB
        <span v-if="result.specimen"> · SPECIMEN (Testetikette)</span>
        <span v-if="!result.validateMedia"> · ohne Medienprüfung</span>
      </p>
      <p class="text-caption">
        Drucken ohne Treiber (Brother QL-1110NWB): Drucker ausschalten, Wi-Fi- und
        Ein/Aus-Taste einige Sekunden gedrückt halten (Massenspeicher-Modus), USB-Kabel
        anschliessen, die .bin ins Laufwerk des Druckers kopieren, WPS-Taste drücken.
        Zum Beenden Drucker ausschalten. Rot blinkende Status-LED = Fehler, meist
        passt die gewählte Rolle nicht zur eingelegten.
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
const media = ref("einzel103x164");
const check = ref(true);
const mediaItems = [
  { key: "einzel103x164", label: "Versandetikette 103 × 164 mm (DK-11247)" },
  { key: "endlos102", label: "Endlosrolle 102 mm (DK-22243)" },
  { key: "einzel102x152", label: "Einzeletikette 102 × 152 mm (DK-11241)" },
  { key: "endlos103", label: "Endlosrolle 103 mm (DK-22246)" },
];
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
      query: {
        id: route.params.id,
        preview: specimen ? 1 : 0,
        media: media.value,
        check: check.value ? 1 : 0,
      },
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
