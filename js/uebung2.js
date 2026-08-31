// Übungslogik Mission 2 (Multitasking Controls): Nachbau des SMT aus dem
// ICA 90 II. Bewegung als Ratensteuerung mit träger Zufallsdrift, Deckungs-
// und Trefferprüfung, Kennzahl. Reine Logik ohne DOM, Zufall und Zeitschritt
// sind einspeisbar, damit alles mit node --test prüfbar bleibt.

export const TESTDAUERN = [5, 10, 30]; // Minuten
export const ELEMENTE = ["stick", "ruder", "schub"];
export const HALTEZEIT_MS = 1000;
export const NADEL_MIN = 40;
export const NADEL_MAX = 160;
export const ZIELKREIS_R = 0.02;     // Anteil der Rahmenbreite
export const STRICH_TOLERANZ = 0.01; // Anteil der Rahmenbreite
export const RAHMEN_VERHAELTNIS = 3 / 7; // Höhe zu Breite des Rahmens; das Bildmodul leitet seine Maße daraus ab
export const NADEL_TOLERANZ = 2;     // Knoten
export const SOLL_KT = 95; // fester Sollwert der Geschwindigkeit, Willis Festlegung
// Randabstand des Fadenkreuzes: die Drift darf es nicht bis an den Bildrand
// schieben (Willis Vorgabe vom 28.08.2026). Die Mitte bleibt erreichbar, das
// Fadenkreuz bleibt aber immer sichtbar im Rahmen.
export const FADEN_RAND = 0.06;

// Raten bei Vollausschlag (je Sekunde) und Driftstärken.
// Stickrate am 29.08.2026 auf Willis Wunsch um rund ein Viertel angehoben
// (der echte Teststick gilt als sehr empfindlich); Ruder unverändert.
const RATE_STICK = 0.56;
const RATE_RUDER = 0.5;
const RATE_NADEL = 30;
const DRIFT_STICK = 0.075;
const DRIFT_RUDER = 0.075;
const DRIFT_NADEL = 5;
const DRIFTWECHSEL_MIN_MS = 1500;
const DRIFTWECHSEL_MAX_MS = 3000;

const begrenze = (w, min, max) => Math.min(max, Math.max(min, w));

function neueDrift(staerke, rnd) {
  return {
    ziel: (rnd() * 2 - 1) * staerke,
    wert: 0,
    restMs: DRIFTWECHSEL_MIN_MS + rnd() * (DRIFTWECHSEL_MAX_MS - DRIFTWECHSEL_MIN_MS),
    staerke,
  };
}

function taktDrift(d, dtMs, rnd) {
  d.restMs -= dtMs;
  if (d.restMs <= 0) {
    d.ziel = (rnd() * 2 - 1) * d.staerke;
    d.restMs = DRIFTWECHSEL_MIN_MS + rnd() * (DRIFTWECHSEL_MAX_MS - DRIFTWECHSEL_MIN_MS);
  }
  d.wert += (d.ziel - d.wert) * Math.min(1, dtMs / 600);
  return d.wert;
}

// Neusetzung nach einem Treffer beziehungsweise Startlage: immer deutlich
// außerhalb der Deckung, damit jede Aufgabe echte Arbeit verlangt.
export function zufallsFadenkreuz(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const x = 0.08 + rnd() * 0.84;
    const y = 0.08 + rnd() * 0.84;
    if (Math.hypot(x - 0.5, y - 0.5) >= 0.25) return { x, y };
  }
  return { x: 0.15, y: 0.15 };
}

export function zufallsStrich(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const x = 0.08 + rnd() * 0.84;
    if (Math.abs(x - 0.5) >= 0.15) return { x };
  }
  return { x: 0.2 };
}

export function zufallsNadel(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const kt = NADEL_MIN + 5 * Math.floor(rnd() * ((NADEL_MAX - NADEL_MIN) / 5 + 1));
    if (kt >= NADEL_MIN && kt <= NADEL_MAX && Math.abs(kt - SOLL_KT) >= 20) return kt;
  }
  return NADEL_MIN;
}

export function erzeugeLaufzustand(auswahl, rnd = Math.random) {
  return {
    auswahl: [...auswahl],
    fadenkreuz: zufallsFadenkreuz(rnd),
    strich: zufallsStrich(rnd),
    nadel: zufallsNadel(rnd),
    soll: SOLL_KT,
    drift: {
      fx: neueDrift(DRIFT_STICK, rnd),
      fy: neueDrift(DRIFT_STICK, rnd),
      strich: neueDrift(DRIFT_RUDER, rnd),
      nadel: neueDrift(DRIFT_NADEL, rnd),
    },
    halte: { stick: 0, ruder: 0, schub: 0 },
    treffer: { stick: 0, ruder: 0, schub: 0 },
    kombitreffer: 0,
    deckungMs: { stick: 0, ruder: 0, schub: 0 },
    testMs: 0,
  };
}

