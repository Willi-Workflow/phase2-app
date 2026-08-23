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
- Das gefragte Prinzip wird je Aufgabe gewürfelt; durch den Nachschub in Viererblöcken (siehe Laufrahmen) kommt jedes Prinzip in jedem Block genau einmal vor.
- Der Zufall ist als Funktion einspeisbar, damit die Erzeugung mit node --test prüfbar bleibt.

## Zwei Erscheinungsformen

Jede Aufgabe erscheint in einer von zwei Formen; die Form wird je Aufgabe mit gleicher Wahrscheinlichkeit gewürfelt:

- **Auswahlfrage:** vier gerechnete Antworten, eine richtig. Die drei Ablenker liegen in plausibler Nähe des Ergebnisses, darunter bevorzugt der klassische 60er-Fehler (Faktor 60 vergessen oder doppelt gerechnet), keine Doppelungen, Reihenfolge gemischt.
- **Zahleneingabe:** ein Eingabefeld mit der Einheit daneben. Komma und Punkt gelten beide als Dezimaltrenner, Leerzeichen werden ignoriert. Enter gibt ab, einen Abgabeknopf gibt es nicht (Fassung nach Willis Sichtung vom 23.08.2026). Richtig ist nur der exakte Wert; da die Erzeugung glatte Zahlen liefert, braucht es keine Toleranz.

## Laufrahmen

Fassung nach Willis Vorgabe vom 23.08.2026: Testdauer statt fester Aufgabenzahl.

- Die Testdauer ist einstellbar (5, 10 oder 30 Minuten, Vorgabe 5), gespeichert je Profil wie bei Mission 4 (`uebung5-einstellung` über die Einstellungen-Tabelle). Aufgaben folgen am Stück, bis die Testdauer um ist; eine bereits laufende Aufgabe wird noch zu Ende beantwortet.
- Der Aufgabennachschub kommt in Viererblöcken, jeder Block enthält jedes der vier Prinzipien genau einmal in gemischter Reihenfolge.
- 20 Sekunden Antwortzeit je Aufgabe mit Ablaufbalken wie in Mission 4.
- Die Kopfzeile auf der Mattscheibe zählt die Aufgaben fortlaufend und zeigt die Test-Restzeit.
- Nach jeder Antwort sofort die Auflösung: richtig grün, falsch oder Zeit abgelaufen rot samt richtigem Wert. Weiter nach kurzer Wartezeit oder per Klick, nach Fehlern bleibt mehr Lesezeit (Werte wie in Mission 4).
- Vollbild mit Hangartür-Übergang: Tür zu, Aufbau verdeckt, Tür auf, erst dann läuft die Zeit.
- Abbruch über Esc, Verlassen des Vollbilds oder Tabwechsel führt zur Ergebnistafel ohne Wertung, gleiche Semantik wie Mission 4.
- Bühne der Abfrage (Fassung nach Willis Sichtung vom 23.08.2026): Der Lauf spielt auf dem Bild eines Fliegerschreibtischs mit Flachbildschirm aus den frühen 2000ern (`bilder/rechner.jpg`, Quelle `entwurf/bilder/rechner-entwurf-8.png`, über Higgsfield erzeugt, von Willi aus acht Entwürfen gewählt). Aufgabenzähler, Fragetext, Antworten, Eingabefeld und Rückmeldung liegen in schwarzer Schreibmaschinenschrift auf der hellen Mattscheibe des Bildschirms; Auswahlfragen zeigen ihre vier Knöpfe als schwarz umrandete Felder an derselben Stelle. Der Ablaufbalken behält seine Ampelfarben (Grün nach Rot mit schwindender Zeit) als Warnsignal, nur seine Schiene ist an die helle Scheibe angepasst. Um das Bild herum füllt eine abgedunkelte, vergrößerte Fassung derselben Szene den Rest des Fensters.

## Wertung

- Je Aufgabe höchstens 10 Punkte. Falsch oder Zeit abgelaufen gibt 0. Richtig gibt einen Grundanteil plus einen Zeitbonus, der linear mit der Restzeit wächst. Vorgabe: 6 Punkte Grund, bis zu 4 Punkte Bonus. Die endgültige Aufteilung legt Willi beim Bau in der Funktion `punkteFuerAntwort` fest; der Grundanteil bleibt dabei mindestens die Hälfte, damit eine langsame richtige Antwort immer vor jeder falschen liegt.
- Kennzahl des Laufs: der Punkteschnitt je gestellter Aufgabe, hochgerechnet auf 0 bis 100. Gerechnet wird Punktesumme geteilt durch (gestellte Aufgaben mal 10), das Ganze mal 100 und gerundet. So bleiben Läufe verschiedener Testdauern untereinander vergleichbar; belohnt wird Richtigkeit und Tempo je Aufgabe, nicht die bloße Menge.
- `js/missionen.js`: Mission 5 erhält `kennzahlName: "Punkte"` und `maximal: 100`. `wertung` bleibt auf `false` (Probebetrieb), bis Willi die Übung als fertig einstuft.
- Gespeicherte Laufdaten (`daten`): `art: "flugphysik"`, `dauerMin`, `gestellt`, `richtig`, `quote` (Prozent), `punkte`. Einzelne Aufgaben werden nicht gespeichert.
- Die Ergebnistafel führt mit den Punkten, darunter Richtige von Gestellt und die Trefferquote; die Fußzeile nennt Testdauer, Antwortzeit je Aufgabe und die Zahl der gestellten Aufgaben.

