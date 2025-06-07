<template>
  <v-container
    ><v-alert v-if="bestellungErfolgreich" type="success" closable class="mb-4">
      Bestellung erfolgreich!
    </v-alert>
    <v-stepper
      v-show="!bestellungErfolgreich"
      @update:model-value="onStepChange"
      :items="['Menge & Datum', 'Anmelden', 'Adresseingabe', 'Bestätigen']"
      next-text="Weiter"
      prev-text="Zurück"
    >
      <template v-slot:item.1>
        <v-card title="Bestellung für Wiederverkäufer" flat
          ><v-alert
    type="info"
    variant="tonal"
    class="mx-auto my-4"
    style="max-width: 100%; font-size: 1rem; font-weight: 500"
    border="start"
  >
    Dieser Bereich ist für Wiederverkäufer gedacht. Hier können Sie Buttenmost in Kistli mit jeweils 14 1-Liter-Bechern sowie Konfis in Kartons à jeweils 6 Gläser zu Vorzugspreisen bestellen. <span v-if="showMore"><br/><br/>
    Falls Sie per Post einen Identifikationscode erhalten haben, können Sie diesen auf der nächsten Seite eingeben. Ansonsten wird ein Formular zur Eingabe der Adresse angegeben. <br/><br/>
    Bitte beachten Sie, dass Bestellungen auf Rechnung nur für registrierte Wiederverkäufer möglich ist. Ansonsten bitten wir Sie, ihre Bestellung gleich anschliessend per Kreditkarte, Postcard oder per Twint zu begleichen. Danke! </span><a href="#" @click.prevent="showMore = !showMore" style="color:#2196f3;" >
      {{ showMore ? 'Weniger anzeigen' : 'Weitere Infos einblenden' }}
    </a>
     
    </v-alert
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
                    Name="Buttenmost"
                    type="number"
                    max="100"
                    :min="0"
                    dense
                  ></v-text-field>
                </td>
                <td>
                  Kistli Buttenmost ({{ store.liter_pro_kistli }} Liter, CHF {{ store.PreisProLiter.toFixed(2) }} pro Liter) à CHF
                  {{ preisProKistli().toFixed(2) }}
                </td>
                <td class="text-right">
                  {{ gesamtPreisKistli().toFixed(2) }}
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
                    hint="Achtung, Konfi neu in Kartons"
                  ></v-text-field>
                </td>
                <td>
                  Karton Konfi klein (6 Gläser, CHF {{ store.konfi_klein_preis.toFixed(2) }} pro Glas) à CHF
                  {{ (store.konfi_gross_anzahl_pro_karton*store.konfi_klein_preis).toFixed(2) }} 
                </td>

                <td class="text-right">
                  {{ gesamtPreisKonfiKlein().toFixed(2) }}
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
                    hint="Achtung, Konfis neu in Kartons"
                  ></v-text-field>
                </td>
                <td>
                  Karton Konfi gross (6 Gläser, CHF {{ store.konfi_gross_preis.toFixed(2) }} pro Glas) à CHF
                  {{ (store.konfi_gross_anzahl_pro_karton*store.konfi_gross_preis).toFixed(2) }}
                </td>

                <td class="text-right">
                  {{ gesamtPreisKonfiGross().toFixed(2) }}
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
          <v-alert
    type="info"
    variant="tonal"
    class="mx-auto my-4"
    style="max-width: 100%; font-size: 1rem; font-weight: 500"
    border="start"
  >
    Bestehende Kunden können sich hier mit dem Pin, den wir Ihnen vor
          Saisonstart per Post zugeschickt haben, einloggen. Alle anderen
          klicken auf weiter.
     
    </v-alert
  >
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
        <v-card flat
          ><v-alert v-show="firma" type="success" class="mb-4">
      Sie haben sich erfolgreich angemeldet. <br/><b>{{ firma }}</b>
    </v-alert>

          <div v-show="!firma">
            <v-alert
                v-show="pinFalsch"

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
                    :rules="PLZRules"
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
        <v-card title="Bestellübersicht" flat>
          <div v-show="rechnung">
            direkt in Datenbank eintragen mit folgenden Daten
          </div>
          <div v-show="!rechnung">
            provisorisch in Datenbank eintragen und Bezahlprozess auslösen
          </div>

          <BestellungTable :data="getOrderData()"/>
          

          <v-alert
            v-show="!formValidity && !firma"
            closable
            type="error"
            text="Achtung: Angaben im Formular ungenügend"
          ></v-alert>
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
const showMore = ref(false)

let pin = ref("");
let loading = ref(false);
let pinFalsch = ref(false);
let bestellungErfolgreich = ref(false);
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
let firma = ref(false);
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

function preisProKistli() {
  return (Number(store.PreisProLiter) + Number(store.PreisBecher)) * Number(store.liter_pro_kistli);
}

function gesamtPreisKistli() {
  return preisProKistli() * Number(kistli.value);
}

function gesamtPreisKonfiKlein() {
  return Number(konfi_klein.value) * Number(store.konfi_klein_preis)* store.konfi_gross_anzahl_pro_karton;
}

function gesamtPreisKonfiGross() {
  return Number(konfi_gross.value) * Number(store.konfi_gross_preis)* store.konfi_gross_anzahl_pro_karton;
}

function Zwischentotal() {
  return (
    gesamtPreisKistli() +
    gesamtPreisKonfiKlein() +
    gesamtPreisKonfiGross()
  );
}

function getOrderData() {
  // Basisfelder, die immer gleich sind
  const base = {
    Konfi_gr: konfi_gross.value,
    Konfi_kl: konfi_klein.value,
    Menge: kistli.value * store.liter_pro_kistli,
    Lieferdatum: Lieferdatum.value.value,
    Betrag: firma.value
      ? (Zwischentotal() + store.lieferpauschale)
      : Zwischentotal(),
    Lieferpauschale: firma.value && vertrieb.value ? store.lieferpauschale : 0,
    Typ: "Standard",
  };

  if (firma.value) {
    // registriert
    return {
      ...base,
      Geschaeft: firma.value,
      vertrieb: vertrieb.value ? vertrieb.value : "Abholung",
      Status: rechnung.value ? "Rechnung offen" : "bestellt",
    };
  } else {
    // nicht registriert
    return {
      ...base,
      Email: Email.value,
      Vorname: Vorname.value,
      Name: Nachname.value,
      Adresse: Adresse.value,
      Adresszusatz: Adresszusatz.value,
      PLZ: PLZ.value,
      Ort: Ort.value,
      Notes: Bemerkungen.value,
      vertrieb: "Abholung",
      Status: "bestellt",
    };
  }
}

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
    pinFalsch.value = false;
  }
    else {
        pinFalsch.value = true;
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
  body: getOrderData(),
});
    console.log(
      "Bestellung erfolgreich in Airtable eingetragen, ID: " + airtable.body
    );

    // wenn nicht auf Rechnung, dann Payrexx Gateway öffnen
    if (rechnung.value) {
      bestellungErfolgreich.value = true;
    } else {
      const payrexx = await $fetch("/api/payrexx", {
        method: "POST",
        body: {
          ...getOrderData(),
    AirtableRecordID: airtable.body
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
