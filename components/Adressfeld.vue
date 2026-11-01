<script setup>
// Adressblock fuer Rechnung, Sammelrechnung und Lieferschein.
// Am Bildschirm wie bisher (eingerueckt). Im Druck absolut positioniert, damit die Adresse
// im Fenster eines C5-Couverts "Fenster links" liegt (SN 010 130: Fenster 100 x 45 mm,
// 20 mm von links, 65 mm von unten; A4 einmal gefaltet).
//
// Masse nach ePost-Vorgabe, Messpunkt obere linke Blattkante:
//   immer sichtbar  x 20-95 mm,  y 47-81 mm  -> hier steht die Adresse
//   evtl. sichtbar  x 15-114 mm, y 33-95 mm  -> hier darf sonst nichts stehen
// Die Seite setzt @page margin 10mm, die CSS-Werte unten sind deshalb um 10 mm kleiner
// als die Masse auf dem Blatt.
//
// Verwendung: Seiten-Container mit class="brief", die Kopfspalte links mit class="kopf".
// ?fenster=1 zeichnet die beiden Zonen im Druck (Testseite drucken, ans Couvert halten).
const props = defineProps({
  data: { type: Object, required: true },
  art: { type: String, default: "Rechnung" }, // "Rechnung" | "Lieferung" (siehe utils/bezeichnung.js)
});
const route = useRoute();
const zeigeFenster = computed(() => route.query.fenster === "1");
</script>

<template>
  <div class="adressfeld pl-14">
    {{ bezeichnung(data, art, "Name") }}<br />
    {{ bezeichnung(data, art, "Adresse") }}<br />
    {{ bezeichnung(data, art, "Adresszusatz") }}<br v-show="bezeichnung(data, art, 'Adresszusatz')" />
    {{ bezeichnung(data, art, "PLZundOrt") }}
  </div>
  <template v-if="zeigeFenster">
    <div class="fenster-zone fenster-immer"></div>
    <div class="fenster-zone fenster-evtl"></div>
  </template>
</template>

<style>
/* nicht scoped: @page und die Regeln fuer den Seiten-Container */
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
  .brief {
    position: relative;
    padding: 0 !important;
    /* eigener Formatierungskontext: der negative Rand der ersten v-row (-12px) darf
       nicht mit dem Container kollabieren, sonst rutscht alles um 3 mm nach oben */
    display: flow-root;
  }
  .brief h1 {
    margin: 0;
    line-height: 1.1;
  }
  /* Kopfspalte: Inhalt darunter (Tabelle) beginnt erst ab y = 95 mm auf dem Blatt */
  .brief .kopf {
    min-height: 85mm;
  }
}
</style>

<style scoped>
.fenster-zone {
  display: none;
}
@media print {
  .adressfeld {
    position: absolute;
    left: 12mm; /* = 22 mm auf dem Blatt */
    top: 40mm; /* = 50 mm auf dem Blatt */
    width: 73mm;
    max-height: 31mm;
    overflow: hidden;
    margin: 0;
    padding: 0 !important;
    font-size: 11pt;
    line-height: 1.35;
  }
  .fenster-zone {
    display: block;
    position: absolute;
    border: 0.3mm dashed #999;
    pointer-events: none;
  }
  .fenster-immer {
    left: 10mm;
    top: 37mm;
    width: 75mm;
    height: 34mm;
  }
  .fenster-evtl {
    left: 5mm;
    top: 23mm;
    width: 99mm;
    height: 62mm;
  }
}
</style>
