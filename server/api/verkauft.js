import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("appGF3k6k6MO8AMkz");

export default defineEventHandler(async (event) => {
  try {
    let { filter, vertrieb } = getQuery(event);
    if (vertrieb == "undefined") {
      vertrieb = "";
    }
    console.log("Vertriebskanal: " + vertrieb);
    let view = "verfuegbare_menge";
    let basis = "tblbU1zmZ2kumAXEY";
    let fields = ["Menge", "vertrieb"];

    let query = { view: view, filterByFormula: filter, fields: fields };

    let resp = [];
    let sendBackBody = { verkaufttotal: 0, verkauftvertriebskanal: 0 };

    resp = await base(basis).select(query).all();
    resp.forEach((element) => {
      sendBackBody.verkaufttotal += element.fields.Menge;
      if (//Das ?. sorgt dafür, dass kein Fehler entsteht, falls einer der Werte undefined ist.
        element.fields.vertrieb?.toLowerCase() === vertrieb?.toLowerCase()
      ) {
        sendBackBody.verkauftvertriebskanal += element.fields.Menge;
      }
    });
    console.log("sendBackBody: " + JSON.stringify(sendBackBody));
    return Response.json(sendBackBody, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed fetching data" }, { status: 500 });
  }
});
