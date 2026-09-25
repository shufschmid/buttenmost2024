notes.md

Diese Applikation dient als 
    - öffentliche Website (Informationen zu Bezugsmöglichkeiten, Rezepte, aktuelle Infos zu Saisonstart etc)
    - Online-Shop für Privatkunden (Anbindung an Payrexx für Bezahlung und Mailgun für Bestätigungsmail)
    - geschützer Online-Shop für b2b-Kunden (Anmeldung per Code, Berechnung Lieferdatum abhängig von verfügbarer Menge)
    - Administrationsbereich (Lieferscheine, Rechnungen, Etiketten für Postversand)


Aufbau: 
pages
    etiketten
        [id].vue: generiert PNG-Bild mit POST-API und bietet Möglichkeit, Status auf "Etikette" zu setzen, übergabe der Record ID von Airtable, Zugriff über Link in Airtable (Tabellenblatt "nächster Postversand")
        brother/[id].vue: wie [id].vue, holt die Etikette aber als Brother-Raster-.bin (QL-1110NWB, Endlosrolle 102 mm) über /api/etikette_brother, zeigt eine Vorschau, bietet den Download der .bin und einen Testmodus (SPECIMEN, ohne Airtable-Schreibzugriff). Zugriff über /etiketten/brother/<recordId>
    lieferschein
        [id].vue: generiert einen einzelnen Lieferschein (für alle Arten von Bestellungen), nutzt util "Bezeichnung" für generelle Adressausgabe ("Lieferung"), Status auf "verschickt" setzbar
    lieferscheine
        [datum].vue: druckt sämtliche Lieferscheine für Lieferung an b2b-Kunden eines Tages (todo: Anpassung an die beiden Touren "direkt" & "Kurier")
    rechnungen
        [id].vue: generiert eine einzelne Rechnung (für alle Arten von Bestellungen). Zugriff über Link aus Airtable, Status auf "Rechnung" setzen.
    rezept
        [id].vue: Darstellung einzelnes Rezept
    verkaufsstellen
        [id].vue: Darstellung einzelne Verkaufsstelle (nur wenn Airtable: Homepage = true)
    admin
        Übersichtsseite für eingeloggte Administratoren, todo: Admin-Navigation
    b2b.vue: Bestellformular für registrierte b2b-Kunden, berechnet das Lieferdatum anhand verfügbarer Menge Tag/Kapazität Lieferwagen pro Tour
    index.vue:
        Hauptseite der öffentlichen Website, bindet Komponenten "verkaufsstelle.vue", "signup.vue" und "shop.vue" ein
    login.vue:
        Login für Admin-Funktionen, nutzt middleware "auth.js"
    rezepte.vue:
        Übersicht der Rezepte
    verkaufsstellen.vue: 
        durchsuchbare Übersicht der Verkaufsstellen, nutzt Komponente "verkaufsstellen.vue" mit anderer Parameterübergabe (alle)

Server-Funktionen
    airtable_get.js: 
        Daten aus Airtable holen und aufbereiten. Wird mehrfach eingesetzt. Übergabe der gewünschten Daten mittels URL-Parameter.
    airtable_update.js:
        simple Update-Funktion für maximal 1-10 Einträge, body wird in den Komponenten aufbereitet und übergeben
    airtable.js:
        erstellen eines Eintrags in Airtable, sowohl für Privatkunden als auch über das b2b-Bestellformular
    auth.js: 
        überprüft die Eingaben im Login-Formular und gibt true/false zurück
    etikette.js:
        Übergabe der Record-ID, erstellt ein Bild mit grosser Mengenangabe & Firmenlogo und übermittelt diese an POST-API, gibt base64-Bild zurück (als Text)
    etikette_brother.js:
        Kopie von etikette.js für den Brother QL-1110NWB (etikette.js bleibt unverändert). Holt die Etikette als PNG (A6, 300 dpi) und wandelt sie mit server/utils/brotherRaster.js in einen Raster-Befehlsstrom (.bin, 1164 x 1748 Punkte, Endlosrolle 102 mm) um. Antwort: JSON mit Vorschau-PNG und .bin (base64); mit ?raw=1 direkt die .bin als Download. Parameter: ?preview=1 (SPECIMEN-Etikette, kein Airtable-Schreibzugriff), ?threshold=1..254 (Schwellwert Schwarz/Weiss). Setzt Status "Etikette" und Sendungsnummer erst nach erfolgreichem Post-Aufruf in einem Update.
    order.js:
        sollte ersetzt werden durch airtable.js (war für Privatbestellungen)
    payrexx.js:
        öffnet payrexx-gateway für Bezahlungsprozess
    qrcode.js:
        erstellt einen Einzahlungsschein für Rechnungen (für alle Arten von Bestellungen einsetzbar)
    webhook_payrexx.js:
        setzt nach erfolgreicher Zahlungsabwicklung den Status der Bestellung in Payrexx auf "bezahlt" (todo: Integration in airtable_update)
    
Store

utils
    bezeichnung.js:
        Übergabe Bestelldetails, Art (Lieferung, Rechnung) und Art (Name, Adresse, PLZundOrt) und gibt gewünschte Daten zurück
    
components
    shop.vue:
        zeigt das Bestellformular für den Post-Versand an und berechnet den Preis inkl. Zuschläge und Rabatt. Die verfügbaren Versanddaten werden vom Store berechnet und bezogen. Es hat einen zweispaltigen Aufbau für Desktop und 1-spaltig für mobile. Aus dem component wird die Unterkomponente "adress" aufgerufen, "formvalidy" wird übergeben. Der Bestellbutton wird mittels :disabled="!formValidity" aktiviert und löst den Bestellvorgang aus
    adress.vue:
        überprüft die korrekte Formeingabe und übermittelt (emit) den Status "formvalidy"
    signup.vue:
        bindet das Rapidmail-Anmeldeformular für Newsletter ein (ausserhalb Saison)
    verkaufsstellen.vue:
        gibt eine durchsuchbare Auflistung von Verkaufsstellen aus, Parameter-Übergabe steuert Pagination (für Startseite, Komplettauflistung)

Etikette auf Brother QL-1110NWB drucken (ohne Treiber)
    1. Endlosrolle 102 mm (DK-22243) einlegen.
    2. Seite /etiketten/brother/<recordId> öffnen, "Etikette laden" (oder "Testetikette" zum Ausprobieren), dann ".bin für Drucker speichern".
    3. Drucker ausschalten. Wi-Fi-Taste und Ein/Aus-Taste gleichzeitig einige Sekunden halten -> Massenspeicher-Modus (Status-LED grün).
    4. USB-Kabel anschliessen, der Drucker erscheint als Wechseldatenträger (2.5 MB).
    5. .bin ins Hauptverzeichnis kopieren (keine Ordner, max. 2 MB), WPS-Taste drücken -> Etikette wird gedruckt und geschnitten.
    6. Zum Beenden Drucker ausschalten (Dateien werden dabei gelöscht). WLAN/LAN/Bluetooth sind im Massenspeicher-Modus nicht verfügbar.
    Technik: Brother Raster Command Reference QL-1100/1110NWB (1296 Pins, 162 Bytes/Zeile, Druckbereich 1164 Pins bei 102 mm). Das Post-A6 kommt quer (1748 x 1240 px), wird um 90 Grad gedreht und um 38 px weissen Rand je Seite auf 1164 x 1748 beschnitten, nie skaliert (Barcode muss 68-69 mm bleiben). Dieselbe .bin könnte auch per Netzwerk-Port 9100 an den Drucker gesendet werden (nicht umgesetzt).
