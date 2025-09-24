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
      href="https://airtable.com/app8cUEZWBvWHDfaN/tblbU1zmZ2kumAXEY/viwEmeSz33ziajVUp?blocks=hide"
      variant="outlined"
      class="ml-2"
      >Airtable: Bestellungen</v-btn
    >
    <v-btn href="https://www.rapidmail.de/" variant="outlined" class="ml-2"
      >Rapidmail</v-btn
    >
  </v-toolbar>
  <v-container
    ><v-row
      ><v-col cols="12">
        <v-alert
    type="info"
    variant="tonal"
    class="mx-auto my-4"
    style="max-width: 100%; font-size: 1rem; font-weight: 500"
    border="start"
  >
     Vorrat für {{shippingDays[0].title}}: {{ ausgabe }}
    </v-alert
  >
        
        
        
       
        </v-col
    ></v-row>
    <v-row
      ><v-col cols="12" md="4">
        <h2><v-icon icon="mdi-printer"></v-icon>Rechnungen</h2>
        <ul class="ml-4">
          <li v-for="Liefertag in shippingDays">
            <nuxt-link :to="'/rechnungen/datum/' + Liefertag.Datum">{{ Liefertag.Datum }}
              </nuxt-link
            >
          </li>
        </ul><br/><br/>
        <h2>Sammelrechnungen</h2>
        <ul class="ml-4">
          <li v-for="Geschaeft in rechnungen()">
            <nuxt-link :to="'/rechnungen/sammelrechnung/' + Geschaeft">{{ Geschaeft }}
              </nuxt-link
            >
          </li>
        </ul>
        
        </v-col
      ><v-col cols="12" md="8"
        ><h2>aktuelle Bestellungen</h2>
        <ul class="ml-4">
          <li v-for="Bestellung in Bestellungen">
            {{ Bestellung.Lieferdatum }} | {{ Bestellung.Kunde }} |
            <nuxt-link :to="'/rechnungen/' + Bestellung.Id">Rechnung</nuxt-link
            > | <nuxt-link :to="'/lieferschein/' + Bestellung.Id"
              >Lieferschein</nuxt-link> | <nuxt-link :to="'/etiketten/' + Bestellung.Id"
              >Etikette</nuxt-link 
            >
          </li>
        </ul></v-col
      ><v-col cols="12" md="4"></v-col
    ></v-row>
    
  </v-container>
  <v-btn
      color="primary"
      @click="sms('+41796169078', 'Test SMS from Nuxt 3')"
      >Test SMS</v-btn>
</template>
<script setup>
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
const Bestellungen = await $fetch(
  "/api/airtable_get?basis=Bestellungen&view=admin"
);


let search = ref();
let VorrratKistli = ref(0);
let vertrieb = ref();
let ausgabe = ref("test");
const store = useButtenmostStore();
</script>
