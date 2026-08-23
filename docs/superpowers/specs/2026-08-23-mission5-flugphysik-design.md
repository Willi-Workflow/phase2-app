# Mission 5 (Test Flugphysik): Entwurf

Stand 23.08.2026, mit Willi abgestimmt. Baut auf dem Grundentwurf `2026-08-22-phase2-app-design.md` und dem Baumuster von Mission 4 auf.

## Zweck

Mission 5 prüft fliegerisches Kopfrechnen unter Zeitdruck: Weg, Zeit, Geschwindigkeit und Sink- oder Steigrate. Die Aufgaben werden von der App erzeugt, nicht aus einem Katalog gelesen, damit die Werte in jedem Lauf wechseln. Ein Wissensbereich in Karteikartenform liefert die Formeln und durchgerechnete Beispiele.

## Aufgabenerzeuger

Vier Aufgabenprinzipien, gefragt ist immer genau eine Größe, die beiden anderen sind gegeben:

| Gefragt | Gegeben | Formel | Beispiel |
|---|---|---|---|
| Zeit (min) | Geschwindigkeit, Weg | t = s / v mal 60 | 100 kt, 500 NM: Flugzeit in Minuten? (300) |
| Weg (NM) | Geschwindigkeit, Zeit | s = v mal t / 60 | 240 kt, 45 min: Weg in NM? (180) |
| Geschwindigkeit (kt) | Weg, Zeit | v = s / t mal 60 | 360 NM, 90 min: Geschwindigkeit in kt? (240) |
| Rate (ft/min) | Höhenänderung, Zeit | r = h / t | 6000 ft in 3 min abbauen: Sinkrate? (2000) |

Regeln für die Erzeugung:

- Erzeugt wird rückwärts vom Ergebnis her: erst ein glatter Zielwert, dann passende Angaben. Alle Werte sind ganzzahlig, es gibt keine Krummwerte.
- Wertelisten für Weg-Zeit-Geschwindigkeit: v aus {60, 80, 90, 100, 120, 150, 180, 200, 240, 300, 360, 420, 480} kt, t aus {12, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300} min, nur Paare mit ganzzahligem s = v mal t / 60 und s zwischen 20 und 2400 NM.
- Werteliste für die Rate: r aus 200 bis 4000 ft/min in Schritten von 100, t aus 2 bis 12 min, h = r mal t, h zwischen 500 und 30000 ft. Steigen oder Sinken wird gewürfelt, der Fragetext nennt die Richtung.
- Einheiten sind fest (kt, NM, Minuten, ft/min) und stehen immer im Fragetext, damit klar ist, was einzugeben ist.
- Das gefragte Prinzip wird je Aufgabe gewürfelt; innerhalb eines Laufs kommen alle vier Prinzipien mindestens einmal vor.
- Der Zufall ist als Funktion einspeisbar, damit die Erzeugung mit node --test prüfbar bleibt.

## Zwei Erscheinungsformen

Jede Aufgabe erscheint in einer von zwei Formen; die Form wird je Aufgabe mit gleicher Wahrscheinlichkeit gewürfelt:

- **Auswahlfrage:** vier gerechnete Antworten, eine richtig. Die drei Ablenker liegen in plausibler Nähe des Ergebnisses, darunter bevorzugt der klassische 60er-Fehler (Faktor 60 vergessen oder doppelt gerechnet), keine Doppelungen, Reihenfolge gemischt.
- **Zahleneingabe:** ein Eingabefeld mit der Einheit daneben. Komma und Punkt gelten beide als Dezimaltrenner, Leerzeichen werden ignoriert. Enter oder der Abgabeknopf gibt ab. Richtig ist nur der exakte Wert; da die Erzeugung glatte Zahlen liefert, braucht es keine Toleranz.

## Laufrahmen

Fester Prüfungsrahmen ohne Einstellungen:

- 10 Aufgaben je Lauf, 30 Sekunden je Aufgabe mit Ablaufbalken wie in Mission 4.
- Nach jeder Antwort sofort die Auflösung: richtig grün, falsch oder Zeit abgelaufen rot samt richtigem Wert. Weiter nach kurzer Wartezeit oder per Klick, nach Fehlern bleibt mehr Lesezeit (Werte wie in Mission 4).
- Vollbild mit Hangartür-Übergang: Tür zu, Aufbau verdeckt, Tür auf, erst dann läuft die Zeit.
- Abbruch über Esc, Verlassen des Vollbilds oder Tabwechsel führt zur Ergebnistafel ohne Wertung, gleiche Semantik wie Mission 4.

## Wertung

