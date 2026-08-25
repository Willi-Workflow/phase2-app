// Übungslogik Mission 5 (Test Flugphysik): Aufgabenerzeugung rückwärts vom
// glatten Ergebnis, Ablenker, Eingabeprüfung und Punktrechnung. Reine Logik
// ohne DOM, der Zufall ist einspeisbar, damit alles mit node --test prüfbar
// bleibt.
import { mische } from "./zufall.js";
import { zufallswerte } from "./instrumente.js";

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

// Anzeigeraster der Instrumente für Instrumentenaufgaben: Der Fahrtmesser
// zeigt nur diese Geschwindigkeiten an, der Höhenmesser nur Hunderterschritte
// zwischen 1000 und 9900 ft, das Variometer nur Werte bis 2000 ft/min. Wer
// den gegebenen Wert am Zeiger abliest, darf ihn also nur dort auch finden.
const FAHRTMESSER_ANZEIGE = [60, 80, 90, 100, 120, 150, 180, 200, 240, 300];
const WZG_PAARE_FAHRTMESSER = WZG_PAARE.filter((p) => FAHRTMESSER_ANZEIGE.includes(p.v));
const RATEN_PAARE_HOEHENMESSER = RATEN_PAARE.filter((p) => p.h >= 1000 && p.h <= 9900);
// Auch der Höhenmesser muss den abzubauenden Betrag plausibel zeigen können.
const RATEN_PAARE_VARIOMETER = RATEN_PAARE.filter((p) => p.r <= 2000 && p.h <= 9400);

const zufallAus = (feld, rnd) => feld[Math.floor(rnd() * feld.length)];

// Jedes Prinzip kommt mindestens einmal vor, der Rest wird gewürfelt.
export function waehlePrinzipien(anzahl, rnd = Math.random) {
  const folge = [...PRINZIPIEN];
  while (folge.length < anzahl) folge.push(zufallAus(PRINZIPIEN, rnd));
  return mische(folge.slice(0, anzahl), rnd);
}

// Bei mitInstrument entfällt der Gegebenwert im Text, stattdessen verweist
// die Frage aufs Ablesen am Instrument, dessen Wert im Anzeigeraster liegen
// muss. Beim Prinzip Geschwindigkeit stünde der gesuchte Wert sonst ablesbar
// am Instrument, darum bleibt es dort immer bei der Textaufgabe.
export function erzeugeAufgabe(prinzip, rnd = Math.random, mitInstrument = false) {
  if (prinzip === "geschwindigkeit") mitInstrument = false;

  if (prinzip === "rate") {
    if (mitInstrument) {
      if (rnd() < 0.5) {
        const { r, t, h } = zufallAus(RATEN_PAARE_HOEHENMESSER, rnd);
        return {
          prinzip,
          frage: `Du musst deine aktuelle Höhe (Höhenmesser) in ${t} Minuten vollständig abbauen. Berechne die Sinkrate in ft/min.`,
          antwort: r,
          einheit: "ft/min",
          instrument: { id: "hoehe", wert: h },
        };
      }
      const { r, t, h } = zufallAus(RATEN_PAARE_VARIOMETER, rnd);
      return {
        prinzip,
        frage: `Du sinkst mit deinem aktuellen Sinken (Variometer). Berechne die Flugzeit für ${h} ft in Minuten.`,
        antwort: t,
        einheit: "min",
        instrument: { id: "vario", wert: -r },
      };
    }
    const { r, t, h } = zufallAus(RATEN_PAARE, rnd);
    const sinken = rnd() < 0.5;
    return {
      prinzip,
      frage: sinken
        ? `Ein Luftfahrzeug muss ${h} ft in ${t} Minuten abbauen. Berechne die Sinkrate in ft/min.`
        : `Ein Luftfahrzeug muss ${h} ft in ${t} Minuten steigen. Berechne die Steigrate in ft/min.`,
      antwort: r,
      einheit: "ft/min",
      instrument: null,
    };
  }

  if (mitInstrument) {
    const { v, t, s } = zufallAus(WZG_PAARE_FAHRTMESSER, rnd);
    if (prinzip === "zeit") return {
      prinzip,
      frage: `Du fliegst mit deiner aktuellen Geschwindigkeit (Fahrtmesser). Das Ziel liegt ${s} NM entfernt. Berechne die Flugzeit in Minuten.`,
      antwort: t,
      einheit: "min",
      instrument: { id: "fahrt", wert: v },
    };
    return {
      prinzip,
      frage: `Du fliegst ${t} Minuten mit deiner aktuellen Geschwindigkeit (Fahrtmesser). Berechne den zurückgelegten Weg in NM.`,
      antwort: s,
      einheit: "NM",
      instrument: { id: "fahrt", wert: v },
    };
  }

  const { v, t, s } = zufallAus(WZG_PAARE, rnd);
  if (prinzip === "zeit") return {
    prinzip,
    frage: `Ein Luftfahrzeug fliegt ${v} kt. Das Ziel liegt ${s} NM entfernt. Berechne die Flugzeit in Minuten.`,
    antwort: t,
    einheit: "min",
    instrument: null,
  };
  if (prinzip === "weg") return {
    prinzip,
    frage: `Ein Luftfahrzeug fliegt ${v} kt für ${t} Minuten. Berechne den zurückgelegten Weg in NM.`,
    antwort: s,
    einheit: "NM",
    instrument: null,
  };
  return {
    prinzip,
    frage: `Ein Luftfahrzeug legt ${s} NM in ${t} Minuten zurück. Berechne die Geschwindigkeit in Knoten.`,
    antwort: v,
    einheit: "kt",
    instrument: null,
  };
}

