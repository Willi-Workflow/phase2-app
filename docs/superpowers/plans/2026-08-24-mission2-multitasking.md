# Mission 2 (Multitasking Controls) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Ziel:** Mission 2 als Nachbau des SMT aus dem ICA 90 II: Fadenkreuz, Ruderstrich und Geschwindigkeitsnadel mit Ratensteuerung und Drift in Deckung bringen und halten, Optik exakt nach Video und Abbildung 3-8.

**Architektur:** Reine Logik (Bewegung, Drift, Deckung, Treffer, Kennzahl) in `js/uebung2.js`; Maße, Winkelrechnung und statische SVG-Bühne in `js/uebung2-bild.js`; Vollbild-Ablauf mit requestAnimationFrame und Controls-Abfrage in `js/uebung2-lauf.js`; Einhängung über die bestehende Zuordnung `UEBUNGEN` in `js/mission.js`.

**Technik:** HTML, CSS, JavaScript-Module ohne Rahmenwerk, SVG-Zeichnung, Tests mit `node --test`, Sichtprüfung headless in Chrome gegen die Referenzbilder.

**Spezifikation:** `docs/superpowers/specs/2026-08-24-mission2-multitasking-design.md`
**Referenzbilder:** `entwurf/bilder/smt-referenz-vollbild.jpg`, `-nah.jpg`, `-treffer.jpg`, `-anzeige.jpg`

## Global Constraints

- Arbeitsverzeichnis: `/Users/o_o/Desktop/Claude/Phase II/App`
- Oberfläche, Bezeichner, Kommentare und Commits auf Deutsch, keine Gedankenstriche, keine Emojis. "Controls" ist als Projektbegriff erlaubt.
- Nach jeder Änderung an einer eingebundenen Datei die Versionsmarke (`?v=N`) hochzählen; bei Modulen zählt die Marke des Einstiegsskripts in der HTML-Seite.
- Tests: `node --test tests/*.test.js`, alle bestehenden Tests (Stand: 90) müssen weiter bestehen.
- Kein `git push` ohne ausdrückliche Freigabe von Willi, nur örtliche Commits.
- Commit-Nachrichten enden mit der Zeile `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Sichtprüfungen headless fahren, nicht in Willis laufendem Chrome; Port 8123 gehört gegebenenfalls einer anderen Sitzung, eigene Server auf 8127 starten und beenden.
- `wertung` von Mission 2 bleibt in diesem Plan auf `false` (Probebetrieb).

---

### Task 1: Bewegungskern in `js/uebung2.js`

**Files:**
- Create: `js/uebung2.js`
- Test: `tests/uebung2.test.js`

**Interfaces:**
- Consumes: nichts Projektspezifisches (der Zufall wird eingespeist).
- Produces aus `js/uebung2.js`:
  - Konstanten `TESTDAUERN` ([5, 10, 30]), `ELEMENTE` (["stick", "ruder", "schub"]), `HALTEZEIT_MS` (1000), `NADEL_MIN` (40), `NADEL_MAX` (160), `ZIELKREIS_R` (0.02), `STRICH_TOLERANZ` (0.01), `NADEL_TOLERANZ` (2), `SOLLWERTE` (45 bis 155 in Fünferschritten)
  - `erzeugeLaufzustand(auswahl, rnd)` liefert den Laufzustand (Positionen im Einheitsraum 0 bis 1, Nadel in Knoten, Sollwert, Driftspeicher, Halte- und Trefferzähler)
  - `takt(zustand, eingaben, dtMs, rnd)` integriert einen Zeitschritt (Raten plus Drift, Grenzen) und liefert in Task 2 die Trefferereignisse; in diesem Task bewegt er nur

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`tests/uebung2.test.js` anlegen:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, ELEMENTE, HALTEZEIT_MS, NADEL_MIN, NADEL_MAX,
  ZIELKREIS_R, STRICH_TOLERANZ, NADEL_TOLERANZ, SOLLWERTE,
  erzeugeLaufzustand, takt,
} from "../js/uebung2.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const ALLE = ["stick", "ruder", "schub"];
const RUHE = { stickX: 0, stickY: 0, ruder: 0, schub: 0 };

test("Rahmenwerte des Nachbaus", () => {
  assert.deepEqual(TESTDAUERN, [5, 10, 30]);
  assert.deepEqual(ELEMENTE, ["stick", "ruder", "schub"]);
  assert.equal(HALTEZEIT_MS, 1000);
  assert.equal(NADEL_MIN, 40);
  assert.equal(NADEL_MAX, 160);
  assert.equal(SOLLWERTE[0], 45);
  assert.equal(SOLLWERTE[SOLLWERTE.length - 1], 155);
  assert.ok(SOLLWERTE.every((w) => w % 5 === 0));
});

test("erzeugeLaufzustand: Startlage gültig und außerhalb der Deckung", () => {
  const rnd = saatZufall(7);
  for (let i = 0; i < 50; i++) {
    const z = erzeugeLaufzustand(ALLE, rnd);
    assert.ok(z.fadenkreuz.x >= 0 && z.fadenkreuz.x <= 1);
    assert.ok(z.fadenkreuz.y >= 0 && z.fadenkreuz.y <= 1);
    assert.ok(Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) > ZIELKREIS_R * 3);
    assert.ok(Math.abs(z.strich.x - 0.5) > STRICH_TOLERANZ * 3);
    assert.ok(SOLLWERTE.includes(z.soll));
    assert.ok(Math.abs(z.nadel - z.soll) > NADEL_TOLERANZ * 2);
  }
});

test("takt: Stickauslenkung bewegt das Fadenkreuz mit begrenzter Rate", () => {
  const rnd = saatZufall(11);
  const z = erzeugeLaufzustand(ALLE, rnd);
  const vorher = { ...z.fadenkreuz };
  takt(z, { ...RUHE, stickX: 1 }, 100, rnd);
  assert.ok(z.fadenkreuz.x > vorher.x);
  assert.ok(z.fadenkreuz.x - vorher.x < 0.1);
});

test("takt: Grenzen halten alle Elemente im erlaubten Bereich", () => {
  const rnd = saatZufall(13);
  const z = erzeugeLaufzustand(ALLE, rnd);
  for (let i = 0; i < 200; i++) takt(z, { stickX: 1, stickY: 1, ruder: 1, schub: 1 }, 50, rnd);
  assert.ok(z.fadenkreuz.x <= 1 && z.fadenkreuz.y <= 1);
  assert.ok(z.strich.x <= 1);
  assert.ok(z.nadel <= NADEL_MAX);
  for (let i = 0; i < 400; i++) takt(z, { stickX: -1, stickY: -1, ruder: -1, schub: -1 }, 50, rnd);
  assert.ok(z.fadenkreuz.x >= 0 && z.fadenkreuz.y >= 0);
  assert.ok(z.strich.x >= 0);
  assert.ok(z.nadel >= NADEL_MIN);
});

test("takt: Drift bewegt ein losgelassenes Element aus der Deckung", () => {
  const rnd = saatZufall(17);
  const z = erzeugeLaufzustand(ALLE, rnd);
  z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5;
  let dauerMs = 0;
  while (Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) <= ZIELKREIS_R && dauerMs < 60000) {
    takt(z, RUHE, 50, rnd);
    dauerMs += 50;
  }
  assert.ok(dauerMs < 15000, `Drift zu schwach, nach ${dauerMs} ms noch in Deckung`);
  assert.ok(dauerMs > 300, "Drift zu stark, Deckung sofort verloren");
});

test("takt: nicht gewählte Elemente bleiben unbewegt", () => {
  const rnd = saatZufall(19);
  const z = erzeugeLaufzustand(["stick"], rnd);
  const strichVorher = z.strich.x;
  const nadelVorher = z.nadel;
  for (let i = 0; i < 100; i++) takt(z, { ...RUHE, ruder: 1, schub: 1 }, 50, rnd);
  assert.equal(z.strich.x, strichVorher);
  assert.equal(z.nadel, nadelVorher);
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `cd "/Users/o_o/Desktop/Claude/Phase II/App" && node --test tests/uebung2.test.js`
Expected: FAIL, Modul `../js/uebung2.js` nicht gefunden.

- [ ] **Step 3: `js/uebung2.js` anlegen**

```js
// Übungslogik Mission 2 (Multitasking Controls): Nachbau des SMT aus dem
// ICA 90 II. Bewegung als Ratensteuerung mit träger Zufallsdrift, Deckungs-
// und Trefferprüfung, Kennzahl. Reine Logik ohne DOM, Zufall und Zeitschritt
// sind einspeisbar, damit alles mit node --test prüfbar bleibt.
import { mische } from "./zufall.js";

