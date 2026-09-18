import test from "node:test";
import assert from "node:assert/strict";
import { schwierigkeitsfaktor1, TEMPOS } from "../js/uebung1.js";
import { schwierigkeitsfaktor2 } from "../js/uebung2.js";
import { schwierigkeitsfaktor3, INSTRUMENTE } from "../js/uebung3.js";
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

test("Mission 3: nur alle Controls mit Kopfrechnen erreichen den Faktor 1", () => {
  // Seit 19.09.2026 waehlt der Bewerber die Instrumente selbst (Willis
  // Auftrag), vorher gab es die Stufen 1 bis 4. Der Grundsatz bleibt: Die
  // volle Einstellung, also alle drei Controls plus Kopfrechnen, ist die
  // einzige mit Faktor 1.
  const voll = schwierigkeitsfaktor3(INSTRUMENTE.length, true);
  assert.ok(Math.abs(voll - 1.0) < 1e-9);
  for (const anzahl of [1, 2, 3]) {
    for (const rechnen of [false, true]) {
      if (anzahl === INSTRUMENTE.length && rechnen) continue;
      assert.ok(schwierigkeitsfaktor3(anzahl, rechnen) < 1.0, `${anzahl} Controls, rechnen ${rechnen}`);
    }
  }
});

test("Mission 4: nur die schwerste Einstellung erreicht den Faktor 1", () => {
  assert.equal(schwierigkeitsfaktor(3, 5), 1.0);
  assert.ok(schwierigkeitsfaktor(Math.max(...ANZEIGEZEITEN), Math.min(...FRAGENANZAHLEN)) < 0.55);
});
