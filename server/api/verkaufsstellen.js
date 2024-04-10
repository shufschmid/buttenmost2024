import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});

const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event, request, context) => {
  try {
    const { view, filterByFormulaField, filterByFormulaValue } = getQuery(event);
    
    let filterbyFormulaString = ""
    if(filterByFormulaField){      
    filterbyFormulaString = "{"+filterByFormulaField+"} = '"+filterByFormulaValue+"'"
    }

    console.log(filterbyFormulaString)
    
    let resp, sendBack;
    let sendBackBody = [];

    resp = await base("Verkaufsstellen")
      .select({
        view: view,
        filterByFormula: filterbyFormulaString,
      })
      .all();

    resp.forEach((element) => {
      sendBackBody.push(element.fields);
    });
    sendBack = {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendBackBody),
    };
    console.log(resp.length + " Verkaufstellen geladen...");
    return sendBack;
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed fetching data" }, { status: 500 });
  }
});
