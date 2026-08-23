# Mission 5 (Test Flugphysik) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Ziel:** Mission 5 als echte Übung: erzeugte Kopfrechenaufgaben zu Weg, Zeit, Geschwindigkeit und Sink-/Steigrate mit Zeitbonus-Wertung, dazu ein Wissensbereich als Karteikartenstapel.

**Architektur:** Reine Logik (Erzeuger, Ablenker, Eingabeprüfung, Punktrechnung) in `js/uebung5.js` mit Tests, der Vollbild-Ablauf samt Karteikarten in `js/uebung5-lauf.js`, der Kartensatz als Daten in `js/wissen5.js`. `js/mission.js` bekommt statt des `uebung4`-Sonderfalls eine Zuordnung Bereichsnummer zu Übungsfabrik.

**Technik:** HTML, CSS und JavaScript-Module ohne Rahmenwerk, Tests mit `node --test`, Sichtprüfung headless in Chrome.

**Spezifikation:** `docs/superpowers/specs/2026-08-23-mission5-flugphysik-design.md`

## Global Constraints

- Arbeitsverzeichnis: `/Users/o_o/Desktop/Claude/Phase II/App`
- Oberfläche, Bezeichner, Kommentare und Commits auf Deutsch, keine Gedankenstriche, keine Emojis. "Controls" ist als Projektbegriff erlaubt.
- Nach jeder Änderung an einer eingebundenen Datei die Versionsmarke (`?v=N`) hochzählen; bei Modulen zählt die Marke des Einstiegsskripts in der HTML-Seite.
- Tests: `node --test tests/*.test.js`, alle bestehenden Tests müssen weiter bestehen.
- Kein `git push` ohne ausdrückliche Freigabe von Willi, nur örtliche Commits.
- Commit-Nachrichten enden mit der Zeile `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Sichtprüfungen headless fahren, nicht in Willis laufendem Chrome.

---

### Task 1: Gemeinsames Mischen nach `js/zufall.js`

`mische` wird von Übung 4 und Übung 5 gebraucht. Es zieht in ein eigenes Modul um, `js/uebung4.js` reicht es weiter, damit bestehende Importe und Tests unverändert bleiben.

**Files:**
- Create: `js/zufall.js`
- Modify: `js/uebung4.js` (Zeilen 25 bis 32, die Funktion `mische`)

**Interfaces:**
- Produces: `mische(feld, rnd = Math.random)` liefert eine gemischte Kopie des Feldes, die Quelle bleibt unberührt. Export aus `js/zufall.js`, Weiterreichung aus `js/uebung4.js`.

- [ ] **Step 1: `js/zufall.js` anlegen**

```js
// Mischen mit einspeisbarem Zufall, geteilt von den Übungen.
export function mische(feld, rnd = Math.random) {
  const kopie = [...feld];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}
