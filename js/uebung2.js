// Übungslogik Mission 2 (Multitasking Controls): Nachbau des SMT aus dem
// ICA 90 II. Bewegung als Ratensteuerung mit träger Zufallsdrift, Deckungs-
// und Trefferprüfung, Kennzahl. Reine Logik ohne DOM, Zufall und Zeitschritt
// sind einspeisbar, damit alles mit node --test prüfbar bleibt.
import { mische } from "./zufall.js";

export const TESTDAUERN = [5, 10, 30]; // Minuten
export const ELEMENTE = ["stick", "ruder", "schub"];
export const HALTEZEIT_MS = 1000;
export const NADEL_MIN = 40;
export const NADEL_MAX = 160;
export const ZIELKREIS_R = 0.02;     // Anteil der Rahmenbreite
export const STRICH_TOLERANZ = 0.01; // Anteil der Rahmenbreite
export const NADEL_TOLERANZ = 2;     // Knoten
export const SOLLWERTE = Array.from({ length: 23 }, (_, i) => 45 + i * 5);

// Raten bei Vollausschlag (je Sekunde) und Driftstärken.
const RATE_STICK = 0.45;
const RATE_RUDER = 0.5;
const RATE_NADEL = 30;
const DRIFT_STICK = 0.05;
const DRIFT_RUDER = 0.05;
const DRIFT_NADEL = 3.5;
const DRIFTWECHSEL_MIN_MS = 1500;
const DRIFTWECHSEL_MAX_MS = 3000;

const begrenze = (w, min, max) => Math.min(max, Math.max(min, w));
const zufallAus = (feld, rnd) => feld[Math.floor(rnd() * feld.length)];

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
  for (;;) {
    const x = 0.08 + rnd() * 0.84;
    const y = 0.08 + rnd() * 0.84;
    if (Math.hypot(x - 0.5, y - 0.5) >= 0.25) return { x, y };
  }
}

export function zufallsStrich(rnd) {
  for (;;) {
    const x = 0.08 + rnd() * 0.84;
    if (Math.abs(x - 0.5) >= 0.15) return { x };
  }
}

export function neuerSoll(alterSoll, nadel, rnd) {
  const passende = SOLLWERTE.filter((w) => w !== alterSoll && Math.abs(w - nadel) >= 15);
  return zufallAus(passende.length ? passende : SOLLWERTE.filter((w) => w !== alterSoll), rnd);
}

export function erzeugeLaufzustand(auswahl, rnd = Math.random) {
  const nadel = 100;
  return {
    auswahl: [...auswahl],
    fadenkreuz: zufallsFadenkreuz(rnd),
    strich: zufallsStrich(rnd),
    nadel,
    soll: neuerSoll(null, nadel, rnd),
    drift: {
      fx: neueDrift(DRIFT_STICK, rnd),
      fy: neueDrift(DRIFT_STICK, rnd),
      strich: neueDrift(DRIFT_RUDER, rnd),
      nadel: neueDrift(DRIFT_NADEL, rnd),
    },
    halte: { stick: 0, ruder: 0, schub: 0 },
    treffer: { stick: 0, ruder: 0, schub: 0 },
    kombitreffer: 0,
  };
}

export function inDeckung(z, element) {
  if (element === "stick") return Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) <= ZIELKREIS_R;
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
    z.fadenkreuz.x = begrenze(z.fadenkreuz.x + (eingaben.stickX * RATE_STICK + taktDrift(z.drift.fx, dtMs, rnd)) * dt, 0, 1);
    z.fadenkreuz.y = begrenze(z.fadenkreuz.y + (eingaben.stickY * RATE_STICK + taktDrift(z.drift.fy, dtMs, rnd)) * dt, 0, 1);
  }
  if (aktiv.includes("ruder")) {
    z.strich.x = begrenze(z.strich.x + (eingaben.ruder * RATE_RUDER + taktDrift(z.drift.strich, dtMs, rnd)) * dt, 0, 1);
  }
  if (aktiv.includes("schub")) {
    z.nadel = begrenze(z.nadel + (eingaben.schub * RATE_NADEL + taktDrift(z.drift.nadel, dtMs, rnd)) * dt, NADEL_MIN, NADEL_MAX);
  }

  for (const element of aktiv) {
    if (inDeckung(z, element)) {
      z.halte[element] += dtMs;
      if (z.halte[element] >= HALTEZEIT_MS) {
        z.treffer[element] += 1;
        const andereInDeckung = aktiv.filter((e) => e !== element).every((e) => inDeckung(z, e));
        if (aktiv.length > 1 && andereInDeckung) z.kombitreffer += 1;
        ereignisse.push({ element, kombi: aktiv.length > 1 && andereInDeckung });
        z.halte[element] = 0;
        if (element === "stick") z.fadenkreuz = zufallsFadenkreuz(rnd);
        else if (element === "ruder") z.strich = zufallsStrich(rnd);
        else z.soll = neuerSoll(z.soll, z.nadel, rnd);
      }
    } else {
      z.halte[element] = 0;
    }
  }
  return ereignisse;
}
