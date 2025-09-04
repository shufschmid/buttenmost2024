<template>
  <h2>Bestellübersicht</h2>
  <v-table >
    <thead>
      <tr>
        <th class="text-left">Liefer- oder Abholdatum</th>
        <th class="text-left">Menge/Produkt</th>
        <th class="text-right">Betrag</th>
      </tr>
    </thead>
    <tbody></tbody>
    <tr>
      <td valign="top">{{ data.Lieferdatum }}</td>
      <td valign="top">
        {{ data.Menge }} Liter Buttenmost
        <span v-show="data.Typ == 'Laden'">
          im Becher à CHF {{ (store.PreisProLiter + store.PreisBecher).toFixed(2) }}
        </span>
        <span v-show="data.Konfi_gr > 0">
          <br />{{ data.Konfi_gr }} Karton Konfi gross (6 Gläser) {{ store.konfi_gross_preis.toFixed(2) }}
        </span>
        <span v-show="data.Konfi_kl > 0">
          <br />{{ data.Konfi_kl }} Karton Konfi klein (6 Gläser) à CHF {{ store.konfi_klein_preis.toFixed(2) }}
        </span>
        <span v-if="data.Lieferpauschale > 0">
          <br />{{ 1 }} x Lieferpauschale
        </span>
      </td>
      <td valign="top" class="text-right">
        CHF {{
          (
            data.Menge *
            (Number(store.PreisBecher) + Number(store.PreisProLiter))
          ).toFixed(2)
        }}
        <span v-show="data.Konfi_gr > 0">
          <br />CHF {{ (data.Konfi_gr * store.konfi_gross_preis).toFixed(2) }}
        </span>
        <span v-show="data.Konfi_kl > 0">
          <br />CHF {{ (data.Konfi_kl * store.konfi_klein_preis).toFixed(2) }}
        </span>
        <span v-if="data.Lieferpauschale > 0">
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
  </v-table>
</template>

<script setup>
const props = defineProps({
  data: { type: Object, required: true }
})

  console.log('BestellungTable props:', props.data)
const store = useButtenmostStore();
</script>