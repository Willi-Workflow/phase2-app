import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WISSEN6, WISSEN6_REIHE } from "../js/wissen6.js";
import { BEREICHE, erzeugeFragen, karteVon } from "../js/uebung6.js";
import { MUSTER } from "../js/muster6.js";

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
      if (w.zwischen) { assert.ok(w.zwischen.length > 0, `${id}: leerer Zwischentitel`); continue; }
      assert.ok(w.titel.length > 0 && w.absaetze.length >= 1, `${id}: leerer Wissensabschnitt`);
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

test("erzeugeFragen mit 0 nimmt den ganzen Katalog", () => {
  const alle = erzeugeFragen({ bereich: "persoenlich", anzahl: 0, rnd: festerZufall() });
  assert.equal(alle.length, WISSEN6.persoenlich.fragen.length);
});

test("karteVon macht aus einer Musterfrage die Bildkarte mit Namen und Steckbrief", () => {
  const f16 = MUSTER.find((m) => m.id === "f16");
  const karte = karteVon({ form: "muster", muster: f16, bild: "bilder/muster/f16/2.jpg" });
  assert.equal(karte.frage, "Welches Muster ist das?");
  assert.equal(karte.bild, "bilder/muster/f16/2.jpg");
  assert.equal(karte.antwort, f16.name);
  assert.ok(karte.auch.includes("Viper"));
  assert.equal(karte.zusatz, f16.steckbrief);
});

test("karteVon zeigt bei Eingabefragen die erste Lösung und streicht Schreibvarianten", () => {
  const karte = karteVon({ frage: "Marine-Entsprechung des Hauptmanns?", form: "eingabe", loesungen: ["Kapitänleutnant", "Kapitaenleutnant"] });
  assert.equal(karte.antwort, "Kapitänleutnant");
  assert.deepEqual(karte.auch, []);
  const mitAuch = karteVon({ frage: "Wer bildet Eurofighter-Piloten aus?", form: "eingabe", loesungen: ["TaktLwG 73", "73", "Steinhoff"] });
  assert.equal(mitAuch.antwort, "TaktLwG 73");
  assert.deepEqual(mitAuch.auch, ["73", "Steinhoff"]);
});

test("karteVon nimmt bei Auswahlfragen die richtige Antwort und trägt das Fragebild", () => {
  const karte = karteVon({ frage: "Zielbestand Patriot?", form: "auswahl", richtig: "15 Feuereinheiten", falsch: ["7", "10", "24"] });
  assert.equal(karte.antwort, "15 Feuereinheiten");
  assert.equal(karte.bild, null);
  const bildkarte = karteVon({ frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-major.png", loesungen: ["Major"] });
  assert.equal(bildkarte.bild, "bilder/abzeichen/luftwaffe-major.png");
});
