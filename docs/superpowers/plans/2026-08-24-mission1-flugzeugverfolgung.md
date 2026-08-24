# Mission 1: Flugzeugverfolgung, Bauplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Ziel:** Mission 1 als PMT-Nachbau: Eigenflug mit Stick und Pedalen, Zielkreis auf das vorausfliegende rote Kunstflugzeug legen, eine Sekunde halten, Treffer; echte 3D-Szene mit three.js, wählbare Dauer, zuschaltbare Buchstabenaufgabe (SLA) mit Schusstaste.

**Architektur:** Reine Logik in `js/uebung1.js` (deterministisch, ohne DOM und ohne three.js), Anzeige und 3D-Szene in `js/uebung1-lauf.js`, three.js als feste Datei unter `js/fremd/`. Einhängen über `UEBUNGEN` in `js/mission.js`. Entwurf: `docs/superpowers/specs/2026-08-24-mission1-flugzeugverfolgung-design.md`.

**Werkzeuge:** Vanilla-JS-Module, three.js 0.180.0 (einzige Fremdbibliothek, nur im Laufmodul), `node --test` für alle Logiktests, SVG-Ebene für den Zielkreis, Sprachausgabe des Browsers für die Buchstaben.

## Globale Randbedingungen

- Oberfläche, Bezeichner und Commits auf Deutsch, keine Gedankenstriche, keine Emojis ("Controls" ist erlaubt).
- Nach jeder Änderung an einer eingebundenen Datei die Versionsmarke `?v=N` hochzählen; bei Modulen zählt die Marke des Einstiegsskripts (`js/mission.js?v=…` in `mission.html`, `stil.css?v=…` in allen Einstiegsseiten).
- Reine Logik in eigene Module unter `js/`, Tests unter `tests/`, Lauf: `node --test tests/*.test.js`, alle bestehenden 113 Tests müssen grün bleiben.
- three.js wird ausschließlich von `js/uebung1-lauf.js` eingeführt, nie von Logik oder Tests.
- Bilder ins Repository nur unter `bilder/` (Quellbestand `entwurf/bilder/`).
- `wertung` von Mission 1 bleibt `false` (Probebetrieb).
- Keine kostenpflichtige Erzeugung (Higgsfield) ohne ausdrückliche Freigabe von Willi; der Freigabeschritt steht in Task 9.
- Jede Task endet mit einem eigenen Commit.

---

### Task 1: three.js als Fremddatei einlegen

**Files:**
- Create: `js/fremd/three.module.js`
- Create: `js/fremd/HERKUNFT.md`

**Interfaces:**
- Produces: ES-Modul `js/fremd/three.module.js` mit den Exporten `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `Fog`, `PlaneGeometry`, `MeshLambertMaterial`, `Mesh`, `Group`, `BoxGeometry`, `CylinderGeometry`, `HemisphereLight`, `TextureLoader`, `RepeatWrapping`, `REVISION`.

- [ ] **Step 1: Datei laden**

```bash
cd "/Users/o_o/Desktop/Claude/Phase II/App"
mkdir -p js/fremd
curl -fsSL -o js/fremd/three.module.js "https://unpkg.com/three@0.180.0/build/three.module.js"
```

Falls unpkg nicht antwortet: `https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js`.

- [ ] **Step 2: Prüfen, dass das Modul lädt**

Run: `node --input-type=module -e "import('./js/fremd/three.module.js').then(m => console.log('three', m.REVISION))"`
Expected: `three 180`

- [ ] **Step 3: Herkunftsnotiz schreiben**

`js/fremd/HERKUNFT.md`:

```markdown
# Fremddateien

- `three.module.js`: three.js 0.180.0, MIT-Lizenz, bezogen am 24.08.2026 von
  https://unpkg.com/three@0.180.0/build/three.module.js. Unverändert eingelegt,
  damit die App ohne Fremdserver läuft. Nur `js/uebung1-lauf.js` führt sie ein.
```

- [ ] **Step 4: Commit**

```bash
git add js/fremd/three.module.js js/fremd/HERKUNFT.md
git commit -m "three.js 0.180.0 als Fremddatei für Mission 1"
```

---

### Task 2: Logik, Zustand und Bewegung

**Files:**
- Create: `js/uebung1.js`
- Create: `tests/uebung1.test.js`

**Interfaces:**
- Produces (von späteren Tasks genutzt, Signaturen verbindlich):
  - `TESTDAUERN = [3, 5, 10]`, `HALTEZEIT_MS = 1000`, `KREIS_R = 0.045`, `BILDVERHAELTNIS = 9/16`, `MINDESTABSTAND = 0.18`, `KEGEL`, `SPRUNG`, `MAXROLL = 1.0`
  - `zufallsZiel(rnd) -> {x, y}`
  - `erzeugeLaufzustand(rnd?) -> zustand` mit `{ziel, kreis, roll, nick, drift, halteMs, treffer, deckungMs, testMs, ersterTrefferMs, letzterTrefferMs}`
  - `takt(zustand, eingaben, dtMs, rnd?) -> ereignisse[]` mit `eingaben = {stickX, stickY, ruder}`

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`tests/uebung1.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, HALTEZEIT_MS, KREIS_R, BILDVERHAELTNIS, MINDESTABSTAND, KEGEL, SPRUNG, MAXROLL,
  zufallsZiel, erzeugeLaufzustand, takt,
} from "../js/uebung1.js";

const still = { stickX: 0, stickY: 0, ruder: 0 };
// Fester Zufall: keine Drift (Zielwert 0 entsteht bei rnd()=0.5), planbare Sprünge.
const halb = () => 0.5;

test("Konstanten der Verfolgung", () => {
  assert.deepEqual(TESTDAUERN, [3, 5, 10]);
  assert.equal(HALTEZEIT_MS, 1000);
  assert.ok(KREIS_R > 0 && KREIS_R < 0.1);
  assert.equal(BILDVERHAELTNIS, 9 / 16);
});

test("zufallsZiel liegt im Kegel und nicht in der Mitte", () => {
  let rufe = 0;
  const rnd = () => [0.1, 0.9, 0.5, 0.2][rufe++ % 4];
  for (let i = 0; i < 50; i++) {
    const z = zufallsZiel(rnd);
    assert.ok(z.x >= KEGEL.xMin && z.x <= KEGEL.xMax);
    assert.ok(z.y >= KEGEL.yMin && z.y <= KEGEL.yMax);
    assert.ok(Math.hypot(z.x - 0.5, (z.y - 0.5) * BILDVERHAELTNIS) >= MINDESTABSTAND);
  }
});

test("Anfangszustand: Kreis mittig, Ziel im Kegel", () => {
  const z = erzeugeLaufzustand(halb);
  assert.deepEqual(z.kreis, { x: 0.5, y: 0.5 });
  assert.equal(z.roll, 0);
  assert.equal(z.treffer, 0);
  assert.ok(z.ziel.x >= KEGEL.xMin && z.ziel.x <= KEGEL.xMax);
});

