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
