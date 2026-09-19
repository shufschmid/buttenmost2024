<template>
  <v-toolbar class="d-print-none">
    <template v-slot:prepend>
      <v-btn icon="mdi-table-edit"></v-btn>
    </template>
    <v-toolbar-title>Admin-Bereich</v-toolbar-title>
    <v-btn href="https://www.payrexx.ch" variant="outlined" class="ml-2"
      >Payrexx</v-btn
    >
    <v-btn
      href="https://airtable.com/appGF3k6k6MO8AMkz/tblbU1zmZ2kumAXEY/viwEmeSz33ziajVUp?blocks=hide"
      variant="outlined"
      class="ml-2"
      >Airtable: Bestellungen</v-btn
    >
    <v-btn href="https://www.rapidmail.de/" variant="outlined" class="ml-2"
      >Rapidmail</v-btn
    >
  </v-toolbar>

  <v-container fluid class="pa-md-6">
    <!-- Kennzahlen zum nächsten Liefertermin -->
    <v-row v-if="shippingDays[0]">
      <v-col cols="12" md="8">
        <v-card variant="tonal" color="info" class="h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon icon="mdi-package-variant" size="large"></v-icon>
            </template>
            <v-card-title>Vorrat für {{ shippingDays[0].title }}</v-card-title>
            <v-card-subtitle class="text-wrap">{{ ausgabe }}</v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="tonal" color="success" class="h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon icon="mdi-basket-outline" size="large"></v-icon>
            </template>
            <v-card-title>{{ VorrratKistli }} Kistli</v-card-title>
            <v-card-subtitle>noch verfügbar</v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Lieferlisten / Kunden nachfassen -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon icon="mdi-truck-outline" class="mr-2"></v-icon>Lieferlisten
            drucken
          </v-card-title>
          <v-divider></v-divider>
          <v-list density="compact" nav>
            <v-list-item
              v-for="Liefertag in shippingDays.slice(0, 3)"
              :key="Liefertag.Datum"
              :to="'/tour/datum/' + Liefertag.Datum"
              prepend-icon="mdi-clipboard-list-outline"
              :title="'Lieferdatum: ' + Liefertag.Datum"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon icon="mdi-account-alert-outline" class="mr-2"></v-icon>Noch keine
            Bestellung ({{ kundenOhneBestellung.length }})
          </v-card-title>
          <v-divider></v-divider>
          <v-list density="compact">
            <v-list-item
              v-for="k in kundenOhneBestellung"
              :key="k.Id"
              :title="k.Geschaeft"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon icon="mdi-clock-alert-outline" class="mr-2"></v-icon>Letzte
            Lieferung > {{ NACHFASS_TAGE }} Tage ({{ kundenUeberfaellig.length }})
          </v-card-title>
          <v-divider></v-divider>
          <v-list density="compact">
            <v-list-item
              v-for="k in kundenUeberfaellig"
              :key="k.Id"
              :title="k.Geschaeft"
              :subtitle="ueberfaelligText(k)"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Kübelgrösse Postversand -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <VerteilungsTabelle
              :bestellungen="BestellungenPost"
              :liefertage="shippingDaysPost"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sendungsnummern-Übersicht -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <LiefernummernCheck
              :bestellungen="BestellungenPost"
              :liefertage="shippingDaysPost"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Rechnungen, Sammelrechnungen, (frei) -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon icon="mdi-printer" class="mr-2"></v-icon>Rechnungen
          </v-card-title>
          <v-divider></v-divider>
          <v-list density="compact" nav>
            <v-list-item
              v-for="Liefertag in shippingDays"
              :key="Liefertag.Datum"
              :to="'/rechnungen/datum/' + Liefertag.Datum"
              :title="Liefertag.Datum"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon icon="mdi-file-document-multiple-outline" class="mr-2"></v-icon
            >Sammelrechnungen
          </v-card-title>
          <v-divider></v-divider>
          <v-card-subtitle class="pt-3">aus offenen Bestellungen</v-card-subtitle>
          <v-list density="compact" nav>
            <v-list-item
              v-for="Geschaeft in rechnungen()"
              :key="Geschaeft"
              :to="'/rechnungen/sammelrechnung/' + Geschaeft"
              :title="Geschaeft"
            ></v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-card-subtitle class="pt-3">aus Verkaufsstellen</v-card-subtitle>
          <v-list density="compact" nav>
            <v-list-item
              v-for="Laden in Sammelrechnungen"
              :key="Laden.Geschaeft"
              :to="'/rechnungen/sammelrechnung/' + Laden.Geschaeft"
              :title="Laden.Geschaeft"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- frei: hier kommt später eine weitere Karte hin -->
      <v-col cols="12" md="4"></v-col>
    </v-row>

    <!-- Werkzeuge -->
    <v-row class="d-print-none">
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-title>
            <v-icon icon="mdi-wrench-outline" class="mr-2"></v-icon>Werkzeuge
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-message-text-outline"
              @click="sms('+41796169078', 'Test SMS from Nuxt 3')"
              >Test SMS</v-btn
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
const store = useButtenmostStore();
onMounted(async () => {
  await vorratconsole()
})
definePageMeta({
  middleware: "auth", // https://dev.to/rafaelmagalhaes/authentication-in-nuxt-3-375o
});
const { data } = await useFetch(
  "/api/airtable_get?basis=tblbU1zmZ2kumAXEY&view=b2b_rechnungen"
);
async function vorratconsole() {
  let Vorrat = await $fetch("/api/vorrat/");
  VorrratKistli.value = Math.floor(Vorrat / store.liter_pro_kistli);

  let Lieferdatum = ref(shippingDays[0]);

  let verkauftURL =
    'api/verkauft/?filter=DATESTR({Lieferdatum})="' +
    Lieferdatum.value.value +
    '"&vertrieb=' +
    vertrieb.value;

  let { verkaufttotal, verkauftvertriebskanal } = await $fetch(verkauftURL);
VorrratKistli.value = Math.floor((Vorrat - verkaufttotal)/ store.liter_pro_kistli);
  console.log(
    "Vorrat",
    Vorrat,
    "bereits verkauft an diesem Tag",
    verkaufttotal
  );
  let verfügbar = Vorrat - verkaufttotal;
  ausgabe.value = +Vorrat+" | bereits verkauft an diesem Tag: "+verkaufttotal+" | verfügbar: "+verfügbar;

}


