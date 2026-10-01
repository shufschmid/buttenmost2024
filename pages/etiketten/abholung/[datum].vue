<template>
  <div>
    <v-toolbar class="d-print-none">
      <v-btn to="/admin" prepend-icon="mdi-arrow-left" variant="text">Admin</v-btn>
      <v-toolbar-title>Abholetiketten · {{ formattedDatum }}</v-toolbar-title>
      <v-btn
        color="primary"
        variant="flat"
        class="mr-2"
        :disabled="running || !anzahlAusgewaehlt"
        :loading="running"
        @click="erzeugen"
      >
        {{ anzahlAusgewaehlt }} Etiketten erzeugen
      </v-btn>
      <v-btn v-if="running" variant="outlined" color="error" @click="abbrechen = true">
        Abbrechen
      </v-btn>
    </v-toolbar>

    <div class="d-flex flex-wrap align-center ga-4 ma-4 d-print-none">
      <v-select
        v-model="media"
        :items="mediaItems"
        item-title="label"
        item-value="key"
        label="Eingelegte Rolle"
        density="compact"
        hide-details
        :disabled="running"
        style="max-width: 360px"
      />
      <v-select
        v-model="stapelGroesse"
        :items="[10, 15, 20, 25, 30]"
        label="Etiketten pro Datei"
        density="compact"
        hide-details
        :disabled="running"
        style="max-width: 180px"
      />
      <v-switch
        v-model="vorschau"
        label="Nur Vorschau (Status nicht ändern)"
        density="compact"
        hide-details
        color="primary"
        :disabled="running"
      />
    </div>

    <p class="mx-4 text-caption">
      Ohne Post-API: Die Etikette wird selbst gezeichnet, es entsteht kein Versandauftrag.
      Vorausgewählt sind nur Bestellungen mit Status „bezahlt“ ({{ anzahlBezahlt }} von
      {{ rows.length }}); andere sind grau und einzeln anwählbar. Beim Erzeugen wird der Status
      auf „Etikette“ gesetzt, ausser im Vorschau-Modus.
    </p>

    <v-alert v-if="ladeFehler" type="error" class="ma-4">
      Bestellungen konnten nicht geladen werden: {{ ladeFehler }}
    </v-alert>

    <v-progress-linear
      v-if="running || fortschritt.total"
      :model-value="fortschritt.total ? (100 * fortschritt.done) / fortschritt.total : 0"
      height="22"
      color="primary"
      class="mx-4"
      style="max-width: calc(100% - 32px)"
    >
      <template #default>{{ fortschritt.done }} / {{ fortschritt.total }}</template>
    </v-progress-linear>

    <v-card v-if="stapel.length" class="ma-4" variant="tonal" color="primary">
      <v-card-title>Dateien für den Drucker</v-card-title>
      <v-card-text>
        <p class="mb-3">
          Drucker im Massenspeicher-Modus (Anleitung unter
          <NuxtLink to="/etiketten/brother/stapel">Post-Etiketten</NuxtLink>): Datei ins
          Laufwerk kopieren, WPS drücken, warten bis die Status-LED wieder grün leuchtet. Bei
          mehreren Dateien nacheinander, nie gleichzeitig.
        </p>
        <div v-for="s in stapel" :key="s.nr" class="mb-2">
          <v-btn :href="s.url" :download="s.filename" color="primary" prepend-icon="mdi-download">
            Datei {{ s.nr }}: {{ s.anzahl }} Etiketten ({{ Math.round(s.bytes / 1024) }} KB)
          </v-btn>
          <span class="text-caption ml-3">{{ s.filename }}</span>
        </div>
      </v-card-text>
    </v-card>

    <div v-if="vorschauen.length" class="d-flex flex-wrap ga-3 ma-4">
      <img
        v-for="v in vorschauen"
        :key="v.id"
        :src="v.src"
        :title="v.kunde"
        style="height: 320px; border: 1px solid #ccc"
      />
    </div>

    <v-table class="ma-4" density="compact">
      <thead>
        <tr>
          <th>
            <v-checkbox-btn
              :model-value="alleAusgewaehlt"
              :indeterminate="!alleAusgewaehlt && anzahlAusgewaehlt > 0"
              :disabled="running"
              @update:model-value="alleSetzen"
            />
          </th>
          <th>#</th>
          <th class="text-left">Kunde</th>
          <th class="text-left">Ort</th>
          <th class="text-right">Liter</th>
          <th class="text-left">Status</th>
          <th class="text-left">Ergebnis</th>
          <th class="text-right">Datei</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(r, i) in rows"
          :key="r.id"
          :class="{ 'bg-red-lighten-5': r.ergebnis === 'Fehler', 'text-disabled': r.Status !== 'bezahlt' }"
        >
          <td><v-checkbox-btn v-model="r.selected" :disabled="running" /></td>
          <td>{{ i + 1 }}</td>
          <td>{{ kundeName(r) }}</td>
          <td>{{ kundeOrt(r) }}</td>
          <td class="text-right">{{ r.Menge }}</td>
          <td>{{ r.Status }}</td>
          <td>
            {{ r.ergebnis }}
            <span v-if="r.fehler" class="text-error text-caption"> {{ r.fehler }}</span>
          </td>
          <td class="text-right">{{ r.stapel }}</td>
        </tr>
      </tbody>
    </v-table>
    <p v-if="rows.length === 0 && !ladeFehler" class="ma-4">
      Keine Abholbestellungen mit Lieferdatum {{ datum }}.
    </p>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const datum = route.params.datum;
const formattedDatum = computed(() =>
  new Date(datum).toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" })
);