export const TESTDAUERN = [5, 10, 30]; // Minuten
export const ELEMENTE = ["stick", "ruder", "schub"];
export const HALTEZEIT_MS = 1000;
export const NADEL_MIN = 40;
export const NADEL_MAX = 160;
export const ZIELKREIS_R = 0.02;     // Anteil der Rahmenbreite
export const STRICH_TOLERANZ = 0.01; // Anteil der Rahmenbreite
export const NADEL_TOLERANZ = 2;     // Knoten
export const SOLLWERTE = Array.from({ length: 23 }, (_, i) => 45 + i * 5);

// Raten bei Vollausschlag (je Sekunde) und Driftstärken.
const RATE_STICK = 0.45;
const RATE_RUDER = 0.5;
const RATE_NADEL = 30;
const DRIFT_STICK = 0.05;
const DRIFT_RUDER = 0.05;
const DRIFT_NADEL = 3.5;
const DRIFTWECHSEL_MIN_MS = 1500;
const DRIFTWECHSEL_MAX_MS = 3000;

const begrenze = (w, min, max) => Math.min(max, Math.max(min, w));
const zufallAus = (feld, rnd) => feld[Math.floor(rnd() * feld.length)];

function neueDrift(staerke, rnd) {
  return {
    ziel: (rnd() * 2 - 1) * staerke,
    wert: 0,
    restMs: DRIFTWECHSEL_MIN_MS + rnd() * (DRIFTWECHSEL_MAX_MS - DRIFTWECHSEL_MIN_MS),
    staerke,
  };
}

function taktDrift(d, dtMs, rnd) {
  d.restMs -= dtMs;
  if (d.restMs <= 0) {
    d.ziel = (rnd() * 2 - 1) * d.staerke;
    d.restMs = DRIFTWECHSEL_MIN_MS + rnd() * (DRIFTWECHSEL_MAX_MS - DRIFTWECHSEL_MIN_MS);
  }
  d.wert += (d.ziel - d.wert) * Math.min(1, dtMs / 600);
  return d.wert;
}

// Neusetzung nach einem Treffer beziehungsweise Startlage: immer deutlich
// außerhalb der Deckung, damit jede Aufgabe echte Arbeit verlangt.
export function zufallsFadenkreuz(rnd) {
  for (;;) {
    const x = 0.08 + rnd() * 0.84;
    const y = 0.08 + rnd() * 0.84;
    if (Math.hypot(x - 0.5, y - 0.5) >= 0.25) return { x, y };
  }
}

export function zufallsStrich(rnd) {
  for (;;) {
    const x = 0.08 + rnd() * 0.84;
    if (Math.abs(x - 0.5) >= 0.15) return { x };
  }
}

export function neuerSoll(alterSoll, nadel, rnd) {
  const passende = SOLLWERTE.filter((w) => w !== alterSoll && Math.abs(w - nadel) >= 15);
  return zufallAus(passende.length ? passende : SOLLWERTE.filter((w) => w !== alterSoll), rnd);
}

export function erzeugeLaufzustand(auswahl, rnd = Math.random) {
  const nadel = 100;
  return {
    auswahl: [...auswahl],
    fadenkreuz: zufallsFadenkreuz(rnd),
    strich: zufallsStrich(rnd),
    nadel,
    soll: neuerSoll(null, nadel, rnd),
    drift: {
      fx: neueDrift(DRIFT_STICK, rnd),
      fy: neueDrift(DRIFT_STICK, rnd),
      strich: neueDrift(DRIFT_RUDER, rnd),
      nadel: neueDrift(DRIFT_NADEL, rnd),
    },
    halte: { stick: 0, ruder: 0, schub: 0 },
    treffer: { stick: 0, ruder: 0, schub: 0 },
    kombitreffer: 0,
  };
}

export function inDeckung(z, element) {
  if (element === "stick") return Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) <= ZIELKREIS_R;
  if (element === "ruder") return Math.abs(z.strich.x - 0.5) <= STRICH_TOLERANZ;
  return Math.abs(z.nadel - z.soll) <= NADEL_TOLERANZ;
}

