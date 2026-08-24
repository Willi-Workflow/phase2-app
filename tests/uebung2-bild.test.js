import { test } from "node:test";
import assert from "node:assert/strict";
import { BILD, RAHMEN, TACHO, xImBild, yImBild, gradFuerKnoten, buehneSvg } from "../js/uebung2-bild.js";
import { RAHMEN_VERHAELTNIS } from "../js/uebung2.js";

test("Maße: Rahmen liegt mittig im 1600er-Bild", () => {
  assert.equal(BILD.b, 1600);
  assert.equal(BILD.h, 900);
  assert.equal(RAHMEN.x * 2 + RAHMEN.b, 1600);
  assert.ok(RAHMEN.b / 1600 > 0.75 && RAHMEN.b / 1600 < 0.85);
});

test("Rahmenhöhe ist an das Deckungsverhältnis gekoppelt", () => {
  assert.equal(RAHMEN.h, RAHMEN.b * RAHMEN_VERHAELTNIS);
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
