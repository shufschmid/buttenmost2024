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
      Name: body.Name._value,
      Adresse: body.Adresse._value,
      Adresszusatz: body.Adresszusatz._value,
      PLZ: body.PLZ._value,
      Ort: body.Ort._value,
      Menge: body.Menge._value,
      Lieferdatum: body.Lieferdatum._value.value,
      Notes: body.Notes._value,
      Verpackung: body.Verpackung,
      Porto: body.Porto._value,
      Lieferpauschale: body.Lieferpauschale._value,
      Gewicht: body.Gewicht,
      Status: body.Status._value,
      Typ: body.Typ._value,
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
