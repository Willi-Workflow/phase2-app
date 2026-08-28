// Ablauflogik der Wissensabfrage von Mission 6, rein und testbar.
// Die Abfrage kennt mehrere Wissensbereiche: die Flugzeugmuster (Bildquiz
// aus muster6.js) und die Katalogbereiche aus wissen6.js mit den Formen
// eingabe, auswahl und reflexion.
import { MUSTER, bildpfad, normalisiere, anzeigenamen } from "./muster6.js";
import { WISSEN6, WISSEN6_REIHE } from "./wissen6.js";
import { mische } from "./zufall.js";

export const BEREICHE = [
  { id: "flugzeugmuster", name: "Flugzeugmuster" },
  ...WISSEN6_REIHE.map((id) => ({ id, name: WISSEN6[id].name })),
];

// 0 steht für alle Fragen des Bereichs.
export const FRAGENZAHLEN = [10, 20, 0];

// Ein Lauf stellt jede Frage höchstens einmal. Für die Flugzeugmuster wird
// je Muster eine zufällige der vorhandenen Ansichten gezogen (ansichten:
// { musterId: Bilderzahl }).
export function erzeugeFragen({ bereich = "flugzeugmuster", ansichten = {}, anzahl, rnd = Math.random }) {
  if (bereich === "flugzeugmuster") {
    const verfuegbar = MUSTER.filter((m) => (ansichten[m.id] ?? 0) > 0);
    const gemischt = mische(verfuegbar, rnd);
    const gewaehlt = anzahl > 0 ? gemischt.slice(0, anzahl) : gemischt;
    return gewaehlt.map((m) => {
      const nummer = 1 + Math.floor(rnd() * ansichten[m.id]);
      return { form: "muster", muster: m, bild: bildpfad(m.id, nummer) };
    });
  }
  const katalog = WISSEN6[bereich]?.fragen ?? [];
  const gemischt = mische(katalog, rnd);
  return anzahl > 0 ? gemischt.slice(0, anzahl) : gemischt;
}

// Karteikartensicht einer Frage (Willis Vorgabe vom 28.08.2026: die
// Wissensabfrage läuft als Karteikarten, nur Persönliches bleibt Text).
// Vorderseite: Frage und gegebenenfalls Bild. Rückseite: die Antwort,
// weitere zählende Namen (ohne Schreibvarianten, die nur die tolerante
// Normalisierung bedienen) und bei Mustern der Steckbrief als Zusatz.
export function karteVon(frage) {
  if (frage.form === "muster") {
    return {
      frage: "Welches Muster ist das?",
      bild: frage.bild,
      antwort: frage.muster.name,
      auch: anzeigenamen(frage.muster),
      zusatz: frage.muster.steckbrief,
    };
  }
  if (frage.form === "auswahl") {
    return { frage: frage.frage, bild: null, antwort: frage.richtig, auch: [], zusatz: "" };
  }
  const gesehen = new Set([normalisiere(frage.loesungen[0])]);
  const auch = [];
  for (const l of frage.loesungen.slice(1)) {
    const norm = normalisiere(l);
    if (gesehen.has(norm)) continue;
    gesehen.add(norm);
    auch.push(l);
  }
  return { frage: frage.frage, bild: frage.bild ?? null, antwort: frage.loesungen[0], auch, zusatz: "" };
}

export function kennzahl(richtig, gestellt) {
  return gestellt ? Math.round((richtig / gestellt) * 100) : 0;
}
