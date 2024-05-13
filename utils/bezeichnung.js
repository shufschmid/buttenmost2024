export default function (data, art, eintrag) {
  let returndata = "";
  if (art == "Lieferung") {
    if (eintrag == "Name") {
      if (data.Lieferung_Bezeichnung) {
        returndata = data.Lieferung_Bezeichnung;
      }
      else if(data.b2b_Geschaeft){
        returndata = data.b2b_Geschaeft
      }
      else{
        returndata = data.Vorname + " " + data.Name;
      }

    }
    else if (eintrag == "Adresse") {
      if (data.Lieferung_Adresse) {
        returndata = data.Lieferung_Adresse;
      }
      else if(data.b2b_Strasse){
        returndata = data.b2b_Strasse
      }
      else{
        returndata = data.Adresse;
      }

    }
    else if (eintrag == "Adresszusatz") {
      if (data.Lieferung_Adresszusatz) {
        returndata = data.Lieferung_Adresszusatz;
      }
      else if(data.b2b_Adresszusatz){
        returndata = data.b2b_Adresszusatz
      }
      else{
        returndata = data.Adresszusatz;
      }

    }
    else if (eintrag == "PLZundOrt") {
      if (data.Lieferung_ORT) {
        returndata = data.Lieferung_PLZ + " " + data.Lieferung_Ort;
      }
      else if(data.b2b_Ort){
        returndata = data.b2b_PLZ + " " + data.b2b_Ort;
      }
      else{
        returndata = data.PLZ + " " + data.Ort;
      }

    }
  
  }
     return returndata
}
