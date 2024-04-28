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
        PLZ: body.PLZ ? body.PLZ : "",
        Ort: body.Ort ? body.Ort.trim() : "",
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
