# Mission 5 Umbau: Cockpit und Instrumentenaufgaben, Bauplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Ziel:** Mission 5 spielt im Cockpit (Bühne wie Mission 4), Fragen im Cockpitfenster, rund ein Drittel der Aufgaben verlangt das Ablesen eines Instrumentenwerts.

**Architektur:** Logikerweiterung in `js/uebung5.js` (Aufgaben tragen optional `instrument`), Laufumbau in `js/uebung5-lauf.js` auf die Cockpitbühne mit `tafelHtml` aus `js/instrumente.js`, Stilregeln in `stil.css`.

**Entwurf:** `docs/superpowers/specs/2026-08-25-mission5-cockpit-design.md` (bindend).

## Global Constraints

- Deutsch für Oberfläche, Bezeichner, Kommentare, Commits; keine Gedankenstriche, keine Emojis.
- Nach jeder Änderung Versionsmarken hochzählen (mission.html: `js/mission.js?v=N`; stil.css-Marke in index/uebersicht/mission).
- Reine Logik ohne DOM in `js/uebung5.js`, Tests mit `node --test tests/*.test.js`, alle bestehenden Tests bleiben grün.
- Punkteregel, 20 s Aufgabenzeit, Formenmix, Testdauern, Kennzahl, Wissensbereich unverändert.

---

### Task 1: Logik der Instrumentenaufgaben

**Files:** Modify `js/uebung5.js`, `tests/uebung5.test.js`.

**Produces:** Aufgabenobjekte mit Feld `instrument: { id: "fahrt"|"hoehe"|"vario", wert: number } | null`; `erzeugeLauf(anzahl, rnd)` liefert rund `Math.round(anzahl / 3)` Instrumentenaufgaben.

- [ ] `erzeugeAufgabe(prinzip, rnd, mitInstrument = false)` erweitern. Ohne Instrument: Verhalten exakt wie heute, zusätzlich `instrument: null`. Mit Instrument:
  - `zeit`: nur Paare mit v aus {60, 80, 90, 100, 120, 150, 180, 200, 240, 300}; Frage `Du fliegst mit deiner aktuellen Geschwindigkeit (Fahrtmesser). Das Ziel liegt ${s} NM entfernt. Berechne die Flugzeit in Minuten.`; `instrument: { id: "fahrt", wert: v }`.
  - `weg`: gleiche v-Liste; Frage `Du fliegst ${t} Minuten mit deiner aktuellen Geschwindigkeit (Fahrtmesser). Berechne den zurückgelegten Weg in NM.`; `instrument: { id: "fahrt", wert: v }`.
  - `rate`, Münzwurf `rnd() < 0.5`:
    - Höhenmesser: nur Paare mit 1000 <= h <= 9900; Frage `Du musst deine aktuelle Höhe (Höhenmesser) in ${t} Minuten vollständig abbauen. Berechne die Sinkrate in ft/min.`; Antwort r, Einheit ft/min; `instrument: { id: "hoehe", wert: h }`.
    - Variometer: nur Paare mit r <= 2000; Frage `Du sinkst mit deinem aktuellen Sinken (Variometer). Berechne die Flugzeit für ${h} ft in Minuten.`; Antwort t, Einheit min; `instrument: { id: "vario", wert: -r }`.
  - `geschwindigkeit`: `mitInstrument` wird ignoriert, immer Textaufgabe.
- [ ] `erzeugeLauf(anzahl, rnd)`: wie bisher Prinzipienfolge und Formenmix; danach `Math.round(anzahl / 3)` Positionen zufällig (mische) unter denen wählen, deren Prinzip nicht `geschwindigkeit` ist, und diese mit `mitInstrument = true` erzeugen. Gibt es weniger geeignete Positionen, werden alle geeigneten genommen.
- [ ] Tests ergänzen: (1) `erzeugeLauf(12, rnd)` mit festem Zufall hat genau 4 Aufgaben mit `instrument`, keine davon Prinzip `geschwindigkeit`; (2) alle Fahrt-Werte in der erlaubten Liste, alle Vario-Werte zwischen -2000 und -200; (3) Fragetext einer Fahrt-Aufgabe enthält nicht `${wert} kt`, der einer Höhen-Aufgabe nicht `${wert} ft`; (4) gleicher Zufall ergibt gleichen Lauf; bestehende Tests unverändert grün.
- [ ] `node --test tests/*.test.js` grün, Commit.

### Task 2: Lauf auf die Cockpitbühne

**Files:** Modify `js/uebung5-lauf.js`, `stil.css`, `mission.html` (Marke), `index.html`/`uebersicht.html`/`mission.html` (stil-Marke).

**Consumes:** `tafelHtml`, `zufallswerte` aus `js/instrumente.js`; Bühnenmuster aus `js/uebung4-lauf.js` (cockpitbuehne, panelflaeche); Aufgaben mit `instrument` aus Task 1.

- [ ] Schleier `laufschleier uebung5` baut die Cockpitbühne wie Mission 4: `cockpitbuehne` mit `panelflaeche`, dazu `testkopf` (Restzeit) und ein neues Scheibenfeld im Cockpitfenster (oberer Bildbereich, mittig), in dem Fragetext, Ablaufbalken und darunter Eingabefeld beziehungsweise Antwortknöpfe stehen. Verhalten (Zeitlimit, Rückmeldung, Punkte, Ergebnistafel) unverändert.
- [ ] Je Aufgabe: `const werte = zufallswerte();` und bei `aufgabe.instrument` den betroffenen Wert überschreiben (`werte[id] = wert`); `panel.innerHTML = tafelHtml(werte)`. Das Panel bleibt während der Aufgabe stehen.
- [ ] `stil.css`: Cockpitregeln für `.laufschleier.uebung5` (Bühne wie `.uebung4`, gleiche Bild- und Panelmaße) plus Scheibenfeld (dunkle, leicht transparente Fläche im Fensterbereich, gut lesbare Schrift). Hinweistext der Mission anpassen (Cockpit, Ablesen).
- [ ] Marken hochzählen (mission.js, stil.css), `node --test` grün, headless-Bildschirmabzug der Missionsseite als Rauchprobe, Commit.
