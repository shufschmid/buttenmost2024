// Liefert die Abhol-Bestellungen eines Lieferdatums MIT Airtable-Record-ID
// fuer die Abholetiketten-Seite /etiketten/abholung/<datum>.
// Das Feld "vertrieb" kennt die Werte "Abholung" und "abholung", beide zaehlen.
//
// Parameter: datum=JJJJ-MM-TT (Pflicht)
import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("appGF3k6k6MO8AMkz");
const TABLE = "tblbU1zmZ2kumAXEY";

export default defineEventHandler(async (event) => {
  const { datum } = getQuery(event);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum || "")) {
    return Response.json({ error: "Parameter datum (JJJJ-MM-TT) fehlt" }, { status: 400 });
  }
  try {
    const records = await base(TABLE)
      .select({
        view: "Bestellungen",
        filterByFormula: `AND(LOWER({vertrieb})="abholung",DATESTR({Lieferdatum})="${datum}")`,
        sort: [
          { field: "Menge", direction: "asc" },
          { field: "Name", direction: "asc" },
        ],
      })
      .all();
    return Response.json(
      records.map((r) => ({ id: r.id, ...r.fields })),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.log("bestellungen_abholung Airtable-Fehler", e?.message ?? e);
    return Response.json({ error: "Airtable: " + (e?.message ?? e) }, { status: 502 });
  }
});