## Wissensbereich als Karteikartenstapel

Fassung nach Willis Sichtung vom 23.08.2026; die erste Fassung (Schild WISSEN öffnet eine Schicht vor der Seite, sechs Karten mit getrennten Beispielkarten) ist verworfen.

- Der Kartenstapel steht fest auf der Seite von Mission 5, unterhalb von Missionsbeschreibung und Auswertung. Kein Knopf, keine Schicht, kein Schließen.
- Gestaltung wie echte Karteikarten, passend zur Papieroptik des Prüfungskalenders: helles Papier mit Linienraster und roter Kopflinie, die oberste Karte leicht gedreht, der Stapel dahinter angedeutet, Inhalt in Handschrift-Anmutung.
- Geblättert wird vor und zurück per Knopf oder Klick auf die Karte, mit Zähler (etwa 3/4) und kurzer Blätterbewegung beim Wechsel. Keine globalen Tastenkürzel, damit die Karten der übrigen Seite nichts wegfangen.
- Jede Karte erklärt ihre Größe vollständig selbst: die Formel, ein Merksatz in Worten und eine durchgerechnete Beispielrechnung in Schritten direkt auf der Karte. Vier Karten:
  1. Geschwindigkeit (v = Weg / Zeit mal 60, Beispiel 360 NM in 90 min)
  2. Weg (s = Geschwindigkeit mal Zeit / 60, Beispiel 240 kt für 45 min)
  3. Zeit, die 60er-Regel (t = Weg / Geschwindigkeit mal 60, Beispiel 100 kt und 500 NM)
  4. Sink- und Steigrate (Rate = Höhenänderung / Zeit in Minuten, Beispiel 6000 ft in 3 min)
- Karteninhalte und Reihenfolge liegen in `js/wissen5.js` (`{ titel, zeilen, beispiel }` je Karte); weitere Karten lassen sich dort ergänzen, ohne den Aufbau anzufassen.
- Einhängung: `mission.html` erhält unter dem Missionsraster einen Behälter, `mission.js` ruft wahlweise `zeichneUnten(feld)` der Übung auf; Übungen ohne Unterbereich lassen ihn leer.

## Bausteine

Nach dem Baumuster von Mission 4:

- `js/uebung5.js`: reine Logik ohne DOM. Aufgabenerzeugung, Ablenkerrechnung, Zahlenprüfung der Eingabe, Punktrechnung (`punkteFuerAntwort`), Kennzahl-Hochrechnung. Tests unter `tests/`.
- `js/uebung5-lauf.js`: Ablauf im Vollbild, beide Erscheinungsformen, Auflösung, Ergebnistafel, Abbruchwege.
- `js/wissen5.js`: Kartensatz des Wissensbereichs.
- `js/mission.js`: Der fest verdrahtete `uebung4`-Sonderfall wird durch eine Zuordnung Bereichsnummer zu Übungsfabrik ersetzt. Der Hinweistext je Übung kommt aus der Übung selbst; Übungen ohne Einstellungen lassen das Einstellungsfeld leer. Der dritte Bereich braucht damit später keinen Umbau mehr.
- `stil.css`: Klassen für Zahleneingabe, Karteikarten und den festen Wissensbereich.
- `mission.html`: Versionsmarke des Einstiegsskripts hochzählen.

## Fehlerverhalten

- Abgebrochene Läufe werden nie gespeichert und tauchen nicht in der Statistik auf.
- Ein Speicherfehler nach vollendetem Lauf meldet sich wie in Mission 4 mit einem Hinweis, der Lauf geht dann verloren.
- Im Probebetrieb (`wertung: false`) wird grundsätzlich nicht gespeichert.

## Prüfung

- Logiktests mit `node --test tests/*.test.js`: Erzeuger liefert nur ganzzahlige, in sich stimmige Werte (mit eingespeistem Zufall über viele Ziehungen), Ablenker sind eindeutig und nie gleich dem Ergebnis, Zahlenprüfung mit Komma, Punkt und Leerzeichen, Punktrechnung an den Grenzen (volle Restzeit, Restzeit 0, falsch), Kennzahl-Hochrechnung, Kartensatz vollständig.
- Sichtprüfung der Missionsseite, des Laufs und des Kartenstapels headless in Chrome.

## Nicht Teil dieses Entwurfs

- Schwierigkeitsstufen für Mission 5 über die wählbare Testdauer hinaus.
- Eine Wiederholsperre für Aufgaben über Läufe hinweg.
- Weitere Aufgabentypen (etwa Verbrauch oder Einheitenumrechnung) und weitere Karteikartensätze; beides ist später über `uebung5.js` und `wissen5.js` ergänzbar.
