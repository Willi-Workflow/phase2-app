import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, AUFGABENZEIT, PRINZIPIEN,
  waehlePrinzipien, erzeugeAufgabe, erzeugeLauf, panelwerte, verdeckteInstrumente,
  ablenker, antwortenFuer, pruefeEingabe,
  punkteFuerAntwort, kennzahl, loesungsweg, TIPPS5,
} from "../js/uebung5.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test("Rahmenwerte: zwanzig Sekunden je Aufgabe, drei Testdauern", () => {
  assert.equal(AUFGABENZEIT, 20);
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
      if (prinzip === "zeit") {
        const [v, s] = zahlen;
        assert.equal(a.antwort, (s / v) * 60);
        assert.equal(a.einheit, "min");
        assert.ok(s >= 20 && s <= 2400);
      }
      if (prinzip === "weg") {
        const [v, t] = zahlen;
        assert.equal(a.antwort, (v * t) / 60);
        assert.equal(a.einheit, "NM");
        assert.ok(a.antwort >= 20 && a.antwort <= 2400);
      }
      if (prinzip === "geschwindigkeit") {
        const [s, t] = zahlen;
        assert.equal(a.antwort, (s / t) * 60);
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

test("erzeugeLauf: volle Länge, alle Prinzipien, beide Formen kommen vor", () => {
  const rnd = saatZufall(29);
  const formen = new Set();
  for (let i = 0; i < 20; i++) {
    const lauf = erzeugeLauf(10, rnd);
    assert.equal(lauf.length, 10);
    for (const p of PRINZIPIEN) assert.ok(lauf.some((a) => a.prinzip === p));
    for (const a of lauf) {
      assert.ok(["auswahl", "eingabe"].includes(a.form));
      formen.add(a.form);
    }
  }
  assert.equal(formen.size, 2);
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

test("ablenker: drei eindeutige, positive, ganzzahlige Werte ungleich der Antwort", () => {
  const rnd = saatZufall(17);
  for (let i = 0; i < 100; i++) {
    for (const prinzip of PRINZIPIEN) {
      const aufgabe = erzeugeAufgabe(prinzip, rnd);
      const falsche = ablenker(aufgabe, rnd);
      assert.equal(falsche.length, 3);
      assert.equal(new Set(falsche).size, 3);
      for (const w of falsche) {
        assert.ok(Number.isInteger(w) && w > 0);
        assert.notEqual(w, aufgabe.antwort);
      }
    }
  }
});

test("ablenker: der 60er-Fehler ist beim Weg dabei", () => {
  const aufgabe = { prinzip: "weg", antwort: 180 };
  assert.ok(ablenker(aufgabe, saatZufall(3)).includes(180 * 60));
});

test("ablenker: der 60er-Fehler ist bei der Zeit dabei, wenn er ganzzahlig ist", () => {
  const aufgabe = { prinzip: "zeit", antwort: 300 };
  assert.ok(ablenker(aufgabe, saatZufall(3)).includes(5));
});

test("antwortenFuer: vier eindeutige Werte, die Antwort ist dabei", () => {
  const rnd = saatZufall(23);
  for (let i = 0; i < 50; i++) {
    const aufgabe = erzeugeAufgabe(PRINZIPIEN[i % 4], rnd);
    const auswahl = antwortenFuer(aufgabe, rnd);
    assert.equal(auswahl.length, 4);
    assert.equal(new Set(auswahl).size, 4);
    assert.ok(auswahl.includes(aufgabe.antwort));
  }
});

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

test("erzeugeAufgabe: glatt teilbare Paare kommen regelmäßig vor", () => {
  // Willis Änderung vom 14.09.2026: Es soll regelmäßig Aufgaben geben, bei
  // denen das Herunterrechnen auf eine Minute glatt aufgeht (180 NM in 45
  // Minuten sind 4 NM je Minute). Die Vielfalt darf darunter nicht leiden,
  // darum muss weiterhin jede Geschwindigkeit und jede Zeit vorkommen.
  const tempi = new Set();
  const zeiten = new Set();
  let glatt = 0;
  let gesamt = 0;
  for (let i = 0; i < 1500; i++) {
    const prinzip = ["zeit", "weg", "geschwindigkeit"][i % 3];
    const a = erzeugeAufgabe(prinzip, Math.random, i % 4 === 0);
    tempi.add(a.werte.v);
    zeiten.add(a.werte.t);
    gesamt += 1;
    if (Number.isInteger(a.werte.v / 60)) glatt += 1;
  }
  assert.ok(glatt / gesamt > 0.65, `Anteil glatter Paare: ${glatt / gesamt}`);
  assert.ok(glatt / gesamt < 0.95, `Anteil glatter Paare: ${glatt / gesamt}`);
  assert.equal(tempi.size, 10);
  assert.equal(zeiten.size, 12);
  for (const v of [80, 100, 200]) assert.ok(tempi.has(v), `${v} kt fehlt`);
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
