import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AUFGABENZAHL, AUFGABENZEIT, PRINZIPIEN,
  waehlePrinzipien, erzeugeAufgabe, erzeugeLauf,
} from "../js/uebung5.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test("Rahmenwerte: zehn Aufgaben, dreißig Sekunden", () => {
  assert.equal(AUFGABENZAHL, 10);
  assert.equal(AUFGABENZEIT, 30);
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
