import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, ELEMENTE, HALTEZEIT_MS, NADEL_MIN, NADEL_MAX,
  ZIELKREIS_R, STRICH_TOLERANZ, NADEL_TOLERANZ, SOLLWERTE, RAHMEN_VERHAELTNIS,
  erzeugeLaufzustand, takt, zufallsFadenkreuz, zufallsStrich,
  inDeckung, punkte, pruefeAuswahl, neuerSoll,
} from "../js/uebung2.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const ALLE = ["stick", "ruder", "schub"];
const RUHE = { stickX: 0, stickY: 0, ruder: 0, schub: 0 };

test("Rahmenwerte des Nachbaus", () => {
  assert.deepEqual(TESTDAUERN, [5, 10, 30]);
  assert.deepEqual(ELEMENTE, ["stick", "ruder", "schub"]);
  assert.equal(HALTEZEIT_MS, 1000);
  assert.equal(NADEL_MIN, 40);
  assert.equal(NADEL_MAX, 160);
  assert.equal(SOLLWERTE[0], 45);
  assert.equal(SOLLWERTE[SOLLWERTE.length - 1], 155);
  assert.ok(SOLLWERTE.every((w) => w % 5 === 0));
});

test("erzeugeLaufzustand: Startlage gültig und außerhalb der Deckung", () => {
  const rnd = saatZufall(7);
  for (let i = 0; i < 50; i++) {
    const z = erzeugeLaufzustand(ALLE, rnd);
    assert.ok(z.fadenkreuz.x >= 0 && z.fadenkreuz.x <= 1);
    assert.ok(z.fadenkreuz.y >= 0 && z.fadenkreuz.y <= 1);
    assert.ok(Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) > ZIELKREIS_R * 3);
    assert.ok(Math.abs(z.strich.x - 0.5) > STRICH_TOLERANZ * 3);
    assert.ok(SOLLWERTE.includes(z.soll));
    assert.ok(Math.abs(z.nadel - z.soll) > NADEL_TOLERANZ * 2);
  }
});

test("takt: Stickauslenkung bewegt das Fadenkreuz mit begrenzter Rate", () => {
  const rnd = saatZufall(11);
  const z = erzeugeLaufzustand(ALLE, rnd);
  const vorher = { ...z.fadenkreuz };
  takt(z, { ...RUHE, stickX: 1 }, 100, rnd);
  assert.ok(z.fadenkreuz.x > vorher.x);
  assert.ok(z.fadenkreuz.x - vorher.x < 0.1);
});

test("takt: Grenzen halten alle Elemente im erlaubten Bereich", () => {
  const rnd = saatZufall(13);
  const z = erzeugeLaufzustand(ALLE, rnd);
  for (let i = 0; i < 200; i++) takt(z, { stickX: 1, stickY: 1, ruder: 1, schub: 1 }, 50, rnd);
  assert.ok(z.fadenkreuz.x <= 1 && z.fadenkreuz.y <= 1);
  assert.ok(z.strich.x <= 1);
  assert.ok(z.nadel <= NADEL_MAX);
  for (let i = 0; i < 400; i++) takt(z, { stickX: -1, stickY: -1, ruder: -1, schub: -1 }, 50, rnd);
  assert.ok(z.fadenkreuz.x >= 0 && z.fadenkreuz.y >= 0);
  assert.ok(z.strich.x >= 0);
  assert.ok(z.nadel >= NADEL_MIN);
});

test("takt: Drift bewegt ein losgelassenes Element aus der Deckung", () => {
  const rnd = saatZufall(17);
  const z = erzeugeLaufzustand(ALLE, rnd);
  z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5;
  let dauerMs = 0;
  while (Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) <= ZIELKREIS_R && dauerMs < 60000) {
    takt(z, RUHE, 50, rnd);
    dauerMs += 50;
  }
  assert.ok(dauerMs < 15000, `Drift zu schwach, nach ${dauerMs} ms noch in Deckung`);
  assert.ok(dauerMs > 300, "Drift zu stark, Deckung sofort verloren");
});

test("takt: nicht gewählte Elemente bleiben unbewegt", () => {
  const rnd = saatZufall(19);
  const z = erzeugeLaufzustand(["stick"], rnd);
  const strichVorher = z.strich.x;
  const nadelVorher = z.nadel;
  for (let i = 0; i < 100; i++) takt(z, { ...RUHE, ruder: 1, schub: 1 }, 50, rnd);
  assert.equal(z.strich.x, strichVorher);
  assert.equal(z.nadel, nadelVorher);
});

