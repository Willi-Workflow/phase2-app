import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, AUFGABENZEIT, PRINZIPIEN, DREISATZ_PRINZIPIEN,
  waehlePrinzipien, erzeugeAufgabe, erzeugeLauf, panelwerte, verdeckteInstrumente,
  pruefeEingabe,
  punkteFuerAntwort, kennzahl, loesungsweg, TIPPS5,
  STUFEN5, STUFENNAMEN, STUFE_STANDARD, STUFENZAHLEN, STUNDENBRUCH_ZEITEN,
  aufgabenbestand, dreisatzSchritte, WZG_PAARE, WZG_PAARE_GLATT,
  DREISATZ_WEG_MAX, istRunderDreisatz,
} from "../js/uebung5.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test("Rahmenwerte: vierzig Sekunden je Aufgabe, drei Testdauern", () => {
  assert.equal(AUFGABENZEIT, 40);
  assert.deepEqual(TESTDAUERN, [5, 10, 30]);
});

test("waehlePrinzipien: alle vier Prinzipien mindestens einmal, gewünschte Länge", () => {
  const rnd = saatZufall(7);
  for (let i = 0; i < 20; i++) {
    const folge = waehlePrinzipien(10, rnd);
    assert.equal(folge.length, 10);
    for (const p of PRINZIPIEN) assert.ok(folge.includes(p));
  }
});

test("erzeugeAufgabe: ganzzahlig, in sich stimmig, Einheit und Bereich passen", () => {
  const rnd = saatZufall(13);
  for (let i = 0; i < 200; i++) {
    for (const prinzip of PRINZIPIEN) {
      const a = erzeugeAufgabe(prinzip, rnd);
      assert.equal(a.prinzip, prinzip);
      assert.ok(Number.isInteger(a.antwort) && a.antwort > 0);
      const zahlen = a.frage.match(/\d+/g).map(Number);
      // Untergrenze seit 17.09.2026 bei 10 NM statt bei 20: Die
      // Dreisatz-Bestände arbeiten mit Zeiten unter einer Viertelstunde,
      // und 120 kt in sieben Minuten sind nun einmal 14 NM.
      if (prinzip === "zeit") {
        const [v, s] = zahlen;
        // Erst malnehmen, dann teilen: (s / v) * 60 driftet bei Paaren wie
        // 124 NM zu 120 kt auf 62.00000000000001. Die App rechnet v * t / 60
        // und bleibt exakt, nur diese Gegenrechnung war anfaellig.
        assert.equal(a.antwort, (s * 60) / v);
        assert.equal(a.einheit, "min");
        assert.ok(s >= 10 && s <= 2400);
      }
      if (prinzip === "weg") {
        const [v, t] = zahlen;
        assert.equal(a.antwort, (v * t) / 60);
        assert.equal(a.einheit, "NM");
        assert.ok(a.antwort >= 10 && a.antwort <= 2400);
      }
      if (prinzip === "geschwindigkeit") {
        const [s, t] = zahlen;
        assert.equal(a.antwort, (s * 60) / t);
        assert.equal(a.einheit, "kt");
        assert.ok(a.antwort >= 60 && a.antwort <= 480);
      }
      if (prinzip === "rate") {
        const [h, t] = zahlen;
        assert.equal(a.antwort, h / t);
        assert.equal(a.einheit, "ft/min");
        assert.ok(h >= 500 && h <= 30000);
        assert.ok(a.antwort >= 200 && a.antwort <= 4000);
      }
    }
  }
});

test("erzeugeLauf: volle Länge, alle Prinzipien, überall Zahleneingabe", () => {
  // Seit dem 17.09.2026 gibt es nur noch eine Antwortform (Willis Auftrag,
  // Auswahlfrage ausgebaut). Das alte form-Feld darf nicht zurückkehren,
  // sonst zeigt der Lauf wieder Knöpfe zum Aussuchen.
  const rnd = saatZufall(29);
  for (let i = 0; i < 20; i++) {
    const lauf = erzeugeLauf(10, rnd);
    assert.equal(lauf.length, 10);
    for (const p of PRINZIPIEN) assert.ok(lauf.some((a) => a.prinzip === p));
    for (const a of lauf) {
      assert.equal(a.form, undefined, "das form-Feld ist ausgebaut");
      assert.ok(typeof a.antwort === "number", "jede Aufgabe hat eine Zahl als Antwort");
    }
  }
});

test("erzeugeLauf: ein Viererblock enthält jedes Prinzip genau einmal", () => {
  const rnd = saatZufall(41);
  for (let i = 0; i < 20; i++) {
    const block = erzeugeLauf(4, rnd);
    assert.deepEqual(block.map((a) => a.prinzip).sort(), [...PRINZIPIEN].sort());
  }
});

test("erzeugeAufgabe: ohne mitInstrument steht instrument auf null, bei jedem Prinzip", () => {
  const rnd = saatZufall(47);
  for (let i = 0; i < 50; i++) {
    for (const prinzip of PRINZIPIEN) {
      assert.equal(erzeugeAufgabe(prinzip, rnd).instrument, null);
    }
  }
});

test("erzeugeLauf: bei zwölf Aufgaben genau vier mit Instrument, keine davon Geschwindigkeit", () => {
  const rnd = saatZufall(53);
  for (let i = 0; i < 20; i++) {
    const lauf = erzeugeLauf(12, rnd);
    const mitInstrument = lauf.filter((a) => a.instrument !== null);
    assert.equal(mitInstrument.length, 4);
    for (const a of mitInstrument) assert.notEqual(a.prinzip, "geschwindigkeit");
  }
});

test("erzeugeLauf: Fahrt-Werte im Anzeigeraster, Vario-Werte zwischen -2000 und -200", () => {
  const rnd = saatZufall(61);
  const fahrtErlaubt = [60, 80, 90, 100, 120, 150, 180, 200, 240, 300];
  for (let i = 0; i < 50; i++) {
    const lauf = erzeugeLauf(12, rnd);
    for (const a of lauf) {
      if (a.instrument === null) continue;
      if (a.instrument.id === "fahrt") assert.ok(fahrtErlaubt.includes(a.instrument.wert));
      if (a.instrument.id === "vario") {
        assert.ok(a.instrument.wert >= -2000 && a.instrument.wert <= -200);
      }
    }
  }
});

test("erzeugeLauf: Fragetext einer Instrumentenaufgabe nennt den Ablesewert nicht", () => {
  const rnd = saatZufall(67);
  for (let i = 0; i < 50; i++) {
    const lauf = erzeugeLauf(12, rnd);
    for (const a of lauf) {
      if (a.instrument === null) continue;
      if (a.instrument.id === "fahrt") assert.ok(!a.frage.includes(`${a.instrument.wert} kt`));
      if (a.instrument.id === "hoehe") assert.ok(!a.frage.includes(`${a.instrument.wert} ft`));
    }
  }
});

test("erzeugeLauf: gleicher Zufall ergibt gleichen Lauf, auch bei den Instrumentenaufgaben", () => {
  assert.deepEqual(erzeugeLauf(12, saatZufall(83)), erzeugeLauf(12, saatZufall(83)));
});

// Die vier Prüfungen zu ablenker und antwortenFuer sind am 17.09.2026 mit
// der Auswahlfrage entfallen: Ohne Antwortknöpfe gibt es keine falschen
// Werte mehr zu bauen. Sie stehen im Commit davor, falls die Auswahlfrage
// je zurückkommt.

test("pruefeEingabe: Komma, Punkt und Leerzeichen gelten", () => {
  assert.ok(pruefeEingabe("300", 300));
  assert.ok(pruefeEingabe(" 300 ", 300));
  assert.ok(pruefeEingabe("300,0", 300));
  assert.ok(pruefeEingabe("300.0", 300));
});

