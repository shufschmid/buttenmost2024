import { defineStore } from "pinia";

export const useButtenmostStore = defineStore("buttenmost", {
  state: () => {
    return {
      SaisonStart: new Date("2025-09-23 12:00:00"),
      SaisonStartFirmen: new Date("2025-09-24 12:00:00"),
      PreisProLiter: 7.9, //3.69 Einkaufspreis 
      PreisBecher: 0.9,
      ZuschlagDirektverkauf: 2.5,
      SaisonEnde: new Date("2025-11-12 12:00:00"),
      SaisonEndeFirmen: new Date("2025-11-12 12:00:00"),
      lieferpauschale: 22,
      kistli: 2, //Voreinstellung für Bestellformular Läden
      liter_pro_kistli: 14,
      konfi_gross_preis: 7.9,
      konfi_gross_anzahl_pro_karton: 6,
      konfi_klein_preis: 4.7,
      konfi_klein_anzahl_pro_karton: 6,
      heute: new Date(),
      StandardMenge: 8,
      MinimumMenge: 2,
      MaximumMenge: 28,
      versandpauschale: 15,
      KapazitaetLieferwagen: 392,
      Verpackung: [
        { Menge: 3, Preis: 4.5, Gewicht: 190 },
        { Menge: 5, Preis: 4.5, Gewicht: 190 },
        { Menge: 10, Preis: 7, Gewicht: 404 },
        { Menge: 12, Preis: 8.9, Gewicht: 562 },
        { Menge: 15, Preis: 9.7, Gewicht: 617 },
        { Menge: 18, Preis: 10, Gewicht: 654 },
        { Menge: 20, Preis: 10.5, Gewicht: 720 },
        { Menge: 29, Preis: 11.9, Gewicht: 821 },
        { Menge: 0, Preis: 0, Gewicht: 0 },
      ],
      Kleinmengenzuschlag: [
        { Grenze: 4, value: 10 },
        { Grenze: 8, value: 8 },
      ],
      Rabatt: [
        { Grenze: 12, value: -0.075 },
        { Grenze: 20, value: -0.15 },
      ],
      authenticated: false,
      loading: false,
      mehrwertsteuernummer: "CHE-202.359.074 MWST",
      mehrwertsteuersatz: 2.6,
      firmenadresse: {
        name: "Buttenmost Hochwald GmbH",
        strasse: "Geissackerweg 17",
        plz: "4146",
        ort: "Hochwald",
        telefon: "079 399 41 46",
        email: "info@buttenmost.ch",
        web: "www.buttenmost.ch",
        mehrwertsteuernummer: "CHE-202.359.074 MWST",
        UID: "CHE-202.359.074",
        iban: "CH53 8080 8004 2768 0936 9",
      },
    };
  },
  getters: {
    preisDirektverkauf() {
      return this.PreisProLiter + this.ZuschlagDirektverkauf;
    },
    isSaison() {
      return this.heute > this.SaisonStart && this.heute < this.SaisonEnde
        ? true
        : false;
    },
    isSaisonFirmen() {
      return this.heute > this.SaisonStartFirmen &&
        this.heute < this.SaisonEndeFirmen
        ? true
        : false;
    },
    SaisonStartString() {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return this.SaisonStart.toLocaleDateString("de-DE", options);
    },
    SaisonStartStringFirmen() {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return this.SaisonStartFirmen.toLocaleDateString("de-DE", options);
    },
    // MoeglicheLieferdaten() {
    //   var result = [];
    //   var days = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    //   var day = days[this.shippingWeekDay];
    //   var current = new Date(this.SaisonStart);
    //   current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));
    //   while (current < this.SaisonEnde) {
    //     if (current > this.heute) {
    //       result.push({
    //         title: new Date(+current).toLocaleDateString("de-DE"),
    //         value: new Date(+current).toISOString().substring(0, 10), //weil Airtable nur XXXX-MM-DD akzeptiert
    //       });
    //     }
    //     current.setDate(current.getDate() + 7);
    //   }
    //   return result;
    // },
    MoeglicheLieferdatenFirmen() {
      var result = [];
      var current = new Date(this.SaisonStartFirmen);

      current.setDate(current.getDate());

      while (current < this.SaisonEndeFirmen) {
        if (
          current > this.heute &&
          (current.getDay() == 2 ||
            current.getDay() == 4 ||
            current.getDay() == 6)
        ) {
          result.push({
            title: new Date(current).toLocaleDateString("de-DE"),
            value: new Date(current).toISOString().substring(0, 10), //weil Airtable nur XXXX-MM-DD akzeptiert
          });
        }
        current.setDate(current.getDate() + 1);
        console.log(current + ":" + current.getDay());
      }
      return result;
    },
  },
  actions: {
    async login(Passwort) {
      // useFetch from nuxt 3
      const { data, pending } = await useFetch("api/auth", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: {
          Passwort,
        },
      });
      this.loading = pending;
      console.log("login: " + data.value.body);
      if (data.value.body) {
        const token = useCookie("token"); // useCookie new hook in nuxt 3
        token.value = data?.value?.body; // set token to cookie
        this.authenticated = data.value.body; // set authenticated  state value to true
      }
    },
    logUserOut() {
      const token = useCookie("token"); // useCookie new hook in nuxt 3
      this.authenticated = false; // set authenticated  state value to false
      token.value = null; // clear the token cookie
    },
  },
});
