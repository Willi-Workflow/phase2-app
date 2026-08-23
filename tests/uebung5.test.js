import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, AUFGABENZEIT, PRINZIPIEN,
  waehlePrinzipien, erzeugeAufgabe, erzeugeLauf,
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
