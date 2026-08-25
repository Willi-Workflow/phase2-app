# Mission 3: 60s Instrumentenflug, Bauplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Ziel:** ICT-Nachbau nach Dissertation 3.3.3: 60-Sekunden-Durchgänge, in denen Kurs, Höhe und Geschwindigkeit gleichmäßig auf Zielwerte geführt werden; Stufen 1 bis 4, Fehlersäule, in Stufe 4 angesagte Rechenaufgaben mit Pedalwahl.

**Architektur:** Logik `js/uebung3.js`, Zeichenfunktionen `js/uebung3-bild.js`, Ablauf `js/uebung3-lauf.js` auf der Cockpitbühne; Zahlenklänge unter `klaenge/zahlen/`; Einhängen über `UEBUNGEN` in `js/mission.js`.

**Entwurf:** `docs/superpowers/specs/2026-08-25-mission3-instrumentenflug-design.md` (bindend, enthält alle Zahlwerte).

## Global Constraints

- Deutsch für Oberfläche, Bezeichner, Kommentare, Commits; keine Gedankenstriche, keine Emojis.
- Versionsmarken nach jeder Änderung hochzählen.
- Reine Logik ohne DOM in `js/uebung3.js` und `js/uebung3-bild.js`, Tests mit `node --test tests/*.test.js`, Bestand bleibt grün.
- Instrumente Kurs, Fahrt, Höhe kommen aus `js/instrumente.js` (`svgKurs`, `svgFahrt`, `svgHoehe`); three.js wird nicht angefasst.

---

### Task 1: Logik des Instrumentenflugs

**Files:** Create `js/uebung3.js`, `tests/uebung3.test.js`.

**Produces (exakte Schnittstellen für die Folgetasks):**
- `TESTDAUERN = [3, 5, 10]`, `STUFEN = [1, 2, 3, 4]`, `FLUGZEIT_S = 60`, `EINRICHTZEIT_S = 5`, `RECHENTAKT_S = 12`
- `erzeugeVorgaben(stufe, rnd)` -> `{ aktive: string[], kurs: { start, aenderung, ziel }, hoehe: { start, aenderung, ziel }, fahrt: { start, ziel } }` (Raster und Grenzen laut Entwurf; `aktive` je Stufe 1/2 zufällige Teilmenge von ["kurs","hoehe","fahrt"], ab Stufe 3 alle; Vorgaben werden immer für alle drei erzeugt)
- `erzeugeFlugzustand(vorgaben)` -> `{ kurs, hoehe, fahrt }` (Kurs und Höhe auf Start, Fahrt auf 60)
- `takt(zustand, achsen, dtMs)` mit `achsen = { stickX, stickY, schub }` (je -1 bis 1): Kursrate stickX mal 9 Grad je Sekunde (Umlauf 0 bis 360), Höhenrate stickY mal 100 ft je Sekunde (Ziehen steigt, Deckel 0 bis 9900), Sollfahrt = 60 + ((schub + 1) / 2) mal 260, Nadel nähert sich mit Zeitkonstante 1,5 s (`fahrt += (soll - fahrt) * (1 - Math.exp(-dt / 1.5))`)
- `sollwert(vorgaben, id, tS)` (linear; Fahrt konstant Start bis Sekunde 5, dann linear bis 60)
- `winkelabstand(a, b)` (kleinster Abstand, 0 bis 180)
- `momentanfehler(zustand, vorgaben, tS)` -> 0 bis 1: Mittel über die aktiven Instrumente, Normierung Kurs /45, Höhe /600, Fahrt /40, je bei 1 gedeckelt; Fahrt zählt erst ab `EINRICHTZEIT_S`
- `durchgangspunkte(fehlerSumme, messungen)` -> `Math.round(100 * (1 - Mittel))`
- `kennzahl3(punkteListe)` -> gerundetes Mittel, leere Liste 0
- `erzeugeRechenaufgabe(rnd)` -> `{ a, op: "+"|"-"|"*", b, antwort }` (plus: Ergebnis höchstens 99; minus: Ergebnis mindestens 0; mal: Faktoren 2 bis 12)
- `antworten5(aufgabe, rnd)` -> fünf gemischte Werte (Antwort plus vier eindeutige positive Ablenker in der Nähe)
- `pedalwahl(ruder)` -> 0 bis 4 über fünf gleich breite Zonen von -1 bis 1

- [ ] Tests decken laut Entwurf: Rasterbindung und Erreichbarkeit der Vorgaben, `aktive` je Stufe, Sollkurven-Randwerte (t=0, t=60, Fahrt bei t<5 und t=5), Taktraten samt Deckeln und Nadel-Zeitkonstante, Winkelabstand über 0 hinweg (350 zu 10 ist 20), Momentanfehler (ein konstruierter Fall je Instrument, Fahrt vor Sekunde 5 unberücksichtigt), Punktrechnung, Rechenaufgabenformen und Ablenker-Eindeutigkeit, Pedalzonen (Grenzwerte -1, -0.61, -0.59, 0, 0.59, 0.61, 1), Determinismus.
- [ ] `node --test` grün, Commit.

