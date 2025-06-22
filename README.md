# Bereitschaftsplaner
Ein Bereitschaftsplaner der im Browser und vollständig lokal läuft.

## Beschreibung
Mit diesem Bereitschaftsplaner lässt sich im Browser ein Team erstellen und anschließend ein Bereitscahftplan erstellen, welcher auch als XLSX Datei exportiert werden kann.
Der Planer operiert vollständig lokal.

### Getting Started
* Download den .zip Ordner
* Entpacke ihn an einer präferierten Stelle
* Starte die **index.html** Datei

### Erstes Team erstellen
* Klicke auf den Button **Neuen Mitarbeiter hinzufügen**
* Fülle das Pop-Up Fenster aus
  * Vor- und Nachname eingeben.
  * In **Urlaube bearbeiten** eine beliebige Anzahl an Urlaube hinzufügen
  * In **Bereitschaft an Feiertagen** wird ausgefüllt in welchem Jahr der Mitarbeiter das letzte Mal eine Bereitschaft hatte. Dadurch wird verhindert, dass ein Mitarbeiter mehrere Jahre in Folge an dem gleichen Feiertag eingesetzt wird.
  * Zum Abschließen auf **Speichern** drücken.
  * Wenn nach dem Speichern ein Fehler bemerkt wurde, kann man auf den erstellten Mitarbeiter klicken, um ihn nachträglich noch zu bearbeiten.
* Wenn alle Mitarbeiter erstellt worden sind, kann man auf **Bereitschaftsplan erstellen** klicken.
  * In dem Pop-Up Fenster wird der Zeitraum eingegeben indem der Bereitschaftsplan erstellt werden soll.
  * Außerdem kann man die Dauer pro Bereitschaftswoche eingeben.
  * Sollten mehr als eine Person für eine Bereitschaftswoche eingeplant werden, kann man dies ebenfalls ändern.
  * Wenn alles eingestellt ist, kann mit **Plan generieren** ein Bereitschaftsplan generiert werden
  * Dieser wird dann ausgegeben.
* Nachdem der Bereitschaftsplan erstellt wurde, klickt man abschließend auf **Bereitschaftsplan exportieren**
  * Dieser wird damit als *.xlsx* heruntergeladen

### Team speichern und laden
* Wenn man ein Team vervollstädigt hat, kann man dieses mit **Speichern** als eine *.team* Datei speichern und herunterladen.
  * Dies ist essentiell, um das Team auch zu einem späteren Zeitpunkt noch zu bearbeiten
* Auf **Öffnen** lässt sich dann eine gespeicherte *.team* Datei einlesen und bearbeiten.
* Ein Überschreiben der alten Datei ist aber nicht möglich. Sollten Änderungen auf diese Weise vorgenommen werden, muss sich vergewissert werden, dass die alte und neue Datei nicht verwechselt werden. (z.B. in dem man die alte Datei löscht.)
