import { test } from "node:test";
import assert from "node:assert/strict";
import { KARTEN5 } from "../js/wissen5.js";

test("Kartensatz: Fundament plus vier gesuchte Größen, je mit Beispiel", () => {
  // Willis Auftrag vom 14.09.2026: eine Fundament-Karte vorneweg, dann je
  // gesuchter Größe eine Karte mit Schritt-für-Schritt-Beispiel.
  assert.equal(KARTEN5.length, 5);
  assert.ok(KARTEN5[0].titel.includes("Fundament"));
  for (const gesucht of ["Geschwindigkeit", "Weg", "Zeit", "rate"]) {
    assert.ok(KARTEN5.some((k) => k.titel.includes(gesucht)), `Karte für ${gesucht} fehlt`);
  }
  for (const k of KARTEN5) {
    assert.ok(k.titel.length > 0);
    assert.ok(k.zeilen.length > 0);
    assert.ok(k.beispiel.length > 0);
    for (const z of [...k.zeilen, ...k.beispiel]) assert.ok(z.length > 0);
    // Kopf, Zeilen, Beispielkopf und Beispiel müssen aufs 34px-Linienraster
    // der Karte passen (Stapelhöhe 430px): höchstens neun Inhaltszeilen.
    assert.ok(k.zeilen.length + 1 + k.beispiel.length <= 9, `Karte ${k.titel} zu lang`);
  }
  // Die Karten der gesuchten Größen rechnen ihr Beispiel in Schritten vor.
  for (const k of KARTEN5.slice(1)) {
    assert.ok(k.beispiel.some((z) => z.startsWith("Schritt 1")), `${k.titel} ohne Schritt 1`);
  }
});
