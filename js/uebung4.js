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
// (Willis Vorgabe, 105 neben 110 Grad war zu dicht) und kommen als guter
// Mix (ebenfalls Willis Vorgabe): je einer aus dem nahen, mittleren und
// fernen Drittel der zulässigen Kandidaten, damit neben naheliegenden auch
// klar verschiedene Werte zur Auswahl stehen.
export const ABLENKER_MIN_SCHRITTE = 3;

// Je ein Element aus dem nahen, mittleren und fernen Drittel der nach
// Abstand sortierten Kandidaten; bei sehr kleinen Mengen füllt der Rest auf.
function mixAusDritteln(kandidaten, abstandVon, rnd) {
  const sortiert = [...kandidaten].sort((a, b) => abstandVon(a) - abstandVon(b));
  const drittel = Math.max(1, Math.floor(sortiert.length / 3));
  const baender = [
    sortiert.slice(0, drittel),
    sortiert.slice(drittel, 2 * drittel),
    sortiert.slice(2 * drittel),
  ].filter((band) => band.length > 0);
  const gewaehlt = [];
  for (const band of baender) {
    const wahl = band[Math.floor(rnd() * band.length)];
    if (!gewaehlt.includes(wahl)) gewaehlt.push(wahl);
  }
  for (const k of mische(sortiert, rnd)) {
    if (gewaehlt.length >= 3) break;
    if (!gewaehlt.includes(k)) gewaehlt.push(k);
  }
  return gewaehlt.slice(0, 3);
}

export function antwortmoeglichkeiten(id, wert, rnd = Math.random) {
  if (id === "horizont") return horizontMoeglichkeiten(wert, rnd);
  const raster = RASTER[id];
  const abstandVon = (w) => {
    let d = Math.abs(w - wert);
    if (id === "kurs") d = Math.min(d, 360 - d);
    return d;
  };
  const kandidaten = rasterwerte(raster)
    .filter((w) => abstandVon(w) >= ABLENKER_MIN_SCHRITTE * raster.schritt);
  const falsche = mixAusDritteln(kandidaten, abstandVon, rnd);
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
      // Mindestens zwei Rasterschritte kombinierter Lageabstand, damit die
      // Lagen deutlich unterscheidbar sind; die Drittelung mischt nah und fern.
      if (abstand >= 2) kandidaten.push({ roll, nick, abstand });
    }
  }
  const falsche = mixAusDritteln(kandidaten, (k) => k.abstand, rnd)
    .map(({ roll, nick }) => ({ roll, nick }));
  return mische([wert, ...falsche], rnd);
}
