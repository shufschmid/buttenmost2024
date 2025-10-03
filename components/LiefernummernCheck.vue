<template>
  <div class="mt-8">
    <h2>Sendungsnummern-Übersicht Postversand</h2>
    <v-table density="compact" class="mt-4">
      <thead>
        <tr>
          <th class="text-left">Lieferdatum</th>
          <th class="text-left">Erster Kessel</th>
          <th class="text-left">Letzter Kessel</th>
          <th class="text-left">Vorhandene Sendungsnummern</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sendungsnummernData" :key="item.datum">
          <td>{{ item.datum }}</td>
          <td>{{ item.allNumbers[0] }}</td>
          <td>{{ item.allNumbers[item.allNumbers.length - 1] }}</td>
          <td>
              <!-- Zeigt die erste Nummer immer an, und dann nur die, die keine direkte Folge sind -->
              <span v-for="(num, index) in item.allNumbers" :key="num">
                <span v-if="(num % 10000) > ((item.allNumbers[index - 1]) % 10000)" class="text-red font-weight-bold">
                  Lücke: {{ num %10000}}
                </span>
                
            </span>
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
    // Schneller Zugriff auf die vorsortierten Bestellungen des Tages
    const bestellungenAmTag = bestellungenByDate.value.get(tagDatumString) || [];

    // 1. Extrahiere alle gültigen Sendungsnummern des Tages
    const alleNummern = bestellungenAmTag
      .map(b => (b.Sendungsnummer))
      .filter(sn => sn)
      .sort((a, b) => a - b);                   // Numerisch sortieren

    // 2. Sortiere die Nummern für die Anzeige

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