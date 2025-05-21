<template>
  <v-container>
    <v-stepper
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
                  Karton Konfi klein (6 Gläser) à CHF à CHF
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
            <v-row>
              <v-col cols="6">
                <v-text-field
                  dense
                  v-model="Vorname"
                  label="Vorname"
                  name="Vorname"
                  :rules="nichtLeer"
                  required
                ></v-text-field></v-col
              ><v-col cols="6">
                <v-text-field
                  dense
                  v-model="Nachname"
                  label="Name"
                  name="Nachname"
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
                  :rules="nichtLeer"
                  required
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
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="9" md="9">
                <v-text-field
                  dense
                  v-model="Ort"
                  label="Ort"
                  name="Ort"
                  :rules="nichtLeer"
                  required
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
                ></v-textarea> </v-col
            ></v-row></div
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
          </div>
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

let konfi_klein = ref(0);
let firma = ref();
let tour = ref();
let rechnung = ref(false);
let Vorname = ref("");
let Nachname = ref("");
let Adresse = ref("");
let Adresszusatz = ref("");
let PLZ = ref("");
let Ort = ref("");
let Email = ref("");
let Bemerkungen = ref("");

let order_registered = computed(() => ({
  Geschaeft: firma.value ? firma.value : "",
  Typ: "Standard",
  Vertrieb: tour.value ? tour.value : "Abholung",
  Status: rechnung.value ? "Rechnung offen" : "bestellt",
  Betrag: tour.value
    ? (Zwischentotal() + store.lieferpauschale).toFixed(2)
    : Zwischentotal().toFixed(2),
  Menge: kistli.value * store.liter_pro_kistli,
  Lieferdatum: Lieferdatum.value.value, //formatiert in yyyy-mm-dd
  Konfi_gr: konfi_gross.value,
  Konfi_kl: konfi_klein.value,
  Lieferpauschale: tour.value ? store.lieferpauschale : 0,
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
  Vertrieb: "Abholung",
  Status: "bestellt",
  Betrag: Zwischentotal().toFixed(2),
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
  let { Geschaeft, Tour, Rechnung } = await $fetch(LadenURL);

  if (Geschaeft) {
    firma.value = Geschaeft;
    tour.value = Tour;
    rechnung.value = Rechnung;
  }
}
</script>
