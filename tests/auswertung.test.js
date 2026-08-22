import { test } from "node:test";
import assert from "node:assert/strict";
import { sortiertNeueste, bestwert, durchschnitt, vergleich } from "../js/auswertung.js";

const laeufe = [
  { profil: "willi", bereich: 1, zeitpunkt: "2026-08-20T10:00:00Z", kennzahl: 70, daten: {} },
  { profil: "willi", bereich: 1, zeitpunkt: "2026-08-22T10:00:00Z", kennzahl: 84, daten: {} },
  { profil: "luigi", bereich: 1, zeitpunkt: "2026-08-21T10:00:00Z", kennzahl: 74, daten: {} },
  { profil: "willi", bereich: 1, zeitpunkt: "2026-08-21T10:00:00Z", kennzahl: 86, daten: {} },
];

test("sortiertNeueste ordnet absteigend nach Zeitpunkt", () => {
  const s = sortiertNeueste(laeufe);
  assert.equal(s[0].kennzahl, 84);
  assert.equal(s.at(-1).kennzahl, 70);
  assert.equal(laeufe[0].kennzahl, 70); // Eingabe bleibt unangetastet
});

test("bestwert liefert das Maximum, null bei leer", () => {
  assert.equal(bestwert(laeufe), 86);
  assert.equal(bestwert([]), null);
});

test("durchschnitt rundet auf eine Nachkommastelle, null bei leer", () => {
  assert.equal(durchschnitt(laeufe), 78.5); // (70+84+74+86)/4
  assert.equal(durchschnitt([]), null);
});

test("vergleich trennt nach Profil", () => {
  const v = vergleich(laeufe);
  assert.equal(v.willi.anzahl, 3);
  assert.equal(v.willi.bestwert, 86);
  assert.equal(v.willi.durchschnitt, 80);
  assert.equal(v.luigi.anzahl, 1);
  assert.equal(v.luigi.durchschnitt, 74);
});
