// Liefert die Post-Bestellungen eines Lieferdatums MIT Airtable-Record-ID
// (airtable_get gibt nur die Felder zurueck). Wird von der Stapelseite
// /etiketten/brother/stapel/<datum> benutzt.
//
// Parameter: datum=JJJJ-MM-TT (Pflicht)
import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("appGF3k6k6MO8AMkz");
const TABLE = "tblbU1zmZ2kumAXEY";
const FIELDS = [
  "Vorname",
  "Name",
  "Adresse",
  "Adresszusatz",
  "PLZ",
  "Ort",
  "Status",
  "Lieferdatum",
  "vertrieb",
  "Menge",
  "Gewicht",
  "Sendungsnummer",
];

export default defineEventHandler(async (event) => {
  const { datum } = getQuery(event);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum || "")) {
    return Response.json({ error: "Parameter datum (JJJJ-MM-TT) fehlt" }, { status: 400 });
  }
  try {
    const records = await base(TABLE)
      .select({
        view: "Bestellungen",
        filterByFormula: `AND({vertrieb}="Post",DATESTR({Lieferdatum})="${datum}")`,
        fields: FIELDS,
        // kleinste Menge zuoberst, bei gleicher Menge nach Name
        sort: [
          { field: "Menge", direction: "asc" },
          { field: "Name", direction: "asc" },
          { field: "Vorname", direction: "asc" },
        ],
      })
      .all();
    return Response.json(
      records.map((r) => ({ id: r.id, ...r.fields })),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.log("bestellungen_post Airtable-Fehler", e?.message ?? e);
    return Response.json({ error: "Airtable: " + (e?.message ?? e) }, { status: 502 });
  }
});
