import test from "node:test";
import assert from "node:assert/strict";
import {
  GRUPPEN, MUSTER, normalisiere, istRichtig, anzeigenamen, musterNachGruppe, bildpfad,
} from "../js/muster6.js";

const muster = (id) => MUSTER.find((m) => m.id === id);

test("normalisiere entfernt Striche, Punkte, Schrägstriche und Leerzeichen", () => {
  assert.equal(normalisiere("F-16"), "f16");
  assert.equal(normalisiere("F/A-18E"), "fa18e");
  assert.equal(normalisiere("Sabre Mk.6"), "sabremk6");
  assert.equal(normalisiere("  Alpha Jet  "), "alphajet");
});

test("normalisiere setzt Umlaute um und übersteht Leeres", () => {
  assert.equal(normalisiere("Würger"), "wuerger");
  assert.equal(normalisiere(null), "");
  assert.equal(normalisiere(""), "");
});

test("istRichtig nimmt Kennung, Spitznamen und vollen Namen in jeder Schreibweise", () => {
  const f16 = muster("f16");
  for (const eingabe of ["f16", "F-16", "f 16", "fighting falcon", "FIGHTING-FALCON", "Viper", "Lockheed Martin F-16 Fighting Falcon"]) {
    assert.equal(istRichtig(eingabe, f16), true, eingabe);
  }
});

test("istRichtig lehnt falsche, halbe und leere Eingaben ab", () => {
  const f16 = muster("f16");
  assert.equal(istRichtig("f15", f16), false);
  assert.equal(istRichtig("f", f16), false);
  assert.equal(istRichtig("", f16), false);
  assert.equal(istRichtig("   ", f16), false);
});

test("istRichtig kennt Kennung und Codename der MiG-29", () => {
  const mig = muster("mig29");
  for (const eingabe of ["mig29", "MiG-29", "mig 29", "Fulcrum"]) {
    assert.equal(istRichtig(eingabe, mig), true, eingabe);
  }
});

test("anzeigenamen streicht Doppelformen und den vollen Namen", () => {
  assert.deepEqual(anzeigenamen(muster("eurofighter")), ["Eurofighter", "Typhoon", "EF2000"]);
  assert.deepEqual(anzeigenamen(muster("rafale")), ["Rafale"]);
});

test("Datenbestand: 44 Muster, Kennungen eindeutig, Felder gefüllt, Gruppen gültig", () => {
  assert.equal(MUSTER.length, 44);
  const ids = new Set(MUSTER.map((m) => m.id));
  assert.equal(ids.size, MUSTER.length);
  const gruppenIds = new Set(GRUPPEN.map((g) => g.id));
  for (const m of MUSTER) {
    assert.ok(gruppenIds.has(m.gruppe), `${m.id}: unbekannte Gruppe ${m.gruppe}`);
    assert.ok(m.loesungen.length >= 1, `${m.id}: ohne Lösungen`);
    assert.ok(m.name.length > 0 && m.steckbrief.length > 0, `${m.id}: leere Felder`);
  }
});

test("jede Gruppe hat Muster und die Aufteilung stimmt", () => {
  for (const g of GRUPPEN) {
    assert.ok(musterNachGruppe(g.id).length >= 1, `${g.id} ist leer`);
  }
  assert.equal(musterNachGruppe("klassiker").length, 13);
  assert.equal(musterNachGruppe("bw-aktuell").length, 10);
});

test("bildpfad baut den Ablageort", () => {
  assert.equal(bildpfad("f16", 2), "bilder/muster/f16/2.jpg");
});
