import qs from "qs";
import axios from "axios";
import Airtable from "airtable";

import fetch from "node-fetch";
import querystring from "querystring";

export default defineEventHandler(async (event) => {
  try {
    // Main configuration
    let myEndpointUrl = "http://qrbillservice.livingtech.ch";
    let myEndpointPath = "/api/qrinvoice/create/";
    let myApiKey = process.env.QR_CODE_API_KEY;
    let qrcode = "";
    let { Name, Strasse, Ort, Betrag, Rechnung_Referenz_Nummer, Bemerkungen } =
      getQuery(event);

    let myConfiguration = {
      Account: "CH5730808008481180711",
      CreditorName: "Buttenmost, Inhaberin Verena Ming",
      CreditorAddress1: "Mattenweg 17",
      CreditorAddress2: "4146 Hochwald",
      CreditorCountryCode: "CH",
      DebtorName: Name,
      DebtorAddress1: Strasse,
      DebtorAddress2: Ort,
      DebtorCountryCode: "CH",
      Amount: Betrag,
      ReferenceNr: Rechnung_Referenz_Nummer,
      UnstructuredMessage: Bemerkungen,
      Currency: "CHF",
      QrOnly: "true",
      Format: "png",
      Language: "DE",
    };
    console.log("test")
    // GET parameters
    let myGetParams = querystring.stringify(myConfiguration);
    console.log(myGetParams);
    // Perform request
    let response = await fetch(
      myEndpointUrl + myEndpointPath + "?" + myGetParams,
      {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
          APIKEY: myApiKey,
          Accept: "application/json",
        },
      }
    );
    let myResponse = response.json();

    qrcode = myResponse.base64Content;

    return Response.json(qrcode, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed fetching data" }, { status: 500 });
  }
});