test("pruefeEingabe: falsche, leere und unlesbare Eingaben gelten nicht", () => {
  assert.ok(!pruefeEingabe("299", 300));
  assert.ok(!pruefeEingabe("", 300));
  assert.ok(!pruefeEingabe("dreihundert", 300));
  assert.ok(!pruefeEingabe(null, 300));
});

test("punkteFuerAntwort: falsch gibt null Punkte", () => {
  assert.equal(punkteFuerAntwort(false, 30000, 30000), 0);
  assert.equal(punkteFuerAntwort(false, 0, 30000), 0);
});

test("punkteFuerAntwort: richtig liegt zwischen Grundanteil und zehn", () => {
  assert.equal(punkteFuerAntwort(true, 30000, 30000), 10);
  const grund = punkteFuerAntwort(true, 0, 30000);
  assert.ok(grund >= 5 && grund < 10);
});

test("punkteFuerAntwort: volle Punktzahl für jede Antwort binnen acht Sekunden", () => {
  const limit = 20000;
  assert.equal(punkteFuerAntwort(true, limit, limit), 10);
  assert.equal(punkteFuerAntwort(true, limit - 8000, limit), 10);
  assert.ok(punkteFuerAntwort(true, limit - 9000, limit) < 10);
  assert.equal(punkteFuerAntwort(true, 0, limit), 7);
});

test("punkteFuerAntwort: mehr Restzeit gibt nie weniger Punkte", () => {
  let vorher = 0;
  for (let rest = 0; rest <= 30000; rest += 3000) {
    const p = punkteFuerAntwort(true, rest, 30000);
    assert.ok(p >= vorher);
    vorher = p;
  }
});

test("kennzahl: Summe auf hundert hochgerechnet und gerundet", () => {
  assert.equal(kennzahl(100, 10), 100);
  assert.equal(kennzahl(0, 10), 0);
  assert.equal(kennzahl(55.6, 10), 56);
  assert.equal(kennzahl(0, 0), 0);
});

// Nacharbeiten aus der Endprüfung: die Drittel-Regel am echten Blockmaß des
// Laufs (Sechserblöcke), der Geschwindigkeits-Sonderfall direkt und das
// Höhenraster der Instrumentenaufgaben.
test("Sechserblock trägt genau zwei Instrumentenaufgaben", () => {
  for (let probe = 0; probe < 50; probe++) {
    const block = erzeugeLauf(6, Math.random);
    assert.equal(block.filter((a) => a.instrument).length, 2);
  }
});

test("Geschwindigkeit bleibt auch auf Wunsch eine Textaufgabe", () => {
  const a = erzeugeAufgabe("geschwindigkeit", Math.random, true);
  assert.equal(a.instrument, null);
});

test("Höhen-Instrumentenaufgaben bleiben im Anzeigeraster", () => {
  let gesehen = 0;
  for (let probe = 0; probe < 400 && gesehen < 20; probe++) {
    const a = erzeugeAufgabe("rate", Math.random, true);
    if (a.instrument?.id !== "hoehe") continue;
    gesehen += 1;
    assert.ok(a.instrument.wert >= 1000 && a.instrument.wert <= 9900);
    assert.equal(a.instrument.wert % 100, 0);
  }
  assert.ok(gesehen >= 20);
});

test("panelwerte: das Panel widerspricht der Aufgabe nicht", () => {
  for (let probe = 0; probe < 200; probe++) {
    const zeit = erzeugeAufgabe(probe % 2 ? "zeit" : "weg", Math.random, true);
    const wz = panelwerte(zeit, Math.random);
    assert.equal(wz.fahrt, zeit.instrument.wert);
    assert.equal(wz.vario, 0);
    assert.deepEqual(wz.horizont, { roll: 0, nick: 0 });

    const rate = erzeugeAufgabe("rate", Math.random, true);
    const wr = panelwerte(rate, Math.random);
    if (rate.instrument.id === "hoehe") {
      assert.equal(wr.hoehe, rate.instrument.wert);
      assert.equal(wr.vario, 0);
      assert.deepEqual(wr.horizont, { roll: 0, nick: 0 });
    } else {
      assert.equal(wr.vario, rate.instrument.wert);
      const abbau = -rate.instrument.wert * rate.antwort;
      assert.ok(wr.hoehe > abbau);          // mehr Höhe, als abgebaut wird
      assert.ok(wr.hoehe >= 1000 && wr.hoehe <= 9900);
      assert.equal(wr.hoehe % 100, 0);
      assert.deepEqual(wr.horizont, { roll: 0, nick: -10 });
    }
  }
});

test("Geschwindigkeitsfrage: ruhiger Reiseflug, Fahrtmesser wird verdeckt", () => {
  const text = erzeugeAufgabe("geschwindigkeit", Math.random);
  const w = panelwerte(text, Math.random);
  for (const feld of ["fahrt", "hoehe", "kurs", "vario", "horizont"]) assert.ok(feld in w);
  assert.equal(w.vario, 0);
  assert.deepEqual(w.horizont, { roll: 0, nick: 0 });
  assert.ok(text.frage.startsWith("Du legst"));
  assert.deepEqual(verdeckteInstrumente(text), ["fahrt"]);
});

test("verdeckteInstrumente: nur verräterische Zeiger", () => {
  assert.deepEqual(verdeckteInstrumente(erzeugeAufgabe("zeit", Math.random)), []);
  assert.deepEqual(verdeckteInstrumente(erzeugeAufgabe("weg", Math.random, true)), []);
  for (let probe = 0; probe < 50; probe++) {
    const rate = erzeugeAufgabe("rate", Math.random, probe % 2 === 0);
    // Ist die Rate die Antwort, wird das Variometer verdeckt; liest man
    // die Rate ab (Antwort in Minuten), bleibt es sichtbar.
    assert.deepEqual(verdeckteInstrumente(rate), rate.einheit === "ft/min" ? ["vario"] : []);
  }
});

test("panelwerte: auch Textwerte stehen am Instrument", () => {
  for (let probe = 0; probe < 200; probe++) {
    const zeit = erzeugeAufgabe(probe % 2 ? "zeit" : "weg", Math.random);
    const wz = panelwerte(zeit, Math.random);
    assert.equal(wz.fahrt, zeit.lage.fahrt);
    assert.ok(zeit.frage.includes(`${zeit.lage.fahrt} kt`));
    assert.equal(wz.vario, 0);
    assert.deepEqual(wz.horizont, { roll: 0, nick: 0 });

    const rate = erzeugeAufgabe("rate", Math.random);
    const wr = panelwerte(rate, Math.random);
    assert.equal(wr.vario, 0);          // die Rate ist die Antwort, kein Verrat
    assert.equal(wr.hoehe, rate.lage.aenderung);  // wörtlich wie im Text
    assert.ok(rate.frage.includes(`${rate.lage.aenderung} ft`));
  }
});

test("erzeugeAufgabe: werte tragen die Rohzahlen stimmig zur Aufgabe", () => {
  // Grundlage der Schnellrechnen-Übung (Willis Auftrag vom 07.09.2026):
  // Jede Aufgabe kennt ihre Rohwerte, der Lösungsweg rechnet mit ihnen.
  for (let i = 0; i < 200; i++) {
    for (const prinzip of PRINZIPIEN) {
      const a = erzeugeAufgabe(prinzip, Math.random, Math.random() < 0.5);
      assert.ok(a.werte, `${prinzip}: werte fehlen`);
      if (prinzip === "rate") {
        const { r, t, h } = a.werte;
        assert.equal(h, r * t);
        assert.ok([r, t].includes(a.antwort));
      } else {
        const { v, t, s } = a.werte;
        assert.equal(s, (v * t) / 60);
        assert.ok([v, t, s].includes(a.antwort));
      }
      assert.ok(loesungsweg(a).length >= 2, `${prinzip}: Lösungsweg leer`);
    }
  }
});

