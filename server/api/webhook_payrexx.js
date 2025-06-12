import Airtable from "airtable";
import formData from "form-data";
import dateFormat from "dateformat";
dateFormat.i18n = {
  dayNames: [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag"
  ],
  monthNames: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember"
  ],
  timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"]
};

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");



export default defineEventHandler(async (event) => {
  let webhookData = await readBody(event);
  console.log(webhookData)
  if(webhookData.transaction.status == "confirmed"){
  let airtableAntwort = await base("tblbU1zmZ2kumAXEY")
    .update(webhookData.transaction.referenceId, {
      Status: "bezahlt",
      BezahlDatum: webhookData.transaction.time,
      BezahlMethode: webhookData.transaction.payment.brand
    })
    .then(e => {
      console.log(e);
      console.log(JSON.stringify(e)); //7:41:42 AM: 64ce5fb2 INFO   {"_table":{"_base":{"_airtable":{},"_id":"appfpfjspgZ9LWcB2"},"id":null,"name":"Table 1"},"id":"recvK2pCxtqNsQnPs","_rawJson":{"id":"recvK2pCxtqNsQnPs","fields":{"Email":"shufschmid@gmail.com","Status":"bezahlt","Vorname":"Samuel bert","Name":"Hufschmid","Adresse":"Jacob Burckhardt-Strasse 17","PLZ":"4052","Ort":"Basel","Betrag":56,"Menge":4,"Versanddatum":"2021-09-07","Verpackung":3,"Porto":15},"createdTime":"2021-06-15T05:40:06.000Z"},"fields":{"Email":"shufschmid@gmail.com","Status":"bezahlt","Vorname":"Samuel bert","Name":"Hufschmid","Adresse":"Jacob Burckhardt-Strasse 17","PLZ":"4052","Ort":"Basel","Betrag":56,"Menge":4,"Versanddatum":"2021-09-07","Verpackung":3,"Porto":15}}
      console.log(e.fields.Vorname, "airtable updated"); //Samuel bert airtable updated

      return e;
    })
    .catch(e => {
      console.log(e, "Error");
    });

  let PortoUndVerpackung = parseFloat(airtableAntwort.fields.Porto)+parseFloat(airtableAntwort.fields.Verpackung);
  //let Verpackung = parseFloat(airtableAntwort.fields.Verpackung);
  let Lieferpauschale = parseFloat(airtableAntwort.fields.Lieferpauschale);
  let Total = parseFloat(airtableAntwort.fields.Betrag);
  let nettoPreis = parseFloat(Total - PortoUndVerpackung - Lieferpauschale);
  console.log(airtableAntwort.fields.Lieferdatum);
  const VersanddatumDate = new Date(airtableAntwort.fields.Lieferdatum);

  const Versanddatum = dateFormat(VersanddatumDate, "dddd, d. mmmm yyyy");
  
}});