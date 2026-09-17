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
- Die Ergebnistafel führt mit der Trefferquote in Prozent (Willis Festlegung vom 24.08.2026: alle Missionen zeigen auf der Tafel Prozent statt Punkte), darunter Richtige von Gestellt; die Fußzeile nennt Testdauer, Antwortzeit je Aufgabe und die Zahl der gestellten Aufgaben. Die gespeicherte Kennzahl bleibt der Punkteschnitt.

## Schnellrechnen-Übung (seit 07.09.2026, Willis Auftrag)

- Abgesetzter Block SCHNELLRECHNEN mit Knopf NUR ÜBEN in den
  Missionseinstellungen (Muster Blitzübung Mission 4), Start über den
  normalen Startweg. Textaufgaben ohne Zeitdruck, endlos bis Esc, zählt
  nie zur Statistik.
- Nach jeder Antwort steht der schnellste im Kopf rechenbare Weg mit den
  konkreten Zahlen der Aufgabe im Bild (loesungsweg in uebung5.js): je
  nach Zahlenlage über NM je Minute (v/60 glatt), den Stundenbruch
  (griffige Minutenzahlen wie 15, 45, 120) oder die nackte Formel; bei
  den Raten der Nullen-Trick. Darunter der Merktipp des Aufgabentyps
  (TIPPS5). Weiter mit Enter.
- Dafür trägt jede Aufgabe seit dem 07.09.2026 ihre Rohwerte (werte:
  v/t/s beziehungsweise r/t/h) mit sich.

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

## Änderungen vom 17.09.2026 (Willis Aufträge)

**Zwei Übungen, nach Rechenweg getrennt.** Beide bleiben reine Übungen
und zählen nie als Lauf.

- SCHNELLRECHNEN (seit 07.09.2026) zieht jetzt nur noch Aufgaben, deren
  Zeit ein glatter Bruchteil einer Stunde ist. Dort trägt die Formel in
  einem Schritt ("30 min ist eine halbe Stunde, also Weg mal 2").
- DREISATZ ist neu. Sie zieht genau die Gegenstücke: Das Herunterrechnen
  auf eine Minute geht glatt auf, die Zeit ist aber kein Stundenbruch,
  dort ist die Formel umständlich. Die Übung fragt die zwei Schritte des
  Dreisatzes einzeln ab statt nur das Ergebnis, denn genau dieses
  Zerlegen soll geübt werden. Schritt 2 bleibt verborgen, bis Schritt 1
  beantwortet ist, und nennt dann den richtigen Zwischenwert im
  Fragetext, damit sich ein Fehler nicht weiterschleppt. Die
  Ergebnistafel zählt beide Schritte getrennt. Raten kommen dort nicht
  vor, dort wäre Schritt 1 schon die Antwort.
- Im gewerteten Test bleibt der Bestand gemischt.

**Schwierigkeitsstufen** (LEICHT, MITTEL, SCHWER) an drei Stellen
einstellbar, je Profil gespeichert: im gewerteten Test und in jeder der
beiden Übungen. Gesteuert wird nicht die Größe der Zahlen, sondern wie
schwer der Zwischenwert ist (Willis Vorgabe: nicht zu groß oder zu krumm,
aber so, dass die Lösung nicht ohne Umrechnung dasteht). Leicht sind
Knoten mit ganzen NM je Minute (120 kt ergibt 2), schwer solche mit
halben (210 kt ergibt 3,5). Aufgaben, deren Antwort ohne Rechnung
ablesbar wäre, fallen überall heraus: 60 kt, 60 Minuten und Fälle, in
denen Knoten und Minuten dieselbe Zahl tragen.

Kennzahl und Punkteregel bleiben in dieser Runde unangetastet (Willis
Wahl "Stufe ja, Wertung später"). Leichte und schwere Läufe mischen sich
damit vorerst in derselben Statistik; die Stufe wandert dafür in die
Laufdaten, damit das später trennbar bleibt. Dazu kommt, dass der
Aufgabenbestand sich mit dieser Runde stark geändert hat, die bisherigen
Läufe stammen aus dem alten.

**Neue Aufgabenform im gewerteten Test: Zielhöhe.** Der Text nennt
Zielhöhe und Zeit ("Du sollst in 6 Minuten auf 3400 ft steigen"), die
Ausgangshöhe steht am Höhenmesser und ist abzulesen. Der Bewerber muss
erst die Differenz bilden, dann die Rate rechnen. Der Höhenmesser bleibt
dafür sichtbar, das Variometer bleibt verdeckt, sonst stünde die gesuchte
Rate am Zeiger. Bei der Auswahlform steht der naheliegende Fehlwert
(Zielhöhe geteilt durch die Zeit, also ohne Abzug der abgelesenen Höhe)
immer unter den Antworten, sonst verpufft die Falle. Die Form macht rund
8 Prozent der Aufgaben aus, also gut eine je Lauf.

**Deckel der Sink- und Steigraten** (Willis Vorgabe vom 17.09.2026): Als
Antwort kommt nie mehr als 2000 ft je Minute vor, weder im gewerteten
Test noch in den Übungen. Der Bestand vor dem Umbau desselben Tages ließ
bis 4000 zu ("Du musst 6200 ft in 2 Minuten steigen" ergab 3100), der
neue bleibt von sich aus bei 1300. RATE_MAX hält den Deckel fest, falls
die Stufen später wachsen; ein Test prüft ihn über alle Stufen und beide
Übungen. Nicht zu verwechseln mit VARIO_MAX: Das sagt, was das
Instrument anzeigen kann, RATE_MAX, was gefragt werden darf.

**Größere Aufgabenbestände** (Willis Rückmeldung vom 17.09.2026, "die
Aufgaben und Werte wiederholen sich zu oft in den Übungen, baue mehr
besonders für schwer"): Die Zahlenlisten je Stufe sind deutlich
verbreitert, am stärksten auf der schwersten. Formel-Paare je Stufe 20,
57 und 86 (vorher 12, 17 und 10), Dreisatz-Paare 60, 39 und 60 (vorher
20, 10 und 15), Ratenpaare 42, 31 und 64 (vorher 25, 21 und 18). Die
Zahl der verschiedenen Zwischenwerte im Dreisatz stieg auf Stufe 2 von
zwei auf drei und auf Stufe 3 von drei auf vier. Gemessen in einer
Übungssitzung von 30 Aufgaben sank die Zahl der Wiederholungen von 6 bis
11 auf 1,5 bis 3,2.

Der Charakter der Stufen bleibt: Beim Dreisatz entscheidet der
Zwischenwert (ganze NM je Minute unten, halbe oben), bei der Formel die
Sperrigkeit des Stundenbruchs. Neu ist, dass die breiteren Formel-Stufen
auch Knoten tragen, bei denen gar kein glatter Dreisatz existiert (140
kt sind 2,333 NM je Minute). Dort zeigt der Lösungsweg keine
Dreisatzzeilen, und das ist richtig so: Eine erzwungene Zeile mit krummer
Zwischenzahl wäre schlechter als keine. Der Test prüft darum nur noch,
dass der Dreisatz nie halb dasteht, und getrennt davon, dass er in der
Dreisatz-Übung immer vollständig erscheint.
