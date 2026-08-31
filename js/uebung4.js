// Übungslogik Mission 4 (Instrumente merken): Stellschrauben, Fragenwahl,
// Antwortauswahlen und die gewichtete Trefferquote. Reine Logik ohne DOM,
// der Zufall ist einspeisbar, damit alles mit node --test prüfbar bleibt.
import { INSTRUMENTE, RASTER, rasterwerte } from "./instrumente.js";
import { mische } from "./zufall.js";
export { mische };

export const ANZEIGEZEITEN = [3, 5, 7, 10, 15]; // Sekunden
export const FRAGENANZAHLEN = [1, 2, 3, 4, 5];
export const TESTDAUERN = [5, 10, 15]; // Minuten
export const ANTWORTZEIT = 10; // Sekunden je Frage

// Schwierigkeitsfaktor: die schwerste Einstellung (3 s, 5 Fragen) erreicht 1,0,
// die leichteste (10 s, 1 Frage) rund 0,5. Kennzahl = Trefferquote mal Faktor.
const ZEITFAKTOR = { 3: 1.0, 5: 0.92, 7: 0.85, 10: 0.75, 15: 0.65 };
const ANZAHLFAKTOR = { 1: 0.67, 2: 0.78, 3: 0.87, 4: 0.94, 5: 1.0 };

export function schwierigkeitsfaktor(anzeigezeit, fragenanzahl) {
  return ZEITFAKTOR[anzeigezeit] * ANZAHLFAKTOR[fragenanzahl];
}

export function kennzahlAus(richtig, gestellt, faktor) {
  if (gestellt === 0) return 0;
  return Math.round((richtig / gestellt) * 100 * faktor);
}

// Zufällig gewählte Instrumente ohne Doppelung.
export function waehleInstrumente(anzahl, rnd = Math.random) {
  return mische(INSTRUMENTE.map((i) => i.id), rnd).slice(0, anzahl);
}

export function istGleich(id, a, b) {
  return id === "horizont" ? a.roll === b.roll && a.nick === b.nick : a === b;
}

// Vier Antwortmöglichkeiten: der wahre Wert und drei Ablenker aus dem
// Werteraster, gemischt. Beim Kurs zählt der Abstand über die Nordgrenze
// hinweg. Seit dem 31.08.2026 halten die Ablenker einen Mindestabstand
// (Willis Vorgabe, 105 neben 110 Grad war zu dicht): mindestens drei
// Rasterschritte, dafür reicht der Kandidatenring bis neun Schritte.
export const ABLENKER_MIN_SCHRITTE = 3;
export function antwortmoeglichkeiten(id, wert, rnd = Math.random) {
  if (id === "horizont") return horizontMoeglichkeiten(wert, rnd);
  const raster = RASTER[id];
  const kandidaten = [];
  for (let k = -9; k <= 9; k++) {
    if (Math.abs(k) < ABLENKER_MIN_SCHRITTE) continue;
    let w = wert + k * raster.schritt;
    if (id === "kurs") w = ((w % 360) + 360) % 360;
    if (w < raster.min || w > raster.max) continue;
    if (!kandidaten.includes(w)) kandidaten.push(w);
  }
  const falsche = mische(kandidaten, rnd).slice(0, 3);
  return mische([wert, ...falsche], rnd);
}

function horizontMoeglichkeiten(wert, rnd) {
  const rolls = rasterwerte(RASTER.roll);
  const nicks = rasterwerte(RASTER.nick);
  const kandidaten = [];
  for (const roll of rolls) {
    for (const nick of nicks) {
      if (roll === wert.roll && nick === wert.nick) continue;
      const abstand = Math.abs(rolls.indexOf(roll) - rolls.indexOf(wert.roll))
        + Math.abs(nicks.indexOf(nick) - nicks.indexOf(wert.nick));
      // Mindestens zwei Rasterschritte kombinierter Lageabstand, höchstens
      // vier: deutlich unterscheidbar, aber noch verwechselbar genug.
      if (abstand >= 2 && abstand <= 4) kandidaten.push({ roll, nick });
    }
  }
  const falsche = mische(kandidaten, rnd).slice(0, 3);
  return mische([wert, ...falsche], rnd);
}
