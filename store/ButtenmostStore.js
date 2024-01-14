import { defineStore } from "pinia";

export const useButtenmostStore = defineStore("buttenmost", {
  state: () => {
    return {
      saisonStart: new Date("2023-09-25"),
      saisonEnd: new Date("2024-11-12"),
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
  },
});