test("loesungsweg: wählt je Zahlenlage die schnellste Route", () => {
  // Geht die eine Minute glatt auf, ist der Dreisatz selbst der schnellste
  // Weg und wird seit dem 14.09.2026 auch so benannt.
  const zeitGlatt = { prinzip: "zeit", antwort: 15, werte: { v: 120, t: 15, s: 30 } };
  assert.deepEqual(loesungsweg(zeitGlatt), [
    "Dreisatz, Schritt 1: 120 kt heißt 120 NM in 60 Minuten, also 120 geteilt durch 60 = 2 NM in einer Minute.",
    "Dreisatz, Schritt 2: 30 NM geteilt durch 2 NM = 15 Minuten.",
  ]);
  // Krumme Knoten: Weg durch Knoten ergibt die Stunden (Prüfer-Befund
  // vom 08.09.2026, die Formelroute mit s mal 60 war nicht der Kopfweg).
  // Der Dreisatz kommt hier über die eine NM ans Ziel und steht darunter.
  const zeitKrumm = { prinzip: "zeit", antwort: 120, werte: { v: 100, t: 120, s: 200 } };
  assert.deepEqual(loesungsweg(zeitKrumm), [
    "200 NM geteilt durch 100 kt = zwei Stunden.",
    "Also 120 Minuten.",
    "Sicher geht auch der Dreisatz, Schritt 1: 100 NM brauchen 60 Minuten, eine NM also 60 geteilt durch 100 = 0,6 Minuten.",
    "Dreisatz, Schritt 2: 200 NM mal 0,6 = 120 Minuten.",
  ]);
  const zeitViertel = { prinzip: "zeit", antwort: 15, werte: { v: 80, t: 15, s: 20 } };
  assert.deepEqual(loesungsweg(zeitViertel), [
    "20 NM geteilt durch 80 kt = eine Viertelstunde.",
    "Also 15 Minuten.",
    "Sicher geht auch der Dreisatz, Schritt 1: 80 NM brauchen 60 Minuten, eine NM also 60 geteilt durch 80 = 0,75 Minuten.",
    "Dreisatz, Schritt 2: 20 NM mal 0,75 = 15 Minuten.",
  ]);
  // Genau eine Stunde: nichts zu rechnen, ab über einer Stunde schlägt
  // der Stundenbruch die NM je Minute.
  const wegStunde = { prinzip: "weg", antwort: 90, werte: { v: 90, t: 60, s: 90 } };
  assert.deepEqual(loesungsweg(wegStunde), [
    "60 Minuten sind genau eine Stunde.",
    "Der Weg entspricht den Knoten: 90 NM.",
  ]);
  const wegLang = { prinzip: "weg", antwort: 450, werte: { v: 90, t: 300, s: 450 } };
  assert.deepEqual(loesungsweg(wegLang), [
    "300 Minuten sind fünf Stunden.",
    "90 kt mal 5 = 450 NM.",
    "Sicher geht auch der Dreisatz, Schritt 1: 90 kt heißt 90 NM in 60 Minuten, also 90 geteilt durch 60 = 1,5 NM in einer Minute.",
    "Dreisatz, Schritt 2: 1,5 NM mal 300 Minuten = 450 NM.",
  ]);
  const tempoStunde = { prinzip: "geschwindigkeit", antwort: 90, werte: { v: 90, t: 60, s: 90 } };
  assert.deepEqual(loesungsweg(tempoStunde), [
    "60 Minuten sind genau eine Stunde.",
    "Die Knoten entsprechen dem Weg: 90 kt.",
  ]);
  // Krumme Knoten beim Weg: Die eine Minute wäre krumm, die eine Stunde
  // nicht, denn die Knoten sind schon die NM je Stunde.
  const wegBruch = { prinzip: "weg", antwort: 75, werte: { v: 100, t: 45, s: 75 } };
  assert.deepEqual(loesungsweg(wegBruch), [
    "45 Minuten sind eine Dreiviertelstunde.",
    "100 kt mal 3, geteilt durch 4 = 75 NM.",
    "Sicher geht auch der Dreisatz, Schritt 1: 45 Minuten sind 45 geteilt durch 60 = 0,75 Stunden.",
    "Dreisatz, Schritt 2: Eine Stunde bringt 100 NM, also 0,75 mal 100 = 75 NM.",
  ]);
  const tempoGlatt = { prinzip: "geschwindigkeit", antwort: 120, werte: { v: 120, t: 18, s: 36 } };
  assert.deepEqual(loesungsweg(tempoGlatt), [
    "Dreisatz, Schritt 1: 36 NM in 18 Minuten, also 36 geteilt durch 18 = 2 NM in einer Minute.",
    "Dreisatz, Schritt 2: 2 NM mal 60 Minuten = 120 kt.",
  ]);
  const tempoBruch = { prinzip: "geschwindigkeit", antwort: 100, werte: { v: 100, t: 45, s: 75 } };
  assert.deepEqual(loesungsweg(tempoBruch), [
    "45 Minuten sind eine Dreiviertelstunde.",
    "75 NM mal 4, geteilt durch 3 = 100 kt.",
    "Sicher geht auch der Dreisatz, Schritt 1: 45 Minuten sind 45 geteilt durch 60 = 0,75 Stunden.",
    "Dreisatz, Schritt 2: In 0,75 Stunden sind es 75 NM, in einer Stunde also 75 geteilt durch 0,75 = 100 kt.",
  ]);
  const rateGesucht = { prinzip: "rate", antwort: 600, werte: { r: 600, t: 8, h: 4800 } };
  assert.deepEqual(loesungsweg(rateGesucht), [
    "Nullen weg: aus 4800 ft werden 48.",
    "48 geteilt durch 8 Minuten = 6, Nullen dran: 600 ft/min.",
    "Sicher geht auch der Dreisatz, Schritt 1: 8 Minuten bringen 4800 ft.",
    "Dreisatz, Schritt 2: Eine Minute bringt 4800 geteilt durch 8 = 600 ft, das sind 600 ft/min.",
  ]);
  const zeitAusRate = { prinzip: "rate", antwort: 4, werte: { r: 1200, t: 4, h: 4800 } };
  assert.deepEqual(loesungsweg(zeitAusRate), [
    "Nullen weg: aus 4800 ft und 1200 ft/min werden 48 und 12.",
    "48 geteilt durch 12 = 4 Minuten.",
    "Sicher geht auch der Dreisatz, Schritt 1: Eine Minute bringt 1200 ft.",
    "Dreisatz, Schritt 2: Für 4800 ft brauchst du 4800 geteilt durch 1200 = 4 Minuten.",
  ]);
  // Ohne werte (fremde alte Aufgabe) still und leise leer.
  assert.deepEqual(loesungsweg({ prinzip: "zeit", antwort: 1 }), []);
});

// Dreisatz seit Willis Änderung vom 14.09.2026: erst auf eine Einheit
// herunterrechnen, dann auf die gesuchte Menge hoch. Die folgenden Prüfungen
// halten fest, wann er der gezeigte Weg ist, wann er neben dem Kniff steht
// und dass er dabei immer mit den echten Zahlen der Aufgabe rechnet.
const dreisatzzeilen = (zeilen) => zeilen.filter((z) => z.includes("Dreisatz"));
const enthaeltZahl = (text, n) => new RegExp(`(?<![\\d,])${n}(?![\\d,])`).test(text);

// Prüft jede Rechnung der Form "A geteilt durch B = C" beziehungsweise
// "A mal B = C" in einer Zeile nach, damit keine Zeile etwas behauptet, was
// nicht aufgeht.
const RECHNUNG = /(\d+(?:,\d+)?)\s*(?:NM|kt|ft|Minuten|Stunden)?\s+(geteilt durch|mal)\s+(\d+(?:,\d+)?)\s*(?:NM|kt|ft|Minuten|Stunden)?\s*=\s*(\d+(?:,\d+)?)/g;
function rechnungenStimmen(zeile) {
  let gesehen = 0;
  for (const t of zeile.matchAll(RECHNUNG)) {
    const zahl = (x) => Number(x.replace(",", "."));
    const soll = t[2] === "mal" ? zahl(t[1]) * zahl(t[3]) : zahl(t[1]) / zahl(t[3]);
    if (Math.abs(soll - zahl(t[4])) > 1e-9) return false;
    gesehen += 1;
  }
  return gesehen > 0;
}

