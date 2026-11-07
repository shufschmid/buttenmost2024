<template>
  <div>
    <v-toolbar class="d-print-none">
      <v-btn to="/admin" prepend-icon="mdi-arrow-left" variant="text">Admin</v-btn>
      <v-toolbar-title>Etikette mit eigenem Text</v-toolbar-title>
    </v-toolbar>

    <v-row class="ma-2">
      <v-col cols="12" md="6">
        <v-textarea
          v-model="text"
          label="Text"
          placeholder="Eine Zeile pro Zeile auf der Etikette"
          rows="6"
          auto-grow
          autofocus
          :counter="MAX_ZEICHEN"
          :rules="[(v) => (v || '').length <= MAX_ZEICHEN || 'Zu viele Zeichen']"
        />

        <div class="d-flex flex-wrap align-center ga-4 mb-4">
          <v-btn-toggle v-model="format" mandatory density="compact" variant="outlined" divided>
            <v-btn value="hoch" prepend-icon="mdi-crop-portrait">Hochformat</v-btn>
            <v-btn value="quer" prepend-icon="mdi-crop-landscape">Querformat</v-btn>
          </v-btn-toggle>
          <v-btn-toggle v-model="ausrichtung" mandatory density="compact" variant="outlined" divided>
            <v-btn value="mitte" icon="mdi-format-align-center" title="zentriert" />
            <v-btn value="links" icon="mdi-format-align-left" title="linksbündig" />
          </v-btn-toggle>
        </div>

        <div class="d-flex flex-wrap align-center ga-4">
          <v-switch
            v-model="fett"
            label="Erste Zeile fett"
            density="compact"
            hide-details
            color="primary"
          />
          <v-switch v-model="logo" label="Logo" density="compact" hide-details color="primary" />
        </div>

        <div class="d-flex flex-wrap align-center ga-4 mt-4">
          <v-select
            v-model="media"
            :items="mediaItems"
            item-title="label"
            item-value="key"
            label="Eingelegte Rolle"
            density="compact"
            hide-details
            style="max-width: 360px"
          />
          <v-text-field
            v-model.number="anzahl"
            type="number"
            min="1"
            :max="MAX_ANZAHL"
            label="Anzahl"
            density="compact"
            hide-details
            style="max-width: 120px"
          />
        </div>

        <p class="text-caption mt-4">
          Ohne Post und ohne Airtable: Die Etikette wird nur gezeichnet. Der Text wird so gross wie
          möglich gesetzt; zu lange Zeilen werden an Wortgrenzen umbrochen. Hochformat entspricht
          der Abholetikette, Querformat der Post-Adressetikette.
        </p>

        <v-alert v-if="fehler" type="error" density="compact" class="mt-4">{{ fehler }}</v-alert>
        <v-alert v-if="ergebnis?.warning" type="warning" density="compact" class="mt-4">
          {{ ergebnis.warning }}
        </v-alert>

        <v-card v-if="dateien.length" class="mt-4" variant="tonal" color="primary">
          <v-card-title>Datei für den Drucker</v-card-title>
          <v-card-text>
            <p class="mb-3">
              Drucker im Massenspeicher-Modus (Anleitung unter
              <NuxtLink to="/etiketten/brother/stapel">Post-Etiketten</NuxtLink>): Datei ins
              Laufwerk kopieren, WPS drücken, warten bis die Status-LED wieder grün leuchtet. Bei
              mehreren Dateien nacheinander, nie gleichzeitig.
            </p>
            <div v-for="d in dateien" :key="d.nr" class="mb-2">
              <v-btn
                :href="aktuell ? d.url : undefined"
                :download="d.filename"
                :disabled="!aktuell"
                color="primary"
                prepend-icon="mdi-download"
              >
                {{ dateien.length > 1 ? `Datei ${d.nr}: ` : "" }}{{ d.anzahl }}
                {{ d.anzahl === 1 ? "Etikette" : "Etiketten" }} ({{ Math.round(d.bytes / 1024) }} KB)
              </v-btn>
              <span class="text-caption ml-3">{{ d.filename }}</span>
            </div>
            <p v-if="!aktuell" class="text-caption">Vorschau wird aktualisiert …</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <div class="d-flex align-center ga-2 mb-2">
          <span class="text-subtitle-1">Vorschau</span>
          <v-progress-circular v-if="laeuft" indeterminate size="18" width="2" color="primary" />
          <span v-if="ergebnis && aktuell" class="text-caption text-medium-emphasis">
            Schrift {{ ergebnis.fontSize }} px, {{ ergebnis.zeilen }}
            {{ ergebnis.zeilen === 1 ? "Zeile" : "Zeilen" }}{{
              ergebnis.umbrochen ? " (umbrochen)" : ""
            }}
          </span>
        </div>
        <div style="overflow-x: auto">
          <div v-if="ergebnis" :style="vorschauBox" :class="{ veraltet: !aktuell }">
            <img :src="ergebnis.previewImage" :style="vorschauBild" alt="Vorschau der Etikette" />
          </div>
          <p v-else-if="!text.trim()" class="text-medium-emphasis">
            Text eingeben, die Vorschau erscheint automatisch.
          </p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});

const MAX_ZEICHEN = 600;
const MAX_ANZAHL = 100;
const MAX_BYTES_PRO_DATEI = 1_800_000; // Massenspeicher: Dateien > 2 MB werden nicht gedruckt
const MAX_SEITEN_PRO_DATEI = 30;

