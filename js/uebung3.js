// Übungslogik Mission 3 (Instrumentenflug): Nachbau des ICT aus dem ICA 90 II
// nach Dissertation 3.3.3 samt Abbildung 3-9. Je Durchgang laufen 60 Sekunden,
// in denen Kurs, Höhe und Fahrt gleichmäßig von einem Startwert zu einem
// Zielwert geführt werden sollen; bewertet wird die Abweichung von der
// linearen Sollkurve. Reine Logik ohne DOM, Zufall und Zeitschritt sind
// einspeisbar (node --test).
import { mische } from "./zufall.js";

export const TESTDAUERN = [3, 5, 10]; // Minuten
export const STUFEN = [1, 2, 3, 4];
export const FLUGZEIT_S = 60;         // Dauer eines Durchgangs
export const EINRICHTZEIT_S = 5;      // Fahrt zählt erst danach zur Wertung
export const RECHENTAKT_S = 12;       // Abstand der Rechenaufgaben in Stufe 4

const INSTRUMENTE = ["kurs", "hoehe", "fahrt"]; // feste Reihenfolge im Ergebnis

// Raster der Zielvorgaben laut Entwurf.
const KURS_START_SCHRITTE = 72;               // 0 bis 355 in 5er Schritten
const KURS_SCHRITT = 5;
const KURS_AENDERUNG_BETRAEGE = [90, 120, 150, 180, 210, 240, 270, 300, 330, 360];

const HOEHE_MIN = 2000, HOEHE_MAX = 8000, HOEHE_SCHRITT = 500;
const HOEHE_START_SCHRITTE = (HOEHE_MAX - HOEHE_MIN) / HOEHE_SCHRITT + 1; // 13
const HOEHE_AENDERUNG_BETRAEGE = [500, 1000, 1500, 2000, 2500, 3000];
const HOEHE_ZIEL_MIN = 500, HOEHE_ZIEL_MAX = 9900;

const FAHRT_MIN = 60, FAHRT_MAX = 320, FAHRT_SCHRITT = 10;
const FAHRT_SCHRITTE = (FAHRT_MAX - FAHRT_MIN) / FAHRT_SCHRITT + 1; // 27
const FAHRT_MINDESTUNTERSCHIED = 40;

// Steuerdynamik des Takts.
const KURSRATE = 9;              // Grad je Sekunde bei Vollausschlag
const HOEHENRATE = 100;          // ft je Sekunde bei Vollausschlag, Ziehen steigt
const FAHRT_ZEITKONSTANTE = 1.5; // Sekunden, mit der die Nadel dem Schub folgt
const TAKT_DT_MAX = 0.05;        // Sekunden, Deckel je Aufruf

const PEDALZONEN = 5;

// Normierung der Fehlersäule.
const NORM_KURS = 45;
const NORM_HOEHE = 600;
const NORM_FAHRT = 40;

const mod360 = (grad) => ((grad % 360) + 360) % 360;
const begrenze = (wert, min, max) => Math.min(max, Math.max(min, wert));
const wuerfelIndex = (anzahl, rnd) => Math.floor(rnd() * anzahl);

function wuerfleKurs(rnd) {
  const start = wuerfelIndex(KURS_START_SCHRITTE, rnd) * KURS_SCHRITT;
  const betrag = KURS_AENDERUNG_BETRAEGE[wuerfelIndex(KURS_AENDERUNG_BETRAEGE.length, rnd)];
  const vorzeichen = rnd() < 0.5 ? -1 : 1;
  const aenderung = vorzeichen * betrag;
  return { start, aenderung, ziel: mod360(start + aenderung) };
}

// Höhe und Fahrt würfeln jeweils neu, bis das Ziel im erlaubten Bereich
// beziehungsweise der Mindestunterschied erreicht ist. Der Schleifenwächter
// verhindert eine Endlosschleife bei einem entarteten Zufall.
function wuerfleHoehe(rnd) {
  for (let versuch = 0; versuch < 1000; versuch++) {
    const start = HOEHE_MIN + wuerfelIndex(HOEHE_START_SCHRITTE, rnd) * HOEHE_SCHRITT;
    const betrag = HOEHE_AENDERUNG_BETRAEGE[wuerfelIndex(HOEHE_AENDERUNG_BETRAEGE.length, rnd)];
    const vorzeichen = rnd() < 0.5 ? -1 : 1;
    const aenderung = vorzeichen * betrag;
    const ziel = start + aenderung;
    if (ziel >= HOEHE_ZIEL_MIN && ziel <= HOEHE_ZIEL_MAX) return { start, aenderung, ziel };
  }
  return { start: HOEHE_MIN, aenderung: HOEHE_AENDERUNG_BETRAEGE[0], ziel: HOEHE_MIN + HOEHE_AENDERUNG_BETRAEGE[0] };
}