test("loesungsweg: wo der Dreisatz der schnellste Weg ist, ist er der gezeigte", () => {
  // Willis Beispiel aus dem Auftrag: 180 NM in 45 Minuten sind 4 NM je Minute.
  const tempo = { prinzip: "geschwindigkeit", antwort: 240, werte: { v: 240, t: 45, s: 180 } };
  assert.deepEqual(loesungsweg(tempo), [
    "Dreisatz, Schritt 1: 180 NM in 45 Minuten, also 180 geteilt durch 45 = 4 NM in einer Minute.",
    "Dreisatz, Schritt 2: 4 NM mal 60 Minuten = 240 kt.",
  ]);
  const weg = { prinzip: "weg", antwort: 180, werte: { v: 240, t: 45, s: 180 } };
  assert.deepEqual(loesungsweg(weg), [
    "Dreisatz, Schritt 1: 240 kt heißt 240 NM in 60 Minuten, also 240 geteilt durch 60 = 4 NM in einer Minute.",
    "Dreisatz, Schritt 2: 4 NM mal 45 Minuten = 180 NM.",
  ]);
  const zeit = { prinzip: "zeit", antwort: 45, werte: { v: 240, t: 45, s: 180 } };
  assert.deepEqual(loesungsweg(zeit), [
    "Dreisatz, Schritt 1: 240 kt heißt 240 NM in 60 Minuten, also 240 geteilt durch 60 = 4 NM in einer Minute.",
    "Dreisatz, Schritt 2: 180 NM geteilt durch 4 NM = 45 Minuten.",
  ]);
  // Der Dreisatz eröffnet die Liste, er ist hier nicht bloß Beiwerk.
  for (const aufgabe of [tempo, weg, zeit]) {
    assert.ok(loesungsweg(aufgabe)[0].startsWith("Dreisatz, Schritt 1:"));
  }
});

test("loesungsweg: wo ein Kniff schneller ist, steht der Dreisatz daneben", () => {
  // Stundenbruch und Nullen-Trick bleiben oben, der Dreisatz kommt darunter
  // und sagt in der ersten Zeile, dass er der sichere Weg ist.
  const faelle = [
    { prinzip: "zeit", antwort: 30, werte: { v: 200, t: 30, s: 100 } },
    { prinzip: "weg", antwort: 60, werte: { v: 80, t: 45, s: 60 } },
    { prinzip: "geschwindigkeit", antwort: 90, werte: { v: 90, t: 120, s: 180 } },
    { prinzip: "rate", antwort: 500, werte: { r: 500, t: 6, h: 3000 } },
    { prinzip: "rate", antwort: 6, werte: { r: 500, t: 6, h: 3000 } },
  ];
  for (const aufgabe of faelle) {
    const zeilen = loesungsweg(aufgabe);
    assert.equal(zeilen.length, 4, JSON.stringify(aufgabe.werte));
    assert.ok(!zeilen[0].includes("Dreisatz"));
    assert.ok(zeilen[2].startsWith("Sicher geht auch der Dreisatz, Schritt 1:"));
    assert.ok(zeilen[3].startsWith("Dreisatz, Schritt 2:"));
  }
});

test("loesungsweg: die Dreisatz-Schritte rechnen mit den echten Zahlen der Aufgabe", () => {
  for (let i = 0; i < 400; i++) {
    for (const prinzip of PRINZIPIEN) {
      const a = erzeugeAufgabe(prinzip, Math.random, Math.random() < 0.5);
      const zeilen = dreisatzzeilen(loesungsweg(a));
      if (zeilen.length === 0) continue; // glatte Stunde, siehe eigene Prüfung
      assert.equal(zeilen.length, 2, `${prinzip}: ${JSON.stringify(a.werte)}`);
      const gegeben = prinzip === "rate"
        ? [a.werte.h, a.antwort === a.werte.t ? a.werte.r : a.werte.t]
        : { zeit: [a.werte.v, a.werte.s], weg: [a.werte.v, a.werte.t], geschwindigkeit: [a.werte.s, a.werte.t] }[prinzip];
      const block = zeilen.join(" ");
      for (const n of gegeben) assert.ok(enthaeltZahl(block, n), `${n} fehlt in: ${block}`);
      // Die letzte Zeile endet auf der Antwort der Aufgabe.
      assert.ok(new RegExp(`= ${a.antwort}(?![\\d,])`).test(zeilen[1]), zeilen[1]);
      // Und jede Rechnung darin geht auch wirklich auf.
      assert.ok(rechnungenStimmen(zeilen[1]), zeilen[1]);
    }
  }
});

test("loesungsweg: nur die glatte Stunde kommt ohne Dreisatz aus", () => {
  // Bei genau 60 Minuten steht die Aufgabe schon auf der einen Stunde, ein
  // zweiter Schritt wäre Ballast. Überall sonst gibt es den Dreisatz.
  for (let i = 0; i < 400; i++) {
    for (const prinzip of PRINZIPIEN) {
      const a = erzeugeAufgabe(prinzip, Math.random, Math.random() < 0.5);
      const ohneDreisatz = dreisatzzeilen(loesungsweg(a)).length === 0;
      if (!ohneDreisatz) continue;
      assert.equal(a.werte.t, 60, `${prinzip}: ${JSON.stringify(a.werte)}`);
      assert.ok(prinzip === "weg" || prinzip === "geschwindigkeit", prinzip);
    }
  }
  assert.equal(dreisatzzeilen(loesungsweg({
    prinzip: "weg", antwort: 90, werte: { v: 90, t: 60, s: 90 },
  })).length, 0);
});

test("erzeugeAufgabe: der gemischte Bestand schöpft aus beiden Methoden", () => {
  // Willis Änderung vom 14.09.2026, seit dem 17.09.2026 nach Methode
  // getrennt: Im gewerteten Test kommen beide Sorten vor, Formelaufgaben mit
  // glattem Stundenbruch und Dreisatzaufgaben ohne. Die Vielfalt darf nicht
  // leiden, darum muss auf jeder Stufe jede Geschwindigkeit und jede Zeit
  // ihres Bestands vorkommen.
  for (const stufe of STUFEN5) {
    const b = aufgabenbestand(stufe);
    const tempi = new Set();
    const zeiten = new Set();
    let dreisatz = 0;
    let gesamt = 0;
    for (let i = 0; i < 3000; i++) {
      const prinzip = ["zeit", "weg", "geschwindigkeit"][i % 3];
      const a = erzeugeAufgabe(prinzip, Math.random, i % 4 === 0, { stufe });
      tempi.add(a.werte.v);
      zeiten.add(a.werte.t);
      gesamt += 1;
      if (!STUNDENBRUCH_ZEITEN.includes(a.werte.t)) dreisatz += 1;
    }
    // Beide Methoden kommen vor, aber der Dreisatz führt deutlich (Willis
    // Auftrag vom 18.09.2026, DREISATZ_ANTEIL 0,75). Die untere Schranke hält
    // das Übergewicht fest, die obere sorgt dafür, dass die Formelaufgaben
    // nicht ganz verschwinden. Bei 3000 Ziehungen liegen beide Schranken
    // mehr als sechs Standardabweichungen entfernt, der Zufall kippt das nicht.
    assert.ok(dreisatz / gesamt > 0.6, `Stufe ${stufe}: Dreisatzanteil ${dreisatz / gesamt}`);
    assert.ok(dreisatz / gesamt < 0.9, `Stufe ${stufe}: Dreisatzanteil ${dreisatz / gesamt}`);
    assert.deepEqual([...tempi].sort((x, y) => x - y),
      [...new Set(b.gemischt.map((p) => p.v))].sort((x, y) => x - y), `Stufe ${stufe}: Tempi`);
    assert.deepEqual([...zeiten].sort((x, y) => x - y),
      [...new Set(b.gemischt.map((p) => p.t))].sort((x, y) => x - y), `Stufe ${stufe}: Zeiten`);
  }
});

