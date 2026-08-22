import { test } from "node:test";
import assert from "node:assert/strict";
import { tageBis, tagesliste, heuteAlsIso, monatsraster, monatsanfang, PRUEFUNGSDATUM } from "../js/zeitplan.js";

test("tageBis zählt volle Tage, unabhängig von der Uhrzeit", () => {
  assert.equal(tageBis("2026-09-14", "2026-08-22"), 23);
  assert.equal(tageBis("2026-09-14", "2026-09-14"), 0);
  assert.equal(tageBis("2026-09-14", "2026-09-15"), -1);
});

test("tagesliste umfasst beide Ränder und kennt Wochenenden", () => {
  const liste = tagesliste("2026-09-11", "2026-09-14");
  assert.equal(liste.length, 4);
  assert.deepEqual(liste.map((t) => t.wochentag), ["Fr", "Sa", "So", "Mo"]);
  assert.deepEqual(liste.map((t) => t.wochenende), [false, true, true, false]);
  assert.equal(liste.at(-1).iso, PRUEFUNGSDATUM);
});

test("heuteAlsIso liefert das Kalenderdatum mit führenden Nullen", () => {
  assert.equal(heuteAlsIso(new Date(2026, 8, 5)), "2026-09-05");
});

test("tagesliste übersteht den Monatswechsel", () => {
  const liste = tagesliste("2026-08-30", "2026-09-02");
  assert.deepEqual(liste.map((t) => `${t.tag}.${t.monat}`), ["30.8", "31.8", "1.9", "2.9"]);
});


test("monatsraster beginnt montags und füllt Ränder mit Lücken", () => {
  const monate = monatsraster("2026-08-01", "2026-09-14");
  assert.equal(monate.length, 2);
  assert.equal(monate[0].name, "August");
  assert.equal(monate[1].name, "September");
  // 1.8.2026 ist ein Samstag: fünf Lücken davor
  assert.deepEqual(monate[0].wochen[0].slice(0, 5), [null, null, null, null, null]);
  assert.equal(monate[0].wochen[0][5].tag, 1);
  // 1.9.2026 ist ein Dienstag: eine Lücke davor
  assert.equal(monate[1].wochen[0][0], null);
  assert.equal(monate[1].wochen[0][1].tag, 1);
  // letzter Eintrag ist der Prüfungstag, Restwoche aufgefüllt
  const letzteWoche = monate[1].wochen.at(-1);
  assert.equal(letzteWoche.filter(Boolean).at(-1).iso, PRUEFUNGSDATUM);
  assert.equal(letzteWoche.length, 7);
});

test("monatsanfang liefert den Ersten des Monats", () => {
  assert.equal(monatsanfang("2026-08-22"), "2026-08-01");
});
