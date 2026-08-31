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

// Empfindlichkeit: Faktor auf den fertigen Kurvenwert. Über 1 ist der volle
// Ausschlag früher erreicht, unter 1 später; der Wert bleibt im Achsenbereich.
// Der Faktor sitzt bewusst hinter der Kurve, damit Totzone und Expo ihre
// Form behalten und die drei Regler unabhängig bleiben.
export function mitEmpfindlichkeit(wert, faktor) {
  return Math.max(-1, Math.min(1, wert * faktor));
}

// Wahl des Faktors nach Modus: "alle" nimmt den allgemeinen Wert, "geraet"
// den je Gerät gespeicherten. Ohne Eintrag (oder ohne Gerät, etwa beim
// Tastatur-Ersatz) bleibt der Faktor neutral bei 1.
export function empfindlichkeitFuer(modus, allgemein, jeGeraet, geraet) {
  if (modus === "geraet") return (geraet != null ? jeGeraet?.[geraet] : null) ?? 1;
  return allgemein;
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
