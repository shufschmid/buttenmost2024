export default function (data, art, eintrag) {
  let returndata = "";
  if (art == "Lieferung") {
    console.log()
    if (eintrag == "Name") {
      if (data.Lieferung_Bezeichnung) {
        returndata = data.Lieferung_Bezeichnung;
      } else if (data.Geschaeft) {
        returndata = data.Geschaeft;
      } else {
        returndata = data.Vorname + " " + data.Name;
      }
    } else if (eintrag == "Adresse") {
      if (data.Lieferung_Adresse) {
        returndata = data.Lieferung_Adresse;
      } else if (data.Strasse) {
        returndata = data.Strasse;
      } else {
        returndata = data.Adresse;
      }
    } else if (eintrag == "Adresszusatz") {
      if (data.Lieferung_Adresszusatz) {
        returndata = data.Lieferung_Adresszusatz;
      } else if (data.Adresszusatz) {
        returndata = data.Adresszusatz;
      } else {
        returndata = data.Adresszusatz;
      }
    } else if (eintrag == "PLZundOrt") {
      if (data.Lieferung_ORT) {
        returndata = data.Lieferung_PLZ + " " + data.Lieferung_Ort;
      } else if (data.Ort) {
        returndata = data.PLZ + " " + data.Ort;
      } else {
        returndata = data.PLZ + " " + data.Ort;
      }
    }
  }
  if (returndata) {
    console.log(returndata)
    return returndata.toString();
  }

}
