import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, ELEMENTE, HALTEZEIT_MS, NADEL_MIN, NADEL_MAX,
  ZIELKREIS_R, STRICH_TOLERANZ, NADEL_TOLERANZ, SOLL_KT, RAHMEN_VERHAELTNIS, FADEN_RAND,
  erzeugeLaufzustand, takt, zufallsFadenkreuz, zufallsStrich,
  inDeckung, punkte, pruefeAuswahl, zufallsNadel, deckungsquote, erfuellung2,
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
  assert.equal(SOLL_KT, 95);
});

test("takt: Stickrate läuft an statt sofort voll anzuliegen", () => {
  // Willis Rückmeldung vom 01.09.2026 ("zu direkt, gerade bei Mission 2"):
  // Die Sollrate baut sich wie in Mission 1 über die Anlaufzeit auf. Drift
  // stillgelegt, damit nur die Eingabe misst.
  const rnd = saatZufall(7);
  const z = erzeugeLaufzustand(ALLE, rnd);
  for (const d of [z.drift.fx, z.drift.fy, z.drift.strich, z.drift.nadel]) { d.ziel = 0; d.wert = 0; d.restMs = 1e9; }
  z.fadenkreuz = { x: 0.5, y: 0.5 };
  takt(z, { ...RUHE, stickX: 1 }, 50, rnd);
  const erster = z.fadenkreuz.x - 0.5;
  assert.ok(erster > 0 && erster < 0.015); // ein Drittel der vollen Rate
  for (let i = 0; i < 100; i++) takt(z, { ...RUHE, stickX: 1 }, 50, rnd);
  z.fadenkreuz.x = 0.5; // von der Randbegrenzung lösen
  takt(z, { ...RUHE, stickX: 1 }, 50, rnd);
  const voll = z.fadenkreuz.x - 0.5;
  assert.ok(voll > 0.025); // volle Rate: 0,56 je Sekunde mal 0,05 s

  // Nachschwenken (Willis Videobefund vom 01.09.2026): Nach dem Loslassen
  // trägt das Fadenkreuz Restschwung und läuft spürbar weiter, statt sofort
  // zu stehen. Eine halbe Sekunde Auslauf muss deutlich Weg machen.
  z.fadenkreuz.x = 0.5;
  for (let i = 0; i < 10; i++) takt(z, RUHE, 50, rnd);
  const auslauf = z.fadenkreuz.x - 0.5;
  assert.ok(auslauf > 0.05, `Auslauf ${auslauf} zu kurz`);
});

test("erzeugeLaufzustand: Startlage gültig und außerhalb der Deckung", () => {
  const rnd = saatZufall(7);
  for (let i = 0; i < 50; i++) {
    const z = erzeugeLaufzustand(ALLE, rnd);
    assert.ok(z.fadenkreuz.x >= 0 && z.fadenkreuz.x <= 1);
    assert.ok(z.fadenkreuz.y >= 0 && z.fadenkreuz.y <= 1);
    assert.ok(Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) > ZIELKREIS_R * 3);
    assert.ok(Math.abs(z.strich.x - 0.5) > STRICH_TOLERANZ * 3);
    assert.equal(z.soll, 95);
    assert.ok(Math.abs(z.nadel - 95) >= 20);
    assert.ok(z.nadel >= NADEL_MIN && z.nadel <= NADEL_MAX && z.nadel % 5 === 0);
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
  // Das Fadenkreuz bleibt innerhalb des Randabstands, nie am Bildrand.
  assert.ok(z.fadenkreuz.x <= 1 - FADEN_RAND && z.fadenkreuz.y <= 1 - FADEN_RAND);
  assert.ok(z.strich.x <= 1);
  assert.ok(z.nadel <= NADEL_MAX);
  for (let i = 0; i < 400; i++) takt(z, { stickX: -1, stickY: -1, ruder: -1, schub: -1 }, 50, rnd);
  assert.ok(z.fadenkreuz.x >= FADEN_RAND && z.fadenkreuz.y >= FADEN_RAND);
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

test("zufallsNadel: Fünferraster, in den Grenzen, mindestens 20 Knoten vom Sollwert", () => {
  const rnd = saatZufall(37);
  for (let i = 0; i < 100; i++) {
    const kt = zufallsNadel(rnd);
    assert.ok(kt >= NADEL_MIN && kt <= NADEL_MAX);
    assert.equal(kt % 5, 0);
    assert.ok(Math.abs(kt - SOLL_KT) >= 20);
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

test("deckungsquote: Anteil der Testzeit in Deckung, gemittelt", () => {
  const z = { auswahl: ["stick", "ruder"], testMs: 10000, deckungMs: { stick: 5000, ruder: 2500, schub: 0 } };
  assert.equal(deckungsquote(z), 38);
  assert.equal(deckungsquote({ auswahl: ["stick"], testMs: 0, deckungMs: { stick: 0, ruder: 0, schub: 0 } }), 0);
});

test("takt: sammelt Deckungszeit und Testzeit", () => {
  const rnd = saatZufall(47);
  const z = erzeugeLaufzustand(["ruder"], rnd);
  z.strich.x = 0.5;
  takt(z, RUHE, 300, rnd);
  assert.equal(z.testMs, 300);
  assert.equal(z.deckungMs.ruder, 300);
  z.strich.x = 0.9;
  takt(z, RUHE, 100, rnd);
  assert.equal(z.testMs, 400);
  assert.equal(z.deckungMs.ruder, 300);
});

test("Erfüllung Mission 2: Deckung am Bestwert 65 gemessen", () => {
  assert.equal(erfuellung2(65), 100);
  assert.equal(erfuellung2(100), 100);
  assert.ok(Math.abs(erfuellung2(32.5) - 50) < 1e-9);
  assert.equal(erfuellung2(0), 0);
});
