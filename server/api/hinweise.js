// Liefert die aktiven Kundenhinweise aus der Airtable-Tabelle "Hinweise" IMMER als Array
// (airtable_get wuerde bei genau einem Treffer ein Objekt liefern). Wird von der
// Komponente Hinweise.vue auf Startseite, Privatkunden- und Firmenkunden-Shop benutzt.
//
// Parameter: ort=Startseite | Shop Privatkunden | Shop Firmenkunden (Pflicht)
//
// Von/Bis werden hier zur Request-Zeit in Zeitzone Europe/Zurich ausgewertet (Netlify
// laeuft in UTC, Airtable-TODAY() ebenfalls). Markdown aus dem Rich-Text-Feld wird hier
// zu HTML gerendert; html:false escaped rohes HTML, javascript:-Links werden geblockt.
import Airtable from "airtable";
import MarkdownIt from "markdown-it";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("appGF3k6k6MO8AMkz");
const TABLE = "tblM49UTV7xEiSsVc"; // Hinweise
const ORTE = ["Startseite", "Shop Privatkunden", "Shop Firmenkunden"];
// Airtable-Auswahl "Typ" -> Vuetify v-alert type
const TYPEN = { Info: "info", Warnung: "warning", Fehler: "error", Erfolg: "success" };
const md = new MarkdownIt({ html: false, breaks: true, linkify: true });

function heuteZuerich() {
  // "JJJJ-MM-TT", vergleichbar mit den Airtable-Datumsfeldern
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default defineEventHandler(async (event) => {
  const { ort } = getQuery(event);
  if (!ORTE.includes(ort)) {
    return Response.json({ error: "Parameter ort ungueltig" }, { status: 400 });
  }
  try {
    const heute = heuteZuerich();
    // bewusst ohne View/Filter/Sort: Tabelle ist winzig, und so bricht nichts,
    // wenn im Airtable-UI eine View verstellt wird
    const records = await base(TABLE).select().all();
    const hinweise = records
      .map((r) => ({ id: r.id, ...r.fields }))
      .filter((h) => h.Aktiv === true)
      .filter((h) => Array.isArray(h.Ort) && h.Ort.includes(ort))
      .filter(
        (h) =>
          (!h.Von || String(h.Von).slice(0, 10) <= heute) &&
          (!h.Bis || String(h.Bis).slice(0, 10) >= heute)
      )
      .sort((a, b) => (a.Reihenfolge ?? 9999) - (b.Reihenfolge ?? 9999))
      .map((h) => ({
        id: h.id,
        titel: h.Titel || "",
        html: md.render(h.Text || ""),
        typ: TYPEN[h.Typ] || "info",
        schliessbar: !!h.Schliessbar,
      }));
    return Response.json(hinweise, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.log("hinweise Airtable-Fehler", e?.message ?? e);
    return Response.json({ error: "Airtable: " + (e?.message ?? e) }, { status: 502 });
  }
});