const text = ref("");
const format = ref("hoch");
const ausrichtung = ref("mitte");
const fett = ref(true);
const logo = ref(true);
const media = ref("einzel103x164");
const anzahl = ref(1);
const mediaItems = [
  { key: "einzel103x164", label: "Versandetikette 103 × 164 mm (DK-11247)" },
  { key: "endlos102", label: "Endlosrolle 102 mm (DK-22243)" },
  { key: "einzel102x152", label: "Einzeletikette 102 × 152 mm (DK-11241)" },
  { key: "endlos103", label: "Endlosrolle 103 mm (DK-22246)" },
];

const ergebnis = ref(null);
const ergebnisSchluessel = ref("");
const fehler = ref("");
const laeuft = ref(false);
const dateien = ref([]);

const parameter = computed(() => ({
  text: text.value,
  quer: format.value === "quer",
  links: ausrichtung.value === "links",
  fett: fett.value,
  logo: logo.value,
  media: media.value,
}));
const schluessel = computed(() => JSON.stringify(parameter.value));
const aktuell = computed(() => !!ergebnis.value && ergebnisSchluessel.value === schluessel.value);

let timer = null;
let anfrageNr = 0;
watch(schluessel, () => {
  clearTimeout(timer);
  if (!text.value.trim() || text.value.length > MAX_ZEICHEN) {
    anfrageNr++; // laufende Antwort verwerfen
    laeuft.value = false;
    fehler.value = "";
    ergebnis.value = null;
    dateienBauen();
    return;
  }
  timer = setTimeout(vorschauLaden, 700);
});

async function vorschauLaden() {
  const nr = ++anfrageNr;
  const key = schluessel.value;
  laeuft.value = true;
  try {
    const d = await $fetch("/api/etikette_freitext", { method: "POST", body: parameter.value });
    if (nr !== anfrageNr) return;
    ergebnis.value = d;
    ergebnisSchluessel.value = key;
    fehler.value = "";
  } catch (e) {
    if (nr !== anfrageNr) return;
    fehler.value = e?.data?.error ?? e?.message ?? String(e);
  } finally {
    if (nr === anfrageNr) laeuft.value = false;
  }
  dateienBauen();
}

// Vorschau so drehen, wie man die Etikette liest (Querformat wird zum Drucken im Uhrzeigersinn
// gedreht, hier wieder zurueck)
const LANG_PX = 440;
const vorschauMasse = computed(() => {
  const e = ergebnis.value;
  if (!e) return { kurz: 0, lang: 0 };
  return { kurz: Math.round((LANG_PX * e.width) / e.height), lang: LANG_PX };
});
const vorschauBox = computed(() => {
  const { kurz, lang } = vorschauMasse.value;
  const quer = ergebnis.value?.quer;
  return {
    position: "relative",
    width: (quer ? lang : kurz) + "px",
    height: (quer ? kurz : lang) + "px",
  };
});
const vorschauBild = computed(() => {
  const { kurz, lang } = vorschauMasse.value;
  const quer = ergebnis.value?.quer;
  return {
    position: "absolute",
    width: kurz + "px",
    height: lang + "px",
    left: (quer ? (lang - kurz) / 2 : 0) + "px",
    top: (quer ? (kurz - lang) / 2 : 0) + "px",
    transform: quer ? "rotate(-90deg)" : "none",
    border: "1px solid #ccc",
    background: "white",
  };
});

function b64ToBytes(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function dateiname(nr, total) {
  const ersteZeile = text.value.trim().split("\n")[0] || "";
  const slug =
    ersteZeile
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 12) || "ETIKETTE";
  return `TEXT-${slug}${total > 1 ? "-" + nr : ""}.bin`;
}

// JOB_INIT + Seite + FF + ... + Seite + Control-Z (wie mergePages()), bei Bedarf auf mehrere Dateien
function dateienBauen() {
  dateien.value.forEach((d) => URL.revokeObjectURL(d.url));
  dateien.value = [];
  const e = ergebnis.value;
  const n = Math.min(MAX_ANZAHL, Math.max(1, Math.floor(Number(anzahl.value) || 1)));
  if (!e) return;
  const init = b64ToBytes(e.jobInit);
  const erste = b64ToBytes(e.page);
  erste[e.pageIndicatorOffset] = 0x00;
  const weitere = new Uint8Array(erste);
  weitere[e.pageIndicatorOffset] = 0x01;
  const proDatei = Math.max(
    1,
    Math.min(MAX_SEITEN_PRO_DATEI, Math.floor(MAX_BYTES_PRO_DATEI / (erste.length + 1)))
  );
  const total = Math.ceil(n / proDatei);
  const out = [];
  for (let start = 0; start < n; start += proDatei) {
    const k = Math.min(proDatei, n - start);
    const parts = [init];
    for (let i = 0; i < k; i++) {
      parts.push(i === 0 ? erste : weitere, new Uint8Array([i < k - 1 ? 0x0c : 0x1a]));
    }
    const blob = new Blob(parts, { type: "application/octet-stream" });
    const nr = out.length + 1;
    out.push({
      nr,
      anzahl: k,
      bytes: blob.size,
      url: URL.createObjectURL(blob),
      filename: dateiname(nr, total),
    });
  }
  dateien.value = out;
}

watch(anzahl, dateienBauen);

onBeforeUnmount(() => {
  clearTimeout(timer);
  dateien.value.forEach((d) => URL.revokeObjectURL(d.url));
});
</script>

<style scoped>
.veraltet {
  opacity: 0.4;
}
</style>
