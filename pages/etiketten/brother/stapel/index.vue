<template>
  <div>
    <v-toolbar class="d-print-none">
      <v-btn to="/admin" prepend-icon="mdi-arrow-left" variant="text">Admin-Bereich</v-btn>
      <v-toolbar-title>Post-Etiketten im Stapel (Brother QL-1110NWB)</v-toolbar-title>
    </v-toolbar>

    <v-container>
      <v-row>
        <v-col cols="12" md="5">
          <v-card class="h-100">
            <v-card-title>
              <v-icon icon="mdi-calendar" class="mr-2"></v-icon>Lieferdatum wählen
            </v-card-title>
            <v-divider></v-divider>
            <v-card-subtitle class="pt-3">
              Es werden alle Post-Bestellungen dieses Datums aufgelistet.
            </v-card-subtitle>
            <v-list v-if="tage.length" density="compact" nav>
              <v-list-item
                v-for="tag in tage"
                :key="tag.Datum"
                :to="'/etiketten/brother/stapel/' + tag.Datum"
                :title="tag.title || tag.Datum"
                :subtitle="tag.Datum"
                prepend-icon="mdi-label-multiple"
              />
            </v-list>
            <v-card-text>
              <v-text-field
                v-model="eigenesDatum"
                label="Anderes Datum (JJJJ-MM-TT)"
                density="compact"
                hide-details
              >
                <template #append>
                  <v-btn
                    :to="'/etiketten/brother/stapel/' + eigenesDatum"
                    :disabled="!/^\d{4}-\d{2}-\d{2}$/.test(eigenesDatum)"
                  >
                    Öffnen
                  </v-btn>
                </template>
              </v-text-field>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-card class="h-100">
            <v-card-title>
              <v-icon icon="mdi-usb-flash-drive-outline" class="mr-2"></v-icon
              >Drucker im Massenspeicher-Modus starten
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <ol class="ml-4 mb-4">
                <li class="mb-2">
                  <b>Drucker ausschalten.</b> Rolle DK-11247 (103 × 164 mm) muss eingelegt sein.
                </li>
                <li class="mb-2">
                  <b>Wi-Fi-Taste und Ein/Aus-Taste gleichzeitig</b> einige Sekunden gedrückt
                  halten, bis die Status-LED grün leuchtet. Der Drucker ist jetzt im
                  Massenspeicher-Modus (WLAN und Bluetooth sind dabei aus).
                </li>
                <li class="mb-2">
                  <b>USB-Kabel</b> mit dem Computer verbinden. Der Drucker erscheint als
                  Wechseldatenträger (2,5 MB), wie ein USB-Stick.
                </li>
                <li class="mb-2">
                  Auf der Stapelseite die Etiketten erzeugen und <b>eine .bin-Datei</b> ins
                  Hauptverzeichnis des Druckerlaufwerks kopieren (keine Ordner, nie zwei Dateien
                  gleichzeitig).
                </li>
                <li class="mb-2">
                  <b>WPS-Taste drücken.</b> Die Status-LED blinkt kurz, der Drucker druckt und
                  schneidet alle Etiketten der Datei. Fertig, wenn die LED wieder dauerhaft grün
                  leuchtet.
                </li>
                <li class="mb-2">
                  <b>Nächste Datei:</b> die gedruckte Datei im Laufwerk löschen (oder Drucker aus-
                  und wieder einschalten, Schritte 1 bis 3), dann die nächste Datei kopieren und
                  erneut WPS drücken.
                </li>
                <li>
                  <b>Beenden:</b> Drucker ausschalten. Die Dateien im Druckerspeicher werden dabei
                  gelöscht.
                </li>
              </ol>
              <v-alert type="warning" variant="tonal" density="compact">
                Status-LED blinkt rot: einmal pro 2 Sekunden heisst falsche Rolle, Deckel offen oder
                Rollenende; zweimal pro 2 Sekunden Massenspeicher-Fehler (Drucker aus, 5 Sekunden
                warten, neu starten). Auf der Stapelseite muss dieselbe Rolle gewählt sein, die im
                Drucker liegt.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
const eigenesDatum = ref("");
const { data } = await useFetch("/api/airtable_get?basis=Lieferdaten&view=post_alle&sort=true");
const tage = computed(() => {
  const d = data.value;
  return Array.isArray(d) ? d : d && d.Datum ? [d] : [];
});
</script>
