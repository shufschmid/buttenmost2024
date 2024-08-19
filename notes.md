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