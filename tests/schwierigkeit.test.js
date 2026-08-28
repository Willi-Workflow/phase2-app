import test from "node:test";
import assert from "node:assert/strict";
import { schwierigkeitsfaktor1, TEMPOS } from "../js/uebung1.js";
import { schwierigkeitsfaktor2 } from "../js/uebung2.js";
import { schwierigkeitsfaktor3, STUFEN } from "../js/uebung3.js";
import { schwierigkeitsfaktor, ANZEIGEZEITEN, FRAGENANZAHLEN } from "../js/uebung4.js";

// Willis Grundsatz: 100 Prozent gibt es nur auf der schwersten Einstellung.
// Jede leichtere Einstellung deckelt die Wertung über einen Faktor unter 1.

test("Mission 1: nur Letter-Task im schnellsten Tempo erreicht den Faktor 1", () => {
  assert.equal(schwierigkeitsfaktor1(true, 1000), 1.0);
  assert.ok(schwierigkeitsfaktor1(false, 1000) < 1.0);
  for (const tempo of TEMPOS.filter((t) => t !== 1000)) {
    assert.ok(schwierigkeitsfaktor1(true, tempo) < 1.0, `Tempo ${tempo}`);
    assert.ok(schwierigkeitsfaktor1(true, tempo) > schwierigkeitsfaktor1(false, tempo));
  }
});

test("Mission 2: nur alle drei Elemente erreichen den Faktor 1", () => {
  assert.equal(schwierigkeitsfaktor2(3), 1.0);
  assert.ok(schwierigkeitsfaktor2(2) < 1.0);
  assert.ok(schwierigkeitsfaktor2(1) < schwierigkeitsfaktor2(2));
});

test("Mission 3: nur Stufe 4 erreicht den Faktor 1, jede Stufe wiegt mehr", () => {
  assert.equal(schwierigkeitsfaktor3(4), 1.0);
  for (let i = 1; i < STUFEN.length; i++) {
    assert.ok(schwierigkeitsfaktor3(STUFEN[i - 1]) < schwierigkeitsfaktor3(STUFEN[i]));
  }
});

test("Mission 4: nur die schwerste Einstellung erreicht den Faktor 1", () => {
  assert.equal(schwierigkeitsfaktor(3, 5), 1.0);
  assert.ok(schwierigkeitsfaktor(Math.max(...ANZEIGEZEITEN), Math.min(...FRAGENANZAHLEN)) < 0.55);
});
