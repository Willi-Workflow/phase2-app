// Ablauflogik der Wissensabfrage von Mission 6, rein und testbar.
// Die Abfrage kennt mehrere Wissensbereiche; bislang gibt es einen,
// die Flugzeugmuster. Weitere Bereiche kommen als Eintrag in BEREICHE
// mit eigener Fragenquelle dazu.
import { MUSTER, bildpfad } from "./muster6.js";
import { mische } from "./zufall.js";

export const BEREICHE = [
  { id: "flugzeugmuster", name: "Flugzeugmuster" },
];

// 0 steht für alle Muster, die Bilder haben.
export const FRAGENZAHLEN = [10, 20, 0];

// Ein Lauf fragt jedes gewählte Muster höchstens einmal ab, mit einer
// zufälligen der vorhandenen Ansichten. ansichten: { musterId: Bilderzahl }.
export function erzeugeFragen({ ansichten, anzahl, rnd = Math.random }) {
  const verfuegbar = MUSTER.filter((m) => (ansichten[m.id] ?? 0) > 0);
  const gemischt = mische(verfuegbar, rnd);
  const gewaehlt = anzahl > 0 ? gemischt.slice(0, anzahl) : gemischt;
  return gewaehlt.map((m) => {
    const nummer = 1 + Math.floor(rnd() * ansichten[m.id]);
    return { muster: m, bild: bildpfad(m.id, nummer) };
  });
}

export function kennzahl(richtig, gestellt) {
  return gestellt ? Math.round((richtig / gestellt) * 100) : 0;
}
