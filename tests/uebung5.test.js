import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, AUFGABENZEIT, PRINZIPIEN,
  waehlePrinzipien, erzeugeAufgabe, erzeugeLauf, panelwerte, verdeckteInstrumente,
  ablenker, antwortenFuer, pruefeEingabe,
  punkteFuerAntwort, kennzahl,
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
