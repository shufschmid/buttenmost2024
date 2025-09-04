import Airtable from "airtable";

Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
    try {
        let { filter } = getQuery(event);

        let view = "verfuegbare_menge";
        let basis = "tblbU1zmZ2kumAXEY";
        let fields = ["Menge"];

        let query = { view: view, filterByFormula: filter, fields: fields };

        let resp = [];
        let sendBackBody = 0;

        resp = await base(basis).select(query).all();
        resp.forEach((element) => {
            sendBackBody += element.fields.Menge;
        });
        return Response.json(resp, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ error: "Failed fetching data" }, { status: 500 });
    }
});
