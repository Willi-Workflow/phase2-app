import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, STUFEN, FLUGZEIT_S, EINRICHTZEIT_S,
  RECHNEN_START_S, ANTWORT_FENSTER_S, FOLGE_PAUSE_S, ANSAGE_PAUSE_MS, RECHNEN_MINDESTREST_S,
  erzeugeVorgaben, erzeugeFlugzustand, takt, sollwert, winkelabstand, kursSollWeg,
  momentanfehler, saeulenfehler, durchgangspunkte, kennzahl3,
  erzeugeRechenaufgabe, antworten5, pedalwahl, RECHENSTUFEN_MAX, erfuellung3,
  passeRechenstufeAn, rechenstandStart, ANSTIEG_SERIE, schiebeZone,
  rechenarten, ablenkerStreuung,
} from "../js/uebung3.js";
import { svgUhr, svgSaeule, uhrwinkel, saeulenanteil } from "../js/uebung3-bild.js";

// Feste Zufallsfolge über ein Array, wie in tests/uebung1.test.js.
const folge = (werte) => { let i = 0; return () => werte[i++]; };
// Zeitloser Zufall über sin, für Determinismus-Vergleiche zweier Läufe.
const zaehler = () => { let n = 0; return () => (Math.sin(n++) + 1) / 2; };

test("Konstanten des Instrumentenflugs", () => {
  assert.deepEqual(TESTDAUERN, [3, 5, 10]);
  assert.deepEqual(STUFEN, [1, 2, 3, 4]);
  assert.equal(FLUGZEIT_S, 60);
  assert.equal(EINRICHTZEIT_S, 5);
  // Durchgehender Rechenfluss seit 03.09.2026 (Willis Auftrag): Startpunkt,
  // Antwortfenster, Folgepause und Sprechpause ersetzen den 12-s-Takt.
  assert.equal(RECHNEN_START_S, 6);
  assert.equal(ANTWORT_FENSTER_S, 10);
  assert.equal(FOLGE_PAUSE_S, 1.2);
  assert.equal(ANSAGE_PAUSE_MS, 350);
  assert.equal(RECHNEN_MINDESTREST_S, 8);
});

test("erzeugeVorgaben: Kurs, Höhe und Fahrt würfeln je Durchgang", () => {
  // Willis Aufträge vom 01.09. und 10.09.2026: Kursbeträge 180, 360, 720,
  // Höhenbeträge 500, 1000, 1500 Fuß (beide mit Richtung), die Fahrt im
  // Zwanzigerraster mit Spanne 40 bis 160 kt.
  // Je Größe zwei Züge: erst der Betrag oder Startwert, dann Richtung oder Ziel.
  const v = erzeugeVorgaben(3, folge([0.1, 0.7, 0.5, 0.5, 0.5, 0.5]));
  assert.deepEqual(v.kurs, { start: 0, aenderung: 180, ziel: 180 });
  assert.deepEqual(v.hoehe, { start: 5000, aenderung: 1000, ziel: 6000 });
  assert.deepEqual(v.fahrt, { start: 200, ziel: 160 });
  const w = erzeugeVorgaben(3, folge([0.8, 0.3, 0.9, 0.2, 0.0, 0.99]));
  assert.deepEqual(w.kurs, { start: 0, aenderung: -720, ziel: 0 });
  assert.deepEqual(w.hoehe, { start: 5000, aenderung: -1500, ziel: 3500 });
  // Von 60 kt aus deckelt die Höchstspanne das Ziel bei 220 statt 320.
  assert.deepEqual(w.fahrt, { start: 60, ziel: 220 });
});

