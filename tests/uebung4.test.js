import { test } from "node:test";
import assert from "node:assert/strict";
import { schwierigkeitsfaktor, kennzahlAus, waehleInstrumente, antwortmoeglichkeiten, istGleich, mische } from "../js/uebung4.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test("schwierigkeitsfaktor: schwerste Einstellung voll, leichtere deckeln tiefer", () => {
  assert.equal(schwierigkeitsfaktor(3, 5), 1);
  assert.ok(Math.abs(schwierigkeitsfaktor(10, 1) - 0.5) < 0.01);
  assert.ok(schwierigkeitsfaktor(5, 3) > schwierigkeitsfaktor(7, 3));
  assert.ok(schwierigkeitsfaktor(5, 4) > schwierigkeitsfaktor(5, 2));
  assert.ok(schwierigkeitsfaktor(15, 3) < schwierigkeitsfaktor(10, 3));
  assert.ok(schwierigkeitsfaktor(15, 1) > 0.4);
});

test("kennzahlAus: Quote mal Faktor, gerundet", () => {
  assert.equal(kennzahlAus(5, 5, 1), 100);
  assert.equal(kennzahlAus(3, 5, 1), 60);
  assert.equal(kennzahlAus(3, 5, schwierigkeitsfaktor(10, 1)), 30);
  assert.equal(kennzahlAus(0, 0, 1), 0);
});

test("waehleInstrumente: gewünschte Anzahl ohne Doppelung", () => {
  const rnd = saatZufall(11);
  for (let i = 0; i < 20; i++) {
    const wahl = waehleInstrumente(3, rnd);
    assert.equal(wahl.length, 3);
    assert.equal(new Set(wahl).size, 3);
  }
  assert.equal(new Set(waehleInstrumente(5, rnd)).size, 5);
});

test("antwortmoeglichkeiten: vier eindeutige Werte, der wahre ist dabei", () => {
  const rnd = saatZufall(23);
  for (const [id, wert] of [["fahrt", 230], ["hoehe", 1000], ["vario", -2000], ["kurs", 0]]) {
    const auswahl = antwortmoeglichkeiten(id, wert, rnd);
    assert.equal(auswahl.length, 4);
    assert.equal(new Set(auswahl).size, 4);
    assert.ok(auswahl.includes(wert));
  }
});

test("antwortmoeglichkeiten: Kurs bleibt im Gradkreis", () => {
  const rnd = saatZufall(5);
  const auswahl = antwortmoeglichkeiten("kurs", 355, rnd);
  for (const w of auswahl) assert.ok(w >= 0 && w <= 355);
});

test("antwortmoeglichkeiten: Horizont liefert vier verschiedene Lagen", () => {
  const rnd = saatZufall(31);
  const wert = { roll: 15, nick: -10 };
  const auswahl = antwortmoeglichkeiten("horizont", wert, rnd);
  assert.equal(auswahl.length, 4);
  assert.equal(auswahl.filter((a) => istGleich("horizont", a, wert)).length, 1);
  const schluessel = auswahl.map((a) => `${a.roll}|${a.nick}`);
  assert.equal(new Set(schluessel).size, 4);
});

test("mische: gleiche Elemente, andere Ordnung möglich, Quelle unberührt", () => {
  const quelle = [1, 2, 3, 4, 5];
  const gemischt = mische(quelle, saatZufall(3));
  assert.deepEqual([...gemischt].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(quelle, [1, 2, 3, 4, 5]);
});
