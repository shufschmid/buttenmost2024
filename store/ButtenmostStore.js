import { defineStore } from "pinia";

export const useButtenmostStore = defineStore("buttenmost", {
  state: () => {
    return {
      saisonStart: new Date("2024-01-01"),
      preis: 7,
      preisDirektverkauf: 9.4,
      saisonEnd: new Date("2024-03-12"),
      shippingWeekDay: "tue",
      heute: new Date(),
      defaultMenge: 4,
      minimalMenge: 2,
      maximalMenge: 28,
      versandpauschale: 15,
      verpackungsPreise: [
        { menge: 5, preis: 4.5 },
        { menge: 10, preis: 7 },
        { menge: 12, preis: 8.9 },
        { menge: 15, preis: 9.7 },
        { menge: 18, preis: 10 },
        { menge: 20, preis: 10.5 },
        { menge: this.maximalMenge, preis: 11.9 },
      ],
      verpackungsPreiseNeu: [
        { menge: 5, preis: 4.5 },  
        { menge: 10, preis: 7 },
        { menge: 12, preis: 8.9 },
        { menge: 15, preis: 9.7 },
        { menge: 18, preis: 10 },
        { menge: 20, preis: 10.5 },
        { menge: this.maximalMenge, preis: 11.9 },
      ],
      kleinmengenzuschlag: {"grenze":4,"betrag":15,"grenzeReduziert":8,"betragReduziert":7.5},
      rabatt: {"grenze":12, value:(-0.1)}
    };
  },
  getters: {
    isSaison() {
      return this.heute > this.saisonStart && this.heute < this.saisonEnd
        ? true
        : false;
    },
    saisonStartString() {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return this.saisonStart.toLocaleDateString("de-DE", options);
    },
    possibleShippingDays() {
      var result = [];
      var days = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      var day = days[this.shippingWeekDay];
      var current = new Date(this.saisonStart);
      current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));
      while (current < this.saisonEnd) {
        if (current > this.heute) {
          result.push({
            title: new Date(+current).toLocaleDateString("de-DE"),
            value: new Date(+current),
          });
        }
        current.setDate(current.getDate() + 7);
      }
      return result;
    },
  },
});
