// Ablauflogik der Wissensabfrage von Mission 6, rein und testbar.
// Die Abfrage kennt mehrere Wissensbereiche: die Flugzeugmuster (Bildquiz
// aus muster6.js) und die Katalogbereiche aus wissen6.js mit den Formen
// eingabe, auswahl und reflexion.
import { MUSTER, bildpfad, normalisiere } from "./muster6.js";
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
// { musterId: Bilderzahl }), bei Auswahlfragen werden die vier Antworten
// gemischt.
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
  const gewaehlt = anzahl > 0 ? gemischt.slice(0, anzahl) : gemischt;
  return gewaehlt.map((f) =>
    f.form === "auswahl" ? { ...f, antworten: mische([f.richtig, ...f.falsch], rnd) } : { ...f });
}

// Tolerante Prüfung der Texteingabe gegen die Lösungsliste einer Frage,
// gleiche Normalisierung wie bei den Flugzeugmustern.
export function pruefeEingabe6(eingabe, frage) {
  const geprueft = normalisiere(eingabe);
  if (geprueft === "") return false;
  return frage.loesungen.some((l) => normalisiere(l) === geprueft);
}

export function kennzahl(richtig, gestellt) {
  return gestellt ? Math.round((richtig / gestellt) * 100) : 0;
}
