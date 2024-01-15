import { defineStore } from "pinia";

export const useButtenmostStore = defineStore("buttenmost", {
  state: () => {
    return {
      saisonStart: new Date("2024-01-01"),
      saisonEnd: new Date("2024-02-12"),
      shippingWeekDay: "tue",
      heute: new Date(),
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
