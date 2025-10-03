import qs from "qs";
import axios from "axios";
import Airtable from "airtable";
import * as PImage from "pureimage";
import Stream from "stream";


  import { Readable } from "stream";
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
      Status: "Etikette", 
    })
    .then((e) => {
      console.log(e.fields.Vorname, "airtable updated"); //Samuel bert airtable updated

      return e;
    })
    .catch((e) => {
      console.log(e, "Error");
    });

  const liter = airtableAntwort.fields.Menge;
  const abholen = airtableAntwort.fields.vertrieb
  const width = 470;
  const height = 250;
  const img1 = PImage.make(width, height);

  const ctx = img1.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  var fnt = PImage.registerFont("public/sourcesanspro-regular.ttf", "Source Sans Pro");
  fnt.loadSync();
  

  ctx.fillStyle = "#000000";
  ctx.font = "100pt 'Source Sans Pro'";
  ctx.fillText(liter.toString(), 10, 80);
  if(abholen === "Abholung") {
    
  ctx.fillText(">", 50, 210);
  
  ctx.fillText("=", 10, 210);
  ctx.fillText("|", 0, 200);

  }
  
  ctx.font = "32pt 'Source Sans Pro'";
  ctx.fillText("Geissackerweg 17", 120, 160);
  ctx.fillText("4146 Hochwald", 120, 190);
  ctx.fillText("www.buttenmost.ch", 120, 220);
  

  
  const buttenmostlogo = "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"
  
// ...
const buttenmostlogoBuffer = Buffer.from(buttenmostlogo, "base64");
const logoImg = await PImage.decodePNGFromStream(Readable.from(buttenmostlogoBuffer));
ctx.drawImage(logoImg, 110, 0); // Jetzt klappt es!


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
  let sendungsnummer = "";

  await axios
    .request(options)
    .then(async function (response) {
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
          sendungsnummer = response.data.item.identCode;
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
  if (barcode && Array.isArray(barcode)) {
  barcode = barcode[0];
}
if (barcode) {
  const airtableAntwort = await base("tblbU1zmZ2kumAXEY")
    .update(query.id, {
      Sendungsnummer: sendungsnummer, 
    })
    .then((e) => {
      console.log(sendungsnummer, "Sendungsnummer hinzugefügt"); 
      return e;
    })
    .catch((e) => {
      console.log(e, "Error");
    });

  // Falls Prefix vorhanden, entfernen:
  const base64Data = barcode.replace(/^data:image\/\w+;base64,/, "");
  const imgBuffer = Buffer.from(base64Data, "base64");
  return new Response(imgBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg", // oder image/png, je nach API-Antwort
      "Content-Disposition": `inline; filename=${sendungsnummer}.jpg`
    }
  });
}
return Response.json({ error: "Kein Bild generiert" }, { status: 400 });
  
});