// Ein Zeitschritt: Eingaben wirken als Rate, die Drift kommt obendrauf.
// Rückgabe: Trefferereignisse dieses Takts, je Element höchstens eines.
export function takt(z, eingaben, dtMs, rnd = Math.random) {
  const dt = dtMs / 1000;
  const aktiv = z.auswahl;
  const ereignisse = [];

  if (aktiv.includes("stick")) {
    z.fadenkreuz.x = begrenze(z.fadenkreuz.x + (eingaben.stickX * RATE_STICK + taktDrift(z.drift.fx, dtMs, rnd)) * dt, 0, 1);
    z.fadenkreuz.y = begrenze(z.fadenkreuz.y + (eingaben.stickY * RATE_STICK + taktDrift(z.drift.fy, dtMs, rnd)) * dt, 0, 1);
  }
  if (aktiv.includes("ruder")) {
    z.strich.x = begrenze(z.strich.x + (eingaben.ruder * RATE_RUDER + taktDrift(z.drift.strich, dtMs, rnd)) * dt, 0, 1);
  }
  if (aktiv.includes("schub")) {
    z.nadel = begrenze(z.nadel + (eingaben.schub * RATE_NADEL + taktDrift(z.drift.nadel, dtMs, rnd)) * dt, NADEL_MIN, NADEL_MAX);
  }

  for (const element of aktiv) {
    if (inDeckung(z, element)) {
      z.halte[element] += dtMs;
      if (z.halte[element] >= HALTEZEIT_MS) {
        z.treffer[element] += 1;
        const andereInDeckung = aktiv.filter((e) => e !== element).every((e) => inDeckung(z, e));
        if (aktiv.length > 1 && andereInDeckung) z.kombitreffer += 1;
        ereignisse.push({ element, kombi: aktiv.length > 1 && andereInDeckung });
        z.halte[element] = 0;
        if (element === "stick") z.fadenkreuz = zufallsFadenkreuz(rnd);
        else if (element === "ruder") z.strich = zufallsStrich(rnd);
        else z.soll = neuerSoll(z.soll, z.nadel, rnd);
      }
    } else {
      z.halte[element] = 0;
    }
  }
  return ereignisse;
}
```

(Die Funktionen `punkte` und `pruefeAuswahl` folgen in Task 2; `mische` wird dort gebraucht und der Import liegt schon bereit, ungenutzte Importe meldet kein Werkzeug.)

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung2.test.js`
Expected: PASS, sechs Tests. (Der Drift-Test ist mit der Saat deterministisch; scheitert er knapp an den Zeitschranken, die Saat im Test anpassen statt der Logik, das geforderte Verhalten bleibt.)

- [ ] **Step 5: Gesamtlauf und Commit**

Run: `node --test tests/*.test.js`
Expected: PASS, 96 Tests.

```bash
git add js/uebung2.js tests/uebung2.test.js
git commit -m "Mission 2: Bewegungskern mit Ratensteuerung und Drift

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Treffer, Kombitreffer, Kennzahl und Auswahlregeln

**Files:**
- Modify: `js/uebung2.js` (ans Ende anfügen)
- Modify: `tests/uebung2.test.js` (ans Ende anfügen)

**Interfaces:**
- Consumes: `erzeugeLaufzustand`, `takt`, `inDeckung`, Konstanten aus Task 1.
- Produces aus `js/uebung2.js`:
  - `punkte(zustand, dauerMin)`: (Summe Einzeltreffer plus 2 mal Kombitreffer) je Minute, gerundet; 0 bei dauerMin 0
  - `pruefeAuswahl(auswahl)`: true nur für nicht leere Teilmengen von ELEMENTE

- [ ] **Step 1: Fehlschlagende Tests anfügen**

Import in `tests/uebung2.test.js` erweitern um `inDeckung, punkte, pruefeAuswahl, neuerSoll` und ans Ende anfügen:

```js
function halteInDeckung(z, element, rnd) {
  // Setzt das Element in Deckung und hält es rechnerisch eine Sekunde:
  // Deckung vor jedem Takt erneuern, weil die Drift dagegen arbeitet.
  let ereignisse = [];
  for (let i = 0; i < 20 && ereignisse.length === 0; i++) {
    if (element === "stick") { z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5; }
    if (element === "ruder") z.strich.x = 0.5;
    if (element === "schub") z.nadel = z.soll;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  return ereignisse;
}

test("takt: eine Sekunde Deckung gibt einen Treffer und setzt neu", () => {
  const rnd = saatZufall(23);
  const z = erzeugeLaufzustand(["stick"], rnd);
  const ereignisse = halteInDeckung(z, "stick", rnd);
  assert.deepEqual(ereignisse, [{ element: "stick", kombi: false }]);
  assert.equal(z.treffer.stick, 1);
  assert.equal(z.kombitreffer, 0);
  assert.ok(Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) >= 0.25);
});

test("takt: unterbrochene Deckung setzt die Haltezeit zurück", () => {
  const rnd = saatZufall(29);
  const z = erzeugeLaufzustand(["ruder"], rnd);
  z.strich.x = 0.5;
  takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 600, rnd);
  z.strich.x = 0.9; // Deckung verlassen
  takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  assert.equal(z.halte.ruder, 0);
  assert.equal(z.treffer.ruder, 0);
});