- Je Aufgabe höchstens 10 Punkte. Falsch oder Zeit abgelaufen gibt 0. Richtig gibt einen Grundanteil plus einen Zeitbonus, der linear mit der Restzeit wächst. Vorgabe: 6 Punkte Grund, bis zu 4 Punkte Bonus. Die endgültige Aufteilung legt Willi beim Bau in der Funktion `punkteFuerAntwort` fest; der Grundanteil bleibt dabei mindestens die Hälfte, damit eine langsame richtige Antwort immer vor jeder falschen liegt.
- Kennzahl des Laufs: Punktesumme, hochgerechnet auf 0 bis 100. Gerechnet wird Summe geteilt durch (Aufgabenzahl mal 10), das Ganze mal 100 und gerundet. Bei 10 Aufgaben ist das die Summe selbst.
- `js/missionen.js`: Mission 5 erhält `kennzahlName: "Punkte"` und `maximal: 100`. `wertung` bleibt auf `false` (Probebetrieb), bis Willi die Übung als fertig einstuft.
- Gespeicherte Laufdaten (`daten`): `art: "flugphysik"`, `gestellt`, `richtig`, `quote` (Prozent), `punkte`. Einzelne Aufgaben werden nicht gespeichert.
- Die Ergebnistafel führt mit den Punkten, darunter Richtige von Gestellt und die Trefferquote; die Fußzeile nennt den festen Rahmen (10 Aufgaben, 30 s je Aufgabe).

## Wissensbereich als Karteikartenstapel

- Auf der Seite von Mission 5 öffnet ein Schild WISSEN einen Kartenstapel, der sich vor die Seite legt. Schließen-Knopf oder Esc führt zurück, ohne die Seite neu zu laden.
- Gestaltung wie echte Karteikarten, passend zur Papieroptik des Prüfungskalenders: helles Papier mit Linienraster und roter Kopflinie, die oberste Karte leicht gedreht, der Stapel dahinter angedeutet, Inhalt in Handschrift-Anmutung.
- Geblättert wird vor und zurück per Knopf, Klick auf die Karte oder Pfeiltasten, mit Zähler (etwa 3/6) und kurzer Blätterbewegung beim Wechsel.
- Kartensatz zum Start, sechs Karten:
  1. Geschwindigkeit = Weg / Zeit (Knoten sind NM je Stunde)
  2. Weg = Geschwindigkeit mal Zeit
  3. Zeit in Minuten = Weg / Geschwindigkeit mal 60 (die 60er-Regel)
  4. Sink/Steigrate = Höhenänderung / Zeit in Minuten
  5. Beispielaufgabe Flugzeit (100 kt, 500 NM) mit Rechenweg in Schritten
  6. Beispielaufgabe Sinkrate mit Rechenweg in Schritten
- Karteninhalte und Reihenfolge liegen in `js/wissen5.js`; weitere Karten lassen sich dort ergänzen, ohne den Aufbau anzufassen.

## Bausteine

Nach dem Baumuster von Mission 4:

- `js/uebung5.js`: reine Logik ohne DOM. Aufgabenerzeugung, Ablenkerrechnung, Zahlenprüfung der Eingabe, Punktrechnung (`punkteFuerAntwort`), Kennzahl-Hochrechnung. Tests unter `tests/`.
- `js/uebung5-lauf.js`: Ablauf im Vollbild, beide Erscheinungsformen, Auflösung, Ergebnistafel, Abbruchwege.
- `js/wissen5.js`: Kartensatz des Wissensbereichs.
- `js/mission.js`: Der fest verdrahtete `uebung4`-Sonderfall wird durch eine Zuordnung Bereichsnummer zu Übungsfabrik ersetzt. Der Hinweistext je Übung kommt aus der Übung selbst; Übungen ohne Einstellungen lassen das Einstellungsfeld leer. Der dritte Bereich braucht damit später keinen Umbau mehr.
- `stil.css`: Klassen für Zahleneingabe, Karteikarten und das Wissens-Schild.
- `mission.html`: Versionsmarke des Einstiegsskripts hochzählen.

## Fehlerverhalten

- Abgebrochene Läufe werden nie gespeichert und tauchen nicht in der Statistik auf.
- Ein Speicherfehler nach vollendetem Lauf meldet sich wie in Mission 4 mit einem Hinweis, der Lauf geht dann verloren.
- Im Probebetrieb (`wertung: false`) wird grundsätzlich nicht gespeichert.

## Prüfung

- Logiktests mit `node --test tests/*.test.js`: Erzeuger liefert nur ganzzahlige, in sich stimmige Werte (mit eingespeistem Zufall über viele Ziehungen), Ablenker sind eindeutig und nie gleich dem Ergebnis, Zahlenprüfung mit Komma, Punkt und Leerzeichen, Punktrechnung an den Grenzen (volle Restzeit, Restzeit 0, falsch), Kennzahl-Hochrechnung, Kartensatz vollständig.
- Sichtprüfung der Missionsseite, des Laufs und des Kartenstapels headless in Chrome.

## Nicht Teil dieses Entwurfs

- Schwierigkeitsstufen oder Einstellungen für Mission 5.
- Eine Wiederholsperre für Aufgaben über Läufe hinweg.
- Weitere Aufgabentypen (etwa Verbrauch oder Einheitenumrechnung) und weitere Karteikartensätze; beides ist später über `uebung5.js` und `wissen5.js` ergänzbar.
