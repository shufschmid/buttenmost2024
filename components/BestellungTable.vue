<template>
  <h2>Bestellübersicht</h2>
  <v-table >
    <thead>
      <tr>
        <th class="text-left">{{ data.vertrieb === "Abholung" ? "Abholdatum" : "Lieferdatum" }}</th>
        <th class="text-left">Menge/Produkt</th>
        <th class="text-right">Betrag</th>
      </tr>
    </thead>
    <tbody>
    <tr>
      <td>{{ printdate(data.Lieferdatum) }}</td>
      <td>
        {{ data.Menge }} Liter Buttenmost
        <span v-show="data.Typ == 'Laden'">
          im Becher à CHF {{ (store.PreisProLiter + store.PreisBecher).toFixed(2) }}
        </span>
        <span v-show="data.Konfi_gr > 0">
          <br />{{ data.Konfi_gr }} Karton Konfi gross ({{ store.konfi_gross_anzahl_pro_karton }} Gläser) à CHF {{ (store.konfi_gross_anzahl_pro_karton * store.konfi_gross_preis).toFixed(2) }}
        </span>
        <span v-show="data.Konfi_kl > 0">
          <br />{{ data.Konfi_kl }} Karton Konfi klein ({{ store.konfi_klein_anzahl_pro_karton }} Gläser) à CHF {{ (store.konfi_klein_anzahl_pro_karton * store.konfi_klein_preis).toFixed(2) }}
        </span>
        
        <span v-if="data.Verpackung > 0">
          <br />Verpackung
        </span>
        <span v-if="data.Porto > 0">
          <br />Porto
        </span>
        <span v-if="data.Lieferpauschale > 0 && data.vertrieb !== 'Abholung'">
          <br />Lieferpauschale
        </span>
        <span v-else-if="data.Lieferpauschale > 0">
          <br />Kleinmengenzuschlag
        </span>
        <span v-else-if="data.Lieferpauschale < 0">
          <br />Mengenrabatt
        </span>
      </td>
      <td class="text-right">
        <span v-if="data.Typ == 'Laden'">
          CHF {{
            (
              data.Menge *
              (Number(store.PreisBecher) + Number(store.PreisProLiter))
            ).toFixed(2)
          }}
        </span>
        <span v-else>
          CHF {{
            (
              (data.Betrag || 0) -
              (data.Verpackung || 0) -
              (data.Porto || 0) -
              (data.Lieferpauschale || 0) -
              (data.Konfi_kl || 0) * store.konfi_klein_anzahl_pro_karton * store.konfi_klein_preis -
              (data.Konfi_gr || 0) * store.konfi_gross_anzahl_pro_karton * store.konfi_gross_preis
            ).toFixed(2)
          }}
        </span>
        
        <span v-show="data.Konfi_gr > 0">
          <br />CHF {{ (data.Konfi_gr * store.konfi_gross_anzahl_pro_karton * store.konfi_gross_preis).toFixed(2) }}
        </span>
        <span v-show="data.Konfi_kl > 0">
          <br />CHF {{ (data.Konfi_kl * store.konfi_klein_anzahl_pro_karton * store.konfi_klein_preis).toFixed(2) }}
        </span>
        
        <span v-if="data.Verpackung > 0">
          <br />CHF {{ data.Verpackung.toFixed(2) }}
        </span>
        <span v-if="data.Porto > 0">
          <br />CHF {{ data.Porto.toFixed(2) }}
        </span>
        <span v-if="data.Lieferpauschale">
          <br />CHF {{ data.Lieferpauschale.toFixed(2) }}
        </span>
        
      </td>
    </tr>
    <tr>
      <td><b>Total inkl. {{ store.mehrwertsteuersatz }} % MWST</b></td>
      <td></td>
      <td class="text-right">
        <b>CHF {{ data.Betrag.toFixed(2) }}</b>
      </td>
    </tr>
    <tr>
      <td>davon MWST</td>
      <td></td>
      <td class="text-right">
        CHF {{ (data.Betrag * store.mehrwertsteuersatz / 100).toFixed(2) }}
      </td>
    </tr>
    </tbody>
  </v-table>
</template>

<script setup>
const props = defineProps({
  data: { type: Object, required: true }
})

  console.log('BestellungTable props:', props.data)
const store = useButtenmostStore();

function printdate(datum) {
  if (!datum) return "";
  return new Date(datum).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
</script>

<style scoped>
/* Tabelle bündig zu Titel und Button ausrichten: Vuetify setzt auf jeder
   Zelle 16px horizontales Padding, aussen soll es aber keinen Abstand geben. */
th:first-child,
td:first-child {
  padding-left: 0 !important;
}
th:last-child,
td:last-child {
  padding-right: 0 !important;
}
</style>