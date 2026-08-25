import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, STUFEN, FLUGZEIT_S, EINRICHTZEIT_S, RECHENTAKT_S,
  erzeugeVorgaben, erzeugeFlugzustand, takt, sollwert, winkelabstand,
  momentanfehler, durchgangspunkte, kennzahl3,
  erzeugeRechenaufgabe, antworten5, pedalwahl,
} from "../js/uebung3.js";

// Feste Zufallsfolge über ein Array, wie in tests/uebung1.test.js.
const folge = (werte) => { let i = 0; return () => werte[i++]; };
// Zeitloser Zufall über sin, für Determinismus-Vergleiche zweier Läufe.
const zaehler = () => { let n = 0; return () => (Math.sin(n++) + 1) / 2; };

test("Konstanten des Instrumentenflugs", () => {
  assert.deepEqual(TESTDAUERN, [3, 5, 10]);
  assert.deepEqual(STUFEN, [1, 2, 3, 4]);
  assert.equal(FLUGZEIT_S, 60);
  assert.equal(EINRICHTZEIT_S, 5);
  assert.equal(RECHENTAKT_S, 12);
});

test("erzeugeVorgaben: Rasterwerte einer durchgerechneten Zufallsfolge", () => {
  // Kurs: Start 35, Änderung -150 -> Ziel 245.
  // Höhe: Start 3500, Änderung +1000 -> Ziel 4500 (kein Neuwürfeln nötig).
  // Fahrt: Start 60, Ziel 160 (Unterschied 100, kein Neuwürfeln nötig).
  const rnd = folge([0.1, 0.25, 0.1, 0.25, 0.2, 0.6, 0.01, 0.39]);
  const v = erzeugeVorgaben(3, rnd);
  assert.deepEqual(v, {
    aktive: ["kurs", "hoehe", "fahrt"],
    kurs: { start: 35, aenderung: -150, ziel: 245 },
    hoehe: { start: 3500, aenderung: 1000, ziel: 4500 },
    fahrt: { start: 60, ziel: 160 },
  });
});

test("erzeugeVorgaben: Höhe würfelt neu, bis das Ziel im Bereich liegt", () => {
  // Erster Versuch: Start 8000, Änderung +3000 -> Ziel 11000, außerhalb.
  // Zweiter Versuch: Start 2000, Änderung -500 -> Ziel 1500, gültig.
  const rnd = folge([
    0.1, 0.25, 0.1,       // Kurs (unverändert für diesen Test)
    0.95, 0.9, 0.9,       // Höhe, ungültiger Versuch
    0.01, 0.01, 0.1,      // Höhe, gültiger Versuch
    0.01, 0.39,           // Fahrt
  ]);
  const v = erzeugeVorgaben(3, rnd);
  assert.deepEqual(v.hoehe, { start: 2000, aenderung: -500, ziel: 1500 });
});

test("erzeugeVorgaben: Fahrt würfelt neu, bis der Unterschied reicht", () => {
  // Erster Versuch: Start 110, Ziel 120, Unterschied 10, zu klein.
  // Zweiter Versuch: Start 60, Ziel 260, Unterschied 200, gültig.
  const rnd = folge([
    0.1, 0.25, 0.1,        // Kurs
    0.25, 0.2, 0.6,        // Höhe
    0.19, 0.23,            // Fahrt, ungültiger Versuch
    0.01, 0.75,            // Fahrt, gültiger Versuch
  ]);
  const v = erzeugeVorgaben(3, rnd);
  assert.deepEqual(v.fahrt, { start: 60, ziel: 260 });
});

