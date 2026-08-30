import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("appGF3k6k6MO8AMkz");

export default defineEventHandler(async (event) => {
  let body = await readBody(event);
  console.log(body)
  await base("tblbU1zmZ2kumAXEY").update(body) //params wird bereits in der Komponente formatiert
});


