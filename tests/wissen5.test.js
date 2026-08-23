import { test } from "node:test";
import assert from "node:assert/strict";
import { KARTEN5 } from "../js/wissen5.js";

test("Kartensatz: sechs Karten mit Titel und Zeilen", () => {
  assert.equal(KARTEN5.length, 6);
  for (const k of KARTEN5) {
    assert.ok(k.titel.length > 0);
    assert.ok(k.zeilen.length > 0);
    for (const z of k.zeilen) assert.ok(z.length > 0);
  }
});
