import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WISSEN6, WISSEN6_REIHE } from "../js/wissen6.js";
import { BEREICHE, erzeugeFragen, pruefeEingabe6 } from "../js/uebung6.js";

const wurzel = fileURLToPath(new URL("..", import.meta.url));

function festerZufall(startwert = 1) {
  let stand = startwert;
  return () => {
    stand = (stand * 16807) % 2147483647;
    return (stand - 1) / 2147483646;
  };
}

test("jeder Wissensbereich ist wohlgeformt und jedes Fragebild existiert", () => {
  for (const id of WISSEN6_REIHE) {
    const bereich = WISSEN6[id];
    assert.ok(bereich, `Bereich ${id} fehlt`);
    assert.ok(bereich.name.length > 0, `${id}: ohne Namen`);
    for (const w of bereich.wissen) {
      assert.ok(w.titel.length > 0 && w.zeilen.length >= 1, `${id}: leere Wissenskarte`);
    }
    for (const f of bereich.fragen) {
      assert.ok(f.frage.length > 0, `${id}: leere Frage`);
      assert.ok(["eingabe", "auswahl", "reflexion"].includes(f.form), `${id}: unbekannte Form ${f.form}`);
      if (f.form === "eingabe") assert.ok(f.loesungen.length >= 1, `${id}: Eingabefrage ohne Lösungen`);
      if (f.form === "auswahl") {
        assert.ok(f.richtig.length > 0, `${id}: Auswahlfrage ohne richtige Antwort`);
        assert.equal(f.falsch.length, 3, `${id}: Auswahlfrage braucht drei falsche Antworten`);
      }
      if (f.form === "reflexion") assert.ok(f.hinweise.length >= 1, `${id}: Reflexionsfrage ohne Hinweise`);
      if (f.bild) assert.ok(existsSync(wurzel + f.bild), `${id}: Bild fehlt: ${f.bild}`);
    }
  }
});

test("Dienstgrade und Persönliches sind gefüllt", () => {
  assert.ok(WISSEN6.dienstgrade.fragen.length >= 25);
  assert.ok(WISSEN6.dienstgrade.fragen.some((f) => f.bild));
  assert.ok(WISSEN6.persoenlich.fragen.length >= 10);
  assert.ok(WISSEN6.persoenlich.fragen.every((f) => f.form === "reflexion"));
});

test("BEREICHE führt die Flugzeugmuster und alle Wissensbereiche", () => {
  assert.equal(BEREICHE.length, 1 + WISSEN6_REIHE.length);
  assert.equal(BEREICHE[0].id, "flugzeugmuster");
  for (const id of WISSEN6_REIHE) assert.ok(BEREICHE.some((b) => b.id === id), id);
});

test("erzeugeFragen zieht aus einem Katalogbereich ohne Doppelungen", () => {
  const fragen = erzeugeFragen({ bereich: "dienstgrade", anzahl: 10, rnd: festerZufall() });
  assert.equal(fragen.length, 10);
  const texte = new Set(fragen.map((f) => f.frage + (f.bild ?? "") + (f.richtig ?? "")));
  assert.equal(texte.size, 10);
});

test("Auswahlfragen bekommen vier gemischte Antworten samt der richtigen", () => {
  const fragen = erzeugeFragen({ bereich: "dienstgrade", anzahl: 0, rnd: festerZufall() });
  const auswahl = fragen.filter((f) => f.form === "auswahl");
  assert.ok(auswahl.length >= 5);
  for (const f of auswahl) {
    assert.equal(f.antworten.length, 4);
    assert.ok(f.antworten.includes(f.richtig));
  }
});

test("erzeugeFragen mit 0 nimmt den ganzen Katalog", () => {
  const alle = erzeugeFragen({ bereich: "persoenlich", anzahl: 0, rnd: festerZufall() });
  assert.equal(alle.length, WISSEN6.persoenlich.fragen.length);
});

test("pruefeEingabe6 ist großzügig bei Schreibweise und Umlauten", () => {
  const frage = { loesungen: ["Kapitänleutnant", "Kapitaenleutnant"] };
  assert.equal(pruefeEingabe6("kapitänleutnant", frage), true);
  assert.equal(pruefeEingabe6("KAPITAENLEUTNANT", frage), true);
  assert.equal(pruefeEingabe6("kapitaen leutnant", frage), true);
  assert.equal(pruefeEingabe6("korvettenkapitaen", frage), false);
  assert.equal(pruefeEingabe6("", frage), false);
});