```

- [ ] **Step 2: `js/uebung4.js` auf das neue Modul umstellen**

Die dortige Definition von `mische` (samt der Zeile `export function mische...` bis zur schließenden Klammer) ersetzen durch Import und Weiterreichung. Oben bei den Importen ergänzen und die alte Funktion löschen:

```js
import { mische } from "./zufall.js";
export { mische };
```

Der bestehende Import `import { INSTRUMENTE, RASTER, rasterwerte } from "./instrumente.js";` bleibt unverändert stehen.

- [ ] **Step 3: Tests laufen lassen**

Run: `cd "/Users/o_o/Desktop/Claude/Phase II/App" && node --test tests/*.test.js`
Expected: alle Tests bestehen (Stand vor diesem Plan: 74), auch `tests/uebung4.test.js` mit seinem `mische`-Import aus `../js/uebung4.js`.

- [ ] **Step 4: Commit**

```bash
git add js/zufall.js js/uebung4.js
git commit -m "Mischen in eigenes Modul gezogen

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Aufgabenerzeuger in `js/uebung5.js`

**Files:**
- Create: `js/uebung5.js`
- Test: `tests/uebung5.test.js`

**Interfaces:**
- Consumes: `mische` aus `js/zufall.js` (Task 1).
- Produces aus `js/uebung5.js`:
  - `AUFGABENZAHL` (10), `AUFGABENZEIT` (30, Sekunden je Aufgabe), `PRINZIPIEN` (`["zeit", "weg", "geschwindigkeit", "rate"]`)
  - `waehlePrinzipien(anzahl, rnd)` liefert ein gemischtes Feld von Prinzip-Namen, jedes Prinzip mindestens einmal
  - `erzeugeAufgabe(prinzip, rnd)` liefert `{ prinzip, frage, antwort, einheit }` (antwort ganzzahlig, einheit eine von `"min"`, `"NM"`, `"kt"`, `"ft/min"`)
  - `erzeugeLauf(anzahl, rnd)` liefert ein Feld solcher Aufgaben, je Aufgabe zusätzlich `form: "auswahl" | "eingabe"`

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`tests/uebung5.test.js` anlegen:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AUFGABENZAHL, AUFGABENZEIT, PRINZIPIEN,
  waehlePrinzipien, erzeugeAufgabe, erzeugeLauf,
} from "../js/uebung5.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test("Rahmenwerte: zehn Aufgaben, dreißig Sekunden", () => {
  assert.equal(AUFGABENZAHL, 10);
  assert.equal(AUFGABENZEIT, 30);
});

test("waehlePrinzipien: alle vier Prinzipien mindestens einmal, gewünschte Länge", () => {
  const rnd = saatZufall(7);
  for (let i = 0; i < 20; i++) {
    const folge = waehlePrinzipien(10, rnd);
    assert.equal(folge.length, 10);
    for (const p of PRINZIPIEN) assert.ok(folge.includes(p));
  }
});

test("erzeugeAufgabe: ganzzahlig, in sich stimmig, Einheit und Bereich passen", () => {
  const rnd = saatZufall(13);
  for (let i = 0; i < 200; i++) {
    for (const prinzip of PRINZIPIEN) {
      const a = erzeugeAufgabe(prinzip, rnd);
      assert.equal(a.prinzip, prinzip);
      assert.ok(Number.isInteger(a.antwort) && a.antwort > 0);
      const zahlen = a.frage.match(/\d+/g).map(Number);
      if (prinzip === "zeit") {
        const [v, s] = zahlen;
        assert.equal(a.antwort, (s / v) * 60);
        assert.equal(a.einheit, "min");
        assert.ok(s >= 20 && s <= 2400);
      }
      if (prinzip === "weg") {
        const [v, t] = zahlen;
        assert.equal(a.antwort, (v * t) / 60);
        assert.equal(a.einheit, "NM");
        assert.ok(a.antwort >= 20 && a.antwort <= 2400);
      }
      if (prinzip === "geschwindigkeit") {
        const [s, t] = zahlen;
        assert.equal(a.antwort, (s / t) * 60);
        assert.equal(a.einheit, "kt");
        assert.ok(a.antwort >= 60 && a.antwort <= 480);
      }
      if (prinzip === "rate") {
        const [h, t] = zahlen;
        assert.equal(a.antwort, h / t);
        assert.equal(a.einheit, "ft/min");
        assert.ok(h >= 500 && h <= 30000);
        assert.ok(a.antwort >= 200 && a.antwort <= 4000);
      }
    }
  }
});

test("erzeugeLauf: volle Länge, alle Prinzipien, beide Formen kommen vor", () => {
  const rnd = saatZufall(29);
  const formen = new Set();
  for (let i = 0; i < 20; i++) {
    const lauf = erzeugeLauf(10, rnd);
    assert.equal(lauf.length, 10);
    for (const p of PRINZIPIEN) assert.ok(lauf.some((a) => a.prinzip === p));
    for (const a of lauf) {
      assert.ok(["auswahl", "eingabe"].includes(a.form));
      formen.add(a.form);
    }
  }
  assert.equal(formen.size, 2);
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `node --test tests/uebung5.test.js`
Expected: FAIL, Modul `../js/uebung5.js` nicht gefunden.

- [ ] **Step 3: `js/uebung5.js` anlegen**

```js
// Übungslogik Mission 5 (Test Flugphysik): Aufgabenerzeugung rückwärts vom
// glatten Ergebnis, Ablenker, Eingabeprüfung und Punktrechnung. Reine Logik
// ohne DOM, der Zufall ist einspeisbar, damit alles mit node --test prüfbar
// bleibt.
import { mische } from "./zufall.js";

export const AUFGABENZAHL = 10;
export const AUFGABENZEIT = 30; // Sekunden je Aufgabe
export const PRINZIPIEN = ["zeit", "weg", "geschwindigkeit", "rate"];

// Wertelisten laut Entwurf: nur Paare, deren Ergebnis ganzzahlig ist und im
// erlaubten Bereich liegt, einmal beim Laden gerechnet.
const GESCHWINDIGKEITEN = [60, 80, 90, 100, 120, 150, 180, 200, 240, 300, 360, 420, 480];
const ZEITEN = [12, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300];
const WZG_PAARE = [];
for (const v of GESCHWINDIGKEITEN) for (const t of ZEITEN) {
  const s = (v * t) / 60;
  if (Number.isInteger(s) && s >= 20 && s <= 2400) WZG_PAARE.push({ v, t, s });
}
const RATEN_PAARE = [];
for (let r = 200; r <= 4000; r += 100) for (let t = 2; t <= 12; t++) {
  const h = r * t;
  if (h >= 500 && h <= 30000) RATEN_PAARE.push({ r, t, h });
}

const zufallAus = (feld, rnd) => feld[Math.floor(rnd() * feld.length)];

// Jedes Prinzip kommt mindestens einmal vor, der Rest wird gewürfelt.
export function waehlePrinzipien(anzahl, rnd = Math.random) {
  const folge = [...PRINZIPIEN];
  while (folge.length < anzahl) folge.push(zufallAus(PRINZIPIEN, rnd));
  return mische(folge.slice(0, anzahl), rnd);
}

export function erzeugeAufgabe(prinzip, rnd = Math.random) {
  if (prinzip === "rate") {
    const { r, t, h } = zufallAus(RATEN_PAARE, rnd);
    const sinken = rnd() < 0.5;
    return {
      prinzip,
      frage: sinken
        ? `Das Luftfahrzeug muss ${h} ft in ${t} Minuten abbauen. Berechne die Sinkrate in ft/min.`
        : `Das Luftfahrzeug muss ${h} ft in ${t} Minuten steigen. Berechne die Steigrate in ft/min.`,
      antwort: r,
      einheit: "ft/min",
    };
  }
  const { v, t, s } = zufallAus(WZG_PAARE, rnd);
  if (prinzip === "zeit") return {
    prinzip,
    frage: `Das Luftfahrzeug fliegt ${v} kt. Das Ziel liegt ${s} NM entfernt. Berechne die Flugzeit in Minuten.`,
    antwort: t,
    einheit: "min",
  };
  if (prinzip === "weg") return {
    prinzip,
    frage: `Das Luftfahrzeug fliegt ${v} kt für ${t} Minuten. Berechne den zurückgelegten Weg in NM.`,
    antwort: s,
    einheit: "NM",
  };
  return {
    prinzip,
    frage: `Das Luftfahrzeug legt ${s} NM in ${t} Minuten zurück. Berechne die Geschwindigkeit in Knoten.`,
    antwort: v,
    einheit: "kt",
  };
}

// Ein Lauf: Prinzipienfolge, je Aufgabe die gewürfelte Erscheinungsform.
export function erzeugeLauf(anzahl = AUFGABENZAHL, rnd = Math.random) {
  return waehlePrinzipien(anzahl, rnd).map((prinzip) => ({
    ...erzeugeAufgabe(prinzip, rnd),
    form: rnd() < 0.5 ? "auswahl" : "eingabe",
  }));
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung5.test.js`
Expected: PASS, vier Tests.

- [ ] **Step 5: Commit**

```bash
git add js/uebung5.js tests/uebung5.test.js
git commit -m "Mission 5: Aufgabenerzeuger mit Tests

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Ablenker und Eingabeprüfung

**Files:**
- Modify: `js/uebung5.js` (ans Ende anfügen)
- Modify: `tests/uebung5.test.js` (ans Ende anfügen)

**Interfaces:**
- Consumes: `erzeugeAufgabe`, `PRINZIPIEN`, `mische` (Task 2).
- Produces aus `js/uebung5.js`:
  - `ablenker(aufgabe, rnd)` liefert drei ganzzahlige, positive, eindeutige Werte ungleich `aufgabe.antwort`; braucht von der Aufgabe nur `prinzip` und `antwort`
  - `antwortenFuer(aufgabe, rnd)` liefert vier gemischte Werte, die Antwort ist dabei
  - `pruefeEingabe(text, antwort)` liefert `true` nur bei exakt passender Zahl; Komma und Punkt gelten, Leerzeichen werden ignoriert

- [ ] **Step 1: Fehlschlagende Tests anfügen**

In `tests/uebung5.test.js` den Import erweitern um `ablenker, antwortenFuer, pruefeEingabe` und ans Ende anfügen:

```js
test("ablenker: drei eindeutige, positive, ganzzahlige Werte ungleich der Antwort", () => {
  const rnd = saatZufall(17);
  for (let i = 0; i < 100; i++) {
    for (const prinzip of PRINZIPIEN) {
      const aufgabe = erzeugeAufgabe(prinzip, rnd);
      const falsche = ablenker(aufgabe, rnd);
      assert.equal(falsche.length, 3);
      assert.equal(new Set(falsche).size, 3);
      for (const w of falsche) {
        assert.ok(Number.isInteger(w) && w > 0);
        assert.notEqual(w, aufgabe.antwort);
      }
    }
  }
});

test("ablenker: der 60er-Fehler ist beim Weg dabei", () => {
  const aufgabe = { prinzip: "weg", antwort: 180 };
  assert.ok(ablenker(aufgabe, saatZufall(3)).includes(180 * 60));
});

test("ablenker: der 60er-Fehler ist bei der Zeit dabei, wenn er ganzzahlig ist", () => {
  const aufgabe = { prinzip: "zeit", antwort: 300 };
  assert.ok(ablenker(aufgabe, saatZufall(3)).includes(5));
});

test("antwortenFuer: vier eindeutige Werte, die Antwort ist dabei", () => {
  const rnd = saatZufall(23);
  for (let i = 0; i < 50; i++) {
    const aufgabe = erzeugeAufgabe(PRINZIPIEN[i % 4], rnd);
    const auswahl = antwortenFuer(aufgabe, rnd);
    assert.equal(auswahl.length, 4);
    assert.equal(new Set(auswahl).size, 4);
    assert.ok(auswahl.includes(aufgabe.antwort));
  }
});

test("pruefeEingabe: Komma, Punkt und Leerzeichen gelten", () => {
  assert.ok(pruefeEingabe("300", 300));
  assert.ok(pruefeEingabe(" 300 ", 300));
  assert.ok(pruefeEingabe("300,0", 300));
  assert.ok(pruefeEingabe("300.0", 300));
});

test("pruefeEingabe: falsche, leere und unlesbare Eingaben gelten nicht", () => {
  assert.ok(!pruefeEingabe("299", 300));
  assert.ok(!pruefeEingabe("", 300));
  assert.ok(!pruefeEingabe("dreihundert", 300));
  assert.ok(!pruefeEingabe(null, 300));
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `node --test tests/uebung5.test.js`
Expected: FAIL, `ablenker` ist kein Export.

- [ ] **Step 3: Umsetzung in `js/uebung5.js` anfügen**

```js
// Der klassische 60er-Fehler je Prinzip: Faktor 60 vergessen oder doppelt
// gerechnet. Bei der Rate gibt es keinen.
function sechzigerFehler(aufgabe) {
  const a = aufgabe.antwort;
  if (aufgabe.prinzip === "zeit" || aufgabe.prinzip === "geschwindigkeit") {
    return Number.isInteger(a / 60) ? a / 60 : null;
  }
  if (aufgabe.prinzip === "weg") return a * 60;
  return null;
}

// Drei Ablenker: bevorzugt der 60er-Fehler, dazu Nachbarwerte in plausibler
// Nähe. Die Schlussschleife garantiert drei Werte auch bei Rundungskollisionen.
export function ablenker(aufgabe, rnd = Math.random) {
  const a = aufgabe.antwort;
  const kandidaten = [];
  const fehler = sechzigerFehler(aufgabe);
  if (fehler && fehler !== a) kandidaten.push(fehler);
  kandidaten.push(...mische([0.5, 0.75, 0.9, 1.1, 1.25, 1.5, 2].map((f) => Math.round(a * f)), rnd));
  const eindeutig = [];
  for (const k of kandidaten) {
    if (k > 0 && k !== a && !eindeutig.includes(k)) eindeutig.push(k);
    if (eindeutig.length === 3) return eindeutig;
  }
  for (let k = 1; eindeutig.length < 3; k++) {
    if (!eindeutig.includes(a + k)) eindeutig.push(a + k);
  }
  return eindeutig;
}

export function antwortenFuer(aufgabe, rnd = Math.random) {
  return mische([aufgabe.antwort, ...ablenker(aufgabe, rnd)], rnd);
}

// Eingaben gelten mit Komma oder Punkt, Leerzeichen werden ignoriert.
// Richtig ist nur der exakte Wert, die Erzeugung liefert glatte Zahlen.
export function pruefeEingabe(text, antwort) {
  const bereinigt = String(text ?? "").replace(/\s/g, "").replace(",", ".");
  if (bereinigt === "") return false;
  const zahl = Number(bereinigt);
  return Number.isFinite(zahl) && zahl === antwort;
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/uebung5.test.js`
Expected: PASS, zehn Tests.

- [ ] **Step 5: Commit**

```bash
git add js/uebung5.js tests/uebung5.test.js
git commit -m "Mission 5: Ablenker und Eingabeprüfung

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Punktrechnung mit Zeitbonus (Willis Funktion)

Die Aufteilung Grundanteil zu Zeitbonus ist Willis Entscheidung. Die Tests prüfen nur die Leitplanken aus der Spezifikation, damit jede erlaubte Aufteilung besteht.

**Files:**
- Modify: `js/uebung5.js` (ans Ende anfügen)
- Modify: `tests/uebung5.test.js` (ans Ende anfügen)

**Interfaces:**
- Produces aus `js/uebung5.js`:
  - `punkteFuerAntwort(richtig, restzeitMs, limitMs)` liefert 0 bei falsch, sonst Grundanteil plus linearen Zeitbonus, höchstens 10, Grundanteil mindestens 5; Rückgabe darf Nachkommastellen haben
  - `kennzahl(punkteSumme, anzahl)` liefert die auf 0 bis 100 hochgerechnete, gerundete Kennzahl

- [ ] **Step 1: Fehlschlagende Tests anfügen**

Import in `tests/uebung5.test.js` erweitern um `punkteFuerAntwort, kennzahl` und ans Ende anfügen:

```js
test("punkteFuerAntwort: falsch gibt null Punkte", () => {
  assert.equal(punkteFuerAntwort(false, 30000, 30000), 0);
  assert.equal(punkteFuerAntwort(false, 0, 30000), 0);
});

test("punkteFuerAntwort: richtig liegt zwischen Grundanteil und zehn", () => {
  assert.equal(punkteFuerAntwort(true, 30000, 30000), 10);
  const grund = punkteFuerAntwort(true, 0, 30000);
  assert.ok(grund >= 5 && grund < 10);
});

test("punkteFuerAntwort: mehr Restzeit gibt nie weniger Punkte", () => {
  let vorher = 0;
  for (let rest = 0; rest <= 30000; rest += 3000) {
    const p = punkteFuerAntwort(true, rest, 30000);
    assert.ok(p >= vorher);
    vorher = p;
  }
});

test("kennzahl: Summe auf hundert hochgerechnet und gerundet", () => {
  assert.equal(kennzahl(100, 10), 100);
  assert.equal(kennzahl(0, 10), 0);
  assert.equal(kennzahl(55.6, 10), 56);
  assert.equal(kennzahl(0, 0), 0);
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `node --test tests/uebung5.test.js`
Expected: FAIL, `punkteFuerAntwort` ist kein Export.

- [ ] **Step 3: Willi nach der Aufteilung fragen**

Dieser Schritt braucht Willis Antwort und läuft über die Hauptsitzung (bei Subagenten: vor dem Beauftragen dieses Tasks fragen). Frage: Aufteilung Grundanteil zu Zeitbonus je richtiger Antwort, Vorgabe 6 Punkte Grund und bis zu 4 Punkte Bonus, erlaubt ist jede Aufteilung mit Grundanteil 5 bis 10 und Summe 10. Willi darf die Funktion auch selbst schreiben; der Rahmen unten steht dann schon bereit und Schritt 4 zeigt die Vorgabe-Fassung.

- [ ] **Step 4: Umsetzung in `js/uebung5.js` anfügen**

Mit der Vorgabe 6 und 4 (oder Willis gewählten Werten an deren Stelle):

```js
// Punktrechnung je Aufgabe, Aufteilung von Willi festgelegt: falsch gibt
// nichts, richtig gibt den Grundanteil plus einen mit der Restzeit linear
// wachsenden Bonus. Eine langsame richtige Antwort schlägt so immer jede
// falsche.
export function punkteFuerAntwort(richtig, restzeitMs, limitMs) {
  if (!richtig) return 0;
  const anteil = Math.max(0, Math.min(1, restzeitMs / limitMs));
  return 6 + 4 * anteil;
}

// Kennzahl des Laufs: Punktesumme auf 0 bis 100 hochgerechnet.
export function kennzahl(punkteSumme, anzahl) {
  if (anzahl === 0) return 0;
  return Math.round((punkteSumme / (anzahl * 10)) * 100);
}
```

- [ ] **Step 5: Tests laufen lassen**

Run: `node --test tests/uebung5.test.js`
Expected: PASS, vierzehn Tests.

- [ ] **Step 6: Commit**

```bash
git add js/uebung5.js tests/uebung5.test.js
git commit -m "Mission 5: Punktrechnung mit Zeitbonus

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Kartensatz in `js/wissen5.js`

**Files:**
- Create: `js/wissen5.js`
- Test: `tests/wissen5.test.js`

**Interfaces:**
- Produces: `KARTEN5`, ein Feld aus sechs Objekten `{ titel, zeilen }`, `zeilen` ist ein Feld nicht leerer Zeichenketten. Gezeichnet wird in Task 6.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`tests/wissen5.test.js` anlegen:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { KARTEN5 } from "../js/wissen5.js";

test("Kartensatz: sechs Karten mit Titel und Zeilen", () => {
  assert.equal(KARTEN5.length, 6);
  for (const k of KARTEN5) {
    assert.ok(k.titel.length > 0);
    assert.ok(k.zeilen.length > 0);
    for (const z of k.zeilen) assert.ok(z.length > 0);
  }
});
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag prüfen**

Run: `node --test tests/wissen5.test.js`
Expected: FAIL, Modul `../js/wissen5.js` nicht gefunden.

- [ ] **Step 3: `js/wissen5.js` anlegen**

```js
// Kartensatz des Wissensbereichs von Mission 5. Nur Daten: Reihenfolge und
// Inhalte der Karteikarten, gezeichnet wird in uebung5-lauf.js. Weitere Karten
// einfach ans Ende anfügen.
export const KARTEN5 = [
  {
    titel: "Geschwindigkeit",
    zeilen: [
      "v = Weg / Zeit",
      "Knoten sind NM je Stunde:",
      "1 kt = 1 NM in 60 Minuten",
    ],
  },
  {
    titel: "Weg",
    zeilen: [
      "s = v mal t",
      "Zeit in Stunden einsetzen,",
      "oder mit Minuten: s = v mal t / 60",
    ],
  },
  {
    titel: "Zeit und die 60er-Regel",
    zeilen: [
      "t in Minuten = s / v mal 60",
      "Erst Weg durch Geschwindigkeit,",
      "dann mal 60. Nie andersherum.",
    ],
  },
  {
    titel: "Sink- und Steigrate",
    zeilen: [
      "Rate = Höhenänderung / Zeit",
      "Zeit in Minuten einsetzen,",
      "das Ergebnis ist ft je Minute.",
    ],
  },
  {
    titel: "Beispiel Flugzeit",
    zeilen: [
      "100 kt, Ziel in 500 NM. Flugzeit?",
      "t = s / v mal 60",
      "t = 500 / 100 mal 60",
      "t = 5 mal 60 = 300 Minuten",
      "Also 5 Stunden bis zum Ziel.",
    ],
  },
  {
    titel: "Beispiel Sinkrate",
    zeilen: [
      "6000 ft in 3 Minuten abbauen. Rate?",
      "Rate = h / t",
      "Rate = 6000 / 3",
      "Rate = 2000 ft/min sinken",
    ],
  },
];
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/wissen5.test.js`
Expected: PASS, ein Test.

- [ ] **Step 5: Commit**

```bash
git add js/wissen5.js tests/wissen5.test.js
git commit -m "Mission 5: Kartensatz des Wissensbereichs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Ablauf in `js/uebung5-lauf.js` samt Probegeschirr

Reines DOM-Modul nach dem Muster von `js/uebung4-lauf.js`, keine Einheitstests; geprüft wird über das Probegeschirr und die Sichtprüfung in Task 9.

**Files:**
- Create: `js/uebung5-lauf.js`
- Create: `entwurf/uebung5-probe.html`

**Interfaces:**
- Consumes: `AUFGABENZAHL, AUFGABENZEIT, erzeugeLauf, antwortenFuer, pruefeEingabe, punkteFuerAntwort, kennzahl` aus `js/uebung5.js`; `KARTEN5` aus `js/wissen5.js`; Türobjekt mit `schliesse()`, `oeffne()`, `verwische(an)` aus `js/hangartuer.js`.
- Produces: `erzeugeUebung5()` liefert `{ hinweis, zeichneFeld, starte }`:
  - `hinweis`: Zeichenkette für die Missionsseite
  - `zeichneFeld(feld)`: zeichnet den WISSEN-Knopf (id `u5-wissen`, Klasse `punkt wissensknopf`) ins Übungsfeld
  - `starte({ tuer, beiEnde, registriereAbbruch })`: wie bei Übung 4; `beiEnde` erhält bei vollendetem Lauf `{ kennzahl, daten: { art: "flugphysik", gestellt, richtig, quote, punkte } }`, bei Abbruch `null`
- CSS-Klassen, die Task 7 gestaltet: `laufschleier uebung5`, `eingabezeile`, `zahlenfeld`, `einheit`, `wissensschicht`, `kartenstapel`, `karteikarte` (mit `dahinter eins`, `dahinter zwei`, `oben`, `blaettert`), `kartenkopf`, `kartenzeile`, `kartenleiste`, `kartenzaehler`, `wissensknopf`

- [ ] **Step 1: `js/uebung5-lauf.js` anlegen**

```js
// Ablauf Mission 5 (Test Flugphysik) im Vollbild: zehn erzeugte Aufgaben mit
// Ablaufbalken, je Aufgabe als Auswahlfrage oder Zahleneingabe, sofortige
// Auflösung, danach die Ergebnistafel. Der Wissensbereich liegt als
// Karteikartenstapel über der Missionsseite, nicht im Lauf.
import {
  AUFGABENZAHL, AUFGABENZEIT, erzeugeLauf, antwortenFuer, pruefeEingabe,
  punkteFuerAntwort, kennzahl,
} from "./uebung5.js";
import { KARTEN5 } from "./wissen5.js";

// Rückmeldung: nach richtigen Antworten geht es zügig weiter, nach falschen
// bleibt Zeit, den wahren Wert zu lesen. Ein Klick überspringt die Wartezeit.
const RUECKMELDEDAUER_RICHTIG = 700;
const RUECKMELDEDAUER_FALSCH = 1800;

export function erzeugeUebung5() {
  const hinweis = "Zehn gerechnete Aufgaben zu Weg, Zeit, Geschwindigkeit und Sink- oder "
    + "Steigrate, je Aufgabe 30 Sekunden. Geantwortet wird per Auswahl oder Zahleneingabe. "
    + "Punkte gibt es für richtige und schnelle Antworten, die Formeln stehen unter WISSEN.";

  function zeichneFeld(feld) {
    feld.innerHTML = `<button class="punkt wissensknopf" id="u5-wissen">WISSEN · KARTEIKARTEN</button>`;
    feld.querySelector("#u5-wissen").addEventListener("click", zeigeWissen);
  }

  // Karteikartenstapel über der Missionsseite: blättern per Knopf, Klick auf
  // die Karte oder Pfeiltasten, Esc oder SCHLIESSEN führt zurück.
  function zeigeWissen() {
    if (document.querySelector(".wissensschicht")) return;
    let index = 0;
    const schicht = document.createElement("div");
    schicht.className = "wissensschicht";
    schicht.innerHTML = `
      <div class="kartenstapel">
        <div class="karteikarte dahinter zwei"></div>
        <div class="karteikarte dahinter eins"></div>
        <div class="karteikarte oben"></div>
      </div>
      <div class="kartenleiste">
        <button class="punkt" id="k-zurueck">◄</button>
        <span class="kartenzaehler" id="k-zaehler"></span>
        <button class="punkt" id="k-weiter">►</button>
        <button class="punkt" id="k-schliessen">SCHLIESSEN</button>
      </div>`;
    document.body.append(schicht);
    const karte = schicht.querySelector(".karteikarte.oben");
    const zaehler = schicht.querySelector("#k-zaehler");

    const zeichne = () => {
      const k = KARTEN5[index];
      karte.innerHTML = `<div class="kartenkopf">${k.titel}</div>`
        + k.zeilen.map((z) => `<div class="kartenzeile">${z}</div>`).join("");
      zaehler.textContent = `${index + 1}/${KARTEN5.length}`;
    };
    const blaettere = (schritt) => {
      index = (index + schritt + KARTEN5.length) % KARTEN5.length;
      karte.classList.remove("blaettert");
      void karte.offsetWidth; // Neustart der Blätterbewegung
      karte.classList.add("blaettert");
      zeichne();
    };
    const schliesse = () => {
      removeEventListener("keydown", beiTaste, true);
      schicht.remove();
    };
    const beiTaste = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); schliesse(); }
      if (e.key === "ArrowRight") blaettere(1);
      if (e.key === "ArrowLeft") blaettere(-1);
    };
    addEventListener("keydown", beiTaste, true);
    karte.addEventListener("click", () => blaettere(1));
    schicht.querySelector("#k-weiter").addEventListener("click", () => blaettere(1));
    schicht.querySelector("#k-zurueck").addEventListener("click", () => blaettere(-1));
    schicht.querySelector("#k-schliessen").addEventListener("click", schliesse);
    schicht.addEventListener("click", (e) => { if (e.target === schicht) schliesse(); });
    zeichne();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const aufgaben = erzeugeLauf(AUFGABENZAHL);
    const limitMs = AUFGABENZEIT * 1000;
    // Der Aufrufer hat die Hangartür bereits geschlossen: der Testbildschirm
    // baut sich verdeckt auf, die Tür öffnet in die laufende Mission.
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung5";
    schleier.innerHTML = `<div class="testkopf"></div><div class="testmitte"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const mitte = schleier.querySelector(".testmitte");
    const kopf = schleier.querySelector(".testkopf");
    let beendet = false;
    let gestellt = 0;
    let richtig = 0;
    let punkteSumme = 0;
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
    // Während des Laufs führt Verlassen (Esc, Vollbild, Tabwechsel) zur
    // Ergebnistafel ohne Wertung; auf der Tafel schließt Esc wie der Knopf.
    let verlasse = () => zeigeErgebnis(false);
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const stelle = (index) => {
      if (beendet) return;
      if (index >= aufgaben.length) { zeigeErgebnis(true); return; }
      const aufgabe = aufgaben[index];
      kopf.textContent = `AUFGABE ${index + 1} / ${aufgaben.length}`;
      const antwortfeld = aufgabe.form === "auswahl"
        ? `<div class="antworten">${antwortenFuer(aufgabe).map((w, i) =>
            `<button class="antwortknopf" data-nr="${i}" data-wert="${w}">${w} ${aufgabe.einheit}</button>`).join("")}</div>`
        : `<form class="eingabezeile" id="u5-form">
            <input class="zahlenfeld" id="u5-eingabe" inputmode="decimal" autocomplete="off" placeholder="Antwort">
            <span class="einheit">${aufgabe.einheit}</span>
            <button class="punkt" type="submit">ABGEBEN</button>
          </form>`;
      mitte.innerHTML = `
        <div class="frage">${aufgabe.frage}</div>
        ${antwortfeld}
        <div class="zeitbalken"><span style="animation-duration:${AUFGABENZEIT}s"></span></div>
        <div class="rueckmeldung"></div>`;

      const start = performance.now();
      let entschieden = false;
      spaeter(() => entscheide({ abgelaufen: true }), limitMs);

      const entscheide = ({ getroffen = false, abgelaufen = false, gewaehlt = null }) => {
        if (entschieden || beendet) return;
        entschieden = true;
        gestellt += 1;
        const rest = abgelaufen ? 0 : Math.max(0, limitMs - (performance.now() - start));
        const punkte = punkteFuerAntwort(getroffen, rest, limitMs);
        if (getroffen) { richtig += 1; punkteSumme += punkte; }
        mitte.querySelectorAll(".antwortknopf").forEach((knopf) => {
          knopf.disabled = true;
          if (Number(knopf.dataset.wert) === aufgabe.antwort) knopf.classList.add("richtig");
          else if (knopf.dataset.nr === gewaehlt) knopf.classList.add("falsch");
        });
        const eingabe = mitte.querySelector("#u5-eingabe");
        if (eingabe) { eingabe.disabled = true; eingabe.classList.add(getroffen ? "richtig" : "falsch"); }
        mitte.querySelector(".zeitbalken span").style.animationPlayState = "paused";
        const rueck = mitte.querySelector(".rueckmeldung");
        rueck.textContent = getroffen
          ? `RICHTIG · ${Math.round(punkte)} PUNKTE`
          : `${abgelaufen ? "ZEIT ABGELAUFEN" : "FALSCH"} · richtig: ${aufgabe.antwort} ${aufgabe.einheit}`;
        rueck.classList.add(getroffen ? "gut" : "schlecht");
        let weitergegangen = false;
        const weiter = () => {
          if (weitergegangen || beendet) return;
          weitergegangen = true;
          schleier.removeEventListener("click", weiter);
          stelle(index + 1);
        };
        spaeter(weiter, getroffen ? RUECKMELDEDAUER_RICHTIG : RUECKMELDEDAUER_FALSCH);
        schleier.addEventListener("click", weiter);
      };

      if (aufgabe.form === "auswahl") {
        mitte.querySelector(".antworten").addEventListener("click", (e) => {
          const knopf = e.target.closest(".antwortknopf");
          if (!knopf) return;
          e.stopPropagation();
          entscheide({ getroffen: Number(knopf.dataset.wert) === aufgabe.antwort, gewaehlt: knopf.dataset.nr });
        });
      } else {
        const form = mitte.querySelector("#u5-form");
        const eingabe = mitte.querySelector("#u5-eingabe");
        eingabe.focus();
        form.addEventListener("click", (e) => e.stopPropagation());
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          entscheide({ getroffen: pruefeEingabe(eingabe.value, aufgabe.antwort) });
        });
      }
    };

    // Ergebnistafel für beide Wege: vollendeter Lauf (gewertet) und Abbruch
    // (ohne Wertung). Die Tür fährt zu, wird verwischt, die Tafel legt sich
    // davor; der Rücksprung räumt die Tafel weg und öffnet die Tür wieder.
    let ergebnisOffen = false;
    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const wert = kennzahl(punkteSumme, aufgaben.length);
      const quote = gestellt ? Math.round((richtig / gestellt) * 100) : 0;
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${wert} PUNKTE</div>
        <div class="ergebniszeilen">
          <span class="trefferzeile">${richtig} von ${gestellt} Aufgaben richtig · ${quote} %</span>
        </div>
        <button class="punkt" id="u5-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>${aufgaben.length} Aufgaben · ${AUFGABENZEIT} s je Aufgabe</span>
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
          daten: { art: "flugphysik", gestellt, richtig, quote, punkte: wert },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u5-fertig").addEventListener("click", schliesse);
    };

    // Die Tür öffnet in die fertig aufgebaute Mission, erst dann läuft die Zeit.
    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      stelle(0);
    })();
  }

  return { hinweis, zeichneFeld, starte };
}
```

- [ ] **Step 2: Probegeschirr `entwurf/uebung5-probe.html` anlegen**

Nach dem Muster von `entwurf/uebung4-probe.html`:

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Übung 5 · Probe</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../stil.css?v=41">
</head>
<body>
<script type="module">
  // Probeaufbau ohne App-Rahmen: schließt die Hangartür und startet den Lauf
  // sofort, damit der Ablauf headless prüfbar ist. Mit ?abbruch=<ms> wird nach
  // dieser Zeit abgebrochen, mit ?wissen=1 öffnet statt des Laufs der
  // Karteikartenstapel.
  import { erzeugeUebung5 } from "../js/uebung5-lauf.js";
  import { erzeugeHangartuer } from "../js/hangartuer.js";
  const uebung = erzeugeUebung5();
  if (new URLSearchParams(location.search).get("wissen")) {
    const feld = document.createElement("div");
    document.body.append(feld);
    uebung.zeichneFeld(feld);
    feld.querySelector("#u5-wissen").click();
  } else {
    const tuer = erzeugeHangartuer();
    let brichAb = null;
    await tuer.schliesse();
    uebung.starte({
      tuer,
      registriereAbbruch: (fn) => { brichAb = fn; },
      beiEnde: (ergebnis) => { document.body.insertAdjacentText("beforeend", `ENDE: ${JSON.stringify(ergebnis)}`); },
    });
    const abbruchNach = Number(new URLSearchParams(location.search).get("abbruch"));
    if (abbruchNach > 0) setTimeout(() => brichAb?.(), abbruchNach);
  }
</script>
</body>
</html>
```

- [ ] **Step 3: Tests laufen lassen (Bestand unberührt)**

Run: `node --test tests/*.test.js`
Expected: PASS, alle Tests; die neuen Dateien brechen nichts.

- [ ] **Step 4: Commit**

```bash
git add js/uebung5-lauf.js entwurf/uebung5-probe.html
git commit -m "Mission 5: Ablauf im Vollbild und Karteikartenstapel

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Gestaltung in `stil.css` und Versionsmarken der Stildatei

**Files:**
- Modify: `stil.css` (zwei bestehende Selektoren erweitern, neue Regeln ans Ende)
- Modify: `index.html`, `uebersicht.html`, `mission.html`, `entwurf/uebung4-probe.html` (Versionsmarke der Stildatei)

**Interfaces:**
- Consumes: die Klassennamen aus Task 6.

- [ ] **Step 1: Bestehende Selektoren auf Übung 5 erweitern**

In `stil.css` Zeile 361 ändern von:

```css
.laufschleier.uebung4 { justify-content: flex-start; padding: 6vh 24px 24px; gap: 26px; }
```

zu:

```css
.laufschleier.uebung4, .laufschleier.uebung5 { justify-content: flex-start; padding: 6vh 24px 24px; gap: 26px; }
```

Und Zeile 386, den Selektor der `.punkt`-Regel, ändern von:

```css
.laufschleier.uebung4 .punkt, .ergebnisschicht .punkt {
```

zu:

```css
.laufschleier.uebung4 .punkt, .laufschleier.uebung5 .punkt, .ergebnisschicht .punkt, .wissensschicht .punkt, #uebungsfeld .punkt {
```

(Der Regelinhalt bleibt jeweils unverändert.)

- [ ] **Step 2: Neue Regeln ans Ende von `stil.css` anfügen**

```css
/* Mission 5: Zahleneingabe im Lauf */
.eingabezeile { display: flex; align-items: center; justify-content: center; gap: 10px; }
.zahlenfeld { font-family: inherit; font-size: 20px; letter-spacing: 0.1em; color: var(--hell); background: #161a10; border: 1px solid #39422c; border-radius: 8px; padding: 12px 14px; width: 170px; text-align: right; }
.zahlenfeld:focus { outline: none; border-color: #6a7a52; }
.zahlenfeld.richtig { border-color: #7da05a; box-shadow: 0 0 0 2px rgba(125, 160, 90, 0.5); }
.zahlenfeld.falsch { border-color: #b0563c; box-shadow: 0 0 0 2px rgba(176, 86, 60, 0.5); }
.eingabezeile .einheit { font-size: 14px; letter-spacing: 0.1em; color: var(--gedeckt); min-width: 52px; text-align: left; }

/* Mission 5: Wissensbereich als Karteikartenstapel. Die Karten tragen die
   Papieranmutung des Prüfungskalenders: cremefarbener Grund, blaues
   Linienraster, rote Kopflinie, Handschrift über die Caveat-Schrift. */
.wissensschicht { position: fixed; inset: 0; z-index: 70; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; background: rgba(8, 10, 6, 0.82); }
.kartenstapel { position: relative; width: min(560px, 88vw); height: min(340px, 54vw); }
.karteikarte { position: absolute; inset: 0; border-radius: 6px; padding: 14px 26px 18px; background: repeating-linear-gradient(to bottom, transparent 0 33px, rgba(58, 92, 137, 0.28) 33px 34px) #f2e9d3; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45); font-family: "Caveat", cursive; color: #2b2b33; transform: rotate(-1.2deg); overflow: hidden; }
.karteikarte.dahinter.eins { transform: rotate(1.1deg) translate(5px, 4px); }
.karteikarte.dahinter.zwei { transform: rotate(-2.4deg) translate(-6px, 8px); }
.karteikarte.oben { cursor: pointer; }
.karteikarte.oben.blaettert { animation: blaettern 0.22s ease-out; }
@keyframes blaettern { from { transform: rotate(-1.2deg) translateX(28px); opacity: 0.15; } to { transform: rotate(-1.2deg) translateX(0); opacity: 1; } }
.kartenkopf { font-size: 27px; line-height: 34px; border-bottom: 2px solid rgba(190, 60, 50, 0.75); }
.kartenzeile { font-size: 22px; line-height: 34px; }
.kartenleiste { display: flex; align-items: center; gap: 12px; }
.kartenzaehler { min-width: 46px; text-align: center; font-size: 13px; letter-spacing: 0.15em; color: var(--hell); }
#uebungsfeld .wissensknopf { margin-top: 6px; }
```

- [ ] **Step 3: Versionsmarken der Stildatei hochzählen**

Run: `grep -rn "stil.css?v=" *.html entwurf/*.html`
Expected: Treffer mit `?v=40` in `index.html`, `uebersicht.html`, `mission.html`, `entwurf/uebung4-probe.html` (weitere Trefferdateien ebenso behandeln). In jeder Trefferdatei `stil.css?v=40` durch `stil.css?v=41` ersetzen. `entwurf/uebung5-probe.html` aus Task 6 steht bereits auf `?v=41`.

- [ ] **Step 4: Tests laufen lassen (Bestand unberührt)**

Run: `node --test tests/*.test.js`
Expected: PASS, alle Tests.

- [ ] **Step 5: Commit**

```bash
git add stil.css index.html uebersicht.html mission.html entwurf/uebung4-probe.html
git commit -m "Mission 5: Gestaltung für Zahleneingabe und Karteikarten

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Einhängung in Missionsseite und Missionsliste

**Files:**
- Modify: `js/mission.js` (Zeilen 8, 17, 187 bis 214, 303 bis 310)
- Modify: `js/uebung4-lauf.js` (Fabrik-Rückgabe und Methodenname)
- Modify: `js/missionen.js` (Zeile 11)
- Modify: `mission.html` (Zeile 42, Versionsmarke des Einstiegsskripts)

**Interfaces:**
- Consumes: `erzeugeUebung5` aus Task 6.
- Produces: einheitliche Übungs-Schnittstelle für alle Bereiche: die Fabrik erhält `{ speicher }` und liefert `{ hinweis, starte }` mit wahlweise `ladeEinstellung` und `zeichneFeld`. `js/mission.js` kennt nur noch die Zuordnung `UEBUNGEN`.

- [ ] **Step 1: `js/uebung4-lauf.js` an die einheitliche Schnittstelle anpassen**

In `erzeugeUebung4` vor `ladeEinstellung` den Hinweistext ergänzen (er zieht aus `mission.js` hierher um):

```js
  const hinweis = "Die fünf Instrumente erscheinen mit zufälligen Werten für die eingestellte Zeit. "
    + "Danach fragt der Test einzelne Instrumente ab: vier Antworten, zehn Sekunden Zeit. "
    + "Runden folgen am Stück, bis die Testdauer um ist.";
```

Die Funktion `zeichneEinstellungen(feld)` in `zeichneFeld(feld)` umbenennen und die Rückgabezeile ändern zu:

```js
  return { hinweis, ladeEinstellung, zeichneFeld, starte };
```

- [ ] **Step 2: `js/mission.js` auf die Zuordnung umstellen**

Import in Zeile 8 erweitern:

```js
import { erzeugeUebung4 } from "./uebung4-lauf.js";
import { erzeugeUebung5 } from "./uebung5-lauf.js";
```

Zeile 17 (`const uebung4 = ...`) ersetzen durch:

```js
// Bereiche mit echter Übung; alle übrigen laufen über den Probelauf.
const UEBUNGEN = { 4: erzeugeUebung4, 5: erzeugeUebung5 };
const uebung = mission && UEBUNGEN[mission.nr] ? UEBUNGEN[mission.nr]({ speicher }) : null;
```

In `starteLauf` den Block `if (uebung4) { ... }` (Zeilen 187 bis 214) auf `uebung` umstellen; nur der Name ändert sich, die Logik bleibt:

```js
  if (uebung) {
    laufAktiv = true;
    // Die Hangartür fährt über der Missionsseite zu, dahinter baut sich der
    // Test auf, dann öffnet die Übung die Tür selbst.
    const tuer = erzeugeHangartuer();
    tuer.schliesse().then(() => uebung.starte({
      tuer,
      registriereAbbruch: (fn) => { brichLaufAb = fn; },
      beiEnde: async (ergebnis) => {
        laufAktiv = false;
        brichLaufAb = null;
        if (ergebnis && mission.wertung) {
          try {
            await speicher.speichereLauf({
              profil: speicher.profil(),
              bereich: mission.nr,
              zeitpunkt: new Date().toISOString(),
              kennzahl: ergebnis.kennzahl,
              daten: ergebnis.daten,
            });
          } catch {
            alert("Der Lauf konnte nicht gesichert werden und geht verloren. Bitte Verbindung und Einrichtung prüfen.");
          }
        }
        await zeichneAuswertung();
      },
    }));
    return;
  }
```

In `initialisiereSeite` den Block `if (uebung4) { ... }` (Zeilen 303 bis 310, mit dem fest verdrahteten Hinweistext) ersetzen durch:

```js
  if (uebung) {
    document.getElementById("uebungshinweis").textContent = uebung.hinweis;
    Promise.resolve(uebung.ladeEinstellung?.()).then(() =>
      uebung.zeichneFeld?.(document.getElementById("uebungsfeld")));
  }
```

- [ ] **Step 3: Missionsliste anpassen**

In `js/missionen.js` Zeile 11 ändern von:

```js
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Richtige", wertung: false },
```

zu:

```js
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Punkte", wertung: false, maximal: 100 },
```

- [ ] **Step 4: Versionsmarke des Einstiegsskripts hochzählen**

In `mission.html` Zeile 42 `js/mission.js?v=27` durch `js/mission.js?v=28` ersetzen.

- [ ] **Step 5: Tests laufen lassen**

Run: `node --test tests/*.test.js`
Expected: PASS, alle Tests.

- [ ] **Step 6: Commit**

```bash
git add js/mission.js js/uebung4-lauf.js js/missionen.js mission.html
git commit -m "Mission 5 eingehängt, Übungen über Zuordnung statt Sonderfall

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Sichtprüfung headless

Headless in Chrome, nicht in Willis laufendem Browser. Schirmbilder ins Sitzungs-Arbeitsverzeichnis (`/private/tmp/claude-501/-Users-o-o/5c2e8c8b-ed84-40d9-8351-a99ac7940469/scratchpad`), nicht ins Projekt.

**Files:**
- Create (unversioniert, wird von git ignoriert oder bleibt untracked): `.superpowers/sdd/seed-mission5.html`

**Interfaces:**
- Consumes: die fertige App aus den Tasks 1 bis 8, `entwurf/uebung5-probe.html` aus Task 6.

- [ ] **Step 1: Örtlichen Server starten**

Run (im Hintergrund): `cd "/Users/o_o/Desktop/Claude/Phase II/App" && python3 -m http.server 8123`

- [ ] **Step 2: Seed-Seite für die Missionsseite anlegen**

`.superpowers/sdd/seed-mission5.html` nach dem Muster von `.superpowers/sdd/seed-mission.html`:

```html
<!DOCTYPE html><meta charset="utf-8"><script>
localStorage.setItem("p2-profil", "willi");
localStorage.setItem("p2-laeufe", JSON.stringify([
 {profil:"willi",bereich:5,zeitpunkt:"2026-08-22T10:00:00Z",kennzahl:48,daten:{art:"flugphysik",gestellt:10,richtig:6,quote:60,punkte:48}},
 {profil:"willi",bereich:5,zeitpunkt:"2026-08-23T09:00:00Z",kennzahl:63,daten:{art:"flugphysik",gestellt:10,richtig:7,quote:70,punkte:63}},
 {profil:"luigi",bereich:5,zeitpunkt:"2026-08-23T08:00:00Z",kennzahl:55,daten:{art:"flugphysik",gestellt:10,richtig:7,quote:70,punkte:55}}
]));
location.href = "/mission.html?bereich=5";
</script>
```

- [ ] **Step 3: Schirmbilder aufnehmen**

Mit `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` und `BILD=/private/tmp/claude-501/-Users-o-o/5c2e8c8b-ed84-40d9-8351-a99ac7940469/scratchpad`:

```bash
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=6000 --screenshot="$BILD/m5-missionsseite.png" "http://localhost:8123/.superpowers/sdd/seed-mission5.html"
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=6000 --screenshot="$BILD/m5-wissen.png" "http://localhost:8123/entwurf/uebung5-probe.html?wissen=1"
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=8000 --screenshot="$BILD/m5-lauf.png" "http://localhost:8123/entwurf/uebung5-probe.html"
"$CHROME" --headless=new --disable-gpu --window-size=1440,900 --virtual-time-budget=15000 --screenshot="$BILD/m5-abbruch.png" "http://localhost:8123/entwurf/uebung5-probe.html?abbruch=9000"
```

- [ ] **Step 4: Schirmbilder lesen und prüfen**

Jedes Bild mit dem Read-Werkzeug ansehen und gegen die Spezifikation halten:

- `m5-missionsseite.png`: Titel TEST FLUGPHYSIK, MISSION 05, neuer Hinweistext, WISSEN-Knopf im Übungsfeld, Probebetrieb-Zeile, Diagramm mit den drei Seed-Läufen, Skala bis 100, Kennzahlname Punkte in den Balkenzeilen.
- `m5-wissen.png`: Karteikartenstapel mit Papieroptik, Linienraster, roter Kopflinie, Handschrift, Zähler 1/6, Blätterknöpfe und SCHLIESSEN.
- `m5-lauf.png`: Kopfzeile AUFGABE 1 / 10, Fragetext mit Einheiten, vier Antwortknöpfe oder Eingabefeld mit Einheit und ABGEBEN, Ablaufbalken.
- `m5-abbruch.png`: Ergebnistafel TEST ABGEBROCHEN mit Punkten, Trefferzeile, ABGEBROCHEN-Zeile und Fußzeile 10 Aufgaben, 30 s je Aufgabe.

Wenn ein Bild vom Soll abweicht: beheben, Versionsmarken hochzählen, neu aufnehmen. Der Lauf-Schirm zeigt je nach Zufall Auswahl oder Eingabe; für die jeweils andere Form die Aufnahme wiederholen, bis beide gesehen wurden.

- [ ] **Step 5: Server beenden und Gesamtlauf**

Server-Prozess beenden, dann:

Run: `node --test tests/*.test.js`
Expected: PASS, alle Tests.

- [ ] **Step 6: Abschluss-Commit, falls in Step 4 Korrekturen anfielen**

```bash
git add -A ':!.superpowers'
git commit -m "Mission 5: Feinschliff nach Sichtprüfung

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Kein `git push`: Willi gibt Pushes einzeln frei, erst nach seiner Sichtung fragen.
