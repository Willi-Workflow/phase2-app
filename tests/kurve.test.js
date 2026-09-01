import { test } from "node:test";
import assert from "node:assert/strict";
import { mitKurve, groessterAusschlag, mitEmpfindlichkeit, empfindlichkeitFuer, mitRuhelage, glaette } from "../js/kurve.js";

test("glaette: Zeitkonstante 0 heißt aus, der neue Wert gilt sofort", () => {
  assert.equal(glaette(0, 1, 16, 0), 1);
  assert.equal(glaette(0.8, -0.3, 16, 0), -0.3);
});

test("glaette: folgt mit der Zeitkonstante, bildratenunabhängig", () => {
  // Nach genau einer Zeitkonstante sind rund 63 Prozent des Wegs geschafft.
  const einSchritt = glaette(0, 1, 100, 100);
  assert.ok(Math.abs(einSchritt - (1 - Math.exp(-1))) < 1e-12);
  // Zwei halbe Schritte ergeben denselben Stand wie ein ganzer: die Wirkung
  // hängt an der vergangenen Zeit, nicht an der Zahl der Aufrufe.
  const zweiHalbe = glaette(glaette(0, 1, 50, 100), 1, 50, 100);
  assert.ok(Math.abs(zweiHalbe - einSchritt) < 1e-12);
  // Sehr großes dt (etwa nach Tabwechsel) landet praktisch auf dem Ziel.
  assert.ok(Math.abs(glaette(0, 1, 10000, 100) - 1) < 1e-12);
});

test("mitEmpfindlichkeit: skaliert ohne Kappung, Faktor heißt Rate", () => {
  // Seit 01.09.2026 (Willis Auftrag): Der Faktor skaliert die Missionsrate,
  // Werte über 1 sind erlaubt. Die alte Kappung bei ±1 hatte ab dem
  // Sättigungspunkt eine Wand in die Kennlinie gebaut.
  assert.equal(mitEmpfindlichkeit(0.4, 1), 0.4);
  assert.equal(mitEmpfindlichkeit(0.4, 1.5), 0.6000000000000001);
  assert.equal(mitEmpfindlichkeit(0.8, 2), 1.6);
  assert.equal(mitEmpfindlichkeit(-0.8, 2), -1.6);
  assert.equal(mitEmpfindlichkeit(1, 0.5), 0.5);
});

test("mitRuhelage: verschobene Mitte wird zur neuen Null, Enden bleiben voll", () => {
  assert.equal(mitRuhelage(0.04, 0.04), 0);   // Ruhe liegt genau auf der Messung
  assert.equal(mitRuhelage(1, 0.04), 1);      // Vollausschlag bleibt erreichbar
  assert.equal(mitRuhelage(-1, 0.04), -1);
  assert.equal(mitRuhelage(0, 0), 0);         // ohne Versatz neutral
  assert.equal(mitRuhelage(0.5, 0), 0.5);
  // Beide Seiten strecken linear: die Hälfte des Restwegs ist der halbe Wert.
  assert.ok(Math.abs(mitRuhelage(0.52, 0.04) - 0.5) < 1e-12);
  assert.ok(Math.abs(mitRuhelage(-0.48, 0.04) - (-0.5)) < 1e-12);
});

test("mitRuhelage: Fehlmessungen über 0,5 Betrag wirken neutral", () => {
  // Eine beim Messen gegriffene Achse oder ein Hebel mit Endlagen-Ruhe
  // (etwa ein Schubregler auf Anschlag) darf die Mitte nicht verschieben.
  assert.equal(mitRuhelage(0.3, 0.9), 0.3);
  assert.equal(mitRuhelage(0.3, -1), 0.3);
  // Und das Ergebnis bleibt im Achsenbereich, auch wenn das Gerät leicht
  // über 1 meldet.
  assert.equal(mitRuhelage(1.02, 0.04), 1);
});

test("empfindlichkeitFuer: Modus alle nimmt den allgemeinen Wert", () => {
  assert.equal(empfindlichkeitFuer("alle", 1.4, { Stick: 0.8 }, "Stick"), 1.4);
});

test("empfindlichkeitFuer: Modus geraet nimmt den Gerätewert, ohne Eintrag neutral", () => {
  assert.equal(empfindlichkeitFuer("geraet", 1.4, { Stick: 0.8 }, "Stick"), 0.8);
  assert.equal(empfindlichkeitFuer("geraet", 1.4, { Stick: 0.8 }, "Pedale"), 1);
  // Tastatur-Ersatz hat kein Gerät: im Gerätemodus neutral
  assert.equal(empfindlichkeitFuer("geraet", 1.4, {}, undefined), 1);
});

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

test("mitKurve: expo wird auf den Bereich 0 bis 1 begrenzt", () => {
  // Ein negatives Expo (spitze Mitte) war am 31.08.2026 kurz eingebaut und
  // nach Willis Testflug wieder verworfen; negativ wirkt seither wie 0.
  assert.equal(mitKurve(0.5, 0, 2), 0.125);
  assert.equal(mitKurve(-0.5, 0, 2), -0.125);
  assert.equal(mitKurve(0.5, 0, -1), 0.5);
});

test("mitKurve: totzone wird auf den Bereich 0 bis 0.9 begrenzt", () => {
  assert.equal(mitKurve(1, 1, 0), 1); // ohne Begrenzung: Division durch 0 (NaN/Infinity)
  assert.equal(mitKurve(1, 5, 0), 1); // extreme Totzone wirkt wie 0.9
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