### Task 2: Zeichenfunktionen Uhr und Fehlersäule

**Files:** Create `js/uebung3-bild.js`, Test-Ergänzung in `tests/uebung3.test.js`.

**Produces:** `svgUhr(restS)` (schwarzes Rundinstrument im Stil von Abbildung 3-9: Ziffern 1 bis 12, roter Zeiger, eine volle Umdrehung je 60 s, Aufschrift Zeit), `svgSaeule(prozent)` (senkrechte Säule 0 bis 100 mit schwarzem Punkt, Aufschrift Fehlersäule), beide als reine SVG-Zeichenketten im Gehäusestil von `js/instrumente.js`.

- [ ] Zeigerwinkel: `(1 - restS / 60) * 360` Grad ab 12-Uhr-Stellung; Punktlage der Säule linear, bei 0 unten, bei 100 oben, außerhalb gedeckelt. Beides mit je einem Test (Winkel bei 60, 30, 0; Punktlage bei -5, 50, 120).
- [ ] `node --test` grün, Commit.

### Task 3: Zahlenklänge übernehmen

**Files:** Create `klaenge/zahlen/` (n0.mp3 bis n99.mp3, op_plus.mp3, op_minus.mp3, op_mal.mp3), `klaenge/zahlen/HERKUNFT.md`.

- [ ] Dateien aus `~/Desktop/Claude/Bundeswehr/App/stimme/` kopieren (unverändert). HERKUNFT.md: übernommen aus der Bundeswehr-Lern-App, dort mit ElevenLabs erzeugt (Schlüssel aus dem macOS-Schlüsselbund, Randstille beschnitten); verwendet für die angesagten Rechenaufgaben der Stufe 4.
- [ ] Stichprobe: drei Dateien mit `afinfo` prüfbar (Dauer > 0), Commit.

### Task 4: Ablauf auf der Cockpitbühne

**Files:** Create `js/uebung3-lauf.js`; Modify `js/mission.js` (UEBUNGEN-Eintrag 3, Marke), `js/missionen.js` (Mission 3 `maximal: 100`), `stil.css` (ICT-Tafel, Schilder, Säule, Antwortleiste, Marken), `mission.html` (Marke).

**Consumes:** alles aus Task 1 und 2, `svgKurs`/`svgFahrt`/`svgHoehe` aus `js/instrumente.js`, Cockpitbühne wie `js/uebung4-lauf.js`, Achsen wie `js/uebung2-lauf.js` (`controls`), Schusstaste wie `js/uebung1-lauf.js`.

- [ ] Einstellungsfeld: STUFE (1 bis 4), TESTDAUER (3/5/10 min, Vorgabe 5), FEHLERSÄULE (EIN/AUS, Vorgabe EIN); Speicherschlüssel `uebung3-einstellung`; Hinweistext (Aufgabe, Steuerung, Stufe 4 mit Pedalen und Schusstaste).
- [ ] Bühne: Cockpit wie Mission 4, im Panel die ICT-Tafel: oben Uhr (mit Zielschild "60 Sekunden") und Kurs (Schild etwa "-270 Grad"), unten Fahrt (Schild "140 bis 100 Knoten") und Höhe (Schild "+2000 Fuß" oder "-2000 Fuß"), mittig die Fehlersäule (nur bei Schalter EIN sichtbar), unten fünf Antwortknöpfe (nur Stufe 4). Nicht aktive Instrumente ohne Zielschild.
- [ ] Durchgang: Uhr läuft 60 s; requestAnimationFrame-Takt liest `stickX`, `stickY`, `schub` (Muster uebung2-lauf), ruft `takt`, misst je Bild `momentanfehler` (Summe und Zähler), zeichnet Instrumente und Säule nach. Nach Ablauf kurze Zwischenanzeige der Durchgangspunkte, dann nächster Durchgang bis zur Testdauer; Ergebnistafel mit Punkten (Kennzahl), mittlerer Abweichung je Instrument, in Stufe 4 Rechenzählwerten. Abbruchpfade (Esc, Vollbild, Tabwechsel) wie Mission 4.
- [ ] Stufe 4: alle `RECHENTAKT_S` eine `erzeugeRechenaufgabe`; Ansage als Klangfolge n{a}, op, n{b} (Audio nacheinander über ended-Ereignis, Vorladen beim Start, Ersatz Browser-Sprachausgabe); fünf Knöpfe aus `antworten5`, `pedalwahl(ruder)` hebt den gewählten hervor, Schusstaste bestätigt (richtig/falsch), ohne Bestätigung verpasst.
- [ ] Marken hochzählen, `node --test` grün, Commit.

### Task 5: Sichtprüfung

**Files:** Create `entwurf/uebung3-probe.html`.

- [ ] Probeseite mit gestellten Achsen (Sinusfahrt auf stickX/stickY/schub, Stufe 4 mit Zufallspedal), rAF-Ersatz für headless (Muster entwurf/uebung1-probe.html), Protokoll der Durchgangspunkte auf der Seite.
- [ ] Headless-Bildschirmabzüge (Tafel sichtbar, Säule sichtbar, Antwortleiste in Stufe 4), Befund im Fortschrittsbuch, Commit.
