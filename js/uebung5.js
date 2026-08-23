// Übungslogik Mission 5 (Test Flugphysik): Aufgabenerzeugung rückwärts vom
// glatten Ergebnis, Ablenker, Eingabeprüfung und Punktrechnung. Reine Logik
// ohne DOM, der Zufall ist einspeisbar, damit alles mit node --test prüfbar
// bleibt.
import { mische } from "./zufall.js";

export const AUFGABENZEIT = 20; // Sekunden je Aufgabe
export const TESTDAUERN = [5, 10, 30]; // Minuten
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
export function erzeugeLauf(anzahl, rnd = Math.random) {
  return waehlePrinzipien(anzahl, rnd).map((prinzip) => ({
    ...erzeugeAufgabe(prinzip, rnd),
    form: rnd() < 0.5 ? "auswahl" : "eingabe",
  }));
}

// Der klassische 60er-Fehler je Prinzip: Faktor 60 vergessen oder doppelt
// gerechnet. Bei der Rate gibt es keinen.
function sechzigerFehler(aufgabe) {
  const a = aufgabe.antwort;
  if (aufgabe.prinzip === "zeit" || aufgabe.prinzip === "geschwindigkeit") {
    return Number.isInteger(a / 60) ? a / 60 : null;
  }
  if (aufgabe.prinzip === "weg") return a * 60;
  return null;
}

// Drei Ablenker: bevorzugt der 60er-Fehler, dazu Nachbarwerte in plausibler
// Nähe. Die Schlussschleife garantiert drei Werte auch bei Rundungskollisionen.
export function ablenker(aufgabe, rnd = Math.random) {
  const a = aufgabe.antwort;
  const kandidaten = [];
  const fehler = sechzigerFehler(aufgabe);
  if (fehler && fehler !== a) kandidaten.push(fehler);
  kandidaten.push(...mische([0.5, 0.75, 0.9, 1.1, 1.25, 1.5, 2].map((f) => Math.round(a * f)), rnd));
  const eindeutig = [];
  for (const k of kandidaten) {
    if (k > 0 && k !== a && !eindeutig.includes(k)) eindeutig.push(k);
    if (eindeutig.length === 3) return eindeutig;
  }
  for (let k = 1; eindeutig.length < 3; k++) {
    if (!eindeutig.includes(a + k)) eindeutig.push(a + k);
  }
  return eindeutig;
}

export function antwortenFuer(aufgabe, rnd = Math.random) {
  return mische([aufgabe.antwort, ...ablenker(aufgabe, rnd)], rnd);
}

// Eingaben gelten mit Komma oder Punkt, Leerzeichen werden ignoriert.
// Richtig ist nur der exakte Wert, die Erzeugung liefert glatte Zahlen.
export function pruefeEingabe(text, antwort) {
  const bereinigt = String(text ?? "").replace(/\s/g, "").replace(",", ".");
  if (bereinigt === "") return false;
  const zahl = Number(bereinigt);
  return Number.isFinite(zahl) && zahl === antwort;
}

// Punktrechnung je Aufgabe, Aufteilung von Willi festgelegt: falsch gibt
// nichts, richtig gibt den Grundanteil plus einen mit der Restzeit linear
// wachsenden Bonus. Eine langsame richtige Antwort schlägt so immer jede
// falsche.
export function punkteFuerAntwort(richtig, restzeitMs, limitMs) {
  if (!richtig) return 0;
  const anteil = Math.max(0, Math.min(1, restzeitMs / limitMs));
  return 7 + 3 * anteil;
}

// Kennzahl des Laufs: Punkteschnitt je gestellter Aufgabe, auf 0 bis 100
// gebracht. So bleiben Läufe verschiedener Testdauern vergleichbar.
export function kennzahl(punkteSumme, anzahl) {
  if (anzahl === 0) return 0;
  return Math.round((punkteSumme / (anzahl * 10)) * 100);
}