test("takt: Kombitreffer nur, wenn die übrigen gewählten Elemente in Deckung stehen", () => {
  const rnd = saatZufall(31);
  const z = erzeugeLaufzustand(["stick", "schub"], rnd);
  z.nadel = z.soll; // Schub in Deckung
  z.halte.schub = 0;
  let ereignisse = [];
  for (let i = 0; i < 20 && ereignisse.length === 0; i++) {
    z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5;
    z.nadel = z.soll;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  const stickEreignis = ereignisse.find((e) => e.element === "stick");
  assert.ok(stickEreignis);
  assert.equal(stickEreignis.kombi, true);
  assert.ok(z.kombitreffer >= 1);
});

test("neuerSoll: nie der alte Wert, immer aus dem Raster", () => {
  const rnd = saatZufall(37);
  for (let i = 0; i < 100; i++) {
    const soll = neuerSoll(75, 75, rnd);
    assert.notEqual(soll, 75);
    assert.ok(SOLLWERTE.includes(soll));
    assert.ok(Math.abs(soll - 75) >= 15);
  }
});

test("punkte: Treffer je Minute, Kombitreffer doppelt", () => {
  const z = { treffer: { stick: 10, ruder: 6, schub: 4 }, kombitreffer: 5 };
  assert.equal(punkte(z, 5), 6);   // (20 + 10) / 5
  assert.equal(punkte(z, 10), 3);  // (20 + 10) / 10
  assert.equal(punkte(z, 0), 0);
});

test("pruefeAuswahl: mindestens ein gültiges Element", () => {
  assert.ok(pruefeAuswahl(["stick"]));
  assert.ok(pruefeAuswahl(["stick", "ruder", "schub"]));
  assert.ok(!pruefeAuswahl([]));
  assert.ok(!pruefeAuswahl(["quatsch"]));
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `node --test tests/uebung2.test.js`
Expected: FAIL, `punkte` ist kein Export.

- [ ] **Step 3: Umsetzung in `js/uebung2.js` anfügen**

```js
// Kennzahl des Laufs: Treffer je Minute, gemeinsame Treffer zählen doppelt.
// So bleiben Läufe verschiedener Testdauern vergleichbar.
export function punkte(z, dauerMin) {
  if (!dauerMin) return 0;
  const einzel = z.treffer.stick + z.treffer.ruder + z.treffer.schub;
  return Math.round((einzel + 2 * z.kombitreffer) / dauerMin);
}

export function pruefeAuswahl(auswahl) {
  return auswahl.length > 0 && auswahl.every((e) => ELEMENTE.includes(e));
}
```

Falls der `mische`-Import aus Task 1 ungenutzt geblieben ist, jetzt entfernen (die Neusetzung braucht ihn nicht); der Kommentar im Dateikopf bleibt stimmig.

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung2.test.js`
Expected: PASS, zwölf Tests.

- [ ] **Step 5: Gesamtlauf und Commit**

Run: `node --test tests/*.test.js`
Expected: PASS, 102 Tests.

```bash
git add js/uebung2.js tests/uebung2.test.js
git commit -m "Mission 2: Treffer, Kombitreffer und Kennzahl

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Maße und SVG-Bühne in `js/uebung2-bild.js`

**Files:**
- Create: `js/uebung2-bild.js`
- Test: `tests/uebung2-bild.test.js`

**Interfaces:**
- Consumes: `NADEL_MIN`, `NADEL_MAX` aus `js/uebung2.js`.
- Produces aus `js/uebung2-bild.js`:
  - `BILD` (viewBox 1600 mal 900), `RAHMEN` ({ x: 160, y: 60, b: 1280, h: 700 }), `STRICH_Y` (Bildkoordinate der Strichhöhe), `TACHO` ({ cx, cy, r })
  - `xImBild(einheitX)`, `yImBild(einheitY)`: Einheitsraum auf Rahmen-Bildkoordinaten
  - `gradFuerKnoten(kt)`: Zeigerwinkel in Grad, 40 Knoten bei 60 Grad, 160 Knoten bei 300 Grad, im Uhrzeigersinn über unten (100 Knoten zeigen senkrecht nach unten)
  - `buehneSvg(auswahl)`: die komplette statische SVG als Zeichenkette, mit Kennungen `#fadenkreuz`, `#ruderstrich`, `#nadel`, `#sollkeil`, `#solltext`, `#zielkreis`, `#mittellinie`, `#tachobogen` für die Laufzeit-Fortschreibung; nicht gewählte Elemente fehlen samt Zielbild

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`tests/uebung2-bild.test.js` anlegen:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { BILD, RAHMEN, TACHO, xImBild, yImBild, gradFuerKnoten, buehneSvg } from "../js/uebung2-bild.js";

test("Maße: Rahmen liegt mittig im 1600er-Bild", () => {
  assert.equal(BILD.b, 1600);
  assert.equal(BILD.h, 900);
  assert.equal(RAHMEN.x * 2 + RAHMEN.b, 1600);
  assert.ok(RAHMEN.b / 1600 > 0.75 && RAHMEN.b / 1600 < 0.85);
});

test("Einheitsraum wird auf den Rahmen abgebildet", () => {
  assert.equal(xImBild(0), RAHMEN.x);
  assert.equal(xImBild(1), RAHMEN.x + RAHMEN.b);
  assert.equal(xImBild(0.5), RAHMEN.x + RAHMEN.b / 2);
  assert.equal(yImBild(0.5), RAHMEN.y + RAHMEN.h / 2);
});

test("gradFuerKnoten: Skala von 60 nach 300 Grad über unten", () => {
  assert.equal(gradFuerKnoten(40), 60);
  assert.equal(gradFuerKnoten(100), 180);
  assert.equal(gradFuerKnoten(160), 300);
});

test("buehneSvg: enthält alle Kennungen der gewählten Elemente", () => {
  const voll = buehneSvg(["stick", "ruder", "schub"]);
  for (const id of ["fadenkreuz", "ruderstrich", "nadel", "sollkeil", "solltext", "zielkreis", "tachobogen"]) {
    assert.ok(voll.includes(`id="${id}"`), id);
  }
});

test("buehneSvg: nicht gewählte Elemente fehlen samt Zielbild", () => {
  const nurStick = buehneSvg(["stick"]);
  assert.ok(nurStick.includes('id="fadenkreuz"'));
  assert.ok(!nurStick.includes('id="ruderstrich"'));
  assert.ok(!nurStick.includes('id="nadel"'));
  assert.ok(!nurStick.includes("AIRSPEED"));
  const ohneStick = buehneSvg(["ruder", "schub"]);
  assert.ok(!ohneStick.includes('id="fadenkreuz"'));
  assert.ok(!ohneStick.includes('id="zielkreis"'));
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `node --test tests/uebung2-bild.test.js`
Expected: FAIL, Modul nicht gefunden.

- [ ] **Step 3: `js/uebung2-bild.js` anlegen**

Optik streng nach den Referenzbildern (`entwurf/bilder/smt-referenz-vollbild.jpg` und `-anzeige.jpg`): schwarzer Grund, dünne weiße Linien mit leicht bläulichem Schimmer, rote Steuerobjekte, Geschwindigkeitsanzeige unten links mit türkisem Bogen.

```js
// Maße und statische SVG-Bühne für Mission 2 (SMT-Nachbau). Gezeichnet wird
// im festen 1600 mal 900 Raster; die Laufzeit schreibt nur Verschiebungen und
// Drehungen der gekennzeichneten Gruppen fort. Farben und Aufbau folgen den
// Referenzbildern unter entwurf/bilder/smt-referenz-*.jpg.
import { NADEL_MIN, NADEL_MAX } from "./uebung2.js";

export const BILD = { b: 1600, h: 900 };
export const RAHMEN = { x: 160, y: 60, b: 1280, h: 700 };
export const STRICH_Y = RAHMEN.y + RAHMEN.h * 0.18;
export const TACHO = { cx: 185, cy: 800, r: 78 };

export const LINIE = "#dfe9f5";      // weiß mit Röhrenschimmer
export const ROT = "#e5312b";
export const TUERKIS = "#8fe3df";

export const xImBild = (x) => RAHMEN.x + x * RAHMEN.b;
export const yImBild = (y) => RAHMEN.y + y * RAHMEN.h;

// 40 Knoten rechts oben, im Uhrzeigersinn über unten bis 160 links oben.
export function gradFuerKnoten(kt) {
  return 60 + ((kt - NADEL_MIN) / (NADEL_MAX - NADEL_MIN)) * 240;
}

// 0 Grad zeigt nach oben, positive Winkel laufen im Uhrzeigersinn.
const punktAmTacho = (grad, r) => {
  const w = (grad * Math.PI) / 180;
  return { x: TACHO.cx + Math.sin(w) * r, y: TACHO.cy - Math.cos(w) * r };
};

function tachoSvg() {
  const striche = [];
  for (let kt = NADEL_MIN; kt <= NADEL_MAX; kt += 10) {
    const grad = gradFuerKnoten(kt);
    const lang = kt % 40 === 0;
    const a = punktAmTacho(grad, TACHO.r - (lang ? 16 : 10));
    const b = punktAmTacho(grad, TACHO.r - 4);
    striche.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${LINIE}" stroke-width="${lang ? 2.4 : 1.4}"/>`);
    if (lang) {
      const t = punktAmTacho(grad, TACHO.r - 30);
      striche.push(`<text x="${t.x.toFixed(1)}" y="${(t.y + 4).toFixed(1)}" fill="${LINIE}" font-size="13" text-anchor="middle">${kt}</text>`);
    }
  }
  // Türkiser Bogen entlang der Skala, wie im Referenzbild.
  const von = punktAmTacho(gradFuerKnoten(NADEL_MIN), TACHO.r);
  const bis = punktAmTacho(gradFuerKnoten(NADEL_MAX), TACHO.r);
  const bogen = `<path id="tachobogen" d="M ${von.x.toFixed(1)} ${von.y.toFixed(1)} A ${TACHO.r} ${TACHO.r} 0 1 1 ${bis.x.toFixed(1)} ${bis.y.toFixed(1)}" fill="none" stroke="${TUERKIS}" stroke-width="4" opacity="0.85"/>`;
  return `
    <g font-family="Arial, Helvetica, sans-serif">
      <circle cx="${TACHO.cx}" cy="${TACHO.cy}" r="${TACHO.r + 14}" fill="#050607" stroke="#20262c" stroke-width="1.5"/>
      ${bogen}
      ${striche.join("")}
      <text x="${TACHO.cx}" y="${TACHO.cy - 26}" fill="${LINIE}" font-size="12" text-anchor="middle" letter-spacing="1">AIRSPEED</text>
      <text x="${TACHO.cx}" y="${TACHO.cy - 13}" fill="${LINIE}" font-size="9" text-anchor="middle" letter-spacing="2">KNOTS</text>
      <g id="nadel" transform="rotate(180 ${TACHO.cx} ${TACHO.cy})">
        <line x1="${TACHO.cx}" y1="${TACHO.cy}" x2="${TACHO.cx}" y2="${TACHO.cy - TACHO.r + 12}" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
      </g>
      <circle cx="${TACHO.cx}" cy="${TACHO.cy}" r="6" fill="#c8ccd2"/>
      <g id="sollkeil" transform="rotate(180 ${TACHO.cx} ${TACHO.cy})">
        <path d="M ${TACHO.cx} ${TACHO.cy - TACHO.r - 12} l -7 -12 l 14 0 z" fill="${ROT}"/>
      </g>
      <text id="solltext" x="${TACHO.cx}" y="${TACHO.cy + TACHO.r + 34}" fill="${ROT}" font-size="15" text-anchor="middle" letter-spacing="1">SOLL 75 kt</text>
    </g>`;
}

export function buehneSvg(auswahl) {
  const mitStick = auswahl.includes("stick");
  const mitRuder = auswahl.includes("ruder");
  const mitSchub = auswahl.includes("schub");
  const R = RAHMEN;

  const kreuz = `
    <line x1="${R.x}" y1="${R.y + R.h / 2}" x2="${R.x + R.b}" y2="${R.y + R.h / 2}" stroke="${LINIE}" stroke-width="2"/>
    <line id="mittellinie" x1="${R.x + R.b / 2}" y1="${R.y}" x2="${R.x + R.b / 2}" y2="${R.y + R.h}" stroke="${LINIE}" stroke-width="2"/>`;

  const zielkreis = mitStick
    ? `<circle id="zielkreis" cx="${R.x + R.b / 2}" cy="${R.y + R.h / 2}" r="${0.02 * R.b}" fill="none" stroke="${LINIE}" stroke-width="2.5"/>`
    : "";

  const fadenkreuz = mitStick ? `
    <g id="fadenkreuz" stroke="${ROT}" stroke-width="3" fill="none">
      <circle cx="0" cy="0" r="${0.014 * R.b}"/>
      <line x1="${-0.024 * R.b}" y1="0" x2="${0.024 * R.b}" y2="0"/>
      <line x1="0" y1="${-0.024 * R.b}" x2="0" y2="${0.024 * R.b}"/>
    </g>` : "";

  const strich = mitRuder
    ? `<line id="ruderstrich" x1="0" y1="${STRICH_Y - 34}" x2="0" y2="${STRICH_Y + 34}" stroke="${ROT}" stroke-width="7"/>`
    : "";

  return `<svg viewBox="0 0 ${BILD.b} ${BILD.h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <rect x="0" y="0" width="${BILD.b}" height="${BILD.h}" fill="#000"/>
    <rect x="${R.x}" y="${R.y}" width="${R.b}" height="${R.h}" fill="none" stroke="${LINIE}" stroke-width="2.5"/>
    ${kreuz}
    ${zielkreis}
    ${strich}
    ${fadenkreuz}
    ${mitSchub ? tachoSvg() : ""}
  </svg>`;
}
```

Hinweis an den Umsetzer: Die Winkelrechnung von `punktAmTacho` gegen die drei Testwerte von `gradFuerKnoten` prüfen (40 Knoten muss rechts oben liegen, 100 unten, 160 links oben) und die Vorzeichen nötigenfalls korrigieren, bis Zahlenkranz und Bogen dem Referenzbild `smt-referenz-anzeige.jpg` entsprechen; die Tests aus Step 1 bleiben unverändert maßgeblich. Die senkrechte Mittellinie bleibt in allen Kombinationen sichtbar (sie ist Zielbild des Ruders und Achse des Kreuzes); der bedingte Ausdruck oben ist bewusst in beiden Zweigen gleich und darf zu einer einzigen Zeile vereinfacht werden.

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung2-bild.test.js`
Expected: PASS, fünf Tests.

- [ ] **Step 5: Gesamtlauf und Commit**

Run: `node --test tests/*.test.js`
Expected: PASS, 107 Tests.

```bash
git add js/uebung2-bild.js tests/uebung2-bild.test.js
git commit -m "Mission 2: Maße und SVG-Bühne nach den Referenzbildern

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Ablauf in `js/uebung2-lauf.js` samt Probegeschirr

**Files:**
- Create: `js/uebung2-lauf.js`
- Create: `entwurf/uebung2-probe.html`

**Interfaces:**
- Consumes: alles aus `js/uebung2.js` und `js/uebung2-bild.js`; Türobjekt aus `js/hangartuer.js`; `controls.wert(rolle)` für die Rollen `stickX`, `stickY`, `ruder`, `schub`; `speicher.ladeEinstellung`/`setzeEinstellung`.
- Produces: `erzeugeUebung2({ speicher, controls })` liefert `{ hinweis, ladeEinstellung, zeichneFeld, starte }` in der einheitlichen Übungs-Schnittstelle. `starte({ tuer, beiEnde, registriereAbbruch })` liefert bei vollendetem Lauf `beiEnde({ kennzahl, daten: { art: "multitasking", dauerMin, auswahl, trefferStick, trefferRuder, trefferSchub, kombitreffer, punkte } })`, bei Abbruch `beiEnde(null)`.
- CSS-Klassen für Task 5: `laufschleier uebung2`, `wahlknopf` (Einstellungsfeld), `smtblitz` (Trefferaufblitzen).

- [ ] **Step 1: `js/uebung2-lauf.js` anlegen**

```js
// Ablauf Mission 2 (Multitasking Controls) im Vollbild: SMT-Nachbau mit
// Rahmen, Fadenkreuz, Ruderstrich und Geschwindigkeitsanzeige. Die Logik
// rechnet in uebung2.js, hier laufen Achsenabfrage, Zeichnung und Tafeln.
import {
  TESTDAUERN, ELEMENTE, erzeugeLaufzustand, takt, punkte, pruefeAuswahl,
} from "./uebung2.js";
import { xImBild, yImBild, TACHO, gradFuerKnoten, buehneSvg } from "./uebung2-bild.js";

const NAMEN = { stick: "STICK", ruder: "RUDER", schub: "SCHUB" };

export function erzeugeUebung2({ speicher, controls }) {
  const hinweis = "Nachbau des Multitasking-Tests der Eignungsfeststellung: Bringe das rote "
    + "Fadenkreuz mit dem Stick in den Zielkreis, den roten Strich mit dem Ruder auf die "
    + "Mittellinie und die Nadel mit dem Schub auf den Sollwert. Eine Sekunde Deckung gibt "
    + "einen Treffer. Wähle unten, welche Controls geprüft werden.";

  let einstellung = { dauer: 5, stick: true, ruder: true, schub: true };

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung2-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  const auswahlAusEinstellung = () => ELEMENTE.filter((e) => einstellung[e]);

  function zeichneFeld(feld) {
    const knoepfe = ELEMENTE.map((e) => `
      <button type="button" class="wahlknopf ${einstellung[e] ? "an" : ""}" data-element="${e}"
        aria-pressed="${einstellung[e]}">${NAMEN[e]}</button>`).join("");
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">CONTROLS</span>
        <span class="wahlknoepfe">${knoepfe}</span></div>
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="dauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.dauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>
      <p class="wahlhinweis" id="u2-wahlhinweis" hidden>Mindestens ein Steuerelement wählen.</p>`;

    const zeigeSperre = () => {
      const gueltig = pruefeAuswahl(auswahlAusEinstellung());
      document.getElementById("start").disabled = !gueltig;
      feld.querySelector("#u2-wahlhinweis").hidden = gueltig;
    };
    feld.addEventListener("click", (e) => {
      const knopf = e.target.closest(".wahlknopf");
      if (!knopf) return;
      const element = knopf.dataset.element;
      einstellung[element] = !einstellung[element];
      knopf.classList.toggle("an", einstellung[element]);
      knopf.setAttribute("aria-pressed", String(einstellung[element]));
      speicher.setzeEinstellung("uebung2-einstellung", einstellung);
      zeigeSperre();
    });
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung2-einstellung", einstellung);
    };
    zeigeSperre();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const auswahl = auswahlAusEinstellung();
    const { dauer } = einstellung;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung2";
    schleier.innerHTML = `<div class="smtbuehne">${buehneSvg(auswahl)}</div><div class="testkopf"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const kopf = schleier.querySelector(".testkopf");
    const svg = schleier.querySelector("svg");
    const fadenkreuz = svg.querySelector("#fadenkreuz");
    const ruderstrich = svg.querySelector("#ruderstrich");
    const nadel = svg.querySelector("#nadel");
    const sollkeil = svg.querySelector("#sollkeil");
    const solltext = svg.querySelector("#solltext");
    const zielkreis = svg.querySelector("#zielkreis");
    const mittellinie = svg.querySelector("#mittellinie");
    const tachobogen = svg.querySelector("#tachobogen");

    const zustand = erzeugeLaufzustand(auswahl);
    let beendet = false;
    let ergebnisOffen = false;
    let testende = Infinity;
    let laeuft = false;
    let vorher = 0;
    const zeitgeber = new Set();
    const spaeter = (fn, ms) => { const t = setTimeout(() => { zeitgeber.delete(t); fn(); }, ms); zeitgeber.add(t); return t; };

    const raeumeAuf = () => {
      beendet = true;
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      schleier.remove();
    };
    const beiVollbildwechsel = () => { if (!document.fullscreenElement) verlasse?.(); };
    const beiSichtwechsel = () => { if (document.hidden) verlasse?.(); };
    let verlasse = () => zeigeErgebnis(false);
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const blitz = (knoten) => {
      if (!knoten) return;
      knoten.classList.add("smtblitz");
      spaeter(() => knoten.classList.remove("smtblitz"), 220);
    };

    const zeichne = () => {
      if (fadenkreuz) fadenkreuz.setAttribute("transform",
        `translate(${xImBild(zustand.fadenkreuz.x).toFixed(1)} ${yImBild(zustand.fadenkreuz.y).toFixed(1)})`);
      if (ruderstrich) ruderstrich.setAttribute("transform",
        `translate(${xImBild(zustand.strich.x).toFixed(1)} 0)`);
      if (nadel) nadel.setAttribute("transform", `rotate(${gradFuerKnoten(zustand.nadel).toFixed(2)} ${TACHO.cx} ${TACHO.cy})`);
      if (sollkeil) sollkeil.setAttribute("transform", `rotate(${gradFuerKnoten(zustand.soll).toFixed(2)} ${TACHO.cx} ${TACHO.cy})`);
      if (solltext) solltext.textContent = `SOLL ${zustand.soll} kt`;
      const rest = Math.max(0, testende - performance.now());
      kopf.textContent = `${auswahl.map((e) => NAMEN[e]).join(" + ")} · REST ${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
    };

    const schleife = (jetzt) => {
      if (beendet || ergebnisOffen || !laeuft) return;
      const dtMs = Math.min(50, jetzt - vorher || 16);
      vorher = jetzt;
      const eingaben = {
        stickX: controls.wert("stickX"),
        stickY: controls.wert("stickY"),
        ruder: controls.wert("ruder"),
        schub: controls.wert("schub"),
      };
      const ereignisse = takt(zustand, eingaben, dtMs);
      for (const e of ereignisse) {
        if (e.element === "stick") blitz(zielkreis);
        else if (e.element === "ruder") blitz(mittellinie);
        else { blitz(tachobogen); }
      }
      zeichne();
      if (performance.now() >= testende) { zeigeErgebnis(true); return; }
      requestAnimationFrame(schleife);
    };

    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const wert = punkte(zustand, dauer);
      const zeilen = auswahl.map((e) =>
        `<span>${NAMEN[e]}: ${zustand.treffer[e]} Treffer</span>`).join("");
      const kombizeile = auswahl.length > 1 ? `<span>Kombitreffer: ${zustand.kombitreffer}</span>` : "";
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${wert} PUNKTE</div>
        <div class="ergebniszeilen">${zeilen}${kombizeile}</div>
        <button class="punkt" id="u2-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>${dauer} min Testdauer · ${auswahl.map((e) => NAMEN[e]).join(" + ")}</span>
          ${abbruchzeile}
        </div>`;
      document.body.append(tafel);
      requestAnimationFrame(() => tafel.classList.add("da"));

      let geschlossen = false;
      const schliesse = async () => {
        if (geschlossen) return;
        geschlossen = true;
        tafel.classList.remove("da");
        setTimeout(() => tafel.remove(), 260);
        tuer.verwische(false);
        raeumeAuf();
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        await beiEnde(gewertet ? {
          kennzahl: wert,
          daten: {
            art: "multitasking",
            dauerMin: dauer,
            auswahl,
            trefferStick: zustand.treffer.stick,
            trefferRuder: zustand.treffer.ruder,
            trefferSchub: zustand.treffer.schub,
            kombitreffer: zustand.kombitreffer,
            punkte: wert,
          },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u2-fertig").addEventListener("click", schliesse);
    };

    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      testende = performance.now() + dauer * 60_000;
      laeuft = true;
      vorher = performance.now();
      zeichne();
      requestAnimationFrame(schleife);
    })();
  }

  return { hinweis, ladeEinstellung, zeichneFeld, starte };
}
```

- [ ] **Step 2: `entwurf/uebung2-probe.html` anlegen**

Probeaufbau mit gestellten Achsen, damit der Ablauf headless prüfbar ist:

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Übung 2 · Probe</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../stil.css?v=53">
</head>
<body>
<script type="module">
  // Probeaufbau ohne App-Rahmen: gestellte Achsen (Sinusfahrt), damit sich
  // alle Elemente sichtbar bewegen. ?auswahl=stick,ruder,schub wählt die
  // Elemente, ?dauer=<min> die Testdauer, ?abbruch=<ms> bricht ab.
  import { erzeugeUebung2 } from "../js/uebung2-lauf.js";
  import { erzeugeHangartuer } from "../js/hangartuer.js";
  const params = new URLSearchParams(location.search);
  const auswahl = (params.get("auswahl") ?? "stick,ruder,schub").split(",");
  const dauer = Number(params.get("dauer")) || 5;
  const speicher = {
    ladeEinstellung: async () => ({ dauer, stick: auswahl.includes("stick"), ruder: auswahl.includes("ruder"), schub: auswahl.includes("schub") }),
    setzeEinstellung: async () => {},
  };
  const start = performance.now();
  const controls = {
    wert(rolle) {
      const t = (performance.now() - start) / 1000;
      const kurven = {
        stickX: Math.sin(t * 0.9) * 0.6,
        stickY: Math.cos(t * 0.7) * 0.5,
        ruder: Math.sin(t * 1.3) * 0.5,
        schub: Math.sin(t * 0.5) * 0.4,
      };
      return kurven[rolle] ?? 0;
    },
  };
  const uebung = erzeugeUebung2({ speicher, controls });
  await uebung.ladeEinstellung();
  const tuer = erzeugeHangartuer();
  let brichAb = null;
  await tuer.schliesse();
  uebung.starte({
    tuer,
    registriereAbbruch: (fn) => { brichAb = fn; },
    beiEnde: (ergebnis) => { document.body.insertAdjacentText("beforeend", `ENDE: ${JSON.stringify(ergebnis)}`); },
  });
  const abbruchNach = Number(params.get("abbruch"));
  if (abbruchNach > 0) setTimeout(() => brichAb?.(), abbruchNach);
</script>
</body>
</html>
```

- [ ] **Step 3: Prüfen (Bestand unberührt, Syntax sauber)**

Run: `node --check js/uebung2-lauf.js && node --test tests/*.test.js`
Expected: Syntax fehlerfrei, PASS 107 Tests.

- [ ] **Step 4: Commit**

```bash
git add js/uebung2-lauf.js entwurf/uebung2-probe.html
git commit -m "Mission 2: Vollbild-Ablauf mit Achsenabfrage und Probegeschirr

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Gestaltung in `stil.css` und Versionsmarken der Stildatei

**Files:**
- Modify: `stil.css` (neue Regeln bei den Missionsregeln)
- Modify: alle HTML-Dateien mit `stil.css?v=52` (Versionsmarke auf v=53)

**Interfaces:**
- Consumes: die Klassennamen aus Task 4.

- [ ] **Step 1: Neue Regeln ergänzen**

```css
/* Mission 2: SMT-Bühne. Schwarzer Grund wie das Original, die SVG füllt das
   Fenster; Kopfzeile fest oben, Trefferaufblitzen als kurzes Aufhellen. */
.laufschleier.uebung2 { display: grid; place-items: center; padding: 0; background: #000; }
.smtbuehne { position: absolute; inset: 0; }
.smtbuehne svg { width: 100%; height: 100%; display: block; }
.laufschleier.uebung2 .testkopf { position: absolute; top: 3vh; left: 50%; transform: translateX(-50%); z-index: 2; color: #6f7d8c; letter-spacing: 0.25em; }
.smtblitz { filter: brightness(2.4) drop-shadow(0 0 6px rgba(223, 233, 245, 0.9)); }

/* Mission 2: Wahlknöpfe der Steuerelemente auf der Missionsseite */
.wahlknoepfe { display: flex; gap: 8px; }
.wahlknopf { font-family: inherit; font-size: 11px; letter-spacing: 0.08em; color: var(--gedeckt); background: #161a10; border: 1px solid #39422c; border-radius: 4px; padding: 6px 12px; cursor: pointer; }
.wahlknopf.an { color: var(--hell); background: #232c18; border-color: #6a7a52; }
.wahlhinweis { font-size: 11px; letter-spacing: 0.08em; color: #c9ae4a; margin-top: 6px; }
```

- [ ] **Step 2: Versionsmarken hochzählen**

Run: `grep -rn "stil.css?v=" *.html entwurf/*.html`
Expected: Treffer mit `?v=52` (außer `entwurf/uebung2-probe.html`, die schon auf v=53 steht). In jeder Trefferdatei `stil.css?v=52` durch `stil.css?v=53` ersetzen.

- [ ] **Step 3: Tests laufen lassen (Bestand unberührt)**

Run: `node --test tests/*.test.js`
Expected: PASS, 107 Tests.

- [ ] **Step 4: Commit**

```bash
git add stil.css index.html uebersicht.html mission.html entwurf/uebung4-probe.html entwurf/uebung5-probe.html entwurf/instrumente-vorschau.html entwurf/varianten-zurueck.html
git commit -m "Mission 2: Gestaltung für SMT-Bühne und Wahlknöpfe

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Einhängung in die Missionsseite

**Files:**
- Modify: `js/mission.js` (Import, Zuordnung, Fabrikaufruf)
- Modify: `mission.html` (Versionsmarke des Einstiegsskripts)

**Interfaces:**
- Consumes: `erzeugeUebung2` aus Task 4.
- Produces: Mission 2 läuft über die Zuordnung `UEBUNGEN`; die Fabriken erhalten künftig `{ speicher, controls }` (Übung 4 und 5 ignorieren den zweiten Schlüssel unschädlich).

- [ ] **Step 1: `js/mission.js` anpassen**

Import ergänzen:

```js
import { erzeugeUebung2 } from "./uebung2-lauf.js";
```

Die Zuordnung und den Fabrikaufruf ändern von:

```js
const UEBUNGEN = { 4: erzeugeUebung4, 5: erzeugeUebung5 };
const uebung = mission && UEBUNGEN[mission.nr] ? UEBUNGEN[mission.nr]({ speicher }) : null;
```

zu:

```js
const UEBUNGEN = { 2: erzeugeUebung2, 4: erzeugeUebung4, 5: erzeugeUebung5 };
const uebung = mission && UEBUNGEN[mission.nr] ? UEBUNGEN[mission.nr]({ speicher, controls }) : null;
```

Wichtig: Die Zeile muss nach der Erzeugung von `controls` stehen (aktuell steht `const controls = erzeugeControls(speicher);` davor, Reihenfolge prüfen und nötigenfalls die Zuordnungszeilen hinter die controls-Zeile ziehen).

- [ ] **Step 2: Versionsmarke hochzählen**

In `mission.html` die Marke `js/mission.js?v=39` auf `js/mission.js?v=40`.

- [ ] **Step 3: Prüfen**

Run: `node --check js/mission.js && node --test tests/*.test.js`
Expected: Syntax fehlerfrei, PASS 107 Tests.

- [ ] **Step 4: Commit**

```bash
git add js/mission.js mission.html
git commit -m "Mission 2 eingehängt, Übungsfabriken erhalten die Controls

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Sichtprüfung headless gegen die Referenzbilder

**Files:**
- Create (unversioniert): `.superpowers/sdd/seed-mission2.html`

**Interfaces:**
- Consumes: die fertige App aus den Tasks 1 bis 6, `entwurf/uebung2-probe.html`, Referenzbilder unter `entwurf/bilder/smt-referenz-*.jpg`.

- [ ] **Step 1: Server starten und Seed-Seite anlegen**

Run (im Hintergrund): `cd "/Users/o_o/Desktop/Claude/Phase II/App" && python3 -m http.server 8127`

`.superpowers/sdd/seed-mission2.html`:

```html
<!DOCTYPE html><meta charset="utf-8"><script>
localStorage.setItem("p2-profil", "willi");
location.href = "/mission.html?bereich=2";
</script>
```

- [ ] **Step 2: Schirmbilder aufnehmen**

Mit `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` und `BILD=/private/tmp/claude-501/-Users-o-o/5c2e8c8b-ed84-40d9-8351-a99ac7940469/scratchpad`:

```bash
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=6000 --screenshot="$BILD/m2-missionsseite.png" "http://localhost:8127/.superpowers/sdd/seed-mission2.html"
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=5000 --screenshot="$BILD/m2-lauf-alle.png" "http://localhost:8127/entwurf/uebung2-probe.html"
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=5000 --screenshot="$BILD/m2-lauf-stick.png" "http://localhost:8127/entwurf/uebung2-probe.html?auswahl=stick"
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=15000 --screenshot="$BILD/m2-abbruch.png" "http://localhost:8127/entwurf/uebung2-probe.html?abbruch=9000"
```

- [ ] **Step 3: Bilder lesen und gegen Soll und Referenz halten**

Jedes Bild mit dem Read-Werkzeug ansehen, dazu `entwurf/bilder/smt-referenz-vollbild.jpg` und `-anzeige.jpg` als Vergleich lesen:

- `m2-missionsseite.png`: Titel MULTITASKING CONTROLS, neuer Hinweistext, drei Wahlknöpfe (alle an), TESTDAUER-Liste, Probebetrieb-Zeile, Startknopf aktiv.
- `m2-lauf-alle.png`: schwarzer Grund, Rahmen mit Linienkreuz wie im Referenz-Vollbild, Zielkreis mittig, rotes Fadenkreuz, roter Strich oben, Geschwindigkeitsanzeige unten links mit türkisem Bogen, Zahlen 40 bis 160 in der Anordnung des Referenzbilds, roter Sollkeil und SOLL-Text, Kopfzeile "STICK + RUDER + SCHUB · REST 4:5x".
- `m2-lauf-stick.png`: nur Rahmen, Kreuz, Zielkreis und Fadenkreuz; kein Strich, keine Anzeige, Kopfzeile "STICK · REST …".
- `m2-abbruch.png`: Ergebnistafel TEST ABGEBROCHEN mit Punkten, Trefferzeilen je Element, Kombitreffer-Zeile, ABGEBROCHEN-Zeile, Fußzeile mit Dauer und Kombination.

Weicht etwas vom Soll oder erkennbar vom Referenzbild ab (Anordnung des Zahlenkranzes, Bogenlage, Linienfarbe, Proportionen): beheben, Versionsmarken hochzählen, neu aufnehmen, bis es passt.

- [ ] **Step 4: Server beenden und Gesamtlauf**

Server-Prozess beenden, dann:

Run: `node --test tests/*.test.js`
Expected: PASS, 107 Tests.

- [ ] **Step 5: Abschluss-Commit, falls in Step 3 Korrekturen anfielen**

```bash
git add -A ':!.superpowers'
git commit -m "Mission 2: Feinschliff nach Sichtprüfung

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Kein `git push`: Willi sichtet zuerst örtlich und gibt Pushes einzeln frei.