test("erzeugeAufgabe: die glatten Paare tragen den Dreisatz als gezeigten Weg", () => {
  // Gegenprobe zur Aufgabenerzeugung: Wo die Minute aufgeht, eröffnet der
  // Dreisatz die Liste, es sei denn, die Aufgabe steht auf genau einer Stunde.
  let gezeigt = 0;
  for (let i = 0; i < 600; i++) {
    const prinzip = ["zeit", "weg", "geschwindigkeit"][i % 3];
    const a = erzeugeAufgabe(prinzip, Math.random, false);
    if (!Number.isInteger(a.werte.v / 60)) continue;
    const zeilen = loesungsweg(a);
    if (a.werte.t === 60 && prinzip !== "zeit") continue;
    if (a.werte.t > 60 && prinzip !== "zeit") continue; // dort schlägt der Stundenbruch
    assert.ok(zeilen[0].startsWith("Dreisatz, Schritt 1:"), `${prinzip}: ${zeilen[0]}`);
    gezeigt += 1;
  }
  assert.ok(gezeigt > 100, `zu wenige Fälle geprüft: ${gezeigt}`);
});

test("TIPPS5: je Prinzip ein Merktipp, und jeder benennt den Dreisatz", () => {
  for (const prinzip of PRINZIPIEN) {
    assert.ok(typeof TIPPS5[prinzip] === "string" && TIPPS5[prinzip].length > 20, prinzip);
    assert.ok(TIPPS5[prinzip].includes("Dreisatz"), prinzip);
  }
});

// Schwierigkeitsstufen und die Trennung nach Methode, Willis Auftrag vom
// 17.09.2026. Drei Stufen, an drei Stellen einstellbar: gewerteter Test,
// Schnellrechnen (Formeln) und Dreisatz. Die folgenden Prüfungen halten fest,
// was jede Stufe liefern muss und was auf keiner Stufe vorkommen darf.

test("Stufen: drei Stufen mit Namen, Standard ist die leichteste", () => {
  assert.deepEqual(STUFEN5, [1, 2, 3]);
  for (const stufe of STUFEN5) {
    assert.ok(typeof STUFENNAMEN[stufe] === "string" && STUFENNAMEN[stufe].length > 2);
  }
  assert.equal(STUFE_STANDARD, 1);
  assert.ok(STUFEN5.includes(STUFE_STANDARD));
});

test("Stufen: jede Stufe liefert gefüllte Bestände in beiden Methoden", () => {
  for (const stufe of STUFEN5) {
    const b = aufgabenbestand(stufe);
    for (const [name, feld] of Object.entries(b)) {
      assert.ok(feld.length > 0, `Stufe ${stufe}: ${name} ist leer`);
    }
    assert.equal(b.gemischt.length, b.formel.length + b.dreisatz.length);
  }
  // Eine unbekannte Stufe fällt auf die Standardstufe zurück, statt mit
  // leeren Listen loszulaufen.
  assert.deepEqual(aufgabenbestand(9), aufgabenbestand(STUFE_STANDARD));
  assert.deepEqual(aufgabenbestand(), aufgabenbestand(STUFE_STANDARD));
});

test("Stufen: Formel-Aufgaben haben immer einen glatten Stundenbruch, Dreisatz-Aufgaben nie", () => {
  for (const stufe of STUFEN5) {
    const b = aufgabenbestand(stufe);
    for (const p of b.formel) {
      assert.ok(STUNDENBRUCH_ZEITEN.includes(p.t), `Stufe ${stufe}: ${p.t} min ist kein Stundenbruch`);
    }
    for (const p of b.dreisatz) {
      assert.ok(!STUNDENBRUCH_ZEITEN.includes(p.t), `Stufe ${stufe}: ${p.t} min ist ein Stundenbruch`);
      // Der Dreisatz braucht die glatte Minute, sonst ist der Zwischenwert krumm.
      assert.ok(Number.isInteger((p.v / 60) * 2), `Stufe ${stufe}: ${p.v} kt sind keine glatte Minute`);
    }
    for (const p of b.gemischt) assert.equal(p.s, (p.v * p.t) / 60);
  }
});

test("Stufen: die erzeugten Aufgaben halten sich an die Methode", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 300; i++) {
      for (const prinzip of DREISATZ_PRINZIPIEN) {
        const mitInstrument = i % 3 === 0;
        const formel = erzeugeAufgabe(prinzip, Math.random, mitInstrument, { stufe, methode: "formel" });
        assert.ok(STUNDENBRUCH_ZEITEN.includes(formel.werte.t),
          `Stufe ${stufe}, ${prinzip}: ${formel.werte.t} min ohne Stundenbruch`);
        const dreisatz = erzeugeAufgabe(prinzip, Math.random, mitInstrument, { stufe, methode: "dreisatz" });
        assert.ok(!STUNDENBRUCH_ZEITEN.includes(dreisatz.werte.t),
          `Stufe ${stufe}, ${prinzip}: ${dreisatz.werte.t} min ist ein Stundenbruch`);
      }
    }
  }
});

test("Stufen: keine Aufgabe, deren Antwort ohne Rechnung dasteht", () => {
  // 60 kt wären 1 NM je Minute, 60 Minuten wären eine ganze Stunde (dann
  // entspricht der Weg schon den Knoten), und trügen Knoten und Minuten
  // dieselbe Zahl, stünde die gesuchte Zahl bereits im Text. Bei den Raten
  // wäre eine einzige Minute die Antwort selbst.
  for (const stufe of STUFEN5) {
    const b = aufgabenbestand(stufe);
    for (const p of b.gemischt) {
      assert.notEqual(p.v, 60, `Stufe ${stufe}: 60 kt`);
      assert.notEqual(p.t, 60, `Stufe ${stufe}: 60 min`);
      assert.notEqual(p.v, p.t, `Stufe ${stufe}: ${p.v} kt in ${p.t} min`);
      assert.notEqual(p.v, p.s);
      assert.notEqual(p.t, p.s);
    }
    for (const p of b.raten) {
      assert.ok(p.t >= 2, `Stufe ${stufe}: ${p.t} min`);
      assert.notEqual(p.r, p.h);
    }
  }
});

test("Stufen: der Zwischenwert wird von Stufe zu Stufe anspruchsvoller", () => {
  // Willis Vorgabe: leicht darf glatt und klein sein (120 kt sind 2 NM je
  // Minute), die höheren Stufen verlangen echte Arbeit, ohne krumm zu werden
  // (210 kt sind 3,5 NM je Minute). Stufe 1 rechnet darum nur mit ganzen
  // NM je Minute, ab Stufe 2 kommen halbe Werte und die krummen Knoten dazu,
  // bei denen die Minute gar nicht trägt und der Stundenbruch ran muss.
  const minuten = (stufe) => STUFENZAHLEN[stufe].tempi.map((v) => v / 60);
  for (const je of minuten(1)) assert.ok(Number.isInteger(je), `Stufe 1: ${je} NM je Minute`);
  for (const stufe of [2, 3]) {
    assert.ok(minuten(stufe).some((je) => !Number.isInteger(je) && Number.isInteger(je * 2)),
      `Stufe ${stufe}: kein halber Zwischenwert`);
    assert.ok(STUFENZAHLEN[stufe].tempi.some((v) => !Number.isInteger((v / 60) * 2)),
      `Stufe ${stufe}: kein krummer Knoten`);
  }
  // Stufe 3 arbeitet im oberen Bereich: der größte halbe Zwischenwert ist
  // dort größer als der von Stufe 2, drei und ein halbes mal 26 rechnet
  // niemand nebenbei ab.
  const groesster = (stufe) => Math.max(...minuten(stufe).filter((je) => Number.isInteger(je * 2)));
  assert.ok(groesster(3) > groesster(2), `${groesster(3)} gegen ${groesster(2)}`);
});

