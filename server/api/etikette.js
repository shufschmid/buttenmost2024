import qs from "qs";
import axios from "axios";
import Airtable from "airtable";
import * as PImage from "pureimage";
import Stream from "stream";


// const logoWithWeight = require("logo.json");

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  //console.log(query.id);
  const airtableAntwort = await base("tblbU1zmZ2kumAXEY")
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
  const img1 = PImage.make(width, height);

  const ctx = img1.getContext("2d");

  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, width, height);

  var fnt = PImage.registerFont("public/sourcesanspro-regular.ttf", "Source Sans Pro");
  fnt.loadSync();
  ctx.fillStyle = "#ffffff";
  ctx.font = "48pt 'Source Sans Pro'";
  ctx.fillText("ABC", 80, 80);

  const pngData = [];

  const dest = new Stream();
  dest.writable = true;

  dest.write = function (data) {
    for (let i = 0; i < data.length; i++) {
      dest.emit("data", data[i]);
    }
  };

  // Act like a passThrough stream; in one ear and out the other.
  dest.on("data", (chunk) => {
    pngData.push(chunk);
  });

  dest.on("end", () => {});

  // For
  // https://github.com/joshmarinacci/node-pureimage/blob/6775bc3dedfd4247c0ee11382e1aebdf2703ca45/src/image.ts#L57
  dest.end = function () {
    dest.emit("finish");
  };

  dest.close = function () {
    dest.emit("close");
  };

  function assert(a, b) {
    if (a !== b) {
      throw new Error(`${a} !== ${b}`);
    } else {
      return true;
    }
  }

  const buf = await PImage.encodePNGToStream(img1, dest).then(() => {
    return new Uint8Array(pngData);
  });
  let b64 =""
  if (
    assert(buf[0], 0x89) &&
    assert(buf[1], 0x50) &&
    assert(buf[2], 0x4e) &&
    assert(buf[3], 0x47)
  ) {
    console.log("buffer contains png header");

    const ascii = Array.from(buf).map((b) => String.fromCharCode(b));
    b64 = btoa(ascii.join(""));

    console.log(b64);
    console.log("test");
  }
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
      //console.log(response);
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
            logo: b64,
            //logo: "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",
            logoFormat: "PNG",
            logoRotation: 270,
          },
          labelDefinition: {
            labelLayout: "A6",
            printAddresses: "RECIPIENT_AND_CUSTOMER",
            imageFileType: "JPG",
            imageResolution: 300,
          },
          item: {
            //Adresszusatz führt ev zu problemen wenn leer? addressSuffix: airtableAntwort.fields.Adresszusatz,
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
          //console.log(barcode);
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
