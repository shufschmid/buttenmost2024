<template>
  <div>
    <v-toolbar class="d-print-none">
      <v-toolbar-title>Post-Etiketten für Brother QL-1110NWB · {{ formattedDatum }}</v-toolbar-title>
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
        v-model="testmodus"
        label="Testmodus (SPECIMEN, ohne Airtable-Änderung)"
        density="compact"
        hide-details
        color="primary"
        :disabled="running"
      />
    </div>

    <p class="mx-4 text-caption">
      Vorausgewählt sind nur Bestellungen mit Status „bezahlt“ ({{ anzahlBezahlt }} von {{ rows.length }}).
      Andere Bestellungen sind grau und müssen einzeln angewählt werden.
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
          Pro Datei: Drucker im Massenspeicher-Modus, Datei ins Laufwerk kopieren, WPS drücken,
          warten bis alle Etiketten gedruckt sind und die Status-LED wieder grün leuchtet.
          Dann die Datei im Laufwerk löschen (oder Drucker aus- und wieder einschalten) und die
          nächste Datei kopieren. Nie zwei Dateien gleichzeitig kopieren, der Drucker druckt sie
          sonst in zufälliger Reihenfolge.
        </p>
        <div v-for="s in stapel" :key="s.nr" class="mb-2">
          <v-btn :href="s.url" :download="s.filename" color="primary" prepend-icon="mdi-download">
            Datei {{ s.nr }}: {{ s.anzahl }} Etiketten ({{ Math.round(s.bytes / 1024) }} KB)
          </v-btn>
          <span class="text-caption ml-3">{{ s.filename }} · {{ s.namen[0] }} … {{ s.namen[s.namen.length - 1] }}</span>
        </div>
      </v-card-text>
    </v-card>

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
          <th class="text-right">Gewicht</th>
          <th class="text-left">Status</th>
          <th class="text-left">Sendungsnummer</th>
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
          <td>{{ r.Vorname }} {{ r.Name }}</td>
          <td>{{ r.PLZ }} {{ r.Ort }}</td>
          <td class="text-right">{{ r.Menge }}</td>
          <td class="text-right">{{ r.Gewicht }}</td>
          <td>{{ r.Status }}</td>
          <td>{{ r.Sendungsnummer }}</td>
          <td>
            {{ r.ergebnis }}
            <span v-if="r.fehler" class="text-error text-caption"> {{ r.fehler }}</span>
          </td>
          <td class="text-right">{{ r.stapel }}</td>
        </tr>
      </tbody>
    </v-table>
    <p v-if="rows.length === 0 && !ladeFehler" class="ma-4">
      Keine Post-Bestellungen mit Lieferdatum {{ datum }}.
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

const { data: bestellungen, error: ladeFehlerRaw } = await useFetch("/api/bestellungen_post", {
  query: { datum },
});
const ladeFehler = computed(() =>
  ladeFehlerRaw.value ? ladeFehlerRaw.value.data?.error ?? ladeFehlerRaw.value.message : ""
);

const rows = ref([]);
watch(
  bestellungen,
  (list) => {
    rows.value = (Array.isArray(list) ? list : []).map((b) => ({
      ...b,
      // Etiketten nur fuer bezahlte Bestellungen (andere bleiben sichtbar, aber abgewaehlt)
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
const stapelGroesse = ref(25);
const testmodus = ref(false);
const running = ref(false);
const abbrechen = ref(false);
const fortschritt = ref({ done: 0, total: 0 });
const stapel = ref([]);

// Seitenfragmente der erzeugten Etiketten in Reihenfolge der Erzeugung
let fragments = [];
let fragmentsTestmodus = null;
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
  // Fragmente eines anderen Modus (Test/echt) verwerfen
  if (fragmentsTestmodus !== null && fragmentsTestmodus !== testmodus.value) {
    fragments = [];
    rows.value.forEach((r) => {
      r.ergebnis = "";
      r.fehler = "";
      r.stapel = null;
    });
  }
  fragmentsTestmodus = testmodus.value;

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
      const d = await $fetch("/api/etikette_brother", {
        query: { id: r.id, preview: testmodus.value ? 1 : 0, media: media.value },
      });
      jobInit = d.jobInit;
      pageIndicatorOffset = d.pageIndicatorOffset;
      fragments.push({ row: r, bytes: b64ToBytes(d.page) });
      r.Sendungsnummer = d.sendungsnummer;
      if (!testmodus.value) r.Status = "Etikette";
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

// Dateien zusammensetzen: JOB_INIT + Seite 1 + FF + Seite 2 + ... + letzte Seite + Control-Z
// (gleiche Logik wie mergePages() in server/utils/brotherRaster.js)
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
    const kurz = datum.slice(5).replace("-", ""); // MMTT
    out.push({
      nr,
      anzahl: chunk.length,
      bytes: blob.size,
      url: URL.createObjectURL(blob),
      filename: `${testmodus.value ? "TEST" : "ETIK"}${kurz}-${nr}.bin`,
      namen: chunk.map((f) => `${f.row.Vorname ?? ""} ${f.row.Name ?? ""}`.trim()),
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
