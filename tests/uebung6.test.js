import test from "node:test";
import assert from "node:assert/strict";
import { BEREICHE, FRAGENZAHLEN, erzeugeFragen, kennzahl } from "../js/uebung6.js";
import { MUSTER } from "../js/muster6.js";

// Fester Zufall für nachvollziehbare Läufe.
function festerZufall(startwert = 1) {
  let stand = startwert;
  return () => {
    stand = (stand * 16807) % 2147483647;
    return (stand - 1) / 2147483646;
  };
}

const alleAnsichten = Object.fromEntries(MUSTER.map((m) => [m.id, 4]));

test("erzeugeFragen zieht die gewünschte Zahl ohne Doppelungen", () => {
  const fragen = erzeugeFragen({ ansichten: alleAnsichten, anzahl: 20, rnd: festerZufall() });
  assert.equal(fragen.length, 20);
  const ids = new Set(fragen.map((f) => f.muster.id));
  assert.equal(ids.size, 20);
});

test("erzeugeFragen mit 0 nimmt alle Muster mit Bildern", () => {
  const fragen = erzeugeFragen({ ansichten: alleAnsichten, anzahl: 0, rnd: festerZufall() });
  assert.equal(fragen.length, MUSTER.length);
});

test("erzeugeFragen überspringt Muster ohne Bilder und bleibt im Ansichtenbereich", () => {
  const ansichten = { f16: 3, f22: 1 };
  const fragen = erzeugeFragen({ ansichten, anzahl: 0, rnd: festerZufall() });
  assert.equal(fragen.length, 2);
  for (const f of fragen) {
    const nummer = Number(f.bild.match(/(\d+)\.jpg$/)[1]);
    assert.ok(nummer >= 1 && nummer <= ansichten[f.muster.id], f.bild);
    assert.ok(f.bild.startsWith(`bilder/muster/${f.muster.id}/`));
  }
});

test("erzeugeFragen mischt: zwei Startwerte, zwei Reihenfolgen", () => {
  const a = erzeugeFragen({ ansichten: alleAnsichten, anzahl: 10, rnd: festerZufall(1) });
  const b = erzeugeFragen({ ansichten: alleAnsichten, anzahl: 10, rnd: festerZufall(99) });
  assert.notDeepEqual(a.map((f) => f.muster.id), b.map((f) => f.muster.id));
});

test("kennzahl rechnet in Prozent und rundet", () => {
  assert.equal(kennzahl(0, 0), 0);
  assert.equal(kennzahl(10, 10), 100);
  assert.equal(kennzahl(1, 3), 33);
  assert.equal(kennzahl(2, 3), 67);
});

test("Bereiche und Fragenzahlen stehen fest", () => {
  assert.ok(BEREICHE.some((b) => b.id === "flugzeugmuster"));
  assert.deepEqual(FRAGENZAHLEN, [10, 20, 0]);
});
