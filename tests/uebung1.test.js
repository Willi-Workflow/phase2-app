import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, HALTEZEIT_MS, KREIS_R, BILDVERHAELTNIS, MINDESTABSTAND, KEGEL, SPRUNG, MAXROLL,
  zufallsZiel, erzeugeLaufzustand, takt, inDeckung, zufallsKreis,
  deckungsquote, ergebnisWerte,
} from "../js/uebung1.js";

const still = { stickX: 0, stickY: 0, ruder: 0 };
// Fester Zufall: keine Drift (Zielwert 0 entsteht bei rnd()=0.5), planbare Sprünge.
const halb = () => 0.5;

const abstandFuerTest = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * BILDVERHAELTNIS);

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
