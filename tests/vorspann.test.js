import { test } from "node:test";
import assert from "node:assert/strict";
import { VORSPANN_MERKER, sollVorspannLaufen } from "../js/vorspann.js";

test("Vorspann läuft nur beim echten Neuöffnen", () => {
  assert.equal(sollVorspannLaufen({ gesehen: false, navTyp: "navigate" }), true);
});

test("Vorspann bleibt beim Neuladen und Zurückblättern aus", () => {
  assert.equal(sollVorspannLaufen({ gesehen: false, navTyp: "reload" }), false);
  assert.equal(sollVorspannLaufen({ gesehen: false, navTyp: "back_forward" }), false);
});

test("Vorspann kommt je Sitzung nur einmal", () => {
  assert.equal(sollVorspannLaufen({ gesehen: true, navTyp: "navigate" }), false);
  assert.equal(typeof VORSPANN_MERKER, "string");
});