test("erzeugeVorgaben: Raster und Erreichbarkeit über viele Zufallszüge", () => {
  for (let probe = 0; probe < 500; probe++) {
    for (const stufe of STUFEN) {
      const v = erzeugeVorgaben(stufe, Math.random);

      assert.ok(v.kurs.start >= 0 && v.kurs.start <= 355);
      assert.equal(v.kurs.start % 5, 0);
      const kursBetrag = Math.abs(v.kurs.aenderung);
      assert.ok(kursBetrag >= 90 && kursBetrag <= 360);
      assert.equal(kursBetrag % 30, 0);
      assert.ok(v.kurs.ziel >= 0 && v.kurs.ziel < 360);
      assert.equal(v.kurs.ziel, ((v.kurs.start + v.kurs.aenderung) % 360 + 360) % 360);

      assert.ok(v.hoehe.start >= 2000 && v.hoehe.start <= 8000);
      assert.equal(v.hoehe.start % 500, 0);
      const hoeheBetrag = Math.abs(v.hoehe.aenderung);
      assert.ok(hoeheBetrag >= 500 && hoeheBetrag <= 3000);
      assert.equal(hoeheBetrag % 500, 0);
      assert.equal(v.hoehe.ziel, v.hoehe.start + v.hoehe.aenderung);
      assert.ok(v.hoehe.ziel >= 500 && v.hoehe.ziel <= 9900);

      assert.ok(v.fahrt.start >= 60 && v.fahrt.start <= 320);
      assert.equal(v.fahrt.start % 10, 0);
      assert.ok(v.fahrt.ziel >= 60 && v.fahrt.ziel <= 320);
      assert.equal(v.fahrt.ziel % 10, 0);
      assert.ok(Math.abs(v.fahrt.ziel - v.fahrt.start) >= 40);
    }
  }
});

test("erzeugeVorgaben: aktive je Stufe, feste Reihenfolge im Ergebnis", () => {
  // Nach den unveränderten Kurs-/Höhen-/Fahrt-Würfen mischt aktive mit den
  // Werten 0.9 und 0.1 die Reihenfolge zu [hoehe, kurs, fahrt].
  const basis = [0.1, 0.25, 0.1, 0.25, 0.2, 0.6, 0.01, 0.39];
  const v1 = erzeugeVorgaben(1, folge([...basis, 0.9, 0.1]));
  assert.deepEqual(v1.aktive, ["hoehe"]);
  const v2 = erzeugeVorgaben(2, folge([...basis, 0.9, 0.1]));
  assert.deepEqual(v2.aktive, ["kurs", "hoehe"]);
  const v3 = erzeugeVorgaben(3, folge(basis));
  assert.deepEqual(v3.aktive, ["kurs", "hoehe", "fahrt"]);
  const v4 = erzeugeVorgaben(4, folge(basis));
  assert.deepEqual(v4.aktive, ["kurs", "hoehe", "fahrt"]);

  for (let probe = 0; probe < 200; probe++) {
    const v = erzeugeVorgaben(1, Math.random);
    assert.equal(v.aktive.length, 1);
    assert.deepEqual(v.aktive, ["kurs", "hoehe", "fahrt"].filter((id) => v.aktive.includes(id)));
    const w = erzeugeVorgaben(2, Math.random);
    assert.equal(w.aktive.length, 2);
    assert.deepEqual(w.aktive, ["kurs", "hoehe", "fahrt"].filter((id) => w.aktive.includes(id)));
  }
});

test("erzeugeVorgaben ist mit gleichem Zufall gleich", () => {
  const a = erzeugeVorgaben(4, zaehler());
  const b = erzeugeVorgaben(4, zaehler());
  assert.deepEqual(a, b);
});

test("erzeugeFlugzustand: Kurs und Höhe auf Start, Fahrt auf 60", () => {
  const v = erzeugeVorgaben(3, folge([0.1, 0.25, 0.1, 0.25, 0.2, 0.6, 0.01, 0.39]));
  const z = erzeugeFlugzustand(v);
  assert.deepEqual(z, { kurs: 35, hoehe: 3500, fahrt: 60 });
});

test("takt: Kursrate stickX mal 9 Grad je Sekunde, Umlauf 0 bis 360", () => {
  const z = { kurs: 0, hoehe: 0, fahrt: 100 };
  takt(z, { stickX: 1, stickY: 0, schub: -1 }, 40); // 0,04 s, unter dem Deckel
  assert.ok(Math.abs(z.kurs - 0.36) < 1e-9);

  const z2 = { kurs: 359.8, hoehe: 0, fahrt: 100 };
  takt(z2, { stickX: 1, stickY: 0, schub: -1 }, 50); // +0,45 Grad -> Umlauf
  assert.ok(Math.abs(z2.kurs - 0.25) < 1e-9);

  const z3 = { kurs: 0.2, hoehe: 0, fahrt: 100 };
  takt(z3, { stickX: -1, stickY: 0, schub: -1 }, 50); // -0,45 Grad -> Umlauf
  assert.ok(Math.abs(z3.kurs - 359.75) < 1e-9);
});