function rechnungen(){
  let arr = data.value.map((item) => {
      return item.Kunde
    })
    let res = [...new Set(arr)];
    return res
}
const shippingDays = await $fetch(
  "/api/airtable_get?basis=Lieferdaten&view=b2b&sort=true"
);
const shippingDaysPost = await $fetch(
  "/api/airtable_get?basis=Lieferdaten&view=post_alle&sort=true"
);
const BestellungenPost = await $fetch(
  "/api/airtable_get?basis=Bestellungen&view=post"
);
const Sammelrechnungen = await $fetch(
  "/api/airtable_get?basis=Verkaufsstellen&view=Sammelrechnungen"
);

// --- Kunden nachfassen: alle Stammkunden (Checkbox in Airtable, unabhängig vom Vertriebskanal)
// ohne Saisonbestellung bzw. mit
// letzter Lieferung vor mehr als NACHFASS_TAGE Tagen
const NACHFASS_TAGE = 10;
// airtable_get entpackt ein Einzelergebnis zum Objekt, ein leeres Ergebnis bleibt []
const toArray = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const saisonStart = store.SaisonStartFirmen.toISOString().substring(0, 10);

const nachfassKunden = toArray(
  await $fetch(
    "/api/airtable_get?basis=Verkaufsstellen&view=alle&filter=" +
      encodeURIComponent("{Stammkunde}=TRUE()")
  )
).filter((k) => k.Geschaeft);

const saisonBestellungen = toArray(
  await $fetch(
    "/api/airtable_get?basis=tblbU1zmZ2kumAXEY&view=" +
      encodeURIComponent("Reminder Stammkunden") +
      "&filter=" +
      encodeURIComponent(`DATESTR({Lieferdatum})>="${saisonStart}"`)
  )
);

// Kunde -> spätestes Lieferdatum (ISO-Strings vergleichen lexikografisch korrekt)
const letzteLieferung = {};
for (const b of saisonBestellungen) {
  if (!b.Kunde || !b.Lieferdatum) continue;
  if (!letzteLieferung[b.Kunde] || b.Lieferdatum > letzteLieferung[b.Kunde]) {
    letzteLieferung[b.Kunde] = b.Lieferdatum;
  }
}

function tageSeit(datum) {
  return Math.floor((store.heute - new Date(datum)) / 86400000);
}

const kundenOhneBestellung = nachfassKunden.filter(
  (k) => !letzteLieferung[k.Geschaeft]
);
// künftiges Lieferdatum -> tageSeit negativ -> nicht überfällig
const kundenUeberfaellig = nachfassKunden
  .filter(
    (k) =>
      letzteLieferung[k.Geschaeft] &&
      tageSeit(letzteLieferung[k.Geschaeft]) > NACHFASS_TAGE
  )
  .map((k) => ({ ...k, letzte: letzteLieferung[k.Geschaeft] }))
  .sort((a, b) => a.letzte.localeCompare(b.letzte)); // älteste zuerst

function ueberfaelligText(k) {
  return (
    "zuletzt " + k.letzte + " (vor " + tageSeit(k.letzte) + " Tagen)"
  );
}

let search = ref();
let VorrratKistli = ref(0);
let vertrieb = ref();
let ausgabe = ref("test");
</script>

<style scoped>
/* Listenzeilen kompakter: Vuetify "compact" misst 40px (einzeilig) bzw. 56px (zweizeilig).
   !important nötig, weil Vuetifys Selektoren gleich spezifisch sind wie die :deep()-Regeln. */
:deep(.v-list) {
  padding-block: 4px;
}
:deep(.v-list-item) {
  min-height: 20px !important;
  padding-block: 0 !important;
}
:deep(.v-list-item--two-line) {
  min-height: 36px !important;
}
:deep(.v-list--nav .v-list-item) {
  margin-bottom: 0 !important;
}
:deep(.v-list-item-title) {
  line-height: 1.25rem;
}
:deep(.v-list-item-subtitle) {
  line-height: 1rem;
}
</style>