test("Nicken verschiebt das Ziel senkrecht", () => {
  const z = erzeugeLaufzustand(halb);
  const vorher = z.ziel.y;
  takt(z, { ...still, stickY: 1 }, 100, halb);
  assert.ok(z.ziel.y > vorher);
});

test("Gieren verschiebt das Ziel waagerecht entgegen", () => {
  const z = erzeugeLaufzustand(halb);
  const vorher = z.ziel.x;
  takt(z, { ...still, ruder: 1 }, 100, halb);
  assert.ok(z.ziel.x < vorher);
});

test("Rollen baut sich auf, koppelt in die Kurve und bleibt begrenzt", () => {
  const z = erzeugeLaufzustand(halb);
  for (let i = 0; i < 100; i++) takt(z, { ...still, stickX: 1 }, 50, halb);
  assert.ok(z.roll > 0 && z.roll <= MAXROLL);
  z.ziel = { x: 0.6, y: 0.5 };  // frei von der Kegelgrenze, sonst klemmt der Vergleich
  takt(z, still, 100, halb);    // Rollage steht, Kurve zieht das Ziel zur Seite
  assert.ok(z.ziel.x < 0.6);
});

test("Ziel bleibt auch bei langem Vollausschlag im Kegel", () => {
  const z = erzeugeLaufzustand(halb);
  for (let i = 0; i < 2000; i++) takt(z, { stickX: 1, stickY: 1, ruder: 1 }, 50, Math.random);
  assert.ok(z.ziel.x >= KEGEL.xMin && z.ziel.x <= KEGEL.xMax);
  assert.ok(z.ziel.y >= KEGEL.yMin && z.ziel.y <= KEGEL.yMax);
  assert.ok(Math.abs(z.roll) <= MAXROLL);
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag sehen**

Run: `node --test tests/uebung1.test.js`
Expected: FAIL, Modul `../js/uebung1.js` fehlt.

- [ ] **Step 3: Logikmodul schreiben**

`js/uebung1.js`:

```js
// Übungslogik Mission 1 (Flugzeugverfolgung): Nachbau des PMT aus dem ICA.
// Eigenflug: Stick rollt und nickt, Pedale gieren; das Zielflugzeug fliegt
// mit träger Zufallsdrift in einem Kegel voraus. Reine Logik ohne DOM und
// ohne three.js, Zufall und Zeitschritt sind einspeisbar (node --test).
// Die Drifthelfer sind bewusst eine Kopie aus uebung2.js; das gemeinsame
// Laufgerüst zieht die Sammel-Härtung später heraus.

export const TESTDAUERN = [3, 5, 10]; // Minuten
export const HALTEZEIT_MS = 1000;
export const KREIS_R = 0.045;          // Anteil der Bildbreite
export const BILDVERHAELTNIS = 9 / 16; // Höhe zu Breite des Sichtfelds
export const MINDESTABSTAND = 0.18;    // Kreis springt nie näher ans Ziel
export const KEGEL = { xMin: 0.12, xMax: 0.88, yMin: 0.15, yMax: 0.85 };
export const SPRUNG = { xMin: 0.15, xMax: 0.85, yMin: 0.2, yMax: 0.8 };
export const MAXROLL = 1.0;            // rad, etwa 57 Grad

// Raten bei Vollausschlag (je Sekunde) und Driftstärken.
const RATE_NICK = 0.35;
const RATE_GIER = 0.4;
const ROLLRATE = 1.6;
const RUECKSTELL = 0.6;
const NICK_SICHT = 0.5;   // rad Blickneigung je Einheit Nickbewegung
const MAXNICK = 0.3;      // rad
const KOPPLUNG = 0.25;    // Kurvenzug bei vollem Rollen, Einheiten je Sekunde
const DRIFT_ZIEL = 0.06;
const DRIFTWECHSEL_MIN_MS = 1500;
const DRIFTWECHSEL_MAX_MS = 3000;

const begrenze = (w, min, max) => Math.min(max, Math.max(min, w));

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

const abstand = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * BILDVERHAELTNIS);

// Startlage des Zielflugzeugs: im Kegel, deutlich außerhalb der Mitte.
export function zufallsZiel(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const z = {
      x: KEGEL.xMin + rnd() * (KEGEL.xMax - KEGEL.xMin),
      y: KEGEL.yMin + rnd() * (KEGEL.yMax - KEGEL.yMin),
    };
    if (abstand(z, { x: 0.5, y: 0.5 }) >= MINDESTABSTAND) return z;
  }
  return { x: 0.25, y: 0.3 };
}

export function erzeugeLaufzustand(rnd = Math.random) {
  return {
    ziel: zufallsZiel(rnd),
    kreis: { x: 0.5, y: 0.5 },
    roll: 0,
    nick: 0,
    drift: { zx: neueDrift(DRIFT_ZIEL, rnd), zy: neueDrift(DRIFT_ZIEL, rnd) },
    halteMs: 0,
    treffer: 0,
    deckungMs: 0,
    testMs: 0,
    ersterTrefferMs: null,
    letzterTrefferMs: 0,
  };
}

// Ein Zeitschritt: Stick und Pedale bewegen den Blick, das Ziel wandert im
// Sichtfeld entgegen; dazu kommt die eigene Drift des Zielflugzeugs.
export function takt(z, eingaben, dtMs, rnd = Math.random) {
  const dt = dtMs / 1000;

  z.roll = begrenze(z.roll + (eingaben.stickX * ROLLRATE - z.roll * RUECKSTELL) * dt, -MAXROLL, MAXROLL);
  const nickBewegung = eingaben.stickY * RATE_NICK * dt;
  z.nick = begrenze(z.nick + nickBewegung * NICK_SICHT - z.nick * RUECKSTELL * dt, -MAXNICK, MAXNICK);
  const gierBewegung = (eingaben.ruder * RATE_GIER + Math.sin(z.roll) * KOPPLUNG) * dt;

  z.ziel.x = begrenze(z.ziel.x - gierBewegung + taktDrift(z.drift.zx, dtMs, rnd) * dt, KEGEL.xMin, KEGEL.xMax);
  z.ziel.y = begrenze(z.ziel.y + nickBewegung + taktDrift(z.drift.zy, dtMs, rnd) * dt, KEGEL.yMin, KEGEL.yMax);

  z.testMs += dtMs;
  return [];
}
```

Die Trefferprüfung folgt in Task 3; `takt` gibt bis dahin ein leeres Feld zurück.

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung1.test.js`
Expected: PASS (7 Tests).

Run: `node --test tests/*.test.js`
Expected: alle Tests grün, keine Regression.

- [ ] **Step 5: Commit**

```bash
git add js/uebung1.js tests/uebung1.test.js
git commit -m "Mission 1: Laufzustand und Eigenflug-Bewegung"
```

---

### Task 3: Logik, Deckung, Haltezeit und Treffer

**Files:**
- Modify: `js/uebung1.js`
- Modify: `tests/uebung1.test.js`

**Interfaces:**
- Produces:
  - `inDeckung(zustand) -> boolean`
  - `zufallsKreis(ziel, rnd) -> {x, y}` (in `SPRUNG`, Abstand `>= MINDESTABSTAND` vom Ziel, Rückfallwert nach 100 Versuchen)
  - `takt(...)` liefert bei Treffer `[{ treffer: true }]`, zählt `deckungMs`, `halteMs`, `treffer`, `ersterTrefferMs`, `letzterTrefferMs` und setzt `kreis` neu.

- [ ] **Step 1: Fehlschlagende Tests ergänzen**

An `tests/uebung1.test.js` anhängen (Import um `inDeckung, zufallsKreis` erweitern):

```js
test("inDeckung misst den Winkelabstand mit Bildverhältnis", () => {
  const z = erzeugeLaufzustand(halb);
  z.kreis = { x: 0.5, y: 0.5 };
  z.ziel = { x: 0.5 + KREIS_R - 0.001, y: 0.5 };
  assert.equal(inDeckung(z), true);
  z.ziel = { x: 0.5 + KREIS_R + 0.001, y: 0.5 };
  assert.equal(inDeckung(z), false);
  // Senkrecht zählt der Abstand gestaucht: derselbe Versatz in y liegt noch drin.
  z.ziel = { x: 0.5, y: 0.5 + KREIS_R + 0.001 };
  assert.equal(inDeckung(z), true);
});

test("Eine Sekunde Deckung gibt den Treffer, der Kreis springt", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.5 };   // direkt unter dem Kreis
  let ereignisse = [];
  for (let i = 0; i < 10; i++) ereignisse = ereignisse.concat(takt(z, still, 100, halb));
  assert.equal(z.treffer, 1);
  assert.deepEqual(ereignisse, [{ treffer: true }]);
  assert.equal(z.ersterTrefferMs, 1000);
  assert.equal(z.letzterTrefferMs, 1000);
  assert.ok(abstandFuerTest(z.kreis, z.ziel) >= MINDESTABSTAND);
  assert.ok(z.kreis.x >= SPRUNG.xMin && z.kreis.x <= SPRUNG.xMax);
  assert.ok(z.kreis.y >= SPRUNG.yMin && z.kreis.y <= SPRUNG.yMax);
});

test("Verlorene Deckung setzt die Haltezeit zurück", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.5 };
  takt(z, still, 600, halb);
  z.ziel = { x: 0.9, y: 0.5 };   // Deckung weg
  takt(z, still, 100, halb);
  assert.equal(z.halteMs, 0);
  z.ziel = { x: z.kreis.x, y: z.kreis.y };
  for (let i = 0; i < 9; i++) takt(z, still, 100, halb);
  assert.equal(z.treffer, 0);    // 900 ms reichen nicht
  takt(z, still, 100, halb);
  assert.equal(z.treffer, 1);
});

test("Deckungszeit summiert sich", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.5 };
  takt(z, still, 400, halb);
  assert.equal(z.deckungMs, 400);
});

test("zufallsKreis: Schleifenwächter greift bei sturem Zufall", () => {
  const ziel = { x: 0.5, y: 0.5 };
  const stur = () => 0.5;        // träfe immer die Zielnähe
  const k = zufallsKreis(ziel, stur);
  assert.ok(abstandFuerTest(k, ziel) >= MINDESTABSTAND);
});
```

Oben in der Testdatei die Hilfe ergänzen:

```js
const abstandFuerTest = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * BILDVERHAELTNIS);
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag sehen**

Run: `node --test tests/uebung1.test.js`
Expected: FAIL, `inDeckung`/`zufallsKreis` fehlen beziehungsweise `takt` liefert keine Treffer.

- [ ] **Step 3: Logik ergänzen**

In `js/uebung1.js` vor `erzeugeLaufzustand` einfügen:

```js
// Neusetzung des Kreises nach einem Treffer: im Sprungbereich und deutlich
// weg vom Ziel, damit jede Aufgabe echte Arbeit verlangt. Der Schleifen-
// wächter verhindert Endlosläufe bei sturem Zufall.
export function zufallsKreis(ziel, rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const k = {
      x: SPRUNG.xMin + rnd() * (SPRUNG.xMax - SPRUNG.xMin),
      y: SPRUNG.yMin + rnd() * (SPRUNG.yMax - SPRUNG.yMin),
    };
    if (abstand(k, ziel) >= MINDESTABSTAND) return k;
  }
  return abstand({ x: SPRUNG.xMin, y: SPRUNG.yMin }, ziel) >= MINDESTABSTAND
    ? { x: SPRUNG.xMin, y: SPRUNG.yMin }
    : { x: SPRUNG.xMax, y: SPRUNG.yMax };
}

export function inDeckung(z) {
  return abstand(z.ziel, z.kreis) <= KREIS_R;
}
```

In `takt` den Schluss ersetzen (`z.testMs += dtMs; return [];` weg, stattdessen):

```js
  z.testMs += dtMs;
  const ereignisse = [];
  if (inDeckung(z)) {
    z.deckungMs += dtMs;
    z.halteMs += dtMs;
    if (z.halteMs >= HALTEZEIT_MS) {
      z.treffer += 1;
      if (z.ersterTrefferMs == null) z.ersterTrefferMs = z.testMs;
      z.letzterTrefferMs = z.testMs;
      z.halteMs = 0;
      z.kreis = zufallsKreis(z.ziel, rnd);
      ereignisse.push({ treffer: true });
    }
  } else {
    z.halteMs = 0;
  }
  return ereignisse;
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung1.test.js`
Expected: PASS (12 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/uebung1.js tests/uebung1.test.js
git commit -m "Mission 1: Deckung, Haltezeit und Kreissprung"
```

---

### Task 4: Logik, Ergebnisrechnung

**Files:**
- Modify: `js/uebung1.js`
- Modify: `tests/uebung1.test.js`

**Interfaces:**
- Produces:
  - `deckungsquote(zustand) -> number` (ganzzahlige Prozent)
  - `ergebnisWerte(zustand) -> { treffer, deckungsquote, ersterTrefferS, mittelS }` (`ersterTrefferS`/`mittelS` sind Sekunden mit einer Nachkommastelle oder `null`)

- [ ] **Step 1: Fehlschlagende Tests ergänzen**

An `tests/uebung1.test.js` anhängen (Import um `deckungsquote, ergebnisWerte` erweitern):

```js
test("Deckungsquote in Prozent", () => {
  const z = erzeugeLaufzustand(halb);
  z.testMs = 60_000;
  z.deckungMs = 21_000;
  assert.equal(deckungsquote(z), 35);
  assert.equal(deckungsquote(erzeugeLaufzustand(halb)), 0); // ohne Laufzeit
});

test("Ergebniswerte: Zeiten in Sekunden mit einer Nachkommastelle", () => {
  const z = erzeugeLaufzustand(halb);
  z.testMs = 120_000;
  z.deckungMs = 30_000;
  z.treffer = 4;
  z.ersterTrefferMs = 8_460;
  z.letzterTrefferMs = 100_000;
  assert.deepEqual(ergebnisWerte(z), {
    treffer: 4, deckungsquote: 25, ersterTrefferS: 8.5, mittelS: 25,
  });
});

test("Ergebniswerte ohne Treffer bleiben leer", () => {
  const z = erzeugeLaufzustand(halb);
  z.testMs = 60_000;
  const w = ergebnisWerte(z);
  assert.equal(w.ersterTrefferS, null);
  assert.equal(w.mittelS, null);
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag sehen**

Run: `node --test tests/uebung1.test.js`
Expected: FAIL, `deckungsquote` fehlt.

- [ ] **Step 3: Logik ergänzen**

Ans Ende von `js/uebung1.js`:

```js
// Führende Kennzahl: Anteil der Laufzeit, in der der Kreis auf dem Flugzeug
// lag, in ganzen Prozent. Die Zeiten daneben folgen den Messgrößen des
// Originals (Zeit bis zum ersten Treffer, mittlere Zeit je Treffer).
export function deckungsquote(z) {
  if (!z.testMs) return 0;
  return Math.round((z.deckungMs / z.testMs) * 100);
}

const zehntel = (ms) => Math.round(ms / 100) / 10;

export function ergebnisWerte(z) {
  return {
    treffer: z.treffer,
    deckungsquote: deckungsquote(z),
    ersterTrefferS: z.ersterTrefferMs == null ? null : zehntel(z.ersterTrefferMs),
    mittelS: z.treffer ? zehntel(z.letzterTrefferMs / z.treffer) : null,
  };
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung1.test.js`
Expected: PASS (15 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/uebung1.js tests/uebung1.test.js
git commit -m "Mission 1: Deckungsquote und Ergebniswerte"
```

---

### Task 5: Logik, Buchstabenreihe und SLA-Zähler

**Files:**
- Modify: `js/uebung1.js`
- Modify: `tests/uebung1.test.js`

**Interfaces:**
- Produces:
  - `BUCHSTABEN_ABSTAND_MS = 2000`, `SLA_FENSTER_MS = 2000`
  - `erzeugeBuchstabenreihe(dauerMin, rnd?) -> [{ b, sla }]` (je Minute genau eine Folge S, L, A mit `sla: true` auf dem A und genau eine Falle S, L, anderer Buchstabe; sonst Buchstaben ohne S, L, A)
  - `erzeugeSlaZaehler(reihe) -> { sprich(index, tMs), druck(tMs), auswertung() }`, `auswertung() -> { erkannt, verpasst, fehlalarm }`

- [ ] **Step 1: Fehlschlagende Tests ergänzen**

An `tests/uebung1.test.js` anhängen (Import erweitern um `BUCHSTABEN_ABSTAND_MS, SLA_FENSTER_MS, erzeugeBuchstabenreihe, erzeugeSlaZaehler`):

```js
test("Buchstabenreihe: Länge, eine Folge und eine Falle je Minute", () => {
  const reihe = erzeugeBuchstabenreihe(3, Math.random);
  assert.equal(reihe.length, Math.floor(3 * 60_000 / BUCHSTABEN_ABSTAND_MS));
  assert.equal(reihe.filter((e) => e.sla).length, 3);
  const text = reihe.map((e) => e.b).join("");
  assert.equal((text.match(/SLA/g) ?? []).length, 3);   // keine zufälligen Extra-Folgen
  assert.equal((text.match(/SL[^A]/g) ?? []).length, 3); // die Fallen
});

test("Buchstabenreihe ist mit gleichem Zufall gleich", () => {
  const zaehler = () => { let n = 0; return () => (Math.sin(n++) + 1) / 2; };
  const a = erzeugeBuchstabenreihe(3, zaehler());
  const b = erzeugeBuchstabenreihe(3, zaehler());
  assert.deepEqual(a, b);
});

test("SLA-Zähler: erkannt, Fehlalarm und verpasst", () => {
  const reihe = [
    { b: "S", sla: false }, { b: "L", sla: false }, { b: "A", sla: true },
    { b: "K", sla: false },
    { b: "S", sla: false }, { b: "L", sla: false }, { b: "A", sla: true },
  ];
  const z = erzeugeSlaZaehler(reihe);
  z.sprich(0, 0); z.sprich(1, 2000); z.sprich(2, 4000);
  z.druck(5000);                      // binnen 2 s nach dem A: erkannt
  z.druck(5500);                      // Fenster verbraucht: Fehlalarm
  z.sprich(3, 6000);
  z.druck(9000);                      // kein offenes A: Fehlalarm
  z.sprich(4, 8000); z.sprich(5, 10000); z.sprich(6, 12000); // zweites A ohne Druck
  assert.deepEqual(z.auswertung(), { erkannt: 1, verpasst: 1, fehlalarm: 2 });
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag sehen**

Run: `node --test tests/uebung1.test.js`
Expected: FAIL, `erzeugeBuchstabenreihe` fehlt.

- [ ] **Step 3: Logik ergänzen**

Ans Ende von `js/uebung1.js`:

```js
// Buchstabenaufgabe aus Testphase 3 des Originals: fortlaufende Reihe,
// die Folge S-L-A wird mit der Schusstaste bestätigt. Das Alphabet der
// Fülltakte enthält weder S noch L noch A, darum entstehen nie ungeplante
// Folgen. Je Minute eine echte Folge und eine Falle S-L-x.
export const BUCHSTABEN_ABSTAND_MS = 2000;
export const SLA_FENSTER_MS = 2000;
const FUELLER = "BCDEFGHKMNPRTUWXZ".split("");

export function erzeugeBuchstabenreihe(dauerMin, rnd = Math.random) {
  const jeMinute = Math.floor(60_000 / BUCHSTABEN_ABSTAND_MS);
  const reihe = Array.from({ length: dauerMin * jeMinute }, () =>
    ({ b: FUELLER[Math.floor(rnd() * FUELLER.length)], sla: false }));
  for (let minute = 0; minute < dauerMin; minute++) {
    const von = minute * jeMinute;
    // Zwei getrennte Drittel der Minute, damit Folge und Falle nie überlappen.
    const folgeStart = von + 1 + Math.floor(rnd() * (jeMinute / 3 - 3));
    const falleStart = von + Math.floor(jeMinute / 2) + Math.floor(rnd() * (jeMinute / 3 - 3));
    reihe[folgeStart] = { b: "S", sla: false };
    reihe[folgeStart + 1] = { b: "L", sla: false };
    reihe[folgeStart + 2] = { b: "A", sla: true };
    reihe[falleStart] = { b: "S", sla: false };
    reihe[falleStart + 1] = { b: "L", sla: false };
    reihe[falleStart + 2] = { b: FUELLER[Math.floor(rnd() * FUELLER.length)], sla: false };
  }
  return reihe;
}

export function erzeugeSlaZaehler(reihe) {
  const offen = [];
  let erkannt = 0;
  let fehlalarm = 0;
  return {
    sprich(index, tMs) { if (reihe[index]?.sla) offen.push(tMs); },
    druck(tMs) {
      const i = offen.findIndex((t) => tMs >= t && tMs - t <= SLA_FENSTER_MS);
      if (i >= 0) { offen.splice(i, 1); erkannt += 1; } else { fehlalarm += 1; }
    },
    // Auswertung am Testende: verpasst sind alle geplanten Folgen ohne Druck.
    auswertung() {
      const geplant = reihe.filter((e) => e.sla).length;
      return { erkannt, verpasst: geplant - erkannt, fehlalarm };
    },
  };
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung1.test.js`
Expected: PASS (18 Tests). Danach `node --test tests/*.test.js`: alles grün.

- [ ] **Step 5: Commit**

```bash
git add js/uebung1.js tests/uebung1.test.js
git commit -m "Mission 1: Buchstabenreihe und SLA-Zähler"
```

---

### Task 6: Schusstaste in controls.js

**Files:**
- Modify: `js/controls.js`

**Interfaces:**
- Produces (von Task 7 und 8 genutzt):
  - `controls.schusstasteVon() -> { geraet, knopf } | null`
  - `controls.starteSchussFang(beiTreffer)` (merkt sich den nächsten neu gedrückten Knopf eines Geräts, speichert als Einstellung `"schusstaste"`)
  - `controls.brichSchussFangAb()`
  - `controls.schussGedrueckt() -> boolean` (Flanke: zugewiesene Schusstaste oder Leertaste)

- [ ] **Step 1: Zustand und Laden erweitern**

In `erzeugeControls` bei den Variablen (`let knopfAlt = false;`) ergänzen:

```js
  let schusstaste = null;    // {geraet, knopf}
  let schussAlt = false;
  let fangKnopf = false;
```

In `lade()` ergänzen:

```js
      schusstaste = await speicher.ladeEinstellung("schusstaste", null);
```

- [ ] **Step 2: Neue Methoden einbauen**

Nach `knopfGedrueckt()` einfügen:

```js
    schusstasteVon() { return schusstaste; },

    // Flanke der Schusstaste: der zugewiesene Geräteknopf, Ersatz Leertaste.
    schussGedrueckt() {
      let jetzt = tasten.has("Space");
      if (schusstaste) {
        const pad = pads().find((p) => p.id === schusstaste.geraet);
        if (pad?.buttons[schusstaste.knopf]?.pressed) jetzt = true;
      }
      const flanke = jetzt && !schussAlt;
      schussAlt = jetzt;
      return flanke;
    },

    // Anlernen wie beim Achsen-Fang: der nächste neu gedrückte Knopf eines
    // Geräts wird die Schusstaste und landet in den Einstellungen.
    starteSchussFang(beiTreffer) {
      const basis = pads().map((p) => ({ geraet: p.id, knoepfe: p.buttons.map((k) => k.pressed) }));
      fangKnopf = true;
      const pruefe = () => {
        if (!fangKnopf) return;
        for (const p of pads()) {
          const alt = basis.find((b) => b.geraet === p.id);
          for (let k = 0; k < p.buttons.length; k++) {
            if (p.buttons[k].pressed && !alt?.knoepfe[k]) {
              schusstaste = { geraet: p.id, knopf: k };
              speicher.setzeEinstellung("schusstaste", schusstaste);
              fangKnopf = false;
              beiTreffer(schusstaste);
              return;
            }
          }
        }
        requestAnimationFrame(pruefe);
      };
      requestAnimationFrame(pruefe);
    },

    brichSchussFangAb() { fangKnopf = false; },
```

- [ ] **Step 3: Zeile im Controls-Dialog ergänzen**

In `oeffneDialog()` nach `${rollenZeilen}` in der Vorlage einfügen:

```js
        <div class="rollenzeile">
          <span class="rollentitel">Schusstaste</span>
          <span class="rollenstand" id="stand-schuss"></span>
          <button class="punkt klein" data-tat="schuss">Zuweisen</button>
        </div>
```

In `zeigeStand` am Ende ergänzen:

```js
        const s = this.schusstasteVon();
        dialog.querySelector("#stand-schuss").textContent =
          s ? `${s.geraet.slice(0, 18)}… Knopf ${s.knopf}` : "nicht zugewiesen · Leertaste";
```

Im Klick-Handler des Dialogs ergänzen:

```js
        if (tat === "schuss") {
          this.brichSchussFangAb();
          e.target.textContent = "Drücken…";
          this.starteSchussFang(() => { e.target.textContent = "Zuweisen"; zeigeStand(); });
        }
```

Und in `schliesse` neben `this.brichFangAb();` auch `this.brichSchussFangAb();` aufrufen.

- [ ] **Step 4: Tests und Syntax prüfen**

Run: `node --check js/controls.js && node --test tests/*.test.js`
Expected: Syntax in Ordnung, alle Tests grün (controls.js hat keine node-Tests, Gamepad und DOM gibt es dort nicht).

- [ ] **Step 5: Commit**

```bash
git add js/controls.js
git commit -m "Controls: Schusstaste anlernbar mit Leertaste als Ersatz"
```

---

### Task 7: Einstellungsfeld und Einbindung

**Files:**
- Create: `js/uebung1-lauf.js` (erste Stufe: Hinweis, Einstellungen, Feld; `starte` folgt in Task 8)
- Modify: `js/mission.js:8-10,20`
- Modify: `js/missionen.js:7`
- Modify: `mission.html` (Versionsmarke)

**Interfaces:**
- Consumes: `TESTDAUERN` aus `js/uebung1.js`, `speicher.ladeEinstellung/setzeEinstellung`, `controls.schusstasteVon/starteSchussFang/brichSchussFangAb`, `controls.geraete()`
- Produces: `erzeugeUebung1({ speicher, controls }) -> { hinweis, ladeEinstellung, zeichneFeld, starte }` (Vertrag wie `erzeugeUebung2`)

- [ ] **Step 1: Laufmodul mit Einstellungsfeld anlegen**

`js/uebung1-lauf.js`:

```js
// Ablauf Mission 1 (Flugzeugverfolgung) im Vollbild: PMT-Nachbau in echter
// 3D-Szene. Die Logik rechnet in uebung1.js, hier laufen Achsenabfrage,
// three.js-Zeichnung, Buchstabenausgabe und Tafeln.
import {
  TESTDAUERN, erzeugeLaufzustand, takt, ergebnisWerte,
  BUCHSTABEN_ABSTAND_MS, erzeugeBuchstabenreihe, erzeugeSlaZaehler,
} from "./uebung1.js";

export function erzeugeUebung1({ speicher, controls }) {
  const hinweis = "Nachbau der Flugzeugverfolgung der Eignungsfeststellung: Steuere mit Stick "
    + "und Pedalen, bis der Zielkreis auf dem vorausfliegenden Flugzeug liegt, und halte ihn "
    + "eine Sekunde dort. Nach jedem Treffer springt der Kreis an eine neue Stelle. Wahlweise "
    + "läuft die Buchstabenaufgabe: Bei der Folge S-L-A die Schusstaste drücken.";

  let einstellung = { dauer: 5, sla: false };

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung1-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="dauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.dauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>
      <div class="wahlzeile"><span class="wahltitel">BUCHSTABEN</span>
        <button type="button" class="wahlknopf ${einstellung.sla ? "an" : ""}" data-element="sla"
          aria-pressed="${einstellung.sla}">SLA-AUFGABE</button></div>
      <p class="wahlhinweis" id="u1-schusshinweis" hidden></p>`;

    const schusshinweis = feld.querySelector("#u1-schusshinweis");
    const zeigeSchussstand = () => {
      if (!einstellung.sla) { schusshinweis.hidden = true; return; }
      const s = controls.schusstasteVon();
      schusshinweis.hidden = false;
      schusshinweis.textContent = s
        ? `Schusstaste: Knopf ${s.knopf}. Ersatz ist die Leertaste.`
        : "Keine Schusstaste zugewiesen, es zählt die Leertaste.";
    };

    feld.onclick = (e) => {
      const knopf = e.target.closest(".wahlknopf");
      if (!knopf) return;
      einstellung.sla = !einstellung.sla;
      knopf.classList.toggle("an", einstellung.sla);
      knopf.setAttribute("aria-pressed", String(einstellung.sla));
      speicher.setzeEinstellung("uebung1-einstellung", einstellung);
      // Beim ersten Einschalten mit Gerät die Schusstaste gleich anlernen.
      if (einstellung.sla && !controls.schusstasteVon() && controls.geraete().length) {
        schusshinweis.hidden = false;
        schusshinweis.textContent = "Schusstaste am Joystick drücken…";
        controls.starteSchussFang(() => zeigeSchussstand());
        return;
      }
      controls.brichSchussFangAb();
      zeigeSchussstand();
    };
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung1-einstellung", einstellung);
    };
    zeigeSchussstand();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    // Task 8 baut hier die 3D-Szene ein; bis dahin sofort zurück zur Mission.
    registriereAbbruch(() => {});
    tuer.oeffne().then(() => beiEnde(null));
  }

  return { hinweis, ladeEinstellung, zeichneFeld, starte };
}
```

- [ ] **Step 2: Einhängen**

`js/mission.js`, bei den Importen ergänzen:

```js
import { erzeugeUebung1 } from "./uebung1-lauf.js";
```

Zeile 20 ersetzen durch:

```js
const UEBUNGEN = { 1: erzeugeUebung1, 2: erzeugeUebung2, 4: erzeugeUebung4, 5: erzeugeUebung5 };
```

`js/missionen.js` Zeile 7: `kennzahlName: "Treffer %"` wird `kennzahlName: "Deckung %"`:

```js
  { nr: 1, name: "Flugzeugverfolgung", kennzahlName: "Deckung %", wertung: false, maximal: 100 },
```

`mission.html`: `js/mission.js?v=48` auf `?v=49`.

- [ ] **Step 3: Prüfen**

Run: `node --check js/uebung1-lauf.js && node --test tests/*.test.js`
Expected: Syntax in Ordnung, alle Tests grün.

Örtlich: `http://localhost:8000/mission.html?bereich=1` zeigt Hinweis, Dauerwahl und SLA-Knopf; Start fährt die Tür zu und wieder auf (noch ohne Szene).

- [ ] **Step 4: Commit**

```bash
git add js/uebung1-lauf.js js/mission.js js/missionen.js mission.html
git commit -m "Mission 1 eingehängt: Einstellungsfeld, Kennzahl Deckung %"
```

---

### Task 8: 3D-Szene, Zielkreis und Lauf

**Files:**
- Modify: `js/uebung1-lauf.js` (Funktion `starte` vollständig)
- Modify: `stil.css` (Regeln für `.uebung1` und `.zielkreis`)
- Modify: `mission.html`, `index.html`, `uebersicht.html` (Marke `stil.css?v=55`), `mission.html` (`mission.js?v=50`)

**Interfaces:**
- Consumes: alle Exporte aus Task 2 bis 5, `controls.wert/schussGedrueckt`, three.js aus `js/fremd/three.module.js`, Tafel-Klassen aus `stil.css` (`laufschleier`, `testkopf`, `ergebnisschicht`, `frage`, `ergebnisgross`, `ergebniszeilen`, `ergebnisfuss`, `abgebrochen`, `punkt`, `smtblitz`)
- Produces: vollständiger Laufzyklus; `beiEnde({ kennzahl, daten })` mit `daten.art = "verfolgung"`

- [ ] **Step 1: starte() durch die echte Fassung ersetzen**

Kopf der Datei um den three.js-Import ergänzen:

```js
import * as THREE from "./fremd/three.module.js";
```

`starte` vollständig ersetzen:

```js
  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const { dauer, sla } = einstellung;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung1";
    schleier.innerHTML = `
      <canvas class="himmelbild"></canvas>
      <svg class="zielkreis" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke-width="4"/>
        <line x1="50" y1="8" x2="50" y2="92" stroke-width="4"/>
        <line x1="8" y1="50" x2="92" y2="50" stroke-width="4"/>
      </svg>
      <div class="testkopf"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const kopf = schleier.querySelector(".testkopf");
    const kreisBild = schleier.querySelector(".zielkreis");
    const leinwand = schleier.querySelector(".himmelbild");

    // 3D-Szene: Kamera in fester Höhe, Bodenebene mit Stadtbild, Dunst zum
    // Horizont. Das Zielflugzeug hängt an der Kamera und wird je Takt aus dem
    // Sichtfeldanteil der Logik gestellt; der Himmel ist der Seitengrund
    // hinter der durchsichtigen Leinwand.
    const BODENHOEHE = 420;
    const FLUGDISTANZ = 260;
    let drei = null;
    try {
      const renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      const szene = new THREE.Scene();
      szene.fog = new THREE.Fog(0xcfd9e2, 1200, 6500);
      const kamera = new THREE.PerspectiveCamera(62, 16 / 9, 1, 9000);
      szene.add(kamera);
      szene.add(new THREE.HemisphereLight(0xffffff, 0x565f4c, 1.05));

      const bodenStoff = new THREE.MeshLambertMaterial({ color: 0x66735f });
      const boden = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), bodenStoff);
      boden.rotation.x = -Math.PI / 2;
      boden.position.y = -BODENHOEHE;
      szene.add(boden);
      // Pfad am Modul verankert, damit auch die Probeseite unter entwurf/
      // dieselbe Datei findet (der Lader löst sonst an der Seitenadresse auf).
      new THREE.TextureLoader().load(new URL("../bilder/stadt.jpg", import.meta.url).href, (t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(48, 48);
        bodenStoff.map = t;
        bodenStoff.color.set(0xffffff);
        bodenStoff.needsUpdate = true;
      }, undefined, () => {}); // ohne Bild bleibt die Grundfarbe stehen

      // Rotes Kunstflugzeug aus Grundkörpern: Rumpf, zwei Tragflächen, Leitwerk.
      const rot = new THREE.MeshLambertMaterial({ color: 0xc23a30 });
      const flugzeug = new THREE.Group();
      const rumpf = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 16, 8), rot);
      rumpf.rotation.x = Math.PI / 2;
      const flaecheOben = new THREE.Mesh(new THREE.BoxGeometry(22, 0.7, 4), rot);
      flaecheOben.position.set(0, 2.6, 1);
      const flaecheUnten = new THREE.Mesh(new THREE.BoxGeometry(20, 0.7, 4), rot);
      flaecheUnten.position.set(0, -1.4, 1);
      const leitwerk = new THREE.Mesh(new THREE.BoxGeometry(7, 0.6, 2.6), rot);
      leitwerk.position.set(0, 0.6, 7.4);
      const seitenflosse = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 2.6), rot);
      seitenflosse.position.set(0, 2.2, 7.4);
      flugzeug.add(rumpf, flaecheOben, flaecheUnten, leitwerk, seitenflosse);
      kamera.add(flugzeug);
      drei = { renderer, szene, kamera, flugzeug };
    } catch {
      drei = null; // ohne WebGL läuft der Test nicht, der Start wird abgebrochen
    }
    if (!drei) {
      schleier.remove();
      tuer.oeffne().then(() => beiEnde(null));
      return;
    }

    const zustand = erzeugeLaufzustand();
    const reihe = sla ? erzeugeBuchstabenreihe(dauer) : [];
    const zaehler = sla ? erzeugeSlaZaehler(reihe) : null;
    let gesprochen = 0;
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
      speechSynthesis?.cancel?.();
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      drei.renderer.dispose();
      schleier.remove();
    };
    const beiVollbildwechsel = () => { if (!document.fullscreenElement) verlasse?.(); };
    const beiSichtwechsel = () => { if (document.hidden) verlasse?.(); };
    let verlasse = () => zeigeErgebnis(false);
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const passeGroesseAn = () => {
      const b = schleier.clientWidth;
      const h = schleier.clientHeight;
      drei.renderer.setSize(b, h, false);
      drei.kamera.aspect = b / h;
      drei.kamera.updateProjectionMatrix();
    };
    passeGroesseAn();
    addEventListener("resize", passeGroesseAn);

    const sprichBuchstaben = () => {
      while (sla && gesprochen < reihe.length && zustand.testMs >= gesprochen * BUCHSTABEN_ABSTAND_MS) {
        const eintrag = reihe[gesprochen];
        zaehler.sprich(gesprochen, zustand.testMs);
        const laut = new SpeechSynthesisUtterance(eintrag.b);
        laut.lang = "de-DE";
        laut.rate = 1.15;
        speechSynthesis.speak(laut);
        gesprochen += 1;
      }
    };

    const zeichne = () => {
      const { kamera, flugzeug, renderer, szene } = drei;
      kamera.rotation.set(zustand.nick, 0, -zustand.roll);
      // Sichtfeldanteil in Kameraraum: x über die halbe Bildbreite bei der
      // Flugdistanz, y gestaucht um das Bildverhältnis.
      const halbeBreite = Math.tan((kamera.fov * Math.PI) / 360) * kamera.aspect * FLUGDISTANZ;
      flugzeug.position.set(
        (zustand.ziel.x - 0.5) * 2 * halbeBreite,
        -(zustand.ziel.y - 0.5) * 2 * halbeBreite * (9 / 16),
        -FLUGDISTANZ,
      );
      flugzeug.rotation.z = -zustand.drift.zx.wert * 6; // eigene Kurve neigt die Flächen
      renderer.render(szene, kamera);

      kreisBild.style.left = `${zustand.kreis.x * 100}%`;
      kreisBild.style.top = `${zustand.kreis.y * 100}%`;
      kreisBild.classList.toggle("deckung", zustand.halteMs > 0);

      const rest = Math.max(0, testende - performance.now());
      kopf.textContent = `VERFOLGUNG${sla ? " + SLA" : ""} · REST ${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
    };

    const schleife = (jetzt) => {
      if (beendet || ergebnisOffen || !laeuft) return;
      const dtMs = Math.min(50, jetzt - vorher || 16);
      vorher = jetzt;
      const eingaben = {
        stickX: controls.wert("stickX"),
        stickY: controls.wert("stickY"),
        ruder: controls.wert("ruder"),
      };
      const ereignisse = takt(zustand, eingaben, dtMs);
      for (const e of ereignisse) {
        if (e.treffer) {
          kreisBild.classList.add("smtblitz");
          spaeter(() => kreisBild.classList.remove("smtblitz"), 220);
        }
      }
      if (sla && controls.schussGedrueckt()) zaehler.druck(zustand.testMs);
      sprichBuchstaben();
      zeichne();
      if (performance.now() >= testende) { zeigeErgebnis(true); return; }
      requestAnimationFrame(schleife);
    };

    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      for (const t of zeitgeber) clearTimeout(t);
      speechSynthesis?.cancel?.();
      removeEventListener("resize", passeGroesseAn);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const werte = ergebnisWerte(zustand);
      const slaWerte = zaehler?.auswertung();
      const zeilen = [
        `<span>Treffer: ${werte.treffer}</span>`,
        `<span>Zeit bis zum ersten Treffer: ${werte.ersterTrefferS == null ? "–" : `${werte.ersterTrefferS} s`}</span>`,
        `<span>Mittlere Zeit je Treffer: ${werte.mittelS == null ? "–" : `${werte.mittelS} s`}</span>`,
        slaWerte ? `<span>SLA: ${slaWerte.erkannt} erkannt · ${slaWerte.verpasst} verpasst · ${slaWerte.fehlalarm} Fehlalarm</span>` : "",
      ].join("");
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${werte.deckungsquote} %</div>
        <div class="ergebniszeilen">${zeilen}</div>
        <button class="punkt" id="u1-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>${dauer} min Testdauer${sla ? " · SLA-Aufgabe" : ""}</span>
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
          kennzahl: werte.deckungsquote,
          daten: {
            art: "verfolgung",
            dauerMin: dauer,
            sla,
            treffer: werte.treffer,
            deckungsquote: werte.deckungsquote,
            ersterTrefferS: werte.ersterTrefferS,
            mittelS: werte.mittelS,
            ...(slaWerte ?? {}),
          },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u1-fertig").addEventListener("click", schliesse);
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
```

- [ ] **Step 2: Gestaltung ergänzen**

Ans Ende des Missions-2-Blocks in `stil.css` anschließen:

```css
/* Mission 1: Verfolgungsszene mit Himmelsverlauf hinter der 3D-Leinwand */
.laufschleier.uebung1 {
  background: linear-gradient(180deg, #4a7ac0 0%, #8fb0d9 52%, #d5e2ec 70%, #e9eff3 100%);
}
.uebung1 .himmelbild { position: absolute; inset: 0; width: 100%; height: 100%; }
.uebung1 .zielkreis {
  position: absolute;
  width: 9%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  stroke: #35e0d0;
  pointer-events: none;
}
.uebung1 .zielkreis.deckung { stroke: #e5312b; }
```

Der Kreisdurchmesser 9 % entspricht `2 * KREIS_R` der Logik; wer einen Wert ändert, zieht den anderen nach.

- [ ] **Step 3: Versionsmarken hochzählen**

- `mission.html`: `js/mission.js?v=49` auf `?v=50` und `stil.css?v=54` auf `?v=55`
- `index.html`, `uebersicht.html`: `stil.css?v=54` auf `?v=55`

- [ ] **Step 4: Prüfen**

Run: `node --check js/uebung1-lauf.js && node --test tests/*.test.js`
Expected: Syntax in Ordnung, alle Tests grün.

Örtlich: Mission 1 starten; Szene mit Horizont, Boden in Grundfarbe (Bild folgt in Task 9), rotes Flugzeug, Zielkreis wandert mit den Achsen, Treffer blitzen, Tafel erscheint.

- [ ] **Step 5: Commit**

```bash
git add js/uebung1-lauf.js stil.css mission.html index.html uebersicht.html
git commit -m "Mission 1: 3D-Szene, Zielkreis und vollständiger Lauf"
```

---

### Task 9: Bodenbild über Higgsfield

**Files:**
- Create: `bilder/stadt.jpg` (und Quellfassungen unter `entwurf/bilder/`)

**Interfaces:**
- Consumes: den Ladepfad `bilder/stadt.jpg` aus Task 8 (der Code steht schon, ohne Datei bleibt die Grundfarbe).

- [ ] **Step 1: Freigabe einholen (Pflicht, keine Erzeugung ohne Ja von Willi)**

Willi den Prompt vorlegen, sinngemäß: nahtlos kachelbares Luftbild einer mitteleuropäischen Stadt senkrecht von oben aus großer Höhe, Straßenraster, Häuserblöcke, gedeckte Grün- und Grautöne wie in `entwurf/bilder/pmt-referenz-schirm.jpg`, keine Wolken, kein Text. Erst nach ausdrücklicher Freigabe erzeugen.

- [ ] **Step 2: Erzeugen, sichten, zuschneiden**

Erzeugte Fassungen unter `entwurf/bilder/stadt-*.jpg` ablegen, Willis Wahl auf Kachelbarkeit prüfen (Ränder vergleichen), als `bilder/stadt.jpg` in Zielgröße 2048 mal 2048 exportieren.

- [ ] **Step 3: Örtlich sichten**

Mission 1 starten: Boden zeigt das Stadtbild, der Dunst verschluckt die Kachelwiederholung zum Horizont. Wirkung mit `entwurf/bilder/pmt-referenz-schirm.jpg` vergleichen.

- [ ] **Step 4: Commit**

```bash
git add bilder/stadt.jpg entwurf/bilder/stadt-*.jpg
git commit -m "Mission 1: Stadtbild als Bodentextur"
```

---

### Task 10: Probeseite, Sichtprüfung und Abschluss

**Files:**
- Create: `entwurf/uebung1-probe.html`

**Interfaces:**
- Consumes: `erzeugeUebung1` aus `js/uebung1-lauf.js`, `erzeugeHangartuer` aus `js/hangartuer.js`

- [ ] **Step 1: Probeseite anlegen**

`entwurf/uebung1-probe.html`:

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Übung 1 · Probe</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../stil.css?v=55">
</head>
<body>
<script type="module">
  // Probeaufbau ohne App-Rahmen: gestellte Achsen (Sinusfahrt), damit sich
  // Blick, Ziel und Kreis sichtbar bewegen. ?dauer=<min> wählt die Dauer,
  // ?sla=1 schaltet die Buchstabenaufgabe zu, ?abbruch=<ms> bricht ab.
  import { erzeugeUebung1 } from "../js/uebung1-lauf.js";
  import { erzeugeHangartuer } from "../js/hangartuer.js";
  const params = new URLSearchParams(location.search);
  const dauer = Number(params.get("dauer")) || 3;
  const sla = params.get("sla") === "1";
  const speicher = {
    ladeEinstellung: async () => ({ dauer, sla }),
    setzeEinstellung: async () => {},
  };
  const start = performance.now();
  const controls = {
    wert(rolle) {
      const t = (performance.now() - start) / 1000;
      const kurven = {
        stickX: Math.sin(t * 0.6) * 0.5,
        stickY: Math.cos(t * 0.5) * 0.4,
        ruder: Math.sin(t * 0.9) * 0.4,
      };
      return kurven[rolle] ?? 0;
    },
    schussGedrueckt: () => false,
    schusstasteVon: () => null,
    starteSchussFang: () => {},
    brichSchussFangAb: () => {},
    geraete: () => [],
  };
  const uebung = erzeugeUebung1({ speicher, controls });
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

- [ ] **Step 2: Headless-Sichtprüfung**

```bash
cd "/Users/o_o/Desktop/Claude/Phase II/App"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --enable-unsafe-swiftshader --allow-file-access-from-files --window-size=1600,900 \
  --virtual-time-budget=12000 --screenshot=/tmp/uebung1-probe.png \
  "http://localhost:8000/entwurf/uebung1-probe.html"
```

Expected: Standbild zeigt Himmel, Boden mit Dunst, rotes Flugzeug und Zielkreis. Das Bild mit `entwurf/bilder/pmt-referenz-schirm.jpg` vergleichen. Läuft der örtliche Server nicht, vorher starten: `python3 -m http.server 8000`.

- [ ] **Step 3: Voller Testlauf und Abnahmehinweis**

Run: `node --test tests/*.test.js`
Expected: alle Tests grün (113 alte plus 18 neue).

Danach Willi örtlich durchspielen lassen (Chrome, Cmd+Shift+R, Mission 1, mit und ohne SLA, Abbruch über Esc). Erst nach seiner Abnahme wird gepusht.

- [ ] **Step 4: Commit**

```bash
git add entwurf/uebung1-probe.html
git commit -m "Mission 1: Probeseite für die Sichtprüfung"
```

---

## Selbstprüfung gegen den Entwurf

- Eigenflug, Kegel, Kreis-Sprung, Haltezeit, Farbwechsel: Tasks 2, 3, 8.
- three.js als Fremddatei, nur im Laufmodul: Tasks 1, 8.
- Szene mit Himmelsverlauf, Bodenbild, Dunst, rotem Kunstflugzeug, SVG-Zielkreis: Tasks 8, 9.
- Dauerwahl und SLA-Haken samt Schusstasten-Anlernen: Tasks 6, 7.
- Buchstabenreihe, Sprachausgabe, Fenster, Zählwerte: Tasks 5, 8.
- Deckungsquote als Kennzahl, Umbenennung auf "Deckung %", Nebenwerte: Tasks 4, 7, 8.
- Tests ohne three.js, Schleifenwächter, Probeseite, Sichtprüfung: Tasks 2 bis 5, 10.
- Higgsfield nur nach Freigabe: Task 9.