test("Stufen: alle Werte bleiben im Anzeigebereich der Instrumente", () => {
  // Der Fahrtmesser zeigt 60 bis 320 kt in Zehnerschritten, der Höhenmesser
  // 1000 bis 9900 ft in Hunderterschritten, das Variometer bis 2000 ft/min.
  // Das Panel spiegelt die Aufgabenwerte, also muss der Bestand hineinpassen.
  for (const stufe of STUFEN5) {
    const b = aufgabenbestand(stufe);
    for (const p of b.gemischt) {
      assert.ok(p.v >= 60 && p.v <= 320 && p.v % 10 === 0, `Stufe ${stufe}: ${p.v} kt`);
    }
    for (const p of b.raten) {
      assert.ok(p.h >= 1000 && p.h <= 8900 && p.h % 100 === 0, `Stufe ${stufe}: ${p.h} ft`);
    }
    for (const p of b.ratenVariometer) {
      assert.ok(p.r <= 2000 && p.r % 100 === 0, `Stufe ${stufe}: ${p.r} ft/min`);
    }
  }
});

test("Stufen: im Lauf bleiben Fahrt- und Variometerwerte im Raster", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 40; i++) {
      for (const a of erzeugeLauf(12, Math.random, { stufe })) {
        if (a.instrument === null) continue;
        if (a.instrument.id === "fahrt") {
          assert.ok(WZG_PAARE.some((p) => p.v === a.instrument.wert), `${a.instrument.wert} kt fremd`);
          assert.ok(a.instrument.wert >= 60 && a.instrument.wert <= 320 && a.instrument.wert % 10 === 0);
        }
        if (a.instrument.id === "vario") {
          assert.ok(a.instrument.wert >= -2000 && a.instrument.wert <= -200);
          assert.equal(Math.abs(a.instrument.wert) % 100, 0);
        }
        if (a.instrument.id === "hoehe") {
          assert.ok(a.instrument.wert >= 1000 && a.instrument.wert <= 9900);
          assert.equal(a.instrument.wert % 100, 0);
        }
      }
    }
  }
});

test("WZG_PAARE_GLATT: genau die Paare mit glatter Minute", () => {
  assert.ok(WZG_PAARE_GLATT.length > 0 && WZG_PAARE_GLATT.length < WZG_PAARE.length);
  for (const p of WZG_PAARE_GLATT) assert.ok(Number.isInteger((p.v / 60) * 2));
  for (const p of WZG_PAARE) {
    if (Number.isInteger((p.v / 60) * 2)) assert.ok(WZG_PAARE_GLATT.includes(p));
  }
});

// Die zwei Schritte des Dreisatzes als eigene Fragen: Grundlage der zweiten
// Übung, die sie einzeln abfragt statt nur das Endergebnis.

test("dreisatzSchritte: der Zwischenwert geht immer auf", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 400; i++) {
      for (const prinzip of DREISATZ_PRINZIPIEN) {
        const a = erzeugeAufgabe(prinzip, Math.random, false, { stufe, methode: "dreisatz" });
        const d = dreisatzSchritte(a);
        assert.ok(d, `Stufe ${stufe}, ${prinzip}: keine Schritte`);
        // Ganz oder ,5, alles andere rechnet im Kopf niemand weiter.
        assert.ok(Number.isInteger(d.zwischenwert * 2), `Zwischenwert ${d.zwischenwert}`);
        assert.ok(d.zwischenwert > 1, `Zwischenwert ${d.zwischenwert} ist zu billig`);
        assert.equal(d.schritt1.antwort, d.zwischenwert);
        assert.equal(d.schritt1.einheit, "NM je Minute");
      }
    }
  }
});

test("dreisatzSchritte: Schritt 1 mal Schritt 2 ergibt die Antwort", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 400; i++) {
      for (const prinzip of DREISATZ_PRINZIPIEN) {
        const a = erzeugeAufgabe(prinzip, Math.random, false, { stufe, methode: "dreisatz" });
        const { zwischenwert: je, schritt2 } = dreisatzSchritte(a);
        // Der zweite Schritt endet auf der Antwort der Aufgabe, und der
        // Zwischenwert trägt ihn: mal die Minuten, mal 60, oder geteilt.
        assert.equal(schritt2.antwort, a.antwort, `${prinzip}: ${JSON.stringify(a.werte)}`);
        if (prinzip === "weg") assert.equal(je * a.werte.t, a.antwort);
        if (prinzip === "zeit") assert.equal(je * a.antwort, a.werte.s);
        if (prinzip === "geschwindigkeit") assert.equal(je * 60, a.antwort);
        assert.equal(schritt2.einheit, a.einheit);
      }
    }
  }
});

test("dreisatzSchritte: Schritt 2 nennt den richtigen Zwischenwert im Fragetext", () => {
  // Damit sich ein Fehler aus Schritt 1 nicht weiterschleppt, steht der
  // richtige Zwischenwert in der Frage von Schritt 2, mit Komma geschrieben.
  for (const stufe of STUFEN5) {
    for (const prinzip of DREISATZ_PRINZIPIEN) {
      for (let i = 0; i < 100; i++) {
        const a = erzeugeAufgabe(prinzip, Math.random, false, { stufe, methode: "dreisatz" });
        const d = dreisatzSchritte(a);
        assert.ok(d.schritt2.frage.includes(String(d.zwischenwert).replace(".", ",")),
          `${d.zwischenwert} fehlt in: ${d.schritt2.frage}`);
        // Komma statt Punkt: 3,5 NM, nicht 3.5 NM.
        assert.ok(!/\d\.\d/.test(d.schritt2.frage), d.schritt2.frage);
      }
    }
  }
});

test("dreisatzSchritte: Raten und fremde Aufgaben geben keine Schritte", () => {
  // Bei einer Rate wäre der erste Schritt schon die Antwort, darum bleibt die
  // Dreisatz-Übung bei Weg, Zeit und Geschwindigkeit.
  assert.deepEqual(DREISATZ_PRINZIPIEN, ["zeit", "weg", "geschwindigkeit"]);
  for (let i = 0; i < 50; i++) {
    assert.equal(dreisatzSchritte(erzeugeAufgabe("rate", Math.random)), null);
  }
  assert.equal(dreisatzSchritte({ prinzip: "zeit", antwort: 1 }), null);
  // Krumme Knoten haben keine glatte Minute, dort gibt es auch keine Schritte.
  assert.equal(dreisatzSchritte({ prinzip: "weg", antwort: 75, werte: { v: 100, t: 45, s: 75 } }), null);
});

// Zielhöhenaufgabe im gewerteten Test (Willis Auftrag vom 17.09.2026,
// wörtlich: "Du sollst in Zeit X auf 3400 ft steigen (Instrument ist bereits
// bei 1000 ft und dies ist zu beachten)").

const zieheZielhoehe = (stufe) => {
  for (let i = 0; i < 2000; i++) {
    const a = erzeugeAufgabe("rate", Math.random, true, { stufe, mitZielhoehe: true });
    if (a.zielhoehe) return a;
  }
  return null;
};

