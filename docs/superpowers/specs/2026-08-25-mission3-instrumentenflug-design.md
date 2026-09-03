# Mission 3: 60s Instrumentenflug (ICT-Nachbau)

Stand 25.08.2026, mit Willi abgestimmt. Nachbau des
Instrument-Coordination-Tests aus dem ICA 90 II nach Dissertation 3.3.3
samt Abbildung 3-9 (Seiten 49 bis 51). Die Instrumente sollen aussehen wie
im Bild (klassische schwarze Rundinstrumente), die Umgebung ist das
Cockpit der App.

## Aufgabe

Je Durchgang läuft eine Flugzeit von 60 Sekunden. Kurs, Höhe und
Geschwindigkeit sollen gleichmäßig so geführt werden, dass die
vorgegebenen Zielwerte genau mit Ablauf der Flugzeit erreicht sind.
Bewertet wird die Abweichung von der gleichmäßigen Sollkurve (linear von
Start zu Ziel). Durchgänge folgen am Stück, bis die Testdauer um ist.

## Aufbau

- `js/uebung3.js`: reine Logik (Zielvorgaben, Sollkurven, Takt,
  Abweichungs- und Punktrechnung, Rechenaufgaben, Pedalwahl),
  deterministisch mit übergebenem Zufall, Tests unter
  `tests/uebung3.test.js`.
- `js/uebung3-bild.js`: reine Zeichenfunktionen für die neuen Anzeigen
  (Uhr mit rotem Zeiger im Stil von Abbildung 3-9, Fehlersäule) und den
  Tafelaufbau; Kurs, Fahrt und Höhe kommen als `svgKurs`, `svgFahrt`,
  `svgHoehe` aus `js/instrumente.js` (klassische schwarze Instrumente wie
  im Bild).
- `js/uebung3-lauf.js`: Vollbild-Ablauf auf der Cockpitbühne wie Mission
  4/5; die `panelflaeche` trägt statt der fünf Merk-Instrumente die
  ICT-Tafel: Uhr, Kurs, Fahrt, Höhe mit je einem Zielschild darüber, die
  Fehlersäule mittig, unten fünf Antwortknöpfe (nur in Stufe 4 sichtbar).
- Einhängen über `UEBUNGEN` in `js/mission.js` (Eintrag `3`);
  `js/missionen.js` bekommt für Mission 3 `maximal: 100`.

## Zielvorgaben je Durchgang

- **Kurs:** Startkurs aus 0 bis 355 (Fünferschritt). Die Änderung ist
  immer die volle Drehung, ±360 Grad (Willis Festlegung vom 25.08.2026),
  nur die Richtung wird gewürfelt; das Schild zeigt sie mit Vorzeichen wie
  im Original, minus dreht links. Das Ziel ist damit wieder der Startkurs,
  gefordert sind 6 Grad je Sekunde bei höchstens 9 vom Stick. Kurs startet
  systemseitig auf dem Startkurs.
- **Höhe:** Start 2000 bis 8000 ft (500er-Schritt), Änderung ±500 bis
  ±3000 ft (500er-Schritt), Ziel bleibt zwischen 500 und 9900 ft. Das
  Schild zeigt den Betrag und die Richtung ergibt sich wie im Original aus
  dem Höhenmesser-Schild ("2000 Fuß" mit Pfeilrichtung ab beziehungsweise
  auf); die App schreibt eindeutig "+2000 Fuß" oder "-2000 Fuß". Höhe
  startet systemseitig auf dem Startwert.
- **Geschwindigkeit:** Start und Ziel aus 60 bis 320 kt (Zehnerschritt),
  Unterschied mindestens 40 kt. Das Schild zeigt "140 bis 100 Knoten". Die
  Nadel muss der Bewerber selbst mit dem Schub auf den Startwert bringen:
  die ersten 5 Sekunden sind Einrichtzeit, die Fahrt zählt erst danach zur
  Wertung, ihre Sollkurve läuft von Sekunde 5 (Startwert) bis 60
  (Zielwert). Kurs und Höhe werten ab Sekunde 0.

## Steuerung

- Stick quer: Kursrate bis ±9 Grad je Sekunde.
- Stick längs: Höhenrate bis ±100 ft je Sekunde, Ziehen steigt.
- Schubregler: stellt die Sollfahrt linear (Regler unten 60 kt, oben 320
  kt), die Nadel folgt mit einer Zeitkonstante von 1,5 s.
- Totzone und Expo kommen wie überall aus dem Controls-Dialog.
- Pedale und Schusstaste werden nur für die Rechenaufgaben in Stufe 4
  benutzt.

## Fehlersäule und Wertung

