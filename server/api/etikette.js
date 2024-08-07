import qs from "qs";
import axios from "axios";
import Airtable from "airtable";
import { createCanvas, loadImage } from "canvas"; //funktioniert nur mit node 12.x oder 20.x

// const logoWithWeight = require("logo.json");

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  console.log(query.id)
  const airtableAntwort = await base("Table 1")
    .update(query.id, {
      Status: "etikette",
    })
    .then((e) => {
      console.log(e.fields.Vorname, "airtable updated"); //Samuel bert airtable updated

      return e;
    })
    .catch((e) => {
      console.log(e, "Error");
    });

  const liter = airtableAntwort.fields.Menge;
  const width = 470;
  const height = 250;

  const imagePosition = {
    w: 149,
    h: 149,
    x: 0,
    y: 0,
  };

  const canvas = createCanvas(width, height);
  const context2 = canvas.getContext("2d");

  context2.fillStyle = "#fff";
  context2.fillRect(0, 0, width, height);

  // Set the style of the test and render it to the canvas
  context2.font = "bold 70pt 'PT Sans'";
  context2.textAlign = "center";
  context2.fillStyle = "#000";
  // 600 is the x value (the center of the image)
  // 170 is the y (the top of the line of text)
  context2.fillText(liter, 80, 240);
  2;
  context2.font = "bold 30pt 'PT Sans";
  context2.textAlign = "left";
  context2.fillText("Buttenmost", 160, 50);
  context2.fillText("aus Hochwald", 160, 82);

  context2.font = "22pt 'PT Sans";
  context2.fillText("Verena Ming", 160, 150);
  context2.fillText("Mattenweg 17", 160, 180);

  context2.fillText("4146 Hochwald", 160, 210);

  context2.fillText("www.buttenmost.ch", 160, 240);

  const image = await loadImage(
    "https://raw.githubusercontent.com/shufschmid/absender/master/assets/rosehip.png"
  ).then((image) => {
    const { w, h, x, y } = imagePosition;
    context2.drawImage(image, x, y, w, h);
  });

  const buffer = await canvas.toBuffer("image/png");

  const logoWithWeight = buffer.toString("base64");

  var options = {
    method: "POST",
    url: "https://wedec.post.ch/WEDECOAuth/token",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify({
      grant_type: "client_credentials",
      client_id: process.env.POST_TESTID,
      client_secret: process.env.POST_TESTSECRET,
      scope: "WEDEC_BARCODE_READ",
    }),
  };

  let barcode = "";

  await axios
    .request(options)
    .then(async function (response) {
      /**
       * eingefügt, weil es Probleme gab mit zweistelligen Logo-Dateien. Nun wir die grosse Zahl nur bis 9 ausgegeben, danach ein Standard-Logo.
       */
      console.log(response)
      var options2 = {
        method: "POST",
        url: "https://wedec.post.ch/api/barcode/v1/generateAddressLabel",
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
        data: {
          language: "DE",
          frankingLicense: "60144346",
          customer: {
            name1: "Verena Ming",
            street: "Mattenweg 17",
            zip: "4146",
            city: "Hochwald",
            country: "CH",
            logo: buffer.toString("base64"),
            logoFormat: "PNG",
            logoRotation: 270,
          },
          labelDefinition: {
            labelLayout: "A6",
            printAddresses: "RECIPIENT_AND_CUSTOMER",
            imageFileType: "JPG",
            imageResolution: 300,
          },
          item: { //Adresszusatz führt ev zu problemen wenn leer? addressSuffix: airtableAntwort.fields.Adresszusatz,
            itemID: airtableAntwort.fields.id,
            recipient: {
              name1: airtableAntwort.fields.Name,
              firstName: airtableAntwort.fields.Vorname,
              street: airtableAntwort.fields.Adresse,
              addressSuffix: airtableAntwort.fields.Adresszusatz,
              zip: airtableAntwort.fields.PLZ,
              city: airtableAntwort.fields.Ort,
              country: "CH",
            },
            attributes: {
              przl: ["PRI", "MAN"],
              weight: parseInt(airtableAntwort.fields.Gewicht),
              // freeText: "7. September / 8 Liter :",
            },
          },
        },
      };
      await axios
        .request(options2)
        .then(function (response) {
          //console.log(JSON.stringify(options2));
          //console.log(response.data.item.label);
          barcode = response.data.item.label;
          console.log(barcode)
        })
        .catch(function (error) {
          //console.log(JSON.stringify(error));
        });
    })
    .catch(function (error) {
      //console.error(JSON.stringify(error));
    });

  //setTimeout(function(){console.log(barcode)}, 1000);
  return Response.json(barcode, { status: 200 });

});