test("Zielhöhenaufgabe: nennt nie die Ausgangshöhe im Text, spiegelt sie aber im Panel", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 80; i++) {
      const a = zieheZielhoehe(stufe);
      assert.ok(a, `Stufe ${stufe}: keine Zielhöhenaufgabe gezogen`);
      const { start, ziel } = a.zielhoehe;
      // Im Text steht nur die Zielhöhe, die Ausgangshöhe hängt am Zeiger.
      assert.ok(a.frage.includes(`${ziel} ft`), a.frage);
      assert.ok(!new RegExp(`(?<!\\d)${start}(?!\\d)`).test(a.frage), `${start} steht im Text: ${a.frage}`);
      assert.equal(a.instrument.id, "hoehe");
      assert.equal(a.instrument.wert, start);
      assert.equal(panelwerte(a, Math.random).hoehe, start);
    }
  }
});

test("Zielhöhenaufgabe: Höhenmesser bleibt sichtbar, das Variometer wird verdeckt", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 60; i++) {
      const a = zieheZielhoehe(stufe);
      // Ohne Höhenmesser ist die Aufgabe nicht lösbar, das Variometer
      // verriete die gesuchte Rate.
      assert.deepEqual(verdeckteInstrumente(a), ["vario"]);
      assert.equal(a.einheit, "ft/min");
      const w = panelwerte(a, Math.random);
      assert.equal(w.vario, 0);
      assert.deepEqual(w.horizont, { roll: 0, nick: 0 });
    }
  }
});

test("Zielhöhenaufgabe: alle Höhen im Anzeigebereich, die Rate geht glatt auf", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 120; i++) {
      const a = zieheZielhoehe(stufe);
      const { start, ziel, steigen } = a.zielhoehe;
      for (const hoehe of [start, ziel]) {
        assert.ok(hoehe >= 1000 && hoehe <= 8900, `Stufe ${stufe}: ${hoehe} ft`);
        assert.equal(hoehe % 100, 0);
      }
      assert.equal(Math.abs(ziel - start), a.werte.h);
      assert.equal(a.werte.h, a.antwort * a.werte.t);
      assert.ok(Number.isInteger(a.antwort) && a.antwort > 0);
      assert.equal(steigen, ziel > start);
    }
  }
});

test("Zielhöhenaufgabe: keine Zahl im Text trifft die gesuchte Rate", () => {
  // Beim Sinken kann die Zielhöhe auf die Rate fallen ("in 6 Minuten auf 1200
  // ft sinken", Antwort 1200 ft/min). Dann stünde die Antwort ablesbar im
  // Text, und Willis Bedingung wäre verletzt. Die Erzeugung schließt solche
  // Ausgangshöhen aus, diese Probe hält das fest.
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 400; i++) {
      const a = zieheZielhoehe(stufe);
      const zahlen = a.frage.match(/\d+/g).map(Number);
      assert.ok(!zahlen.includes(a.antwort), `Antwort steht im Text: ${a.frage}`);
      assert.notEqual(a.zielhoehe.ziel, a.antwort);
    }
  }
});

test("Zielhöhenaufgabe: der Text sagt eindeutig, ob gestiegen oder gesunken wird", () => {
  const gesehen = new Set();
  for (let i = 0; i < 400; i++) {
    const a = zieheZielhoehe(1 + (i % 3));
    gesehen.add(a.zielhoehe.steigen);
    if (a.zielhoehe.steigen) {
      assert.ok(a.frage.includes("steigen") && a.frage.includes("Steigrate"), a.frage);
      assert.ok(!a.frage.includes("sinken") && !a.frage.includes("Sinkrate"), a.frage);
    } else {
      assert.ok(a.frage.includes("sinken") && a.frage.includes("Sinkrate"), a.frage);
      assert.ok(!a.frage.includes("steigen") && !a.frage.includes("Steigrate"), a.frage);
    }
  }
  // Beides kommt vor.
  assert.equal(gesehen.size, 2);
});

test("Zielhöhenaufgabe: der Lösungsweg führt die Differenz als ersten Schritt mit", () => {
  for (let i = 0; i < 200; i++) {
    const a = zieheZielhoehe(1 + (i % 3));
    const zeilen = loesungsweg(a);
    const { start, ziel } = a.zielhoehe;
    assert.ok(zeilen[0].startsWith("Erst die Differenz:"), zeilen[0]);
    for (const zahl of [start, ziel, a.werte.h]) {
      assert.ok(zeilen[0].includes(String(zahl)), `${zahl} fehlt in: ${zeilen[0]}`);
    }
    // Danach kommt die Rate, und der Weg endet auf der Antwort.
    assert.ok(zeilen[1].includes("Nullen weg"), zeilen[1]);
    assert.ok(zeilen[2].includes(`${a.antwort} ft/min`), zeilen[2]);
  }
  assert.ok(TIPPS5.zielhoehe.includes("Höhenmesser") && TIPPS5.zielhoehe.includes("Differenz"));
});

test("Zielhöhenaufgabe: nur im gewerteten Lauf, nie in den Übungen", () => {
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 300; i++) {
      for (const prinzip of PRINZIPIEN) {
        for (const methode of ["formel", "dreisatz"]) {
          const a = erzeugeAufgabe(prinzip, Math.random, i % 2 === 0, { stufe, methode });
          assert.ok(!a.zielhoehe, `${methode}: ${a.frage}`);
        }
      }
    }
  }
  // Im Lauf kommt sie dagegen regelmäßig vor.
  let gesehen = 0;
  for (let i = 0; i < 60; i++) {
    gesehen += erzeugeLauf(12, Math.random, { stufe: 2 }).filter((a) => a.zielhoehe).length;
  }
  assert.ok(gesehen > 20, `nur ${gesehen} Zielhöhenaufgaben in 720`);
});

test("Alle Stufen: jede Aufgabe trägt einen brauchbaren Lösungsweg", () => {
  // Gegenprobe über den ganzen Bestand. Der Dreisatz steht dabei nur dort,
  // wo er auch glatt aufgeht: Seit der Bestand am 17.09.2026 verbreitert
  // wurde, tragen die Formel-Stufen auch krumme Knoten wie 140 kt, bei denen
  // weder die Minute noch die NM glatt herunterzurechnen sind (140 geteilt
  // durch 60 sind 2,333). Dort wäre eine erzwungene Dreisatzzeile mit einer
  // krummen Zwischenzahl schlechter als keine. Genau diese Aufgaben gehören
  // aber in die Formel-Übung, denn "70 NM geteilt durch 140 kt ist eine
  // halbe Stunde" ist der kurze Weg.
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 300; i++) {
      for (const prinzip of PRINZIPIEN) {
        const a = erzeugeAufgabe(prinzip, Math.random, i % 3 === 0, { stufe, mitZielhoehe: i % 5 === 0 });
        const zeilen = loesungsweg(a);
        assert.ok(zeilen.length >= 2, `Stufe ${stufe}, ${prinzip}: Weg zu kurz`);
        const dreisatzZeilen = zeilen.filter((z) => z.includes("Dreisatz")).length;
        // Entweder steht der Dreisatz ganz da oder gar nicht, nie halb: Eine
        // einzelne Schrittzeile wäre für den, der sich schwertut, das
        // Schlimmste. Ob er dasteht, entscheidet das Modul danach, ob der
        // Zwischenwert glatt herauskommt; diese Regel wird hier bewusst
        // nicht nachgebaut, sonst prüfte der Test nur seine eigene Kopie.
        assert.ok(dreisatzZeilen === 0 || dreisatzZeilen === 2,
          `Stufe ${stufe}, ${prinzip}: halber Dreisatz ${JSON.stringify(zeilen)}`);
        // Keine Zeile zeigt einen Punkt als Dezimaltrenner.
        for (const z of zeilen) assert.ok(!/\d\.\d/.test(z), z);
      }
    }
  }
});

