import Airtable from "airtable";

Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
    try {

        let basis = "Lieferdaten";
        let view = "vorrat";
        let fields = ["Vorrat"];

        let query = { view: view, sort: [{ field: "Datum", direction: "desc" }], maxRecords: 1, fields: fields };

        let resp = [];
        let sendBackBody = 0;

        resp = await base(basis).select(query).all();
        resp.forEach((element) => {
            sendBackBody = element.fields.Vorrat;
        });
        return Response.json(sendBackBody, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ error: "Failed fetching data" }, { status: 500 });
    }
});
