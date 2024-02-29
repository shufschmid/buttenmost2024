import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event, request, context) => {
  const params = JSON.parse(event.body)
  console.log(params)
  await base("Table 1").create(
    {
      Email: params.email,
      Vorname: params.forename.trim(),
      Betrag: params.Preis,
      Name: params.surname.trim(),
      Adresse: params.street.trim(),
      PLZ: params.postcode.trim(),
      Ort: params.place.trim(),
      Menge: params.menge,
      Lieferdatum: params.versanddatum,
      Notes:params.bemerkungen,
      Verpackung: params.verpackung,
      Porto:params.porto,
      Lieferpauschale:params.versandpauschale,
      Gewicht: params.gewicht,
      Status: "bestellt",
      Typ: "Post"
    }
  ).then(res => {
    console.log(res, 'response') // find getID in console log
    console.log(res.getId()) // check if desired result
    recordID = res.getId() // assing to var

  }).catch(e => {
    console.log(e, 'Error')
  })
  
  console.log(recordID)
  return {
    statusCode: 200,
    body: `${recordID}`
  }
})