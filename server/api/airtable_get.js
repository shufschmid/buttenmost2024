import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event, request, context) => {
  try {
    let { view, basis, filter, sort, specialfields, recID, verkaufsstellensort } = getQuery(event);

    if (!filter) {
      filter = "";
    }
    if (!view) {
      view = "website";
    }
    if (!basis) {
      basis = "Verkaufsstellen";
    }
    let fields = [];
    if (specialfields == "verfuegbare_menge") {
      fields = ["Menge"];
    }

    let query = { view: view, filterByFormula: filter, fields: fields };
    if (sort) {
      query = {
        view: view,
        filterByFormula: filter,
        fields: fields,
        sort: [{ field: "Datum", direction: "asc" }],
      };
    }

    if(verkaufsstellensort){
      query = {
        view: view,
        filterByFormula: filter,
        fields: fields,
        sort: [{ field: "Ort", direction: "asc" }],
      };
    }
    let resp = [];
    let sendBackBody = [];
    if (recID) {
      resp = await base(basis).find(recID);
      sendBackBody = resp.fields
    } else {
      resp = await base(basis).select(query).all();
      resp.forEach((element) => {
        sendBackBody.push(element.fields);
      });
      if (sendBackBody.length == 1) {
        sendBackBody = sendBackBody[0];
      }
    }

    //Antwort aufbereiten

    //console.log(sendBackBody);
    return Response.json(sendBackBody, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed fetching data" }, { status: 500 });
  }
});
