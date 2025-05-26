<template>
  <v-container
    ><v-alert v-if="bestellungErfolgreich" type="success" closable class="mb-4">
      Bestellung erfolgreich!
    </v-alert>
    <v-stepper
      v-show="!bestellungErfolgreich"
      @update:model-value="onStepChange"
      :items="['Step 1', 'Step 2', 'Step 3', 'Step4']"
    >
      <template v-slot:item.1>
        <v-card title="Bestellung für Wiederverkäufer" flat
          ><v-banner
            class="m-0"
            color="pink-darken-1"
            icon="mdi-calendar"
            lines="one"
          >
            <v-select
              label="Datum"
              :items="shippingDays"
              v-model="Lieferdatum"
              return-object
            ></v-select>
          </v-banner>

          <v-table>
            <tbody>
              <tr>
                <td>
                  <v-text-field
                    variant="outlined"
                    v-model="kistli"
                    Name="Konfi gross"
                    type="number"
                    :max="verfuegbareMengeKistli"
                    :min="0"
                    dense
                  ></v-text-field>
                </td>
                <td>
                  Kistli Buttenmost ({{ store.liter_pro_kistli }} Liter) à CHF
                  {{
                    (
                      (store.PreisProLiter + store.PreisBecher) *
                      store.liter_pro_kistli
                    ).toFixed(2)
                  }}
                </td>
                <td class="text-right">
                  {{
                    (
                      (store.PreisProLiter + store.PreisBecher) *
                      store.liter_pro_kistli *
                      kistli
                    ).toFixed(2)
                  }}
                </td>
                <td>CHF</td>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    variant="outlined"
                    dense
                    v-model="konfi_klein"
                    label=""
                    Name="Konfi klein"
                    type="number"
                    :min="0"
                    hint="Achtung, Konfi gibt es nur noch in Kartons à 6 Gläser"
                  ></v-text-field>
                </td>
                <td>
                  Karton Konfi klein (6 Gläser) à CHF
                  {{ store.konfi_klein_preis.toFixed(2) }}
                </td>

                <td class="text-right">
                  {{ (konfi_klein * store.konfi_klein_preis).toFixed(2) }}
                </td>
                <td>CHF</td>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    dense
                    variant="outlined"
                    v-model="konfi_gross"
                    label=""
                    Name="Konfi gross"
                    type="number"
                    :min="0"
                    max-width="5"
                    hint="Achtung, Konfi gibt es nur noch in Kartons à 6 Gläser"
                  ></v-text-field>
                </td>
                <td>
                  Karton Konfi gross (6 Gläser) à CHF
                  {{ store.konfi_gross_preis.toFixed(2) }}
                </td>

                <td class="text-right">
                  {{ (konfi_gross * store.konfi_gross_preis).toFixed(2) }}
                </td>
                <td>CHF</td>
              </tr>

              <tr>
                <td>Zwischentotal:</td>
                <td></td>
                <td class="text-right">
                  {{ Zwischentotal().toFixed(2) }}
                </td>
                <td>CHF</td>
              </tr>
            </tbody></v-table
          >
        </v-card>
      </template>

      <template v-slot:item.2>
        <v-card title="Einloggen / Adresse eingeben" flat>
          Bestehende Kunden können sich hier mit dem Pin, den wir Ihnen vor
          Saisonstart per Post zugeschickt haben, einloggen. Alle anderen
          klicken auf weiter.
          <v-text-field
            v-model="pin"
            label="PIN"
            Name="PIN"
            :rules="PINRules"
            required
          ></v-text-field>
        </v-card>
      </template>

      <template v-slot:item.3>
        <v-card title="Step Three" flat
          ><div v-show="firma">{{ firma }}</div>

          <div v-show="!firma">
            <v-alert
              v-show="pin"
              closable
              text="Achtung: Falscher PIN-Code. Entweder Adresse eingeben und auf Vorkasse bestellen oder Zurück klicken und PIN erneut eingeben. Bei Fragen: Tel 079..."
              type="info"
            ></v-alert>
            <v-form v-model="formValidity">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    dense
                    v-model="Vorname"
                    label="Vorname"
                    name="Vorname"
                  ></v-text-field></v-col
                ><v-col cols="6">
                  <v-text-field
                    dense
                    v-model="Nachname"
                    label="Name/Geschäft"
                    name="Nachname"
                    required
                    :rules="nichtLeer"
                  ></v-text-field>
                </v-col> </v-row
              ><v-row dense>
                <v-col cols="12">
                  <v-text-field
                    dense
                    v-model="Adresse"
                    label="Adresse"
                    name="Adresse"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    dense
                    v-model="Adresszusatz"
                    label="Adresszusatz"
                    name="Adresszusatz"
                  ></v-text-field>
                </v-col> </v-row
              ><v-row dense>
                <v-col cols="3" md="3">
                  <v-text-field
                    dense
                    v-model="PLZ"
                    label="PLZ"
                    Name="PLZ"
                  ></v-text-field>
                </v-col>
                <v-col cols="9" md="9">
                  <v-text-field
                    dense
                    v-model="Ort"
                    label="Ort"
                    name="Ort"
                  ></v-text-field> </v-col></v-row
              ><v-row dense>
                <v-col cols="12">
                  <v-text-field
                    dense
                    v-model="Email"
                    label="E-mail"
                    name="Email"
                    :rules="EmailRules"
                    required
                  ></v-text-field>
                  <v-textarea
                    dense
                    v-model="Bemerkungen"
                    name="Bemerkungen"
                    label="Bemerkungen"
                    auto-grow
                    rows="1"
                  ></v-textarea> </v-col></v-row
            ></v-form></div
        ></v-card>
      </template>
      <template v-slot:item.4>
        <v-card title="Step Four" flat>
          <div v-show="rechnung">
            direkt in Datenbank eintragen mit folgenden Daten
          </div>
          <div v-show="!rechnung">
            provisorisch in Datenbank eintragen und Bezahlprozess auslösen
          </div>
          <div v-show="firma">
            {{ JSON.stringify(order_registered, null, 2) }}
          </div>
          <div v-show="!firma">
            {{ JSON.stringify(order_nonregistered, null, 2) }}
            <v-alert
              v-show="!formValidity && !firma"
              closable
              type="error"
              text="Achtung: Angaben im Formular ungenügend"
            ></v-alert>
          </div>
          <v-btn
            color="success"
            elevation="2"
            block
            @click="order"
            :disabled="!formValidity && !firma"
            :loading="loading"
          >
            Jetzt bestellen</v-btn
          >
        </v-card>
      </template>
    </v-stepper>
  </v-container>
