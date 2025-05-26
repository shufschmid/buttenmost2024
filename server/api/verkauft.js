import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

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
      if (//kann entfernt werden, sobald in DB nur noch kleingeschrieben "kurier"
        element.fields.vertrieb &&
        element.fields.vertrieb.toLowerCase() === vertrieb
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
