const qs = require("qs");
const Airtable = require("airtable");
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});

const base = new Airtable.base("app8cUEZWBvWHDfaN");

exports.handler = async (event, context) => {
  let resp, sendBack;
  let sendBackBody = [];
  let view = "alle";
  if (event.queryStringParameters.view) {
    view = event.queryStringParameters.view;
  }

  resp = await base("Verkaufsstellen")
    .select({
      view: view,
    })
    .all();

  if (typeof resp !== "undefined") {
    resp.forEach((element) => {
      sendBackBody.push(element.fields);
    });
    sendBack = {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendBackBody),
    };
  } else {
    sendBack = {
      statusCode: 204,
      body: "keine Verkaufsstellen geladen",
    };
  }
  console.log(resp.length + " Verkaufstellen geladen...");
  return sendBack;
};
