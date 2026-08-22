import { test } from "node:test";
import assert from "node:assert/strict";
import { mitKurve, groessterAusschlag } from "../js/kurve.js";

test("mitKurve: innerhalb der Totzone ist der Wert 0", () => {
  assert.equal(mitKurve(0.05, 0.06, 0), 0);
  assert.equal(mitKurve(-0.05, 0.06, 0), 0);
});

test("mitKurve: Vollausschlag bleibt Vollausschlag", () => {
  assert.equal(mitKurve(1, 0.06, 0), 1);
  assert.equal(mitKurve(-1, 0.06, 0.5), -1);
});

test("mitKurve: Expo staucht die Mitte", () => {
  const ohne = mitKurve(0.5, 0, 0);
  const mit = mitKurve(0.5, 0, 1);
  assert.equal(ohne, 0.5);
  assert.ok(mit < ohne && mit > 0); // reine Kubikkurve: 0.125
});

test("groessterAusschlag findet die bewegte Achse über alle Geräte", () => {
  const basen = [
    { geraet: "Stick", achsen: [0, 0, 0] },
    { geraet: "Schub", achsen: [-1] },
  ];
  const jetzt = [
    { geraet: "Stick", achsen: [0.1, 0, 0] },
    { geraet: "Schub", achsen: [-0.2] },
  ];
  const t = groessterAusschlag(basen, jetzt, 0.55);
  assert.deepEqual(t, { geraet: "Schub", achse: 0, delta: 0.8 });
});

test("groessterAusschlag liefert null unterhalb der Schwelle", () => {
  const basen = [{ geraet: "Stick", achsen: [0] }];
  const jetzt = [{ geraet: "Stick", achsen: [0.3] }];
  assert.equal(groessterAusschlag(basen, jetzt, 0.55), null);
});

test("groessterAusschlag übersteht neu dazugekommene Geräte", () => {
  const basen = [{ geraet: "Stick", achsen: [0] }];
  const jetzt = [
    { geraet: "Stick", achsen: [0] },
    { geraet: "Pedale", achsen: [0.9] },
  ];
  const t = groessterAusschlag(basen, jetzt, 0.55);
  assert.deepEqual(t, { geraet: "Pedale", achse: 0, delta: 0.9 });
});

test("groessterAusschlag waehlt groesseres rohen Delta, nicht Rundungsartefakt", () => {
  const basen = [
    { geraet: "A", achsen: [0] },
    { geraet: "B", achsen: [0] },
  ];
  const jetzt = [
    { geraet: "A", achsen: [0.803] },
    { geraet: "B", achsen: [0.801] },
  ];
  const t = groessterAusschlag(basen, jetzt, 0.55);
  assert.deepEqual(t, { geraet: "A", achse: 0, delta: 0.8 });
});
