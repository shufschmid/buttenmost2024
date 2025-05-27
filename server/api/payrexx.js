import qs from 'qs'
import axios from 'axios'
import crypto from "node:crypto";


const baseUrl = "https://api.payrexx.com/v1.0/";


// payrexx.js module content:
const secret = process.env.PAYREXX_SECRET_KEY;

const init = function (instance, secret) {
  function buildSignature(query = "") {
    return crypto.createHmac('sha256', secret).update(query).digest('base64')
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
  try {
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
    "fields[email][value]": body.Email ? body.Email.replace(/ /g, ""):"",
    "fields[surname][value]": body.Name ? body.Name.replace(/ /g, ""):body.Geschaeft.replace(/ /g, ""),
    "fields[forename][value]": body.Vorname ? body.Vorname.replace(/ /g, ""):"",
    "fields[street][value]": body.Adresse ? body.Adresse.replace(/ /g, ""):"",
    "fields[postcode][value]": body.PLZ?body.PLZ.replace(/ /g, ""):"",
    "fields[place][value]": body.Ort?body.Ort.replace(/ /g, ""):"",
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
  } catch (error) {
    console.error("Payrexx Fehler:", error);
    return {
      statusCode: 500,
      body: "Payrexx Fehler: " + error.message,
    };
  }
});
