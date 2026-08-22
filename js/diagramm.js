// Verlaufsdiagramm der Läufe: reine Rechenlogik ohne DOM, prüfbar mit node --test.
// Farbpaar mit scripts der Dataviz-Prüfung validiert (Helligkeitsband dunkel,
// Buntheit, Farbfehlsicht-Trennung, Kontrast auf #0e120b).

export const PROFILFARBEN = { willi: "#4a83c4", luigi: "#b58e2e" };

// Kennzahlen eines Profils in Laufreihenfolge (ältester zuerst).
export function reihe(laeufe, profil) {
  return laeufe
    .filter((l) => l.profil === profil)
    .sort((a, b) => (a.zeitpunkt < b.zeitpunkt ? -1 : 1))
    .map((l) => l.kennzahl);
}

// Y-Achse: saubere Schritte von 0 bis zu einem runden Höchstwert.
export function skala(werte, prozent) {
  if (prozent) return { max: 100, schritte: [0, 25, 50, 75, 100] };
  const roh = Math.max(0, ...werte);
  if (roh === 0) return { max: 10, schritte: [0, 5, 10] };
  const zehner = 10 ** Math.floor(Math.log10(roh / 4));
  const schritt = [1, 2, 2.5, 5, 10].map((f) => f * zehner).find((s) => s * 4 >= roh);
  const max = Math.ceil(roh / schritt) * schritt;
  const schritte = [];
  for (let w = 0; w <= max; w += schritt) schritte.push(w);
  return { max, schritte };
}

// Werte in Bildkoordinaten des Zeichenfelds; X ist die Laufnummer.
export function punkte(werte, feld, maxAnzahl, maxWert) {
  const schrittX = maxAnzahl > 1 ? feld.breite / (maxAnzahl - 1) : 0;
  return werte.map((w, i) => ({
    x: feld.x + (maxAnzahl > 1 ? i * schrittX : feld.breite / 2),
    y: feld.y + feld.hoehe - (w / maxWert) * feld.hoehe,
  }));
}

export function pfad(p) {
  return p.map((pt, i) => `${i ? "L" : "M"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(" ");
}

// Höchstens sechs beschriftete Laufnummern, die letzte immer dabei.
export function laufnummern(maxAnzahl) {
  if (maxAnzahl <= 6) return Array.from({ length: maxAnzahl }, (_, i) => i + 1);
  const schritt = Math.ceil(maxAnzahl / 6);
  const nummern = [];
  for (let n = 1; n <= maxAnzahl; n += schritt) nummern.push(n);
  if (nummern[nummern.length - 1] !== maxAnzahl) nummern.push(maxAnzahl);
  return nummern;
}
