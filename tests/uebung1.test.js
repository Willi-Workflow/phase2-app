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