test("takt: Höhenrate stickY mal 100 ft je Sekunde, Ziehen steigt, Deckel 0 bis 9900", () => {
  const z = { kurs: 0, hoehe: 5000, fahrt: 100 };
  takt(z, { stickX: 0, stickY: 1, schub: -1 }, 40);
  assert.ok(Math.abs(z.hoehe - 5004) < 1e-9);

  const oben = { kurs: 0, hoehe: 9899, fahrt: 100 };
  takt(oben, { stickX: 0, stickY: 1, schub: -1 }, 1000); // dt gedeckelt
  assert.equal(oben.hoehe, 9900);

  const unten = { kurs: 0, hoehe: 3, fahrt: 100 };
  takt(unten, { stickX: 0, stickY: -1, schub: -1 }, 1000); // dt gedeckelt
  assert.equal(unten.hoehe, 0);
});

test("takt: Sollfahrt aus dem Schub, Nadel folgt mit Zeitkonstante 1,5 s", () => {
  const oben = { kurs: 0, hoehe: 0, fahrt: 100 };
  takt(oben, { stickX: 0, stickY: 0, schub: 1 }, 50);
  const sollOben = 320;
  assert.ok(Math.abs(oben.fahrt - (100 + (sollOben - 100) * (1 - Math.exp(-0.05 / 1.5)))) < 1e-9);

  const unten = { kurs: 0, hoehe: 0, fahrt: 100 };
  takt(unten, { stickX: 0, stickY: 0, schub: -1 }, 50);
  const sollUnten = 60;
  assert.ok(Math.abs(unten.fahrt - (100 + (sollUnten - 100) * (1 - Math.exp(-0.05 / 1.5)))) < 1e-9);

  const mitte = { kurs: 0, hoehe: 0, fahrt: 100 };
  takt(mitte, { stickX: 0, stickY: 0, schub: 0 }, 50);
  const sollMitte = 190;
  assert.ok(Math.abs(mitte.fahrt - (100 + (sollMitte - 100) * (1 - Math.exp(-0.05 / 1.5)))) < 1e-9);
});

test("takt deckelt dt auf höchstens 0,05 s je Aufruf", () => {
  const a = { kurs: 0, hoehe: 5000, fahrt: 100 };
  const b = { kurs: 0, hoehe: 5000, fahrt: 100 };
  takt(a, { stickX: 1, stickY: 1, schub: 1 }, 50);
  takt(b, { stickX: 1, stickY: 1, schub: 1 }, 5000);
  assert.equal(a.kurs, b.kurs);
  assert.equal(a.hoehe, b.hoehe);
  assert.ok(Math.abs(a.fahrt - b.fahrt) < 1e-9);
});

test("sollwert: Randwerte bei t=0 und t=60", () => {
  const v = {
    kurs: { start: 10, aenderung: -270, ziel: 100 },
    hoehe: { start: 2000, aenderung: -500, ziel: 1500 },
    fahrt: { start: 100, ziel: 300 },
  };
  assert.equal(sollwert(v, "kurs", 0), 10);
  assert.equal(sollwert(v, "kurs", 60), 100);
  assert.equal(sollwert(v, "hoehe", 0), 2000);
  assert.equal(sollwert(v, "hoehe", 60), 1500);
  assert.equal(sollwert(v, "fahrt", 0), 100);
  assert.equal(sollwert(v, "fahrt", 60), 300);
});

test("sollwert Kurs: Interpolation über die Änderung, nicht über den kürzesten Weg", () => {
  // -270 Grad heißt links drehen: die Sollkurve läuft über 360/0 hinweg
  // abwärts, nicht den kurzen Weg über 100 nach oben.
  const v = { kurs: { start: 10, aenderung: -270, ziel: 100 }, hoehe: { start: 0, aenderung: 0, ziel: 0 }, fahrt: { start: 0, ziel: 0 } };
  assert.equal(sollwert(v, "kurs", 30), 235); // 10 - 135 = -125 -> 235

  // +30 Grad über 350 hinaus: Sollkurve läuft über 360 hinweg aufwärts.
  const w = { kurs: { start: 350, aenderung: 30, ziel: 20 }, hoehe: { start: 0, aenderung: 0, ziel: 0 }, fahrt: { start: 0, ziel: 0 } };
  assert.equal(sollwert(w, "kurs", 30), 5); // 350 + 15 = 365 -> 5
});

test("sollwert Höhe: linear von Start zu Ziel", () => {
  const v = { kurs: { start: 0, aenderung: 0, ziel: 0 }, hoehe: { start: 2000, aenderung: -500, ziel: 1500 }, fahrt: { start: 0, ziel: 0 } };
  assert.equal(sollwert(v, "hoehe", 30), 1750);
});