test("takt: gleichzeitige Treffer im selben Takt zählen beide als Kombitreffer", () => {
  const rnd = saatZufall(41);
  const z = erzeugeLaufzustand(["stick", "ruder"], rnd);
  let ereignisse = [];
  for (let i = 0; i < 30 && ereignisse.length === 0; i++) {
    z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5;
    z.strich.x = 0.5;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  assert.equal(ereignisse.length, 2);
  assert.ok(ereignisse.every((e) => e.kombi === true));
  assert.equal(z.kombitreffer, 2);
});

test("Neusetzung: liefert auch bei entartetem Zufall eine gültige Lage", () => {
  const fest = () => 0.5;
  const p = zufallsFadenkreuz(fest);
  assert.deepEqual(p, { x: 0.15, y: 0.15 });
  const s = zufallsStrich(fest);
  assert.deepEqual(s, { x: 0.2 });
});

function halteInDeckung(z, element, rnd) {
  // Setzt das Element in Deckung und hält es rechnerisch eine Sekunde:
  // Deckung vor jedem Takt erneuern, weil die Drift dagegen arbeitet.
  let ereignisse = [];
  for (let i = 0; i < 20 && ereignisse.length === 0; i++) {
    if (element === "stick") { z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5; }
    if (element === "ruder") z.strich.x = 0.5;
    if (element === "schub") z.nadel = z.soll;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  return ereignisse;
}

test("takt: eine Sekunde Deckung gibt einen Treffer und setzt neu", () => {
  const rnd = saatZufall(23);
  const z = erzeugeLaufzustand(["stick"], rnd);
  const ereignisse = halteInDeckung(z, "stick", rnd);
  assert.deepEqual(ereignisse, [{ element: "stick", kombi: false }]);
  assert.equal(z.treffer.stick, 1);
  assert.equal(z.kombitreffer, 0);
  assert.ok(Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) >= 0.25);
});

test("takt: unterbrochene Deckung setzt die Haltezeit zurück", () => {
  const rnd = saatZufall(29);
  const z = erzeugeLaufzustand(["ruder"], rnd);
  z.strich.x = 0.5;
  takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 600, rnd);
  z.strich.x = 0.9; // Deckung verlassen
  takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  assert.equal(z.halte.ruder, 0);
  assert.equal(z.treffer.ruder, 0);
});

test("takt: Kombitreffer nur, wenn die übrigen gewählten Elemente in Deckung stehen", () => {
  const rnd = saatZufall(31);
  const z = erzeugeLaufzustand(["stick", "schub"], rnd);
  z.nadel = z.soll; // Schub in Deckung
  z.halte.schub = 0;
  let ereignisse = [];
  for (let i = 0; i < 20 && ereignisse.length === 0; i++) {
    z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5;
    z.nadel = z.soll;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  const stickEreignis = ereignisse.find((e) => e.element === "stick");
  assert.ok(stickEreignis);
  assert.equal(stickEreignis.kombi, true);
  assert.ok(z.kombitreffer >= 1);
});

test("neuerSoll: nie der alte Wert, immer aus dem Raster", () => {
  const rnd = saatZufall(37);
  for (let i = 0; i < 100; i++) {
    const soll = neuerSoll(75, 75, rnd);
    assert.notEqual(soll, 75);
    assert.ok(SOLLWERTE.includes(soll));
    assert.ok(Math.abs(soll - 75) >= 15);
  }
});

test("punkte: Treffer je Minute, Kombitreffer doppelt", () => {
  const z = { treffer: { stick: 10, ruder: 6, schub: 4 }, kombitreffer: 5 };
  assert.equal(punkte(z, 5), 6);   // (20 + 10) / 5
  assert.equal(punkte(z, 10), 3);  // (20 + 10) / 10
  assert.equal(punkte(z, 0), 0);
});

test("pruefeAuswahl: mindestens ein gültiges Element", () => {
  assert.ok(pruefeAuswahl(["stick"]));
  assert.ok(pruefeAuswahl(["stick", "ruder", "schub"]));
  assert.ok(!pruefeAuswahl([]));
  assert.ok(!pruefeAuswahl(["quatsch"]));
});

test("inDeckung: senkrechter Rand des Zielkreises zählt wie der sichtbare Kreis", () => {
  const rnd = saatZufall(43);
  const z = erzeugeLaufzustand(["stick"], rnd);
  z.fadenkreuz = { x: 0.5, y: 0.5 + 0.038 };
  assert.ok(inDeckung(z, "stick"));
  z.fadenkreuz = { x: 0.5 + 0.038, y: 0.5 };
  assert.ok(!inDeckung(z, "stick"));
});