const { data: bestellungen, error: ladeFehlerRaw } = await useFetch("/api/bestellungen_abholung", {
  query: { datum },
});
const ladeFehler = computed(() =>
  ladeFehlerRaw.value ? ladeFehlerRaw.value.data?.error ?? ladeFehlerRaw.value.message : ""
);

const str = (v) => (Array.isArray(v) ? v.join(" ") : v == null ? "" : String(v)).trim();
// gleiche Logik wie utils/bezeichnung.js (Art "Lieferung")
function kundeName(r) {
  return (
    str(r.Lieferung_Bezeichnung) ||
    str(r.b2b_Bezeichnung) ||
    [str(r.Vorname), str(r.Name)].filter(Boolean).join(" ")
  );
}
function kundeOrt(r) {
  return str(r.Lieferung_Ort) || str(r.b2b_Ort) || str(r.Ort);
}

const rows = ref([]);
watch(
  bestellungen,
  (list) => {
    rows.value = (Array.isArray(list) ? list : []).map((b) => ({
      ...b,
      selected: b.Status === "bezahlt",
      ergebnis: "",
      fehler: "",
      stapel: null,
    }));
  },
  { immediate: true }
);

const media = ref("einzel103x164");
const mediaItems = [
  { key: "einzel103x164", label: "Versandetikette 103 × 164 mm (DK-11247)" },
  { key: "endlos102", label: "Endlosrolle 102 mm (DK-22243)" },
  { key: "einzel102x152", label: "Einzeletikette 102 × 152 mm (DK-11241)" },
  { key: "endlos103", label: "Endlosrolle 103 mm (DK-22246)" },
];
const stapelGroesse = ref(30);
const vorschau = ref(false);
const running = ref(false);
const abbrechen = ref(false);
const fortschritt = ref({ done: 0, total: 0 });
const stapel = ref([]);
const vorschauen = ref([]);

let fragments = [];
let fragmentsVorschau = null;
let jobInit = null;
let pageIndicatorOffset = 19;

const anzahlAusgewaehlt = computed(() => rows.value.filter((r) => r.selected).length);
const anzahlBezahlt = computed(() => rows.value.filter((r) => r.Status === "bezahlt").length);
const alleAusgewaehlt = computed(() => {
  const bezahlt = rows.value.filter((r) => r.Status === "bezahlt");
  return bezahlt.length > 0 && bezahlt.every((r) => r.selected);
});
function alleSetzen(v) {
  rows.value.forEach((r) => (r.selected = !!v && r.Status === "bezahlt"));
}

function b64ToBytes(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function erzeugen() {
  if (fragmentsVorschau !== null && fragmentsVorschau !== vorschau.value) {
    fragments = [];
    vorschauen.value = [];
    rows.value.forEach((r) => {
      r.ergebnis = "";
      r.fehler = "";
      r.stapel = null;
    });
  }
  fragmentsVorschau = vorschau.value;

  const auswahl = rows.value.filter((r) => r.selected && r.ergebnis !== "OK");
  if (!auswahl.length) return;
  running.value = true;
  abbrechen.value = false;
  fortschritt.value = { done: 0, total: auswahl.length };

  for (const r of auswahl) {
    if (abbrechen.value) break;
    r.ergebnis = "läuft …";
    r.fehler = "";
    try {
      const d = await $fetch("/api/etikette_abholung", {
        query: { id: r.id, preview: vorschau.value ? 1 : 0, media: media.value },
      });
      jobInit = d.jobInit;
      pageIndicatorOffset = d.pageIndicatorOffset;
      fragments.push({ row: r, bytes: b64ToBytes(d.page) });
      vorschauen.value.push({ id: r.id, src: d.previewImage, kunde: d.kunde });
      if (!vorschau.value) r.Status = "Etikette";
      r.ergebnis = "OK";
      if (d.warning) r.fehler = d.warning;
    } catch (e) {
      const dd = e?.data;
      r.ergebnis = "Fehler";
      r.fehler = dd?.error
        ? `${dd.error}${dd.details ? " – " + JSON.stringify(dd.details) : ""}`
        : e?.message ?? String(e);
    }
    fortschritt.value.done++;
    stapelBauen();
  }
  running.value = false;
}

// JOB_INIT + Seite 1 + FF + Seite 2 + ... + letzte Seite + Control-Z (wie mergePages())
function stapelBauen() {
  stapel.value.forEach((s) => URL.revokeObjectURL(s.url));
  if (!fragments.length || !jobInit) {
    stapel.value = [];
    return;
  }
  const init = b64ToBytes(jobInit);
  const n = stapelGroesse.value;
  const out = [];
  for (let i = 0; i < fragments.length; i += n) {
    const chunk = fragments.slice(i, i + n);
    const parts = [init];
    chunk.forEach((f, k) => {
      const b = new Uint8Array(f.bytes);
      b[pageIndicatorOffset] = k === 0 ? 0x00 : 0x01;
      parts.push(b, new Uint8Array([k < chunk.length - 1 ? 0x0c : 0x1a]));
    });
    const blob = new Blob(parts, { type: "application/octet-stream" });
    const nr = out.length + 1;
    chunk.forEach((f) => (f.row.stapel = nr));
    const kurz = datum.slice(5).replace("-", "");
    out.push({
      nr,
      anzahl: chunk.length,
      bytes: blob.size,
      url: URL.createObjectURL(blob),
      filename: `${vorschau.value ? "VORS" : "ABHOL"}${kurz}-${nr}.bin`,
    });
  }
  stapel.value = out;
}

watch(stapelGroesse, () => {
  if (!running.value) stapelBauen();
});

onBeforeUnmount(() => {
  stapel.value.forEach((s) => URL.revokeObjectURL(s.url));
});
</script>