</template>
<script setup>
const store = useButtenmostStore();
const shippingDays = await $fetch(
  "/api/airtable_get?basis=Lieferdaten&view=b2b&sort=true"
);
let pin = ref("");
let bestellungErfolgreich = ref(false);
function Zwischentotal() {
  return (
    (store.PreisProLiter + store.PreisBecher) *
      store.liter_pro_kistli *
      kistli.value +
    konfi_klein.value * store.konfi_klein_preis +
    konfi_gross.value * store.konfi_gross_preis
  );
}
let Lieferdatum = ref(shippingDays[0]);
let kistli = ref(2); //Voreinstellung
let konfi_gross = ref(0);
let nichtLeer = [(value) => !!value || "Angabe wird benötigt"];
let PLZRules = [
  (value) => !!value || "Postleitzahl fehlt",
  (value) => /\d\d\d\d/.test(value) || "Postleitzahl ungültig",
];
let EmailRules = [
  (value) => !!value || "E-Mail-Adresse wird benötigt",
  (value) =>
    value.indexOf("@") !== 0 || "Gültige E-Mail-Adresse wird benötigt ",
  (value) => value.includes("@") || "Gültige E-Mail-Adresse wird benötigt",
  (value) => value.includes(".") || "Gültige E-Mail-Adresse wird benötigt",
  (value) =>
    value.indexOf(".") <= value.length - 2 ||
    "Gültige E-Mail-Adresse wird benötigt",
];
let konfi_klein = ref(0);
let firma = ref();
let vertrieb = ref();
let rechnung = ref(false);
let Vorname = ref("");
let Nachname = ref("");
let Adresse = ref("");
let Adresszusatz = ref("");
let PLZ = ref("");
let Ort = ref("");
let Email = ref("");
let Bemerkungen = ref("");

let formValidity = ref(false);

