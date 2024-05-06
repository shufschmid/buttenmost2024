import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
  let body = await readBody(event);
  let recordID = "test";
  await base("Table 1")
    .create(
      {
        Menge: body.Menge,
        Betrag: body.Betrag,
        Lieferdatum: body.Lieferdatum,
        Typ: body.Typ,
        Geschaeft: body.Geschaeft ? body.Geschaeft : "",
        Email: body.Email ? body.Email.trim() : "",
        Vorname: body.Vorname ? body.Vorname.trim() : "",
        Name: body.Name ? body.Name.trim() : "",
        Adresse: body.Adresse ? body.Adresse.trim() : "",
        Adresszusatz: body.Adresszusatz ? body.Adresszusatz.trim() : "",
        PLZ: body.PLZ ? body.PLZ.toString().trim() : "",
        Ort: body.Ort ? body.Ort.trim() : "",
        Lieferung_Bezeichnung: body.Lieferung_Bezeichnung ? body.Lieferung_Bezeichnung.trim() : "",
        Lieferung_Adresse: body.Lieferung_Adresse ? body.Lieferung_Adresse.trim() : "",
        Lieferung_Adresszusatz: body.Lieferung_Adresszusatz ? body.Lieferung_Adresszusatz.trim() : "",
        Lieferung_PLZ: body.Lieferung_PLZ ? body.Lieferung_PLZ : "",
        Lieferung_Ort: body.Lieferung_Ort ? body.Lieferung_Ort.trim() : "",        
        Rechnung_Bezeichnung: body.Rechnung_Bezeichnung ? body.Rechnung_Bezeichnung.trim() : "",
        Rechnung_Adresse: body.Rechnung_Adresse ? body.Rechnung_Adresse.trim() : "",
        Rechnung_Adresszusatz: body.Rechnung_Adresszusatz ? body.Rechnung_Adresszusatz.trim() : "",
        Rechnung_PLZ: body.Rechnung_PLZ ? body.Rechnung_PLZ : "",
        Rechnung_Ort: body.Rechnung_Ort ? body.Rechnung_Ort.trim() : "",
        Notes: body.Notes,
        Verpackung: body.Verpackung,
        Porto: body.Porto,
        Lieferpauschale: body.Lieferpauschale,
        Gewicht: body.Gewicht,
        Status: body.Status,
      },
      { typecast: true }
    )
    .then((res) => {
      //console.log(res, "response"); // find getID in console log
      recordID = res.getId(); // assing to var
    })
    .catch((e) => {
      console.log(e, "Error");
    });
  return {
    statusCode: 200,
    body: `${recordID}`,
  };
});
