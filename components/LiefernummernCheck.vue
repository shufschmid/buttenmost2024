<template>
  <div class="mt-8">
    <h2>Sendungsnummern-Übersicht Postversand</h2>
    <v-table density="compact" class="mt-4">
      <thead>
        <tr>
          <th class="text-left">Lieferdatum</th>
          <th class="text-left">Erste Sendungsnummer</th>
          <th class="text-left">Letzte Sendungsnummer</th>
          <th class="text-left">Lücken / Fehler</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sendungsnummernData" :key="item.datum">
          <td>{{ item.datum }}</td>
          <td>{{ item.allNumbers.length > 0 ? item.allNumbers[0].toString() : '' }}</td>
          <td>{{ item.allNumbers.length > 0 ? item.allNumbers[item.allNumbers.length - 1].toString() : '' }}</td>
          <td>
              <div v-for="(num, index) in item.allNumbers" :key="num.toString()">
                <!-- Prüft auf Lücken nach dem ersten Element -->
                <div v-if="index > 0 && num > (item.allNumbers[index - 1] + 1n)" class="text-red font-weight-bold">
                  Lücke vor: {{ num.toString() }}
                </div>
                <!-- Prüft auf Duplikate oder falsche Sortierung -->
                <div v-else-if="index > 0 && num <= item.allNumbers[index - 1]" class="text-orange font-weight-bold">
                  Fehler/Duplikat bei: {{ num.toString() }}
                </div>
              </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  bestellungen: {
    type: Array,
    required: true,
  },
  liefertage: {
    type: Array,
    required: true,
  },
});

// Hilfsfunktion, um nur den Datumsteil eines Datums-Strings zu bekommen (YYYY-MM-DD)
function getLocalDateString(dateString) {
    if (!dateString) return null;
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
}

// Bestellungen einmalig nach Datum gruppieren für bessere Performance
const bestellungenByDate = computed(() => {
  const grouped = new Map();
  if (!props.bestellungen) {
    return grouped;
  }

  for (const bestellung of props.bestellungen) {
    const dateString = getLocalDateString(bestellung.Lieferdatum);
    if (!dateString) continue;

    if (!grouped.has(dateString)) {
      grouped.set(dateString, []);
    }
    grouped.get(dateString).push(bestellung);
  }
  return grouped;
});

// Daten für die Tabelle aufbereiten
const sendungsnummernData = computed(() => {
  return props.liefertage.map(tag => {
    const tagDatumString = getLocalDateString(tag.Datum);
    const bestellungenAmTag = bestellungenByDate.value.get(tagDatumString) || [];

    // 1. Extrahiere alle gültigen Sendungsnummern als BigInt
    const alleNummern = bestellungenAmTag
      .map(b => {
        try {
          // Versuche, die Nummer in ein BigInt umzuwandeln
          return BigInt(b.Sendungsnummer);
        } catch (e) {
          // Wenn es fehlschlägt (z.B. leerer String), gib null zurück
          return null;
        }
      })
      .filter(n => n !== null); // Filtere alle ungültigen Einträge heraus

    // 2. Sortiere die BigInt-Nummern
    alleNummern.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    // 3. Gib das Datenobjekt für die Tabellenzeile zurück
    return {
      datum: tag.Datum,
      allNumbers: alleNummern,
    };
  });
});
</script>

<style scoped>
th, td {
  border: 1px solid #e0e0e0;
}
</style>