import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});

const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event, request, context) => {
  try {
    let { view, basis, filter, specialfields } = getQuery(event);
    
    if(!filter){      
      filter = ""
    }
    if(!view){
      view="website"
    }
    if(!basis){
      basis = "Verkaufsstellen"
    }
    let fields = []
    if(specialfields == "verfuegbare_menge"){
      fields = ["Menge"]
    }

    console.log(filter)
    
    let resp, sendBack;
    let sendBackBody = [];

    resp = await base(basis)
      .select({
        view: view,
        filterByFormula: filter,
        fields: fields
      })
      .all();

    resp.forEach((element) => {
      sendBackBody.push(element.fields);
    });

    console.log(resp.length + " Element(e) von Airtable geladen...");
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendBackBody),
    };


  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed fetching data" }, { status: 500 });
  }
});