test("sollwert Fahrt: konstant bis Sekunde 5, danach linear bis 60", () => {
  const v = { kurs: { start: 0, aenderung: 0, ziel: 0 }, hoehe: { start: 0, aenderung: 0, ziel: 0 }, fahrt: { start: 100, ziel: 300 } };
  assert.equal(sollwert(v, "fahrt", 0), 100);
  assert.equal(sollwert(v, "fahrt", 3), 100);
  assert.equal(sollwert(v, "fahrt", 5), 100);
  assert.equal(sollwert(v, "fahrt", 32.5), 200); // Mittelpunkt zwischen 5 und 60
  assert.equal(sollwert(v, "fahrt", 60), 300);
});

test("winkelabstand: kleinster Abstand über 0 hinweg", () => {
  assert.equal(winkelabstand(350, 10), 20);
  assert.equal(winkelabstand(10, 350), 20);
  assert.equal(winkelabstand(0, 180), 180);
  assert.equal(winkelabstand(0, 0), 0);
  assert.equal(winkelabstand(45, 45), 0);
  assert.equal(winkelabstand(0, 45), 45);
});

test("momentanfehler: konstruierter Fall für Kurs", () => {
  const v = {
    aktive: ["kurs"],
    kurs: { start: 45, aenderung: 0, ziel: 45 },
    hoehe: { start: 0, aenderung: 0, ziel: 0 },
    fahrt: { start: 0, ziel: 0 },
  };
  // Sollwert konstant 45 Grad, Ist bei 67,5 Grad -> Abweichung 22,5 -> /45 = 0,5.
  const z = { kurs: 67.5, hoehe: 0, fahrt: 0 };
  assert.ok(Math.abs(momentanfehler(z, v, 30) - 0.5) < 1e-9);
  // Deckel bei 1: Abweichung 90 Grad wäre 2, bleibt bei 1.
  z.kurs = 135;
  assert.equal(momentanfehler(z, v, 30), 1);
});

test("momentanfehler: konstruierter Fall für Höhe", () => {
  const v = {
    aktive: ["hoehe"],
    kurs: { start: 0, aenderung: 0, ziel: 0 },
    hoehe: { start: 2000, aenderung: 600, ziel: 2600 },
    fahrt: { start: 0, ziel: 0 },
  };
  // Sollwert bei t=30 (Anteil 0,5): 2300. Ist 2600 -> Abweichung 300 -> /600 = 0,5.
  const z = { kurs: 0, hoehe: 2600, fahrt: 0 };
  assert.ok(Math.abs(momentanfehler(z, v, 30) - 0.5) < 1e-9);
  // Deckel bei 1.
  z.hoehe = 2000 + 900;
  assert.equal(momentanfehler(z, v, 30), 1);
});

test("momentanfehler: konstruierter Fall für Fahrt, unberücksichtigt vor Sekunde 5", () => {
  const v = {
    aktive: ["fahrt"],
    kurs: { start: 0, aenderung: 0, ziel: 0 },
    hoehe: { start: 0, aenderung: 0, ziel: 0 },
    fahrt: { start: 100, ziel: 180 },
  };
  // Sollwert bei t=32,5 (Mittelpunkt 5..60): 140. Ist 160 -> Abweichung 20 -> /40 = 0,5.
  const z = { kurs: 0, hoehe: 0, fahrt: 160 };
  assert.ok(Math.abs(momentanfehler(z, v, 32.5) - 0.5) < 1e-9);

  // Vor der Einrichtzeit ist die Fahrt das einzige aktive Instrument:
  // der Momentanfehler bleibt 0, unabhängig vom Istwert.
  z.fahrt = 999;
  assert.equal(momentanfehler(z, v, 2), 0);
});

test("momentanfehler: Mittel über mehrere aktive Instrumente, Fahrt fällt vor Sekunde 5 heraus", () => {
  const v = {
    aktive: ["kurs", "hoehe", "fahrt"],
    kurs: { start: 0, aenderung: 0, ziel: 0 },
    hoehe: { start: 2000, aenderung: 0, ziel: 2000 },
    fahrt: { start: 100, ziel: 200 },
  };
  const z = { kurs: 22.5, hoehe: 2300, fahrt: 5000 }; // Fahrt absichtlich weit daneben
  // Bei t=2 (< Einrichtzeit) zählt nur Kurs (0,5) und Höhe (0,5) -> Mittel 0,5.
  assert.ok(Math.abs(momentanfehler(z, v, 2) - 0.5) < 1e-9);
});

