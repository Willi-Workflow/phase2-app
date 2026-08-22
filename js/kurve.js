// Reine Steuerlogik: Totzone, Expo und das Anlernen der Achsen.

export function mitKurve(wert, totzone, expo) {
  const betrag = Math.abs(wert);
  if (betrag < totzone) return 0;
  const gestreckt = ((betrag - totzone) / (1 - totzone)) * Math.sign(wert);
  return (1 - expo) * gestreckt + expo * gestreckt ** 3;
}

export function groessterAusschlag(basen, jetzt, schwelle) {
  const ruhe = new Map(basen.map((g) => [g.geraet, g.achsen]));
  let treffer = null;
  for (const geraet of jetzt) {
    const basis = ruhe.get(geraet.geraet) ?? [];
    geraet.achsen.forEach((wert, achse) => {
      const delta = Math.abs(wert - (basis[achse] ?? 0));
      if (delta > schwelle && (!treffer || delta > treffer.delta)) {
        treffer = { geraet: geraet.geraet, achse, delta: Math.round(delta * 100) / 100 };
      }
    });
  }
  return treffer;
}
