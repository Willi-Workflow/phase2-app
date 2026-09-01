// Reine Steuerlogik: Totzone, Expo und das Anlernen der Achsen.

// Ein negatives Expo (spitze Mitte) war am 31.08.2026 kurz eingebaut und
// wurde nach Willis Testflug wieder verworfen: Das Handling verschlechterte
// sich. Expo staucht seither wieder nur die Mitte (0 linear, 1 maximal weich).
export function mitKurve(wert, totzone, expo) {
  const t = Math.min(Math.max(totzone, 0), 0.9);
  const e = Math.min(Math.max(expo, 0), 1);
  const betrag = Math.abs(wert);
  if (betrag < t) return 0;
  const gestreckt = ((betrag - t) / (1 - t)) * Math.sign(wert);
  return (1 - e) * gestreckt + e * gestreckt ** 3;
}

// Empfindlichkeit: Faktor auf den fertigen Kurvenwert, seit 01.09.2026 ohne
// Kappung (Willis Auftrag). Der Faktor skaliert damit die Missionsrate:
// 1,5 heißt anderthalbfache Maximalrate bei Vollausschlag. Die alte Kappung
// bei ±1 hatte stattdessen die Kennlinie verbogen: Ab Faktor mal Kurvenwert
// gleich 1 war eine Wand, dahinter fühlte sich jeder Stickweg gleich an.
// Nur für Ratenachsen verwenden; Stellungsachsen wie der Schub dürfen nie
// über ihren Bereich hinaus skaliert werden.
export function mitEmpfindlichkeit(wert, faktor) {
  return wert * faktor;
}

// Ruhelage: Der Stick meldet in Ruhe selten exakt 0. Die gemessene Ruhelage
// wird zur neuen Mitte, beide Seiten strecken sich zurück auf den vollen
// Bereich, damit die Totzone symmetrisch um die echte Mitte liegt und der
// Vollausschlag erreichbar bleibt. Eine Ruhelage über 0,5 Betrag wird als
// Fehlmessung verworfen (etwa eine Achse, die beim Messen gegriffen war,
// oder ein Hebel mit Endlagen-Ruhe): dann wirkt die Funktion neutral.
export function mitRuhelage(wert, ruhe) {
  const r = Math.abs(ruhe) > 0.5 ? 0 : ruhe;
  const spanne = wert >= r ? 1 - r : 1 + r;
  return Math.max(-1, Math.min(1, (wert - r) / spanne));
}

// Wahl des Faktors nach Modus: "alle" nimmt den allgemeinen Wert, "geraet"
// den je Gerät gespeicherten. Ohne Eintrag (oder ohne Gerät, etwa beim
// Tastatur-Ersatz) bleibt der Faktor neutral bei 1.
export function empfindlichkeitFuer(modus, allgemein, jeGeraet, geraet) {
  if (modus === "geraet") return (geraet != null ? jeGeraet?.[geraet] : null) ?? 1;
  return allgemein;
}

// Glättung: Der Kurvenwert folgt dem Stick nicht sprunghaft, sondern mit
// einer Zeitkonstante (Willis Rückmeldung vom 01.09.2026, "zu direkt";
// große Simulatoren filtern das Eingangssignal genauso). Zeitbasiert über
// exp(-dt/tau), damit die Wirkung von der Bildrate unabhängig ist.
// zeitMs 0 heißt aus: der neue Wert gilt sofort.
export function glaette(alt, neu, dtMs, zeitMs) {
  if (!(zeitMs > 0)) return neu;
  return alt + (neu - alt) * (1 - Math.exp(-Math.max(dtMs, 0) / zeitMs));
}

export function groessterAusschlag(basen, jetzt, schwelle) {
  const ruhe = new Map(basen.map((g) => [g.geraet, g.achsen]));
  let treffer = null;
  for (const geraet of jetzt) {
    const basis = ruhe.get(geraet.geraet) ?? [];
    geraet.achsen.forEach((wert, achse) => {
      const delta = Math.abs(wert - (basis[achse] ?? 0));
      if (delta > schwelle && (!treffer || delta > treffer.rohesDelta)) {
        treffer = { geraet: geraet.geraet, achse, rohesDelta: delta };
      }
    });
  }
  if (!treffer) return null;
  return { geraet: treffer.geraet, achse: treffer.achse, delta: Math.round(treffer.rohesDelta * 100) / 100 };
}
