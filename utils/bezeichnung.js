import { isProxy, toRaw } from "vue";

export default function (data, art, eintrag) {
  let returndata = "";
  if (art == "Lieferung") {
    if (eintrag == "Name") {
      returndata =
        data.Lieferung_Bezeichnung ||
        data.b2b_Bezeichnung ||
        data.Vorname + " " + data.Name;
    } else if (eintrag == "Adresse") {
      returndata = data.Lieferung_Adresse || data.b2b_Adresse || data.Adresse;
    } else if (eintrag == "Adresszusatz") {
      returndata = data.Lieferung_Adresszusatz || data.b2b_Adresszusatz || data.Adresszusatz;

    } else if (eintrag == "PLZundOrt") {

      if (data.Lieferung_Ort) {
        returndata = data.Lieferung_PLZ + " " + data.Lieferung_Ort;
      } else if (data.b2b_Ort) {
        returndata = data.b2b_PLZ + " " + data.b2b_Ort;
      } else {
        returndata = data.PLZ + " " + data.Ort;
      }
    }
  }
  else if(art == "Rechnung") {
    if (eintrag == "Name") {
      returndata =
        data.Rechnung_Bezeichnung ||
        data.b2b_Bezeichnung ||
        data.Vorname + " " + data.Name;
    } else if (eintrag == "Adresse") {
      returndata = data.Rechnung_Adresse || data.b2b_Adresse || data.Adresse;
    } else if (eintrag == "Adresszusatz") {
      returndata = data.Rechnung_Adresszusatz || data.b2b_Adresszusatz || data.Adresszusatz;

    } else if (eintrag == "PLZundOrt") {

      if (data.Rechnung_Ort) {
        returndata = data.Rechnung_PLZ + " " + data.Rechnung_Ort;
      } else if (data.b2b_Ort) {
        returndata = data.b2b_PLZ + " " + data.b2b_Ort;
      } else {
        returndata = data.PLZ + " " + data.Ort;
      }
    }
  }
  if (returndata) {
    console.log(returndata);
    return returndata.toString();
  }
}