function wuerfleFahrt(rnd) {
  for (let versuch = 0; versuch < 1000; versuch++) {
    const start = FAHRT_MIN + wuerfelIndex(FAHRT_SCHRITTE, rnd) * FAHRT_SCHRITT;
    const ziel = FAHRT_MIN + wuerfelIndex(FAHRT_SCHRITTE, rnd) * FAHRT_SCHRITT;
    if (Math.abs(ziel - start) >= FAHRT_MINDESTUNTERSCHIED) return { start, ziel };
  }
  return { start: FAHRT_MIN, ziel: FAHRT_MAX };
}

// Stufe 1 nimmt eines der drei Instrumente, Stufe 2 zwei, ab Stufe 3 alle
// drei. Die Auswahl selbst ist zufällig, das Ergebnis steht immer in der
// festen Reihenfolge kurs, hoehe, fahrt.
function waehleAktive(stufe, rnd) {
  if (stufe >= 3) return [...INSTRUMENTE];
  const gemischt = mische(INSTRUMENTE, rnd).slice(0, stufe);
  return INSTRUMENTE.filter((id) => gemischt.includes(id));
}

// Zielvorgaben eines Durchgangs. Kurs, Höhe und Fahrt werden immer für alle
// drei Instrumente erzeugt, unabhängig davon, welche laut Stufe aktiv sind.
export function erzeugeVorgaben(stufe, rnd = Math.random) {
  const kurs = wuerfleKurs(rnd);
  const hoehe = wuerfleHoehe(rnd);
  const fahrt = wuerfleFahrt(rnd);
  return { aktive: waehleAktive(stufe, rnd), kurs, hoehe, fahrt };
}

// Anfangszustand: Kurs und Höhe stehen systemseitig auf dem Startwert, die
// Fahrt beginnt bei 60 kt und muss vom Bewerber selbst hochgezogen werden.
export function erzeugeFlugzustand(vorgaben) {
  return { kurs: vorgaben.kurs.start, hoehe: vorgaben.hoehe.start, fahrt: 60 };
}

// Ein Zeitschritt der Steuerung. dt wird je Aufruf auf höchstens 0,05 s
// gedeckelt, damit ein ausgesetzter Takt (etwa nach Tabwechsel) die Lage
// nicht in einem Sprung verändert.
export function takt(zustand, achsen, dtMs) {
  const dt = Math.min(dtMs / 1000, TAKT_DT_MAX);
  zustand.kurs = mod360(zustand.kurs + achsen.stickX * KURSRATE * dt);
  zustand.hoehe = begrenze(zustand.hoehe + achsen.stickY * HOEHENRATE * dt, 0, 9900);
  const sollfahrt = FAHRT_MIN + ((achsen.schub + 1) / 2) * (FAHRT_MAX - FAHRT_MIN);
  zustand.fahrt += (sollfahrt - zustand.fahrt) * (1 - Math.exp(-dt / FAHRT_ZEITKONSTANTE));
  return zustand;
}

// Sollwert eines Instruments zur Sekunde tS, linear von Start zu Ziel. Beim
// Kurs läuft die Interpolation über die gewürfelte Änderung (nicht über den
// kürzesten Weg zum normierten Ziel), damit die Drehrichtung der Vorgabe
// entspricht: bei -270 Grad dreht die Sollkurve links, auch wenn rechts der
// kürzere Weg wäre. Die Fahrt steht bis Sekunde 5 (Einrichtzeit) auf dem
// Startwert und läuft erst danach linear zum Ziel.
export function sollwert(vorgaben, id, tS) {
  const t = begrenze(tS, 0, FLUGZEIT_S);
  if (id === "kurs") {
    return mod360(vorgaben.kurs.start + vorgaben.kurs.aenderung * (t / FLUGZEIT_S));
  }
  if (id === "hoehe") {
    return vorgaben.hoehe.start + vorgaben.hoehe.aenderung * (t / FLUGZEIT_S);
  }
  if (id === "fahrt") {
    if (t <= EINRICHTZEIT_S) return vorgaben.fahrt.start;
    const anteil = (t - EINRICHTZEIT_S) / (FLUGZEIT_S - EINRICHTZEIT_S);
    return vorgaben.fahrt.start + (vorgaben.fahrt.ziel - vorgaben.fahrt.start) * anteil;
  }
  throw new Error(`unbekannte Instrumenten-Kennung: ${id}`);
}

// Kleinster Winkelabstand zweier Kurse, unabhängig von der Umlaufrichtung
// (350 zu 10 ist 20, nicht 340).
export function winkelabstand(a, b) {
  const d = Math.abs(mod360(a) - mod360(b));
  return Math.min(d, 360 - d);
}

