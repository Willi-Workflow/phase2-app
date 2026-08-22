import { test } from "node:test";
import assert from "node:assert/strict";
import { kurzname, rollenStand } from "../js/geraetestand.js";

const ROLLEN = [
  ["stickX", "Stick quer"],
  ["schub", "Schubregler"],
];

test("kurzname entfernt den Vendor-Zusatz der Chrome-Kennung", () => {
  assert.equal(kurzname("T.16000M (Vendor: 044f Product: b10a)"), "T.16000M");
  assert.equal(kurzname("TWCS Throttle (STANDARD GAMEPAD Vendor: 044f Product: b687)"), "TWCS Throttle");
});

test("kurzname kürzt überlange Namen mit Auslassungszeichen", () => {
  const kurz = kurzname("Saitek Pro Flight Rudder Pedals Deluxe");
  assert.ok(kurz.length <= 27);
  assert.ok(kurz.endsWith("…"));
});

test("rollenStand: ohne Zuweisung greift die Tastatur", () => {
  const [stickX, schub] = rollenStand(ROLLEN, {}, []);
  assert.equal(stickX.zustand, "tastatur");
  assert.equal(stickX.text, "Tastatur");
  assert.equal(schub.titel, "Schubregler");
});

test("rollenStand: zugewiesenes und verbundenes Gerät erscheint mit Achse", () => {
  const kennung = "T.16000M (Vendor: 044f Product: b10a)";
  const zuordnung = { stickX: { geraet: kennung, achse: 0, invert: false } };
  const [stickX] = rollenStand(ROLLEN, zuordnung, [kennung]);
  assert.equal(stickX.zustand, "verbunden");
  assert.equal(stickX.text, "T.16000M · Achse 0");
});

test("rollenStand: Umkehrung wird ausgewiesen", () => {
  const kennung = "T.16000M (Vendor: 044f Product: b10a)";
  const zuordnung = { stickX: { geraet: kennung, achse: 1, invert: true } };
  const [stickX] = rollenStand(ROLLEN, zuordnung, [kennung]);
  assert.equal(stickX.text, "T.16000M · Achse 1 · umgekehrt");
});

test("rollenStand: zugewiesenes, aber fehlendes Gerät wird gemeldet", () => {
  const zuordnung = { schub: { geraet: "TWCS Throttle (Vendor: 044f Product: b687)", achse: 2, invert: true } };
  const stand = rollenStand(ROLLEN, zuordnung, []);
  assert.equal(stand[1].zustand, "fehlt");
  assert.equal(stand[1].text, "TWCS Throttle fehlt · Tastatur greift");
});