test("durchgangspunkte", () => {
  assert.equal(durchgangspunkte(0, 10), 100);
  assert.equal(durchgangspunkte(10, 10), 0);
  assert.equal(durchgangspunkte(5, 10), 50);
  assert.equal(durchgangspunkte(2.5, 10), 75);
});

test("kennzahl3: gerundetes Mittel, leere Liste 0", () => {
  assert.equal(kennzahl3([]), 0);
  assert.equal(kennzahl3([80, 90, 100]), 90);
  assert.equal(kennzahl3([70, 71]), 71);
});

test("erzeugeRechenaufgabe: Formen und Grenzen", () => {
  for (let i = 0; i < 500; i++) {
    const a = erzeugeRechenaufgabe(Math.random);
    assert.ok(["+", "-", "*"].includes(a.op));
    if (a.op === "+") {
      assert.equal(a.antwort, a.a + a.b);
      assert.ok(a.antwort <= 99);
      assert.ok(a.a >= 1 && a.a <= 98 && a.b >= 0);
    } else if (a.op === "-") {
      assert.equal(a.antwort, a.a - a.b);
      assert.ok(a.antwort >= 0);
      assert.ok(a.a >= 1 && a.a <= 99 && a.b >= 0);
    } else {
      assert.equal(a.antwort, a.a * a.b);
      assert.ok(a.a >= 2 && a.a <= 12);
      assert.ok(a.b >= 2 && a.b <= 12);
    }
  }
});

test("erzeugeRechenaufgabe ist mit gleichem Zufall gleich", () => {
  const a = erzeugeRechenaufgabe(zaehler());
  const b = erzeugeRechenaufgabe(zaehler());
  assert.deepEqual(a, b);
});

test("antworten5: fünf eindeutige Werte inklusive der Antwort, Ablenker alle positiv", () => {
  for (let i = 0; i < 500; i++) {
    const aufgabe = erzeugeRechenaufgabe(Math.random);
    const werte = antworten5(aufgabe, Math.random);
    assert.equal(werte.length, 5);
    assert.ok(werte.includes(aufgabe.antwort));
    assert.equal(new Set(werte).size, 5);
    // Die Antwort selbst darf bei Minusaufgaben 0 sein, die vier Ablenker
    // sind laut Vorgabe immer positiv.
    const ablenker = werte.filter((w) => w !== aufgabe.antwort);
    assert.equal(ablenker.length, 4);
    assert.ok(ablenker.every((w) => w > 0));
  }
});

test("antworten5: Ablenker liegen nah an der Antwort, beim Einmaleins auch Nachbarprodukte", () => {
  const aufgabe = { a: 7, op: "*", b: 8, antwort: 56 };
  const werte = antworten5(aufgabe, () => 0); // ohne Mischen prüfbar über den Inhalt
  const erwartetNah = [55, 57, 54, 58, 46, 66, 49, 63, 48, 64]; // Nähe plus Nachbarprodukte
  for (const w of werte) {
    if (w === 56) continue;
    assert.ok(erwartetNah.includes(w), `${w} liegt nicht in der erwarteten Nähe`);
  }
});

test("antworten5 füllt bei kleiner Antwort weiter entfernte, aber eindeutige Werte auf", () => {
  const aufgabe = { a: 5, op: "-", b: 5, antwort: 0 };
  const werte = antworten5(aufgabe, Math.random);
  assert.equal(werte.length, 5);
  assert.equal(new Set(werte).size, 5);
  assert.ok(werte.every((w) => w >= 0));
});

test("antworten5 ist mit gleichem Zufall gleich", () => {
  const aufgabe = { a: 6, op: "*", b: 9, antwort: 54 };
  const a = antworten5(aufgabe, zaehler());
  const b = antworten5(aufgabe, zaehler());
  assert.deepEqual(a, b);
});

test("pedalwahl: fünf gleich breite Zonen von -1 bis 1", () => {
  assert.equal(pedalwahl(-1), 0);
  assert.equal(pedalwahl(-0.61), 0);
  assert.equal(pedalwahl(-0.59), 1);
  assert.equal(pedalwahl(0), 2);
  assert.equal(pedalwahl(0.59), 3);
  assert.equal(pedalwahl(0.61), 4);
  assert.equal(pedalwahl(1), 4);
});