// Momentanfehler zur Sekunde tS: Mittel der normierten Abweichungen über die
// aktiven Instrumente, je Instrument bei 1 gedeckelt. Die Fahrt zählt erst ab
// der Einrichtzeit; ist sie vorher das einzige aktive Instrument, bleibt der
// Momentanfehler 0.
export function momentanfehler(zustand, vorgaben, tS) {
  const teile = [];
  if (vorgaben.aktive.includes("kurs")) {
    const abweichung = winkelabstand(zustand.kurs, sollwert(vorgaben, "kurs", tS));
    teile.push(Math.min(1, abweichung / NORM_KURS));
  }
  if (vorgaben.aktive.includes("hoehe")) {
    const abweichung = Math.abs(zustand.hoehe - sollwert(vorgaben, "hoehe", tS));
    teile.push(Math.min(1, abweichung / NORM_HOEHE));
  }
  if (vorgaben.aktive.includes("fahrt") && tS >= EINRICHTZEIT_S) {
    const abweichung = Math.abs(zustand.fahrt - sollwert(vorgaben, "fahrt", tS));
    teile.push(Math.min(1, abweichung / NORM_FAHRT));
  }
  if (teile.length === 0) return 0;
  return teile.reduce((summe, w) => summe + w, 0) / teile.length;
}

// Punkte eines Durchgangs aus der Summe der Momentanfehler über die Messungen
// der Wertungszeit. Ohne Messung gilt der Durchgang als fehlerfrei.
export function durchgangspunkte(fehlerSumme, messungen) {
  if (!messungen) return 100;
  return Math.round(100 * (1 - fehlerSumme / messungen));
}

// Kennzahl des Laufs: gerundetes Mittel der Durchgangspunkte.
export function kennzahl3(punkteListe) {
  if (punkteListe.length === 0) return 0;
  return Math.round(punkteListe.reduce((summe, p) => summe + p, 0) / punkteListe.length);
}

// Rechenaufgabe für Stufe 4: plus mit Ergebnis höchstens 99, minus mit
// Ergebnis mindestens 0, kleines Einmaleins mit Faktoren 2 bis 12. Die
// Operanden werden so gewürfelt, dass die Grenze immer eingehalten ist,
// ohne dass ein Neuwürfeln nötig wird.
export function erzeugeRechenaufgabe(rnd = Math.random) {
  const formen = ["+", "-", "*"];
  const op = formen[wuerfelIndex(formen.length, rnd)];
  if (op === "+") {
    const a = 1 + wuerfelIndex(98, rnd);   // 1 bis 98
    const b = wuerfelIndex(100 - a, rnd);  // 0 bis (99 - a): Summe bleibt <= 99
    return { a, op, b, antwort: a + b };
  }
  if (op === "-") {
    const a = 1 + wuerfelIndex(99, rnd);   // 1 bis 99
    const b = wuerfelIndex(a + 1, rnd);    // 0 bis a: Ergebnis bleibt >= 0
    return { a, op, b, antwort: a - b };
  }
  const a = 2 + wuerfelIndex(11, rnd);     // 2 bis 12
  const b = 2 + wuerfelIndex(11, rnd);     // 2 bis 12
  return { a, op, b, antwort: a * b };
}

// Fünf gemischte Antwortmöglichkeiten: die richtige Antwort plus vier
// eindeutige, positive Ablenker aus ihrer Nähe (±1, ±2, ±10, beim
// Einmaleins zusätzlich die Nachbarprodukte). Der Kandidatenpool wird vor
// der Auswahl gemischt, damit auch die Nachbarprodukte tatsächlich zum Zug
// kommen und nicht immer von den nahen Zahlenwerten verdrängt werden. Reicht
// die Nähe nicht für vier eindeutige Werte, füllt eine Schlussschleife mit
// weiter entfernten, aber weiterhin eindeutigen Werten auf.
export function antworten5(aufgabe, rnd = Math.random) {
  const antwort = aufgabe.antwort;
  const kandidaten = [antwort - 1, antwort + 1, antwort - 2, antwort + 2, antwort - 10, antwort + 10];
  if (aufgabe.op === "*") {
    kandidaten.push(
      (aufgabe.a - 1) * aufgabe.b, (aufgabe.a + 1) * aufgabe.b,
      aufgabe.a * (aufgabe.b - 1), aufgabe.a * (aufgabe.b + 1),
    );
  }
  const eindeutig = [];
  for (const k of mische(kandidaten, rnd)) {
    if (k > 0 && k !== antwort && !eindeutig.includes(k)) eindeutig.push(k);
    if (eindeutig.length === 4) break;
  }
  for (let k = 3; eindeutig.length < 4; k++) {
    const kandidat = antwort + k;
    if (kandidat > 0 && kandidat !== antwort && !eindeutig.includes(kandidat)) eindeutig.push(kandidat);
  }
  return mische([antwort, ...eindeutig], rnd);
}

// Pedalwahl über fünf gleich breite Zonen des Ausschlags von -1 bis 1.
export function pedalwahl(ruder) {
  const r = begrenze(ruder, -1, 1);
  const zone = Math.floor(((r + 1) / 2) * PEDALZONEN);
  return begrenze(zone, 0, PEDALZONEN - 1);
}
