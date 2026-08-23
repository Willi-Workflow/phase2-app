// Übungslogik Mission 5 (Test Flugphysik): Aufgabenerzeugung rückwärts vom
// glatten Ergebnis, Ablenker, Eingabeprüfung und Punktrechnung. Reine Logik
// ohne DOM, der Zufall ist einspeisbar, damit alles mit node --test prüfbar
// bleibt.
import { mische } from "./zufall.js";

export const AUFGABENZAHL = 10;
export const AUFGABENZEIT = 30; // Sekunden je Aufgabe
export const PRINZIPIEN = ["zeit", "weg", "geschwindigkeit", "rate"];

// Wertelisten laut Entwurf: nur Paare, deren Ergebnis ganzzahlig ist und im
// erlaubten Bereich liegt, einmal beim Laden gerechnet.
const GESCHWINDIGKEITEN = [60, 80, 90, 100, 120, 150, 180, 200, 240, 300, 360, 420, 480];
const ZEITEN = [12, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300];
const WZG_PAARE = [];
for (const v of GESCHWINDIGKEITEN) for (const t of ZEITEN) {
  const s = (v * t) / 60;
  if (Number.isInteger(s) && s >= 20 && s <= 2400) WZG_PAARE.push({ v, t, s });
}
const RATEN_PAARE = [];
for (let r = 200; r <= 4000; r += 100) for (let t = 2; t <= 12; t++) {
  const h = r * t;
  if (h >= 500 && h <= 30000) RATEN_PAARE.push({ r, t, h });
}

const zufallAus = (feld, rnd) => feld[Math.floor(rnd() * feld.length)];

// Jedes Prinzip kommt mindestens einmal vor, der Rest wird gewürfelt.
export function waehlePrinzipien(anzahl, rnd = Math.random) {
  const folge = [...PRINZIPIEN];
  while (folge.length < anzahl) folge.push(zufallAus(PRINZIPIEN, rnd));
  return mische(folge.slice(0, anzahl), rnd);
}

export function erzeugeAufgabe(prinzip, rnd = Math.random) {
  if (prinzip === "rate") {
    const { r, t, h } = zufallAus(RATEN_PAARE, rnd);
    const sinken = rnd() < 0.5;
    return {
      prinzip,
      frage: sinken
        ? `Das Luftfahrzeug muss ${h} ft in ${t} Minuten abbauen. Berechne die Sinkrate in ft/min.`
        : `Das Luftfahrzeug muss ${h} ft in ${t} Minuten steigen. Berechne die Steigrate in ft/min.`,
      antwort: r,
      einheit: "ft/min",
    };
  }
  const { v, t, s } = zufallAus(WZG_PAARE, rnd);
  if (prinzip === "zeit") return {
    prinzip,
    frage: `Das Luftfahrzeug fliegt ${v} kt. Das Ziel liegt ${s} NM entfernt. Berechne die Flugzeit in Minuten.`,
    antwort: t,
    einheit: "min",
  };
  if (prinzip === "weg") return {
    prinzip,
    frage: `Das Luftfahrzeug fliegt ${v} kt für ${t} Minuten. Berechne den zurückgelegten Weg in NM.`,
    antwort: s,
    einheit: "NM",
  };
  return {
    prinzip,
    frage: `Das Luftfahrzeug legt ${s} NM in ${t} Minuten zurück. Berechne die Geschwindigkeit in Knoten.`,
    antwort: v,
    einheit: "kt",
  };
}

// Ein Lauf: Prinzipienfolge, je Aufgabe die gewürfelte Erscheinungsform.
export function erzeugeLauf(anzahl = AUFGABENZAHL, rnd = Math.random) {
  return waehlePrinzipien(anzahl, rnd).map((prinzip) => ({
    ...erzeugeAufgabe(prinzip, rnd),
    form: rnd() < 0.5 ? "auswahl" : "eingabe",
  }));
}
