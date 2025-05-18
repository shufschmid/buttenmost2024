import Airtable from "airtable";

Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
    try {
        let { filter,tour } = getQuery(event);
        if (tour == "undefined" ){
            tour = "";
        }
        let view = "verfuegbare_menge";
        let basis = "tblbU1zmZ2kumAXEY";
        let fields = ["Menge","Tour"];

        let query = { view: view, filterByFormula: filter, fields: fields };


        

        let resp = [];
        let sendBackBody = {total:0,tour:0};

        resp = await base(basis).select(query).all();
        resp.forEach((element) => {
            sendBackBody.total += element.fields.Menge;
            if(element.fields.Tour == tour){
                sendBackBody.tour += element.fields.Menge;
            }
        });
        return Response.json(sendBackBody, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ error: "Failed fetching data" }, { status: 500 });
    }
});
