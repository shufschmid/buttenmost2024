import qs from 'qs'
import axios from 'axios'

const Base64 = require("crypto-js/enc-base64");
const hmacSHA256 = require("crypto-js/hmac-sha256");


const baseUrl = "https://api.payrexx.com/v1.0/";

console.log("wird geladen");

// payrexx.js module content:
const secret = process.env.PAYREXX_SECRET_KEY;

const init = function (instance, secret) {
  function buildSignature(query = "") {
    return Base64.stringify(hmacSHA256(query, secret));
  }

  function buildBaseUrl(path) {
    return baseUrl + path + "?instance=" + instance;
  }

  return {
    getGateway: function (id) {
      const baseUrl = buildBaseUrl("Gateway/" + id + "/");
      const url = baseUrl + "&ApiSignature=" + buildSignature();
      return axios.get(url);
    },
    createGateway: function (params) {
      if (!params.amount) {
        throw new Error("Amount required!");
      }

      const defaultParams = {
        currency: "CHF",
      };

      let queryParams = Object.assign({}, defaultParams, params);

      const queryStr = qs.stringify(queryParams);
      const signature = buildSignature(queryStr);

      queryParams.ApiSignature = signature;
      const queryStrSigned = qs.stringify(queryParams);

      const baseUrl = buildBaseUrl("Gateway/");
      return axios.post(baseUrl, queryStrSigned);
    },
  };
};


export default defineEventHandler(async (event) => {
  let body = await readBody(event);
  // where you want to consume the payrexx module:
  const payrexx = init("buttenmost", secret);
  const response = await payrexx.createGateway({
    amount: body.Betrag * 100,
    failedRedirectUrl:
      "https://buttenmost.ch/danke/?fehler=abgelehnt&kunde=" +
      body.Email,
    cancelRedirectUrl:
      "https://buttenmost.ch/danke/?fehler=abgebrochen&kunde=" +
      body.Email,
    successRedirectUrl:
      "https://buttenmost.ch/danke/?success=true&kunde=" + body.Email,
    referenceId: body.AirtableRecordID,
    //fields: "['forename':'Samuel','surname':'Hufschmidharcode','email':'samhardode@gmail.com']"  // ergibt &fields=['forename':'Samuel','surname':'Hufschmidharcode','email':'samhardode@gmail.com']
    "fields[email][value]": body.Email.replace(/ /g, ""),
    "fields[surname][value]": body.Name.replace(/ /g, ""),
    "fields[forename][value]": body.Vorname.replace(/ /g, ""),
    "fields[street][value]": body.Adresse.replace(/ /g, ""),
    "fields[postcode][value]": body.PLZ.replace(/ /g, ""),
    "fields[place][value]": body.Ort.replace(/ /g, ""),
    "fields[text][value]": String(body.Lieferdatum),
    //muss ergeben: &fields[forename][value]=Samuel&fields[surname][value]=Hufschmidharcode&fields[email][value]=samhardode@gmail.com&ApiSi
    // add more fields here
  });

  //if (response.status === 200) {
  const gateway = JSON.stringify(response.data.data[0]);
  // here you will get the gateway
  //}
  return {
    statusCode: 200,
    body: `${response.data.data[0].link}`,
  };
});
