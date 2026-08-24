# Mission 2 (Multitasking Controls): Entwurf

Stand 24.08.2026, mit Willi abgestimmt. Nachbau des Senso-Motorischen Tests (SMT) aus dem Testsystem ICA 90 II der fliegerischen Eignungsfeststellung, nach Punkt 3.3.2 samt Abbildung 3-8 der Dissertation (`~/Desktop/Claude/Phase II/Phase II Doc.pdf`, Seiten 47 bis 48) und den Bildschirmaufnahmen aus der Focus-TV-Reportage (Video 5SY9CYhNAa4, Abschnitt 2:47 bis 4:45). Maßgabe von Willi: Das Programm soll genau so aussehen wie im Video und auf der Abbildung.

## Referenzbilder

Unter `entwurf/bilder/`:
- `smt-referenz-vollbild.jpg`: frontales Vollbild des Programms (Video 2:59)
- `smt-referenz-nah.jpg`: Nahaufnahme Zielkreis und Fadenkreuz (2:52)
- `smt-referenz-treffer.jpg`: Fadenkreuz in Deckung mit dem Zielkreis (3:26)
- `smt-referenz-anzeige.jpg`: Monitor mit Geschwindigkeitsanzeige unten links (4:40)

## Bühne und Optik

- Schwarzer Vollbildgrund, kein Cockpit, keine Zierde: Der Lauf sieht aus wie das Original auf dem Prüfgerät.
- Ein großer rechteckiger Rahmen aus dünnen, weißen Linien mit leicht bläulichem Röhrenschimmer, mittig auf der Fläche, Breite etwa 80 Prozent, Höhe etwa 68 Prozent des Fensters, damit die Geschwindigkeitsanzeige wie in Abbildung 3-8 frei unter dem Rahmen liegt.
- Ein Linienkreuz teilt den Rahmen in vier Felder: eine waagerechte Linie über die volle Breite auf halber Höhe, eine senkrechte Linie über die volle Höhe in der Mitte.
- Im Schnittpunkt der weiße Zielkreis, nur Umriss, Durchmesser etwa 4 Prozent der Rahmenbreite.
- Das rote Fadenkreuz (Kreisumriss mit über den Kreis hinausstehendem Kreuz, sattes Rot): vom Stick gesteuert, frei im Rahmen beweglich.
- Der rote Senkrechtstrich (kurzer, dicker Balken) auf fester Höhe im oberen Rahmenviertel, nur waagerecht beweglich: von den Ruderpedalen gesteuert. Ziel ist die weiße senkrechte Linie.
- Unten links, außerhalb des Rahmens, die Geschwindigkeitsanzeige nach Abbildung 3-8 und Video: rundes Zifferblatt auf schwarzem Grund, Aufschrift AIRSPEED und KNOTS, Skala 40 bis 160 mit Zahlen in Vierzigerschritten und Strichen dazwischen, türkiser Skalenbogen entlang der Marken, weiße Nadel. Der Sollwert wird als roter Zielkeil außen am Skalenring markiert und steht zusätzlich als Zahl unter der Anzeige (etwa "SOLL 75 kt").
- Kopfzeile oben mittig in gedeckter, kleiner Schrift: gewählte Kombination und Test-Restzeit (etwa "STICK + RUDER · REST 4:32").
- Keine weiteren Bildelemente. Rückmeldung bei einem Treffer: Das getroffene Zielelement (Zielkreis, senkrechte Linie beziehungsweise Skalenbogen) blitzt kurz hell auf, dann wird neu gesetzt.

## Steuerung und Bewegung

- Rollen aus der bestehenden Controls-Anlage (`js/controls.js`): Stick quer und Stick längs bewegen das Fadenkreuz, das Seitenruder bewegt den Strich, der Schubregler die Nadel. Die Tastatur-Ersatzsteuerung der Controls-Anlage gilt unverändert.
- Steuerlogik als Rate: Die Auslenkung der Achse bestimmt die Geschwindigkeit des Elements (Stick und Ruder um die Ruhelage, Schub um die Mittelstellung). So verlangt das Halten echte Arbeit.
- Drift (Willis Festlegung): Jedes aktive Element wandert zusätzlich langsam mit einer sich träge ändernden Zufallsdrift. Die Drift ist so bemessen, dass ein losgelassenes Element binnen weniger Sekunden aus der Deckung läuft.
- Elemente bleiben in ihren Grenzen: Fadenkreuz im Rahmen, Strich zwischen den Rahmenkanten, Nadel zwischen 40 und 160 Knoten.

## Treffer-Logik

- Deckung: Fadenkreuzmitte innerhalb des Zielkreises; Strichmitte höchstens 1 Prozent der Rahmenbreite von der senkrechten Linie entfernt; Nadel innerhalb von 2 Knoten um den Sollwert.
- Ein Treffer entsteht, wenn die Deckung eine volle Sekunde ohne Unterbrechung gehalten wird. Danach setzt das System das jeweilige Element neu: das Fadenkreuz auf eine zufällige Position im Rahmen, der Strich auf eine zufällige Waagerechtposition, der Sollwert auf einen neuen Wert (45 bis 155 in Fünferschritten, nie der alte Wert). Das Zielbild selbst (Kreis, Linie) bleibt fest.
- Kombitreffer: Erzielt ein Element einen Treffer, während alle übrigen aktiven Elemente in diesem Moment ebenfalls in Deckung stehen, zählt zusätzlich ein Kombitreffer.