test("erzeugeVorgaben: Raster und Erreichbarkeit über viele Zufallszüge", () => {
  const gesehen = new Set();
  for (let probe = 0; probe < 500; probe++) {
    for (const stufe of STUFEN) {
      const v = erzeugeVorgaben(stufe, Math.random);

      assert.equal(v.kurs.start, 0); // Start bleibt Norden
      assert.ok([180, 360, 720].includes(Math.abs(v.kurs.aenderung)));
      assert.equal(v.kurs.ziel, ((v.kurs.aenderung % 360) + 360) % 360);
      gesehen.add(v.kurs.aenderung);

      assert.equal(v.hoehe.start, 5000); // Starthöhe bleibt fest
      assert.ok([500, 1000, 1500].includes(Math.abs(v.hoehe.aenderung)));
      assert.equal(v.hoehe.ziel, v.hoehe.start + v.hoehe.aenderung);
      gesehen.add(`h${v.hoehe.aenderung}`);

      assert.ok(v.fahrt.start >= 60 && v.fahrt.start <= 320);
      assert.equal(v.fahrt.start % 20, 0);
      assert.ok(v.fahrt.ziel >= 60 && v.fahrt.ziel <= 320);
      assert.equal(v.fahrt.ziel % 20, 0);
      // Kopfrechenfreundlich (Willis Auftrag vom 10.09.2026): Werte und
      // Spanne glatt durch 4 teilbar, Spanne zwischen 40 und 160 kt.
      assert.equal(v.fahrt.start % 4, 0);
      assert.equal(v.fahrt.ziel % 4, 0);
      const spanne = Math.abs(v.fahrt.ziel - v.fahrt.start);
      assert.ok(spanne >= 40 && spanne <= 160);
      assert.equal(spanne % 4, 0);
    }
  }
  // Über 2000 Züge müssen bei Kurs und Höhe beide Richtungen und alle
  // Beträge vorkommen: sechs Kurswerte plus sechs Höhenwerte.
  assert.equal(gesehen.size, 12);
});

test("erzeugeVorgaben: aktive je Stufe, feste Reihenfolge im Ergebnis", () => {
  // Ab Stufe 3 sind immer alle drei Instrumente aktiv, in fester Reihenfolge.
  assert.deepEqual(erzeugeVorgaben(3, Math.random).aktive, ["kurs", "hoehe", "fahrt"]);
  assert.deepEqual(erzeugeVorgaben(4, Math.random).aktive, ["kurs", "hoehe", "fahrt"]);

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
  const v = erzeugeVorgaben(3, Math.random);
  const z = erzeugeFlugzustand(v);
  assert.deepEqual(z, { kurs: 0, kursWeg: 0, hoehe: 5000, fahrt: 60 });
});

