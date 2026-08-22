// Rollenstand für die Missionsseite: je Rolle das zugewiesene Gerät und ob es
// gerade verbunden ist. Reine Logik ohne DOM, prüfbar mit node --test.

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