export function inDeckung(z, element) {
  if (element === "stick") return Math.hypot(z.fadenkreuz.x - 0.5, (z.fadenkreuz.y - 0.5) * RAHMEN_VERHAELTNIS) <= ZIELKREIS_R;
  if (element === "ruder") return Math.abs(z.strich.x - 0.5) <= STRICH_TOLERANZ;
  return Math.abs(z.nadel - z.soll) <= NADEL_TOLERANZ;
}

// Ein Zeitschritt: Eingaben wirken als Rate, die Drift kommt obendrauf.
// Rückgabe: Trefferereignisse dieses Takts, je Element höchstens eines.
export function takt(z, eingaben, dtMs, rnd = Math.random) {
  const dt = dtMs / 1000;
  const aktiv = z.auswahl;
  const ereignisse = [];

  if (aktiv.includes("stick")) {
    z.fadenkreuz.x = begrenze(z.fadenkreuz.x + (eingaben.stickX * RATE_STICK + taktDrift(z.drift.fx, dtMs, rnd)) * dt, FADEN_RAND, 1 - FADEN_RAND);
    z.fadenkreuz.y = begrenze(z.fadenkreuz.y + (eingaben.stickY * RATE_STICK + taktDrift(z.drift.fy, dtMs, rnd)) * dt, FADEN_RAND, 1 - FADEN_RAND);
  }
  if (aktiv.includes("ruder")) {
    z.strich.x = begrenze(z.strich.x + (eingaben.ruder * RATE_RUDER + taktDrift(z.drift.strich, dtMs, rnd)) * dt, 0, 1);
  }
  if (aktiv.includes("schub")) {
    z.nadel = begrenze(z.nadel + (eingaben.schub * RATE_NADEL + taktDrift(z.drift.nadel, dtMs, rnd)) * dt, NADEL_MIN, NADEL_MAX);
  }

  const deckung = {};
  for (const element of aktiv) deckung[element] = inDeckung(z, element);
  z.testMs += dtMs;
  for (const element of aktiv) if (deckung[element]) z.deckungMs[element] += dtMs;
  for (const element of aktiv) {
    if (deckung[element]) {
      z.halte[element] += dtMs;
      if (z.halte[element] >= HALTEZEIT_MS) {
        z.treffer[element] += 1;
        const kombi = aktiv.length > 1 && aktiv.filter((e) => e !== element).every((e) => deckung[e]);
        if (kombi) z.kombitreffer += 1;
        ereignisse.push({ element, kombi });
        z.halte[element] = 0;
        if (element === "stick") z.fadenkreuz = zufallsFadenkreuz(rnd);
        else if (element === "ruder") z.strich = zufallsStrich(rnd);
        else z.nadel = zufallsNadel(rnd);
      }
    } else {
      z.halte[element] = 0;
    }
  }
  return ereignisse;
}

// Kennzahl des Laufs: Treffer je Minute, gemeinsame Treffer zählen doppelt.
// So bleiben Läufe verschiedener Testdauern vergleichbar.
export function punkte(z, dauerMin) {
  if (!dauerMin) return 0;
  const einzel = z.treffer.stick + z.treffer.ruder + z.treffer.schub;
  return Math.round((einzel + 2 * z.kombitreffer) / dauerMin);
}

// Deckungsquote: Anteil der Testzeit in Deckung, über die gewählten Elemente
// gemittelt und in Prozent gerundet. Nah am Original, das die Zeit auf dem
// Ziel misst; seit 28.08.2026 die gespeicherte Kennzahl (Willis Vorgabe:
// überall Prozent), die Treffer je Minute bleiben als Detail in den Daten.
export function deckungsquote(z) {
  if (!z.testMs || z.auswahl.length === 0) return 0;
  const summe = z.auswahl.reduce((s, e) => s + z.deckungMs[e], 0);
  return Math.round((summe / (z.testMs * z.auswahl.length)) * 100);
}

// Schwierigkeitsfaktor: ein Element zu halten ist deutlich leichter als
// drei gleichzeitig, darum erreicht nur die volle Auswahl den Faktor 1,0.
const ELEMENTFAKTOR = { 1: 0.6, 2: 0.85, 3: 1.0 };
export function schwierigkeitsfaktor2(anzahlElemente) {
  return ELEMENTFAKTOR[anzahlElemente] ?? 0.6;
}

export function pruefeAuswahl(auswahl) {
  return auswahl.length > 0 && auswahl.every((e) => ELEMENTE.includes(e));
}

// Erfüllungsanteil (Willis Festlegung vom 31.08.2026): Auch hier sind
// 100 Prozent Deckung unerreichbar (alles driftet ständig weg), darum wird
// die Deckung am erreichbaren Bestwert gemessen; Faktor wie bisher obendrauf.
export const DECKUNG_BESTWERT = 65;   // % Deckungsquote für volle Erfüllung

export function erfuellung2(quote) {
  return Math.min(100, (quote / DECKUNG_BESTWERT) * 100);
}