test("Die Dreisatz-Übung zeigt immer beide Dreisatzzeilen", () => {
  // Was der Test darüber offenlässt, hält dieser fest: In der Übung, die den
  // Dreisatz übt, muss er auch dastehen. Ihr Bestand besteht genau aus den
  // Knoten, bei denen die Minute aufgeht.
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 400; i++) {
      for (const prinzip of ["weg", "zeit", "geschwindigkeit"]) {
        const a = erzeugeAufgabe(prinzip, Math.random, false, { stufe, methode: "dreisatz" });
        const zeilen = loesungsweg(a);
        assert.equal(zeilen.filter((z) => z.includes("Dreisatz")).length, 2,
          `Stufe ${stufe}, ${prinzip}: ${JSON.stringify(a.werte)} ${JSON.stringify(zeilen)}`);
      }
    }
  }
});

test("Keine Sink- oder Steigrate über 2000 ft/min, in keiner Stufe und keiner Übung", () => {
  // Willis Vorgabe vom 17.09.2026. Der Bestand vor dem Umbau desselben Tages
  // ließ bis 4000 ft/min zu ("6200 ft in 2 Minuten steigen" ergab 3100). Der
  // neue Bestand bleibt von sich aus deutlich darunter; dieser Test hält den
  // Deckel fest, wenn die Stufen später wachsen.
  let groesste = 0;
  for (const stufe of STUFEN5) {
    // Gewerteter Test, alle Formen, einschließlich der Zielhöhenaufgabe.
    for (let i = 0; i < 300; i++) {
      for (const a of erzeugeLauf(8, Math.random, { stufe })) {
        if (a.einheit !== "ft/min") continue;
        assert.ok(a.antwort <= 2000, `Stufe ${stufe}: ${a.antwort} ft/min in "${a.frage}"`);
        groesste = Math.max(groesste, a.antwort);
      }
    }
    // Beide Übungen.
    for (const methode of ["formel", "dreisatz"]) {
      for (let i = 0; i < 600; i++) {
        const a = erzeugeAufgabe("rate", Math.random, false, { stufe, methode });
        if (a.einheit !== "ft/min") continue;
        assert.ok(a.antwort <= 2000, `Übung ${methode}, Stufe ${stufe}: ${a.antwort} ft/min`);
        groesste = Math.max(groesste, a.antwort);
      }
    }
  }
  // Gegenprobe, dass der Test überhaupt Raten gesehen hat.
  assert.ok(groesste > 0);
});

// Rundungsregel des Dreisatz-Bestands, Willis Rückmeldung vom 17.09.2026
// ("die werte in den dreisatz übungen sind mir jetzt zu krumm"). Die
// Verbreiterung vom selben Tag hatte Minuten wie 58 und Wege wie 261 NM in
// den Bestand gespült. Die folgenden Prüfungen halten fest, was rund heißt,
// und bewachen zugleich den Preis dafür: Der Bestand darf nicht so schmal
// werden, dass die Wiederholungen zurückkommen, und keine Geschwindigkeit
// darf zur Hausgeschwindigkeit werden.

test("Dreisatz: runde Minuten, gerade Wege, nichts über dem Deckel", () => {
  for (const stufe of STUFEN5) {
    for (const p of aufgabenbestand(stufe).dreisatz) {
      assert.ok(p.t % 2 === 0 || p.t % 5 === 0,
        `Stufe ${stufe}: ${p.t} min ist weder gerade noch ein Fünfer`);
      assert.equal(p.s % 2, 0, `Stufe ${stufe}: ${p.s} NM ist ungerade`);
      assert.ok(p.s <= DREISATZ_WEG_MAX, `Stufe ${stufe}: ${p.s} NM über dem Deckel`);
      assert.ok(istRunderDreisatz(p), `Stufe ${stufe}: ${p.v} kt in ${p.t} min`);
    }
  }
});

test("Dreisatz: die krummen Werte von heute Mittag sind weg", () => {
  // Stichprobe aus dem, was Willi vorlag: Primzahl-Minuten, die Überlängen
  // und die Wege jenseits des Deckels.
  const krummeMinuten = [7, 9, 11, 13, 17, 21, 27, 58];
  // Alle ungerade: Sie koennen unter keinem Deckel zurueckkehren. 234 NM
  // stand hier bis zum 18.09.2026 mit dabei und ist seit der Anhebung auf
  // 300 NM regelkonform (180 kt in 78 Minuten), darum raus aus der Liste.
  const krummeWege = [33, 39, 51, 91, 95, 119, 133, 161, 203, 261];
  for (const stufe of STUFEN5) {
    for (const p of aufgabenbestand(stufe).dreisatz) {
      assert.ok(!krummeMinuten.includes(p.t), `Stufe ${stufe}: ${p.t} min ist zurück`);
      assert.ok(!krummeWege.includes(p.s), `Stufe ${stufe}: ${p.s} NM ist zurück`);
    }
  }
});

test("Dreisatz: jede Stufe bleibt breit genug gegen Wiederholungen", () => {
  // Der alte Bestand vor der Verbreiterung hatte 20/10/15 Paare und
  // wiederholte sich nach Willis Urteil zu oft. Darunter darf keine Stufe
  // mehr fallen, sonst ist der Gewinn von heute Mittag wieder verspielt.
  for (const stufe of STUFEN5) {
    const anzahl = aufgabenbestand(stufe).dreisatz.length;
    assert.ok(anzahl >= 25, `Stufe ${stufe}: nur ${anzahl} Dreisatz-Paare`);
  }
});

test("Dreisatz: halbe Zwischenwerte bleiben, keine Hausgeschwindigkeit", () => {
  // Der Preis der strengen Fassung wäre gewesen, dass nur 2,5 NM je Minute
  // übrig bleibt und Stufe 2 und 3 fast immer 150 kt zeigen. Genau das
  // bewacht diese Prüfung: Ab Stufe 2 müssen mindestens zwei verschiedene
  // halbe Zwischenwerte vorkommen, und kein Tempo darf den Bestand tragen.
  for (const stufe of [2, 3]) {
    const paare = aufgabenbestand(stufe).dreisatz;
    const halbe = new Set(paare.map((p) => p.v / 60).filter((je) => !Number.isInteger(je)));
    assert.ok(halbe.size >= 2, `Stufe ${stufe}: nur ${halbe.size} halbe Zwischenwerte`);
    const jeTempo = {};
    for (const p of paare) jeTempo[p.v] = (jeTempo[p.v] || 0) + 1;
    const groesster = Math.max(...Object.values(jeTempo));
    assert.ok(groesster / paare.length < 0.6,
      `Stufe ${stufe}: ein Tempo stellt ${groesster} von ${paare.length} Paaren`);
  }
});

test("Dreisatz-Übung: auch die gestellten Aufgaben tragen nur runde Werte", () => {
  // Gegenprobe am Erzeuger statt am Bestand, über alle Stufen und die drei
  // Prinzipien der Dreisatz-Übung.
  for (const stufe of STUFEN5) {
    for (let i = 0; i < 200; i++) {
      for (const prinzip of DREISATZ_PRINZIPIEN) {
        const a = erzeugeAufgabe(prinzip, Math.random, i % 3 === 0, { stufe, methode: "dreisatz" });
        const { t, s } = a.werte;
        assert.ok(t % 2 === 0 || t % 5 === 0, `Stufe ${stufe}, ${prinzip}: ${t} min`);
        assert.equal(s % 2, 0, `Stufe ${stufe}, ${prinzip}: ${s} NM`);
        assert.ok(s <= DREISATZ_WEG_MAX, `Stufe ${stufe}, ${prinzip}: ${s} NM`);
        // Der Zwischenwert der beiden Schritte muss weiter tragen.
        const schritte = dreisatzSchritte(a);
        assert.ok(schritte !== null, `Stufe ${stufe}, ${prinzip}: keine Schritte`);
        assert.ok(Number.isInteger(schritte.zwischenwert * 2),
          `Stufe ${stufe}, ${prinzip}: Zwischenwert ${schritte.zwischenwert}`);
      }
    }
  }
});