## Laufaufbau (Willis Festlegung vom 24.08.2026: freie Auswahl der Steuerelemente)

- Auf der Missionsseite sind die drei Steuerelemente einzeln anwählbar (Stick, Ruder, Schub), jede Kombination ist erlaubt, auch ein einzelnes Element. Die Auswahl gilt unverändert für den gesamten Lauf, es gibt keinen Wechsel zwischendurch.
- Ist kein Element angewählt, bleibt der Startknopf gesperrt mit Hinweis.
- Testdauer einstellbar: 5, 10 oder 30 Minuten (Vorgabe 5). Auswahl und Testdauer werden je Profil als `uebung2-einstellung` gespeichert (Vorgabe: alle drei angewählt).
- Im Lauf sind nur die gewählten Elemente sichtbar und wertbar; die übrigen (samt zugehörigem Zielbild beziehungsweise Anzeige) sind ausgeblendet. Die Kopfzeile zeigt die gewählte Kombination.
- Vollbild mit Hangartür-Übergang, Abbruch über Esc, Vollbildverlassen oder Tabwechsel führt zur Ergebnistafel ohne Wertung, gleiche Semantik wie Mission 4 und 5. Mit Ablauf der Testdauer endet der Lauf sofort, offene Haltezeiten verfallen.

## Wertung (Willis Festlegung: Treffer je Minute)

- Punkte des Laufs: (Summe aller Einzeltreffer plus 2 mal Summe der Kombitreffer) geteilt durch die Testdauer in Minuten, gerundet. So bleiben Läufe verschiedener Dauern vergleichbar. Bei nur einem gewählten Element gibt es naturgemäß keine Kombitreffer; die gewählte Kombination steht in den Laufdaten, damit Vergleiche einzuordnen sind.
- `js/missionen.js`: Mission 2 behält `kennzahlName: "Punkte"`, ohne `maximal` (die Diagrammskala richtet sich nach den Läufen). `wertung` bleibt auf `false` (Probebetrieb), bis Willi die Übung als fertig einstuft.
- Gespeicherte Laufdaten (`daten`): `art: "multitasking"`, `dauerMin`, `auswahl` (Feld der gewählten Elemente), `trefferStick`, `trefferRuder`, `trefferSchub`, `kombitreffer`, `punkte`.
- Die Ergebnistafel führt mit den Punkten, darunter die Aufschlüsselung (Treffer je gewähltem Steuerelement und Kombitreffer); die Fußzeile nennt Testdauer und gewählte Kombination.

## Bausteine

Nach dem Baumuster der Missionen 4 und 5:

- `js/uebung2.js`: reine Logik ohne DOM. Raten- und Driftrechnung je Takt (Zeitschritt einspeisbar), Grenzen, Deckungsprüfung, Haltezeit- und Trefferverwaltung, Neusetzung (Zufall einspeisbar), Kombitreffer, Kennzahl. Tests unter `tests/`.
- `js/uebung2-lauf.js`: Vollbild-Ablauf mit requestAnimationFrame, SVG-Zeichnung von Rahmen, Kreuz, Zielkreis, Fadenkreuz, Strich und Geschwindigkeitsanzeige, Achsenabfrage über die Controls-Anlage, Einstellung (Steuerelement-Auswahl und Testdauer) und Hinweistext, Ergebnistafel, Abbruchwege.
- `js/mission.js`: Eintrag `2: erzeugeUebung2` in der Zuordnung `UEBUNGEN`.
- `stil.css`: Klassen für die SMT-Bühne (schwarzer Grund, Linienfarben, Kopfzeile).
- `mission.html`: Versionsmarke des Einstiegsskripts hochzählen.

## Fehlerverhalten

- Abgebrochene Läufe werden nie gespeichert; im Probebetrieb wird grundsätzlich nicht gespeichert; Speicherfehler melden sich wie bei den übrigen Missionen.
- Ohne erkanntes Gerät läuft die Tastatur-Ersatzsteuerung; die Rollenanzeige der Missionsseite zeigt den Stand wie gehabt.

## Prüfung

- Logiktests mit `node --test tests/*.test.js`: Raten- und Driftintegration (deterministisch mit eingespeistem Zufall und festem Zeitschritt), Grenzen, Deckungstoleranzen, Haltezeit über Taktgrenzen, Neusetzung (nie alter Sollwert), Kombitreffer-Bedingung (nur gewählte Elemente zählen), Kennzahlrechnung, Auswahlregeln (mindestens ein Element).
- Sichtprüfung headless in Chrome gegen die Referenzbilder; ein Probegeschirr `entwurf/uebung2-probe.html` nach dem Muster der Missionen 4 und 5, mit einspeisbaren Achsenwerten für die headless Prüfung.
- Die Geräteprüfung mit dem echten Thrustmaster bleibt als bekannter offener Punkt bestehen und ist nicht Teil dieses Entwurfs.

## Nicht Teil dieses Entwurfs

- Die Zusatzaufgaben und Messkategorien-Normierung des Originals (Prozentränge, Noten).
- Schwierigkeitsstufen über die wählbare Testdauer hinaus; Empfindlichkeits-Feinjustierung der Achsen über die bestehende Controls-Anlage hinaus.
- Ein Wissensbereich für Mission 2.
