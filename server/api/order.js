import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
  let body = await readBody(event);
  let recordID = " test";
  await base("Table 1")
    .create({
      Email: body.Email.trim(),
      Vorname: body.Vorname.trim(),
      Betrag: body.Betrag,
      Name: body.Name.trim(),
      Adresse: body.Adresse.trim(),
      Adresszusatz: body.Adresszusatz.trim(),
      PLZ: body.PLZ,
      Ort: body.Ort.trim(),
      Menge: body.Menge,
      Lieferdatum: body.Lieferdatum,
      Notes: body.Notes,
      Verpackung: body.Verpackung,
      Porto: body.Porto,
      Lieferpauschale: body.Lieferpauschale,
      Gewicht: body.Gewicht,
      Status: body.Status,
      Typ: body.Typ,
    })
    .then((res) => {
      //console.log(res, "response"); // find getID in console log
      console.log(res.getId()); // check if desired result
      recordID = res.getId(); // assing to var
    })
    .catch((e) => {
      console.log(e, "Error");
    });

  console.log(recordID);
  return {
    statusCode: 200,
    body: `${recordID}`,
  };
});
