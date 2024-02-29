notes.md

index.vue ist das Hauptfile, hier wird die Verbindung zum Store hergestellt (Pinia) und es werden die Komponenten der 
Startseite geladen, abhängig davon ob Saison oder nicht. 

components
shop zeigt das Bestellformular für den Post-Versand an und berechnet den Preis inkl. Zuschläge und Rabatt. 
Die verfügbaren Versanddaten werden vom Store berechnet und bezogen. Es hat einen zweispaltigen Aufbau 
für Desktop und 1-spaltig für mobile. 
Aus dem component wird die Unterkomponente "adress" aufgerufen, "formvalidy" wird übergeben. 
Der Bestellbutton wird mittels :disabled="!formValidity" aktiviert und löst den Bestellvorgang aus

adress
überprüft die korrekte Formeingabe und übermittelt (emit) den Status "formvalidy"