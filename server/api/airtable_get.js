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

    
    let resp
    let sendBackBody = [];

    resp = await base(basis)
      .select({
        view: view,
        filterByFormula: filter,
        fields: fields
      })
      .all();

      //Antwort aufbereiten
    
      resp.forEach((element) => {
      sendBackBody.push(element.fields);
    });
    if(sendBackBody.length == 1){
      sendBackBody = sendBackBody[0]
    }
    return Response.json(sendBackBody, { status: 200 });


  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed fetching data" }, { status: 500 });
  }
});
