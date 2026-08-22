import { test } from "node:test";
import assert from "node:assert/strict";
import { reihe, skala, punkte, pfad, laufnummern } from "../js/diagramm.js";

const LAEUFE = [
  { profil: "willi", zeitpunkt: "2026-08-23T10:00:00Z", kennzahl: 40 },
  { profil: "luigi", zeitpunkt: "2026-08-23T09:00:00Z", kennzahl: 30 },
  { profil: "willi", zeitpunkt: "2026-08-22T10:00:00Z", kennzahl: 20 },
];

test("reihe filtert das Profil und sortiert ältesten Lauf zuerst", () => {
  assert.deepEqual(reihe(LAEUFE, "willi"), [20, 40]);
  assert.deepEqual(reihe(LAEUFE, "luigi"), [30]);
  assert.deepEqual(reihe(LAEUFE, "unbekannt"), []);
});

test("skala: Prozentkennzahlen enden fest bei 100", () => {
  assert.deepEqual(skala([63], true), { max: 100, schritte: [0, 25, 50, 75, 100] });
});

test("skala: freie Kennzahlen bekommen runde Schritte", () => {
  const s = skala([87], false);
  assert.equal(s.max, 100);
  assert.deepEqual(s.schritte, [0, 25, 50, 75, 100]);
  const klein = skala([7], false);
  assert.equal(klein.max, 8);
  assert.deepEqual(klein.schritte, [0, 2, 4, 6, 8]);
});

test("skala: ohne Werte bleibt ein brauchbarer Rahmen", () => {
  assert.deepEqual(skala([], false), { max: 10, schritte: [0, 5, 10] });
});

test("punkte verteilt Läufe über die Breite und spiegelt die Höhe", () => {
  const feld = { x: 10, y: 0, breite: 100, hoehe: 100 };
  const p = punkte([0, 50, 100], feld, 3, 100);
  assert.deepEqual(p[0], { x: 10, y: 100 });
  assert.deepEqual(p[1], { x: 60, y: 50 });
  assert.deepEqual(p[2], { x: 110, y: 0 });
});

test("punkte: ein einzelner Lauf sitzt mittig", () => {
  const feld = { x: 0, y: 0, breite: 100, hoehe: 100 };
  assert.deepEqual(punkte([100], feld, 1, 100), [{ x: 50, y: 0 }]);
});

test("pfad baut eine Linienbeschreibung", () => {
  assert.equal(pfad([{ x: 1, y: 2 }, { x: 3.25, y: 4 }]), "M 1.0 2.0 L 3.3 4.0");
});

test("laufnummern: wenige Läufe alle, viele ausgedünnt mit letzter Nummer", () => {
  assert.deepEqual(laufnummern(3), [1, 2, 3]);
  const viele = laufnummern(20);
  assert.ok(viele.length <= 7);
  assert.equal(viele[0], 1);
  assert.equal(viele[viele.length - 1], 20);
});