// Ein Lauf: Prinzipienfolge, je Aufgabe die gewürfelte Erscheinungsform.
// Zusätzlich wird rund ein Drittel der Aufgaben zu Instrumentenaufgaben, rein
// zufällig verteilt über die Positionen, deren Prinzip nicht Geschwindigkeit
// ist. Gibt es weniger geeignete Positionen als das Drittel, werden alle
// geeigneten genommen.
export function erzeugeLauf(anzahl, rnd = Math.random) {
  const prinzipien = waehlePrinzipien(anzahl, rnd);
  const geeignete = prinzipien.reduce((liste, prinzip, i) => {
    if (prinzip !== "geschwindigkeit") liste.push(i);
    return liste;
  }, []);
  const anzahlInstrument = Math.min(Math.round(anzahl / 3), geeignete.length);
  const instrumentPositionen = new Set(mische(geeignete, rnd).slice(0, anzahlInstrument));
  return prinzipien.map((prinzip, i) => ({
    ...erzeugeAufgabe(prinzip, rnd, instrumentPositionen.has(i)),
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

// Vollständiges, widerspruchsfreies Panel zur Aufgabe: bei Ablese-Aufgaben
// zeigt das betroffene Instrument den Aufgabenwert und der Rest passt zur
// Lage (Willis Vorgabe vom 25.08.2026). Textaufgaben sprechen von einem
// fremden Luftfahrzeug, das eigene Panel würfelt frei.
export function panelwerte(aufgabe, rnd = Math.random) {
  const werte = zufallswerte(rnd);
  const instrument = aufgabe.instrument;
  if (!instrument) return werte;
  werte[instrument.id] = instrument.wert;
  if (instrument.id === "fahrt" || instrument.id === "hoehe") {
    // Reiseflug beziehungsweise Abbau steht erst bevor: waagerecht, kein
    // Steigen oder Sinken auf dem Variometer.
    werte.vario = 0;
    werte.horizont = { roll: 0, nick: 0 };
  }
  if (instrument.id === "vario") {
    // Der Sinkflug läuft: Nase leicht gesenkt, und der Höhenmesser zeigt
    // mindestens den abzubauenden Betrag (h = Rate mal Zeit), im
    // Anzeigeraster mit etwas zufälliger Reserve.
    const h = -instrument.wert * aufgabe.antwort;
    const mindest = Math.max(1000, Math.ceil((h + 100) / 100) * 100);
    werte.hoehe = Math.min(9900, mindest + 100 * Math.floor(rnd() * 5));
    werte.horizont = { roll: 0, nick: -10 };
  }
  return werte;
}
