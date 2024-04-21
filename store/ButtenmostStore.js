import { defineStore } from "pinia";

export const useButtenmostStore = defineStore("buttenmost", {
  state: () => {
    return {
      SaisonStart: new Date("2024-01-01"),
      SaisonStartFirmen: new Date("2024-01-01"),
      PreisProLiter: 7,
      preisDirektverkauf: 9.4,
      SaisonEnde: new Date("2024-09-12"),
      SaisonEndeFirmen: new Date("2024-09-12"),
      shippingWeekDay: "tue",
      heute: new Date(),
      StandardMenge: 4,
      MinimumMenge: 2,
      MaximumMenge: 28,
      versandpauschale: 15,
      Verpackung: [
        { Menge: 5, Preis: 4.5, Gewicht: 190 },
        { Menge: 10, Preis: 7, Gewicht: 404 },
        { Menge: 12, Preis: 8.9, Gewicht: 562 },
        { Menge: 15, Preis: 9.7, Gewicht: 617 },
        { Menge: 18, Preis: 10, Gewicht: 654 },
        { Menge: 20, Preis: 10.5, Gewicht: 720 },
        { Menge: 20, Preis: 11.9, Gewicht: 821 },
      ],
      Kleinmengenzuschlag: {
        Grenze: 4,
        Betrag: 15,
        GrenzeReduziert: 8,
        BetragReduziert: 7.5,
      },
      Rabatt: { Grenze: 12, value: -0.1 },
      authenticated: false,
      loading: false,
    };
  },
  getters: {
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
    SaisonStartStringFirmen(){
      const options = { year: "numeric", month: "long", day: "numeric" };
      return this.SaisonStartFirmen.toLocaleDateString("de-DE", options);
    },
    MoeglicheLieferdaten() {
      var result = [];
      var days = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      var day = days[this.shippingWeekDay];
      var current = new Date(this.SaisonStart);
      current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));
      while (current < this.SaisonEnde) {
        if (current > this.heute) {
          result.push({
            title: new Date(+current).toLocaleDateString("de-DE"),
            value: new Date(+current).toISOString().substring(0, 10), //weil Airtable nur XXXX-MM-DD akzeptiert
          });
        }
        current.setDate(current.getDate() + 7);
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
      console.log(data.value.body);
      this.authenticated = data.value.body; // set authenticated  state value to true
    },
  },
});
