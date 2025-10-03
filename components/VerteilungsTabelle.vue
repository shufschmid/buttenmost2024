<template>
  <div>
    <h2>Kübelgrösse Postversand</h2>
    <v-table density="compact" class="mt-4">
      <thead>
        <tr>
          <th class="text-left">Lieferdatum</th>
          <th v-for="header in headers" :key="header" class="text-center">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in matrix" :key="item.datum">
          <td>{{ item.datum }}</td>
          <td v-for="(count, index) in item.counts" :key="index" class="text-center">
            {{ count > 0 ? count : '' }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { useButtenmostStore } from '~/store/ButtenmostStore';
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

const store = useButtenmostStore();

// Kategorien aus dem Store holen und Header generieren
const headers = computed(() => {
  let lowerBound = 1;
  return store.Verpackung.filter(v => v.Menge > 0).map(v => {
    const header = `${v.Menge-1}-Liter`;
    lowerBound = v.Menge + 1;
    return header;
  });
});

// Matrix mit den Zählungen berechnen
const matrix = computed(() => {
  const kategorien = store.Verpackung.filter(v => v.Menge > 0);

  return props.liefertage.map(tag => {
    const counts = kategorien.map((kategorie, index) => {
      const lowerBound = index === 0 ? 0 : kategorien[index - 1].Menge;
      const upperBound = kategorie.Menge;

      const anzahl = props.bestellungen.filter(bestellung => {
        return (
          bestellung.Lieferdatum === tag.Datum &&
          bestellung.Menge >= lowerBound &&
          bestellung.Menge < upperBound
        );
      }).length;
      return anzahl;
    });

    return {
      datum: tag.Datum,
      counts: counts,
    };
  });
});
</script>

<style scoped>
th, td {
  border: 1px solid #e0e0e0;
}
</style>