test("takt: Kursrate stickX mal 15 Grad je Sekunde, Umlauf 0 bis 360", () => {
  // 15 Grad je Sekunde seit 29.08.2026: Die Doppeldrehung (720 Grad in 60 s
  // braucht im Schnitt 12) muss mit Reserve fliegbar sein.
  const z = { kurs: 0, hoehe: 0, fahrt: 100 };
  takt(z, { stickX: 1, stickY: 0, schub: -1 }, 40); // 0,04 s, unter dem Deckel
  assert.ok(Math.abs(z.kurs - 0.6) < 1e-9);

  const z2 = { kurs: 359.8, hoehe: 0, fahrt: 100 };
  takt(z2, { stickX: 1, stickY: 0, schub: -1 }, 50); // +0,75 Grad -> Umlauf
  assert.ok(Math.abs(z2.kurs - 0.55) < 1e-9);
  // kursWeg wickelt nicht um: hinter dem Umlauf steht die volle Gradzahl.
  assert.ok(Math.abs(z2.kursWeg - 360.55) < 1e-9);

  const z3 = { kurs: 0.2, hoehe: 0, fahrt: 100 };
  takt(z3, { stickX: -1, stickY: 0, schub: -1 }, 50); // -0,75 Grad -> Umlauf
  assert.ok(Math.abs(z3.kurs - 359.45) < 1e-9);
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

test("momentanfehler: Kurs aufgewickelt, kein Absinken beim Umlauf", () => {
  // Willis Entscheid vom 03.09.2026: Gezählt wird die tatsächlich gedrehte
  // Gradzahl gegen das Soll. Wer bei einer Volldrehung stehen bleibt, sieht
  // Säule und Wertung nicht mehr sinken, wenn das Soll am eigenen Kurs
  // vorbeiläuft (früher: kleinster Winkelabstand, 330 zu 0 waren 30 Grad).
  const v = {
    aktive: ["kurs"],
    kurs: { start: 0, aenderung: 360, ziel: 0 },
    hoehe: { start: 0, aenderung: 0, ziel: 0 },
    fahrt: { start: 0, ziel: 0 },
  };
  assert.equal(kursSollWeg(v, 55), 330);
  const stehend = { kurs: 0, kursWeg: 0, hoehe: 0, fahrt: 0 };
  assert.equal(momentanfehler(stehend, v, 30), 1); // Soll 180, voller Fehler
  assert.equal(momentanfehler(stehend, v, 55), 1); // Soll 330: bleibt voller Fehler
  const mitgedreht = { kurs: 330, kursWeg: 330, hoehe: 0, fahrt: 0 };
  assert.equal(momentanfehler(mitgedreht, v, 55), 0);
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

test("saeulenfehler: schlechtestes Instrument statt Mittel", () => {
  // Willis Auftrag vom 10.09.2026: Die Säule zeigt das schlechteste aktive
  // Instrument. Ist eines am Deckel, steht die Säule voll, egal wie sauber
  // die übrigen laufen. Die Wertung rechnet weiter mit momentanfehler.
  const v = {
    aktive: ["kurs", "hoehe"],
    kurs: { start: 0, aenderung: 0, ziel: 0 },
    hoehe: { start: 5000, aenderung: 0, ziel: 5000 },
    fahrt: { start: 100, ziel: 140 },
  };
  // Kurs 90 Grad daneben (gedeckelt 1), Höhe exakt: Mittel 0,5, Maximum 1.
  const z = { kurs: 90, kursWeg: 90, hoehe: 5000, fahrt: 100 };
  assert.ok(Math.abs(momentanfehler(z, v, 30) - 0.5) < 1e-9);
  assert.equal(saeulenfehler(z, v, 30), 1);
  // Kurs halb daneben, Höhe exakt: Mittel 0,25, Maximum 0,5.
  const halb = { kurs: 22.5, kursWeg: 22.5, hoehe: 5000, fahrt: 100 };
  assert.ok(Math.abs(saeulenfehler(halb, v, 30) - 0.5) < 1e-9);
  // Beide exakt: Säule auf 0.
  const sauber = { kurs: 0, kursWeg: 0, hoehe: 5000, fahrt: 100 };
  assert.equal(saeulenfehler(sauber, v, 30), 0);
});

test("saeulenfehler: ohne messbares Instrument 0, Fahrt zählt ab Sekunde 5", () => {
  const v = {
    aktive: ["fahrt"],
    kurs: { start: 0, aenderung: 0, ziel: 0 },
    hoehe: { start: 5000, aenderung: 0, ziel: 5000 },
    fahrt: { start: 100, ziel: 140 },
  };
  const z = { kurs: 0, kursWeg: 0, hoehe: 5000, fahrt: 60 };
  assert.equal(saeulenfehler(z, v, 2), 0); // vor der Einrichtzeit
  assert.ok(saeulenfehler(z, v, 32.5) > 0); // danach misst die Säule
});

test("durchgangspunkte", () => {
  assert.equal(durchgangspunkte(0, 0), 0);   // nie getaktet ist nicht perfekt
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

test("erzeugeRechenaufgabe: vier Rechenarten, Grenzen und Ansagbarkeit je Stufe", () => {
  // Willis Auftrag vom 14.09.2026: Mal und Geteilt kommen dazu, Minus darf
  // ins Negative gehen. Harte Randbedingung bleibt die Ansage: Es gibt
  // Klänge nur für 0 bis 99, also müssen BEIDE Operanden dort liegen und
  // ganzzahlig sein. Das Ergebnis wird nicht angesagt und darf negativ oder
  // größer sein.
  const gesehen = new Set();
  for (let stufe = 0; stufe <= RECHENSTUFEN_MAX; stufe++) {
    for (let i = 0; i < 300; i++) {
      const a = erzeugeRechenaufgabe(Math.random, stufe);
      assert.ok(["+", "-", "*", "/"].includes(a.op));
      gesehen.add(a.op);
      assert.ok(rechenarten(stufe).includes(a.op), `Stufe ${stufe}: ${a.op} nicht vorgesehen`);
      // Ansagbarkeit: ganzzahlig und im Klangvorrat n0 bis n99.
      for (const wert of [a.a, a.b]) {
        assert.ok(Number.isInteger(wert), `Stufe ${stufe}: ${wert} nicht ganzzahlig`);
        assert.ok(wert >= 0 && wert <= 99, `Stufe ${stufe}: ${wert} nicht ansagbar`);
      }
      assert.ok(Number.isInteger(a.antwort));
      const deckel = [9, 15, 20, 30, 40, 55, 70, 85, 99][stufe];
      if (a.op === "+") {
        assert.equal(a.antwort, a.a + a.b);
        assert.ok(a.antwort <= 99); // Plus bleibt bewusst zweistellig
        assert.ok(a.a >= 1 && a.a <= deckel, `Stufe ${stufe}: a=${a.a}`);
      } else if (a.op === "-") {
        assert.equal(a.antwort, a.a - a.b);
        assert.ok(a.a >= 1 && a.a <= deckel, `Stufe ${stufe}: a=${a.a}`);
        assert.ok(a.b <= deckel, `Stufe ${stufe}: b=${a.b}`);
        // Auf der untersten Sprosse bleibt Minus im Positiven.
        if (stufe < 1) assert.ok(a.antwort >= 0, `Stufe ${stufe} soll nicht negativ werden`);
      } else if (a.op === "*") {
        assert.equal(a.antwort, a.a * a.b);
        // Fliegbar im Kopf: ein Faktor bleibt einstellig.
        assert.ok(Math.min(a.a, a.b) <= 9, `Stufe ${stufe}: ${a.a} mal ${a.b} zu schwer`);
      } else {
        // Teilen muss glatt aufgehen und darf nie durch 0 oder 1 teilen.
        assert.ok(a.b >= 2, `Stufe ${stufe}: Teiler ${a.b}`);
        assert.equal(a.a % a.b, 0, `Stufe ${stufe}: ${a.a} geteilt durch ${a.b} geht nicht auf`);
        assert.equal(a.antwort, a.a / a.b);
        assert.ok(a.a <= deckel, `Stufe ${stufe}: Dividend ${a.a} über dem Deckel`);
      }
    }
  }
  // Über alle Stufen müssen alle vier Rechenarten vorgekommen sein.
  assert.deepEqual([...gesehen].sort(), ["*", "+", "-", "/"]);
  // Ohne Stufenangabe gilt Stufe 0 (einstellig, nur Plus und Minus),
  // jenseits wird geklemmt.
  const leicht = erzeugeRechenaufgabe(() => 0.99);
  assert.ok(leicht.a <= 9 && leicht.b <= 9);
  assert.ok(["+", "-"].includes(leicht.op));
  const geklemmt = erzeugeRechenaufgabe(() => 0.99, 99);
  assert.ok(geklemmt.a <= 99 && geklemmt.b <= 99);
});

test("rechenarten: unterste Sprosse nur Plus und Minus, Mal ab 1, Geteilt ab 2", () => {
  // Nur der Einstieg bleibt leicht. Tief gehängt nach der Messung vom
  // 14.09.2026: Auf Stufe 5 wäre Teilen im Lauf praktisch nie vorgekommen.
  assert.deepEqual(rechenarten(0), ["+", "-"]);
  assert.deepEqual(rechenarten(1), ["+", "-", "*"]);
  assert.deepEqual(rechenarten(2), ["+", "-", "*", "/"]);
  assert.deepEqual(rechenarten(RECHENSTUFEN_MAX), ["+", "-", "*", "/"]);
  assert.deepEqual(rechenarten(99), ["+", "-", "*", "/"]); // geklemmt
});

test("Rechenarten kommen in einem echten Lauf wirklich vor", () => {
  // Gegenprobe zur Messung: Ein Fünf-Minuten-Lauf bringt rund 30 Aufgaben,
  // die Stufe steigt nach drei Richtigen und fällt bei jedem Fehler. Selbst
  // bei mäßiger Trefferquote müssen alle vier Arten und negative Ergebnisse
  // auftauchen, sonst steht Willis Auftrag nur auf dem Papier.
  const gesehen = new Set();
  let negativ = 0;
  for (let lauf = 0; lauf < 200; lauf++) {
    let stand = rechenstandStart();
    for (let i = 0; i < 30; i++) {
      const a = erzeugeRechenaufgabe(Math.random, stand.stufe);
      gesehen.add(a.op);
      if (a.antwort < 0) negativ++;
      stand = passeRechenstufeAn(stand, Math.random() < 0.7);
    }
  }
  assert.deepEqual([...gesehen].sort(), ["*", "+", "-", "/"]);
  assert.ok(negativ > 50, `zu wenige negative Ergebnisse: ${negativ} in 200 Läufen`);
});

test("erzeugeRechenaufgabe: negative Ergebnisse kommen oben wirklich vor", () => {
  let negativ = 0;
  for (let i = 0; i < 2000; i++) {
    if (erzeugeRechenaufgabe(Math.random, RECHENSTUFEN_MAX).antwort < 0) negativ++;
  }
  assert.ok(negativ > 0, "auf der obersten Sprosse fehlen negative Ergebnisse");
});

test("passeRechenstufeAn: drei Richtige heben, jeder Fehler senkt", () => {
  // Willis Treppenregel vom 03.09.2026: langsamer Anstieg über die Serie,
  // sofortiger Abstieg bei falsch oder verpasst, Grenzen 0 und Maximum.
  let stand = rechenstandStart();
  assert.deepEqual(stand, { stufe: 0, serie: 0 });
  stand = passeRechenstufeAn(stand, true);
  stand = passeRechenstufeAn(stand, true);
  assert.equal(stand.stufe, 0); // zwei Richtige reichen nicht
  stand = passeRechenstufeAn(stand, true);
  assert.deepEqual(stand, { stufe: 1, serie: 0 });
  stand = passeRechenstufeAn(stand, true);
  stand = passeRechenstufeAn(stand, false); // Fehler bricht die Serie und senkt
  assert.deepEqual(stand, { stufe: 0, serie: 0 });
  stand = passeRechenstufeAn(stand, false); // unter 0 geht es nicht
  assert.deepEqual(stand, { stufe: 0, serie: 0 });
});

test("passeRechenstufeAn: Deckel am Maximum, Serie zählt nach Fehler neu", () => {
  let stand = { stufe: RECHENSTUFEN_MAX, serie: ANSTIEG_SERIE - 1 };
  stand = passeRechenstufeAn(stand, true);
  assert.deepEqual(stand, { stufe: RECHENSTUFEN_MAX, serie: 0 });
  stand = passeRechenstufeAn(stand, false);
  assert.equal(stand.stufe, RECHENSTUFEN_MAX - 1);
  // Nach dem Fehler heben erst wieder drei Richtige in Folge.
  stand = passeRechenstufeAn(stand, true);
  stand = passeRechenstufeAn(stand, true);
  assert.equal(stand.stufe, RECHENSTUFEN_MAX - 1);
  stand = passeRechenstufeAn(stand, true);
  assert.equal(stand.stufe, RECHENSTUFEN_MAX);
});

test("erzeugeRechenaufgabe ist mit gleichem Zufall gleich", () => {
  const a = erzeugeRechenaufgabe(zaehler());
  const b = erzeugeRechenaufgabe(zaehler());
  assert.deepEqual(a, b);
});

test("antworten5: fünf eindeutige, ganzzahlige Werte inklusive der Antwort", () => {
  // Seit dem 14.09.2026 dürfen Ablenker null oder negativ sein: Wären sie
  // weiter auf positiv gezwungen, stäche bei einem negativen Ergebnis die
  // richtige Antwort als einzige negative Zahl heraus, ohne dass jemand
  // rechnen müsste. Geprüft wird über alle Stufen, damit auch Produkte und
  // negative Ergebnisse vorkommen.
  for (let stufe = 0; stufe <= RECHENSTUFEN_MAX; stufe++) {
    for (let i = 0; i < 200; i++) {
      const aufgabe = erzeugeRechenaufgabe(Math.random, stufe);
      const werte = antworten5(aufgabe, Math.random);
      assert.equal(werte.length, 5);
      assert.ok(werte.includes(aufgabe.antwort));
      assert.equal(new Set(werte).size, 5);
      assert.ok(werte.every((w) => Number.isInteger(w)));
    }
  }
});

test("antworten5: Ablenker liegen nah an der Antwort, der weite wächst mit ihr", () => {
  // Nah sind immer ±1 und ±2, dazu ein weiter Ablenker von rund einem
  // Fünftel der Antwort (mindestens 3, höchstens 20).
  assert.equal(ablenkerStreuung(56), 11);
  assert.equal(ablenkerStreuung(3), 3);     // Untergrenze greift
  assert.equal(ablenkerStreuung(180), 20);  // Obergrenze greift
  assert.equal(ablenkerStreuung(-40), 8);   // Betrag zählt

  const aufgabe = { a: 47, op: "+", b: 9, antwort: 56 };
  const werte = antworten5(aufgabe, () => 0); // ohne Mischen prüfbar über den Inhalt
  const erwartetNah = [55, 57, 54, 58, 45, 67]; // ±1, ±2, ±11
  for (const w of werte) {
    if (w === 56) continue;
    assert.ok(erwartetNah.includes(w), `${w} liegt nicht in der erwarteten Nähe`);
  }
});

test("antworten5 bleibt bei Antwort 0 und bei negativer Antwort eindeutig", () => {
  for (const aufgabe of [
    { a: 5, op: "-", b: 5, antwort: 0 },
    { a: 4, op: "-", b: 30, antwort: -26 },
  ]) {
    const werte = antworten5(aufgabe, Math.random);
    assert.equal(werte.length, 5);
    assert.equal(new Set(werte).size, 5);
    assert.ok(werte.includes(aufgabe.antwort));
  }
});

test("antworten5: kein Ablenker, der ohne Rechnen ausscheidet", () => {
  // Bei positiver Antwort bleiben alle Ablenker positiv. Ein Ablenker unter
  // 1 wäre bei Plus, Mal und Geteilt ohne jede Rechnung auszuschließen und
  // verschenkte einen der fünf Knöpfe; im Einstieg traf das jede vierte
  // Aufgabe. Bei Antwort 0 und darunter bleiben nicht positive Ablenker
  // dagegen nötig, sonst wäre die Antwort die einzige ihrer Art.
  for (let stufe = 0; stufe <= RECHENSTUFEN_MAX; stufe++) {
    for (let i = 0; i < 300; i++) {
      const aufgabe = erzeugeRechenaufgabe(Math.random, stufe);
      const werte = antworten5(aufgabe, Math.random);
      assert.equal(new Set(werte).size, 5);
      const ablenker = werte.filter((w) => w !== aufgabe.antwort);
      if (aufgabe.antwort > 0) {
        assert.ok(ablenker.every((w) => w > 0), `Stufe ${stufe}: ${aufgabe.antwort} mit ${ablenker}`);
      } else {
        // Die Antwort darf nie die einzige nicht positive Zahl der Liste sein.
        assert.ok(werte.filter((w) => w <= 0).length >= 2, `Stufe ${stufe}: ${werte}`);
      }
    }
  }
  // Antwort 1 ist der engste Fall: aus der Nähe bleiben nur 2, 3 und 4,
  // der vierte Ablenker kommt aus der Schlussschleife.
  const knapp = antworten5({ a: 5, op: "-", b: 4, antwort: 1 }, Math.random);
  assert.equal(new Set(knapp).size, 5);
  assert.ok(knapp.includes(1));
  assert.ok(knapp.every((w) => w > 0));
});

test("antworten5 ist mit gleichem Zufall gleich", () => {
  const aufgabe = { a: 6, op: "*", b: 9, antwort: 54 };
  const a = antworten5(aufgabe, zaehler());
  const b = antworten5(aufgabe, zaehler());
  assert.deepEqual(a, b);
});

test("schiebeZone: schrittweise mit Klemmung an den Rändern", () => {
  // Pfeiltastenwahl ohne Pedale (Willis Auftrag vom 03.09.2026).
  assert.equal(schiebeZone(2, 1), 3);
  assert.equal(schiebeZone(2, -1), 1);
  assert.equal(schiebeZone(0, -1), 0);
  assert.equal(schiebeZone(4, 1), 4);
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

test("uhrwinkel: volle Umdrehung über 60 Sekunden ab der 12-Uhr-Stellung", () => {
  assert.equal(uhrwinkel(60), 0);
  assert.equal(uhrwinkel(30), 180);
  assert.equal(uhrwinkel(0), 360);
});

test("saeulenanteil: linear zwischen 0 und 1, außerhalb gedeckelt", () => {
  assert.equal(saeulenanteil(-5), 0);
  assert.equal(saeulenanteil(50), 0.5);
  assert.equal(saeulenanteil(120), 1);
});

test("svgUhr: Zeiger steht auf dem gerechneten Winkel, Aufschrift Zeit", () => {
  assert.ok(svgUhr(60).includes('rotate(0.00 60 60)'));
  assert.ok(svgUhr(30).includes('rotate(180.00 60 60)'));
  assert.ok(svgUhr(0).includes('rotate(360.00 60 60)'));
  assert.ok(svgUhr(45).includes("ZEIT"));
  assert.ok(svgUhr(45).includes("<svg"));
});

test("svgSaeule: Punkt steht auf der gerechneten Höhe, Aufschrift Fehlersäule", () => {
  assert.ok(svgSaeule(-5).includes('cy="106.00"'));
  assert.ok(svgSaeule(50).includes('cy="67.00"'));
  assert.ok(svgSaeule(120).includes('cy="28.00"'));
  assert.ok(svgSaeule(50).includes("FEHLERSÄULE"));
  assert.ok(svgSaeule(50).includes("<svg"));
});

test("Erfüllung Mission 3: Kopfrechnen fließt in Stufe 4 mit 20 Prozent ein", () => {
  assert.equal(erfuellung3(90, null), 90);                    // ohne Rechenteil
  assert.equal(erfuellung3(90, { richtig: 0, gestellt: 0 }), 90);
  assert.ok(Math.abs(erfuellung3(90, { richtig: 5, gestellt: 10 }) - (0.8 * 90 + 0.2 * 50)) < 1e-9);
  assert.ok(Math.abs(erfuellung3(100, { richtig: 10, gestellt: 10 }) - 100) < 1e-9);
});
