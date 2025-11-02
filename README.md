# Bereitschaftsplaner

Ein Bereitschaftsplaner, der im Browser und vollständig lokal läuft.

## Beschreibung

Mit diesem Bereitschaftsplaner lässt sich im Browser ein Team erstellen und anschließend ein Bereitschaftsplan erstellen, welcher auch als XLSX-Datei exportiert werden kann.  
Der Planer operiert vollständig lokal.

## Updatehinweise

- ab Version 0.2.2 .team Dateien nicht mehr kompatibel mit den Alten
  -  um das zu ändern muss man das Bundeslandkürzel in Großbuchstaben am Ende der .team Datei angefügen
 
## Change-Log
  0.2.5 -> 0.2.6
  
    - Globals.js in Web-Speicher Laden und damit arbeiten
    - Version Check mit Fallbacks
    - cleanup main.js
    - Excel Export Metadaten ergänzt
    - Excel Export Name der Datei mit Teamnamen und Jahr erweitern

## Getting Started

1. Lade den `.zip`-Ordner herunter  
2. Entpacke ihn an einer bevorzugten Stelle  
3. Starte die Datei **index.html**

## Erstes Team erstellen

- Wähle zuerst das passende Bundesland aus
- Klicke auf den Button **Neuen Mitarbeiter hinzufügen**
- Fülle das Pop-up-Fenster aus:
  - Vor- und Nachname eingeben
  - Unter **Urlaube bearbeiten** eine beliebige Anzahl an Urlauben hinzufügen
  - In **Bereitschaft an Feiertagen** wird eingetragen, in welchem Jahr der Mitarbeiter das letzte Mal eine Bereitschaft hatte  
  - Zum Abschließen auf **Speichern** drücken  
  - Falls nach dem Speichern ein Fehler auffällt, kann der Mitarbeiter durch Klick nachträglich bearbeitet werden

- Wenn alle Mitarbeiter erstellt sind, auf **Bereitschaftsplan erstellen** klicken:
  - Im Pop-up-Fenster den Zeitraum eingeben, in dem der Bereitschaftsplan gelten soll  
  - Dauer pro Bereitschaftswoche definieren  
  - Optional mehrere Personen pro Woche einplanen  
  - Mit **Plan generieren** den Plan erstellen

- Anschließend auf **Bereitschaftsplan exportieren** klicken, um den Plan als `.xlsx` herunterzuladen

## Team speichern und laden

- Nach der Fertigstellung kann das Team über **Speichern** als `.team`-Datei gespeichert und heruntergeladen werden  
  - Dies ist wichtig, um das Team später weiter bearbeiten zu können

- Über **Öffnen** lässt sich eine gespeicherte `.team`-Datei laden und bearbeiten

- Ein direktes Überschreiben der alten Datei ist nicht möglich.  
  Daher sollte sichergestellt werden, dass alte und neue Dateien nicht verwechselt werden (z. B. indem man die alte Datei löscht)
