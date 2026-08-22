// Reine Rechenlogik für die Auswertung. Keine Abhängigkeiten, kein Browser nötig.

export function sortiertNeueste(laeufe) {
  return [...laeufe].sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt));
}

export function bestwert(laeufe) {
  if (laeufe.length === 0) return null;
  return Math.max(...laeufe.map((l) => l.kennzahl));
}

export function durchschnitt(laeufe) {
  if (laeufe.length === 0) return null;
  const summe = laeufe.reduce((s, l) => s + l.kennzahl, 0);
  return Math.round((summe / laeufe.length) * 10) / 10;
}

export function vergleich(laeufe) {
  const seite = (profil) => {
    const eigene = laeufe.filter((l) => l.profil === profil);
    return { anzahl: eigene.length, bestwert: bestwert(eigene), durchschnitt: durchschnitt(eigene) };
  };
  return { willi: seite("willi"), luigi: seite("luigi") };
}