- Momentanfehler = Mittel der normierten Abweichungen der aktiven
  Instrumente; Normierung: Kurs Winkelabstand/45 Grad, Höhe /600 ft,
  Fahrt /40 kt, jeweils bei 1 gedeckelt. Die Fehlersäule zeigt ihn als 0
  bis 100 Prozent (Punkt auf der Säule wie im Original), Schalter
  FEHLERSÄULE EIN/AUS (Vorgabe EIN); ausgeschaltet wird trotzdem gewertet.
- Punkte je Durchgang: 100 mal (1 minus mittlerer Momentanfehler über die
  Wertungszeit), gerundet. Kennzahl des Laufs: Mittel der Durchgänge.
  Probebetrieb (`wertung: false`), bis Willi die Übung freigibt.

## Stufen und Einstellungen

- STUFE wählbar vor dem Start: 1 (ein zufälliges der drei Instrumente),
  2 (zwei zufällige), 3 (alle drei), 4 (alle drei plus Rechenaufgaben).
  Nicht aktive Instrumente zeigen ihren Startwert und werten nicht.
- TESTDAUER 3, 5 oder 10 Minuten (Vorgabe 5); Durchgänge am Stück mit
  kurzer Zwischenanzeige der Durchgangspunkte.
- FEHLERSÄULE EIN/AUS.

## Rechenaufgaben (Stufe 4)

- Die Aufgaben laufen seit dem 03.09.2026 durchgehend nacheinander
  (Willis Entscheid, ersetzt das feste 12-Sekunden-Raster): erste Aufgabe
  bei Sekunde 6 des Durchgangs, Antwortfenster 10 s ab Ansagebeginn, nach
  Antwort oder Fensterablauf folgt nach 1,2 s die nächste, bis der
  Durchgang endet; unter 8 s Restzeit startet keine neue Aufgabe mehr,
  eine am Durchgangsende offene zählt als verpasst. Nur angesagt, nicht angezeigt (wie im Original über Gehör),
  mit 350 ms Sprechpause zwischen Zahl, Zeichen und Zahl: nur noch a+b
  (Ergebnis höchstens 99) und a-b (Ergebnis mindestens 0); das
  Einmaleins ist seit dem 29.08.2026 raus (Willis Entscheid).
- Anpassende Schwierigkeit seit dem 03.09.2026 (Willis Entscheid, ohne
  Vorbild im Original, dort ist keine Schwierigkeitsregel beschrieben):
  eine Stufenleiter deckelt die Operanden (5/9/15/20/30/40/55/70/85/99).
  Treppenregel: drei Richtige in Folge heben die Stufe um eins, jede
  falsche oder verpasste Aufgabe senkt sie sofort um eins und bricht die
  Serie. Jeder Lauf und jede Übung beginnt auf der leichtesten Stufe,
  gespeichert wird der Stand nicht.
- Ansage aus vorproduzierten ElevenLabs-Klängen: Zahl, Rechenzeichen,
  Zahl. Die Dateien kommen als Kopie aus der Bundeswehr-Lern-App
  (`~/Desktop/Claude/Bundeswehr/App/stimme`, n0 bis n99 plus op_plus,
  op_minus, op_mal) nach `klaenge/zahlen/` mit eigener HERKUNFT.md;
  Ersatz ist die Browser-Sprachausgabe.
- Fünf Antwortknöpfe am unteren Rand (richtiger Wert plus vier eindeutige
  Ablenker in der Nähe). Die Pedale wählen über fünf gleich breite Zonen
  des Ausschlags den Knopf (der gewählte hebt sich hervor), die
  Schusstaste bestätigt. Ohne Bestätigung bis zur nächsten Aufgabe zählt
  die Aufgabe als verpasst. In der Kopfrechen-Übung wählen ohne
  verbundene Pedale die Pfeiltasten links/rechts die Zone, bestätigt
  wird über die Leertaste als Schusstasten-Ersatz (Willis Auftrag vom
  03.09.2026); der Flug bleibt bei der reinen Pedalwahl.
- Zählwerte (richtig, falsch, verpasst) erscheinen in der Ergebnistafel;
  seit dem 31.08.2026 fließt das Kopfrechnen in Stufe 4 mit 20 Prozent in
  die Kennzahl ein (verpasste zählen als falsch).

## Sichtprüfung und Tests

- `entwurf/uebung3-probe.html` mit gestellten Achsen für den
  headless-Durchlauf; Optik wird örtlich gezeigt, Willi nimmt ab.
- Tests ohne DOM: Zielvorgaben in den Rastern und erreichbar, Sollkurven
  (Randwerte, Fahrt ab Sekunde 5), Taktrechnung (Raten, Deckel,
  Nadel-Zeitkonstante), Winkelabstand über 0 Grad hinweg, Momentanfehler
  und Punktrechnung, Rechenaufgabenformen samt Ablenkern, Pedalzonenwahl,
  gleicher Zufall ergibt gleiche Vorgaben.
