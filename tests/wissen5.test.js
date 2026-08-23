import { test } from "node:test";
import assert from "node:assert/strict";
import { KARTEN5 } from "../js/wissen5.js";

test("Kartensatz: vier Karten mit Titel, Zeilen und Beispielrechnung", () => {
  assert.equal(KARTEN5.length, 4);
  for (const k of KARTEN5) {
    assert.ok(k.titel.length > 0);
    assert.ok(k.zeilen.length > 0);
    assert.ok(k.beispiel.length > 0);
    for (const z of [...k.zeilen, ...k.beispiel]) assert.ok(z.length > 0);
  }
});
