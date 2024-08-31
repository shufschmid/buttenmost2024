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
import Mailgun from "mailgun.js";
const mailgun = new Mailgun(formData);

// const buttenmostBild = fs.createReadStream(`${__dirname}/buttenmost.png`);
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY
});
const mg = mailgun.client({
  username: "api",
  key: process.env.MG_API_KEY,
  public_key: process.env.MG_PUBLIC_KEY,
  url: "https://api.eu.mailgun.net"
});
const base = new Airtable.base("app8cUEZWBvWHDfaN");


export default defineEventHandler(async (event) => {
  let webhookData = await readBody(event);
  console.log(webhookData)
  if(webhookData.transaction.status == "confirmed"){
  const airtableAntwort = await base("tblbU1zmZ2kumAXEY")
    .update(webhookData.transaction.referenceId, {
      Status: "bezahlt"
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
  const mailbody = `<!DOCTYPE html>
<html  style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
<head>
<meta name="viewport" content="width=device-width" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Billing e.g. invoices and receipts</title>

<style type="text/css">
img {
max-width: 100%;
}
body {
-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
}
body {
background-color: #f6f6f6;
}
@media only screen and (max-width: 640px) {
  body {
    padding: 0 !important;
  }
  h1 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h2 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h3 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h4 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h1 {
    font-size: 22px !important;
  }
  h2 {
    font-size: 18px !important;
  }
  h3 {
    font-size: 16px !important;
  }
  .container {
    padding: 0 !important; width: 100% !important;
  }
  .content {
    padding: 0 !important;
  }
  .content-wrap {
    padding: 10px !important;
  }
  .invoice {
    width: 100% !important;
  }
}
</style>
</head>

<body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">

<table class="body-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
    <td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
      <div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
        <table class="main" width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-wrap aligncenter" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: center; margin: 0; padding: 20px;" align="center" valign="top">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    <h1 class="aligncenter" style="font-family: 'Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif; box-sizing: border-box; font-size: 32px; color: #000; line-height: 1.2em; font-weight: 500; text-align: center; margin: 40px 0 0;" align="center">Danke für Ihre Bestellung</h1>
                  </td>
                </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Wir verschicken Ihren Buttenmost am ${Versanddatum}
                  </td>
                </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block aligncenter" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">
                    <table class="invoice" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; text-align: left; width: 80%; margin: 40px auto;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 5px 0;" valign="top">${
                      airtableAntwort.fields.Vorname
                    } ${
    airtableAntwort.fields.Name
  }<br style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" />${
    airtableAntwort.fields.Adresse
  }<br style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" />${
    airtableAntwort.fields.PLZ
  } ${airtableAntwort.fields.Ort}</td>
                      </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 5px 0;" valign="top">
                          <table class="invoice-items" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 5px 0;" valign="top">${
                            airtableAntwort.fields.Menge
                          } Liter Buttenmost</td>
                              <td class="alignright" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 5px 0;" align="right" valign="top">CHF ${nettoPreis.toFixed(
                                2
                              )}</td>
                            </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 5px 0;" valign="top">Porto/Verpackung</td>
                              <td class="alignright" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 5px 0;" align="right" valign="top">CHF ${PortoUndVerpackung.toFixed(
                                2
                              )}</td>
                            </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 5px 0;" valign="top">Versandpauschale</td>
                              <td class="alignright" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 5px 0;" align="right" valign="top">CHF ${Lieferpauschale.toFixed(
                                2
                              )}</td>
                            </tr><tr class="total" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="alignright" width="80%" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 2px; border-top-color: #333; border-top-style: solid; border-bottom-color: #333; border-bottom-width: 2px; border-bottom-style: solid; font-weight: 700; margin: 0; padding: 5px 0;" align="right" valign="top">Total</td>
                              <td class="alignright" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 2px; border-top-color: #333; border-top-style: solid; border-bottom-color: #333; border-bottom-width: 2px; border-bottom-style: solid; font-weight: 700; margin: 0; padding: 5px 0;" align="right" valign="top">CHF ${Total.toFixed(
                                2
                              )}</td>
                            </tr></table></td>
                      </tr></table></td>
                </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block aligncenter" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">
                    Zahlung erhalten am ${webhookData.transaction.time} mit ${
    webhookData.transaction.payment.brand
  } via payrexx.com. Betrag inkl. 2,5 % Mehrwertsteuer, CHE-369.928.965
                  </td>
                </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block aligncenter" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">
                Buttenmost, Inhaberin Verena Ming, Mattenweg 17, 4146 Hochwald
                  </td>
                </tr></table></td>
          </tr></table><div class="footer" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">
          <table width="100%" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="aligncenter content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">Fragen? Tel 061 751 48 21 <a href="mailto:info@buttenmost.ch" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;">info@buttenmost.ch</a></td>
            </tr></table></div></div>
    </td>
    <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
  </tr></table></body>
</html>`;
  await mg.messages
    .create("mg.buttenmost.ch", {
      from: "Buttenmost <info@buttenmost.ch>",
      to: [airtableAntwort.fields.Email],
      subject: "Danke für Ihre Bestellung",
      html: mailbody
      // inline: [buttenmostBild],
      //   template: "rechnung",
      //   "h:X-Mailgun-Variables": JSON.stringify({ customVariable })
    })
    .then(msg => console.log(msg)) // logs response data
    .catch(err => console.log(err)); // logs any error

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      airtableAntwort,
      mailbody
    })
  });
}});