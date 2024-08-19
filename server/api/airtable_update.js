import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
  let body = await readBody(event);
  console.log(body)
  await base("tblbU1zmZ2kumAXEY").update(body) //params wird bereits in der Komponente formatiert
});


