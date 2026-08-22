// Rollen- und Gerätestand: je Rolle das zugewiesene Gerät und ob es gerade
// verbunden ist, dazu die Geräteliste für den Controls-Dialog.
// Reine Logik ohne DOM, prüfbar mit node --test.

const NAMENSLAENGE = 26;

export function kurzname(kennung) {
  const ohneZusatz = kennung.replace(/\s*\([^)]*Vendor:[^)]*\)\s*$/i, "").trim();
  return ohneZusatz.length > NAMENSLAENGE ? `${ohneZusatz.slice(0, NAMENSLAENGE)}…` : ohneZusatz;
}

export function rollenStand(rollen, zuordnung, kennungen) {
  return rollen.map(([rolle, titel]) => {
    const z = zuordnung[rolle];
    if (!z) return { rolle, titel, zustand: "tastatur", text: "Tastatur" };
    if (kennungen.includes(z.geraet)) {
      const umkehr = z.invert ? " · umgekehrt" : "";
      return { rolle, titel, zustand: "verbunden", text: `${kurzname(z.geraet)} · Achse ${z.achse}${umkehr}` };
    }
    return { rolle, titel, zustand: "fehlt", text: `${kurzname(z.geraet)} fehlt · Tastatur greift` };
  });
}

// Geräteliste für den Controls-Dialog: alle verbundenen Geräte mit Umfang und
// zugewiesenen Rollen, dahinter zugewiesene, aber gerade getrennte Geräte.
export function geraeteListe(rollen, zuordnung, geraete) {
  const titelVon = (rolle) => rollen.find(([r]) => r === rolle)?.[1] ?? rolle;
  const rollenVon = (kennung) => Object.entries(zuordnung)
    .filter(([, z]) => z.geraet === kennung)
    .map(([rolle]) => titelVon(rolle));
  const verbundene = geraete.map((g) => ({
    kennung: g.kennung,
    name: kurzname(g.kennung),
    zustand: "verbunden",
    umfang: `${g.achsen} Achsen · ${g.knoepfe} Knöpfe`,
    rollen: rollenVon(g.kennung),
  }));
  const fehlende = [...new Set(Object.values(zuordnung).map((z) => z.geraet))]
    .filter((kennung) => !geraete.some((g) => g.kennung === kennung))
    .map((kennung) => ({
      kennung,
      name: kurzname(kennung),
      zustand: "fehlt",
      umfang: "",
      rollen: rollenVon(kennung),
    }));
  return [...verbundene, ...fehlende];
}
