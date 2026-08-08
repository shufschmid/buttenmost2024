<template>
  <div>
    <v-form name="rechnung" ref="form">
      <v-toolbar class="d-print-none">
        <template v-slot:prepend>
          <v-btn icon="mdi-table-edit"></v-btn>
        </template>
        <v-btn-toggle v-model="vertrieb" mandatory color="primary" class="mr-4">
          <v-btn value="Kurier">Zentrale (Velokurier)</v-btn>
          <v-btn value="Fahrer">Direkt per Lieferwagen</v-btn>
          <v-btn value="Abholung">Abholung</v-btn>
        </v-btn-toggle>
      </v-toolbar>

      <v-container id="tour">
        <v-row
          ><v-col cols="8"
            ><h1>{{ formattedDatum }} <br/>{{ vertriebLabel }}</h1></v-col
          >
          <v-col cols="4" align="right">
            

        <img src="/logo.svg" alt="Buttenmost Logo" style="max-width: 200px; margin-bottom: 0rem;" /><br />
          </v-col><v-col cols="12">
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Kunde</th>

                  <th class="text-left">Buttenmost</th>
                  
                  <th class="text-right">leere Kistli zurück</th>

                  <th class="text-right">Konfi gross</th>
                  
                  <th class="text-right">Konfi klein</th>
                  
                  <th class="text-right">Info Fahrer</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lieferung in lieferungen.data.value" :key="lieferung.Id">
                  <td valign="top">{{ lieferung.Kunde }}</td>
                  <td valign="top">{{ Math.round(lieferung.Menge/store.liter_pro_kistli) }} Kistli</td>
                  <td valign="top">
                    <template v-if="lieferung.sofortzurueck?.[0] === true"
                      >Kistli sofort zurücknehmen</template
                    >
                    <template v-else-if="letzteBestellungen[lieferung.Kunde]"
                      >{{ Math.round(letzteBestellungen[lieferung.Kunde].Menge / store.liter_pro_kistli) }} Kistli zurücknehmen</template
                    >
                  </td>
                  <td valign="top"
                    ><template v-if="lieferung.Konfi_gr"
                      >{{ lieferung.Konfi_gr }} Schachteln</template
                    ></td
                  >
                  <td valign="top"
                    ><template v-if="lieferung.Konfi_kl"
                      >{{ lieferung.Konfi_kl }} Schachteln</template
                    ></td
                  >
                  <td valign="top">
                    {{ lieferung.Bemerkungen }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td valign="top"><b>Total</b></td>
                  <td valign="top"><b>{{ totale.kistli }} Kistli</b></td>
                  <td valign="top"></td>
                  <td valign="top"
                    ><b v-if="totale.konfiGross"
                      >{{ totale.konfiGross }} Schachteln</b
                    ></td
                  >
                  <td valign="top"
                    ><b v-if="totale.konfiKlein"
                      >{{ totale.konfiKlein }} Schachteln</b
                    ></td
                  >
                  <td valign="top"></td>
                </tr>
              </tfoot> </v-table
            >
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>
<script setup>
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});
let buttoncolor = ref("primary");
const store = useButtenmostStore();
const route = useRoute();

const vertrieb = computed({
  get: () => route.query.vertrieb || "Kurier",
  set: (v) =>
    navigateTo({ path: route.path, query: { ...route.query, vertrieb: v } }),
});

const formattedDatum = computed(() =>
  new Date(route.params.datum).toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
  })
);

const vertriebLabel = computed(() => {
  if (vertrieb.value === "Fahrer") return "Verteilung direkt per Lieferwagen";
  if (vertrieb.value === "Abholung") return "Abholung in Hochwald";
  return "Verteilung über Zentrale per Velokurier";
});

const lieferungen = await useFetch(() =>
  '/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&view=tour&filter=' +
    encodeURIComponent(
      `AND(DATESTR({Lieferdatum})="${route.params.datum}",{vertrieb}="${vertrieb.value}")`
    )
);

const totale = computed(() => {
  const data = lieferungen.data.value || [];
  return {
    kistli: Math.round(
      data.reduce((sum, l) => sum + (l.Menge || 0), 0) / store.liter_pro_kistli
    ),
    konfiGross: data.reduce((sum, l) => sum + (l.Konfi_gr || 0), 0),
    konfiKlein: data.reduce((sum, l) => sum + (l.Konfi_kl || 0), 0),
  };
});

const letzteBestellungen = ref({});

watch(
  () => lieferungen.data.value,
  async (data) => {
    const kunden = [...new Set((data || []).map((l) => l.Kunde))];
    const results = {};
    await Promise.all(
      kunden.map(async (kunde) => {
        const prev = await $fetch(
          '/api/airtable_get/?basis=tblbU1zmZ2kumAXEY&view=tour&filter=' +
            encodeURIComponent(
              `AND({Kunde}="${kunde}",DATESTR({Lieferdatum})<"${route.params.datum}")`
            ) +
            '&sortfield=Lieferdatum&sortdirection=desc&maxRecords=1'
        );
        if (prev && !Array.isArray(prev)) {
          results[kunde] = prev;
        }
      })
    );
    letzteBestellungen.value = results;
  },
  { immediate: true }
);

function printdate(datum) {
  return new Date(datum).toLocaleDateString();
}

</script>

<style scoped>
th, td {
  border: 1px solid #e0e0e0;
}
</style>