let order_registered = computed(() => ({
  Geschaeft: firma.value ? firma.value : "",
  Typ: "Standard",
  vertrieb: vertrieb.value ? vertrieb.value : "abholung",
  Status: rechnung.value ? "Rechnung offen" : "bestellt",
  Betrag: vertrieb.value
    ? (Zwischentotal() + store.lieferpauschale).toFixed(2)
    : Zwischentotal().toFixed(2),
  Menge: kistli.value * store.liter_pro_kistli,
  Lieferdatum: Lieferdatum.value.value, //formatiert in yyyy-mm-dd
  Konfi_gr: konfi_gross.value,
  Konfi_kl: konfi_klein.value,
  Lieferpauschale: vertrieb.value ? store.lieferpauschale : 0,
}));

let order_nonregistered = computed(() => ({
  Email: Email.value,
  Vorname: Vorname.value,
  Name: Nachname.value,
  Adresse: Adresse.value,
  Adresszusatz: Adresszusatz.value,
  PLZ: PLZ.value,
  Ort: Ort.value,
  Menge: kistli.value * store.liter_pro_kistli,
  Lieferdatum: Lieferdatum.value.value,
  Notes: Bemerkungen.value,
  Typ: "Standard",
  vertrieb: "abholung",
  Status: "bestellt",
  Betrag: Zwischentotal().toFixed(2),
  Lieferpauschale: 0,
  Konfi_gr: konfi_gross.value,
  Konfi_kl: konfi_klein.value,
}));

function onStepChange(val) {
  if (val === 3) {
    checkPIN();
  }
}

async function checkPIN() {
  let LadenURL =
    '/api/airtable_get/?basis=Verkaufsstellen&view=alle&filter={Code}="' +
    pin.value +
    '"';
  let { Geschaeft, Vertriebskanal, Rechnung } = await $fetch(LadenURL);

  if (Geschaeft) {
    firma.value = Geschaeft;
    vertrieb.value = Vertriebskanal;
    console.log("vertrieb", vertrieb);
    rechnung.value = Rechnung;
  }
}

async function order() {
  let Vorrat = await $fetch("/api/vorrat/");
  let verkauftURL =
    'api/verkauft/?filter=DATESTR({Lieferdatum})="' +
    Lieferdatum.value.value +
    '"&vertrieb=' +
    vertrieb.value;
  let { verkaufttotal, verkauftvertriebskanal } = await $fetch(verkauftURL);

  console.log(
    "Vorrat",
    Vorrat,
    "bereits verkauft an diesem Tag",
    verkaufttotal,
    "bereits verkauft in derselben Tour",
    verkauftvertriebskanal,
    "bestellte Menge:",
    kistli.value * store.liter_pro_kistli,
    "Vertrieb:",
    vertrieb.value
  );
  if (
    store.liter_pro_kistli * kistli.value < Vorrat - verkaufttotal &&
    (store.liter_pro_kistli * kistli.value <
      store.KapazitaetLieferwagen - verkauftvertriebskanal ||
      vertrieb.value == undefined)
  ) {
    console.log(
      "Genügend Buttenmost vorhanden, genügend Kapazität im Lieferwagen vorhanden, Bestellung möglich"
    );

    const airtable = await $fetch("/api/airtable", {
      method: "POST",

      body: firma.value ? order_registered.value : order_nonregistered.value,
    });
    console.log(
      "Bestellung erfolgreich in Airtable eingetragen, ID: " + airtable.body
    );

    // wenn nicht auf Rechnung, dann Payrexx Gateway öffnen
    if (order_registered.value.Status != "bestellt") {
      bestellungErfolgreich.value = true;
    } else {
      const payrexx = await $fetch("/api/payrexx", {
        method: "POST",
        body: {
          Email: Email.value,
          Vorname: Vorname.value,
          Name: Nachname.value,
          Betrag: vertrieb.value
            ? (Zwischentotal() + store.lieferpauschale).toFixed(2)
            : Zwischentotal().toFixed(2),
          Menge: kistli.value * store.liter_pro_kistli,
          Adresse: Adresse.value,
          PLZ: PLZ.value,
          Ort: Ort.value,
          Lieferdatum: Lieferdatum.value.value,
          AirtableRecordID: airtable.body,
        },
      });
      console.log("Payrexx Gateway erfolgreich eröffnet: " + payrexx.body);
      window.location.href = payrexx.body;
    }
  } else {
    console.log("Bestellung nicht möglich");
    return;
  }

  //}
}
</script>
