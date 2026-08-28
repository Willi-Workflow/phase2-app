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

// Festes Standardszenario (Willis Vorgabe vom 28.08.2026): keine gewürfelten
// Zielvorgaben mehr, jeder Durchgang fliegt dieselbe Standardaufgabe.
const HOEHE_BASIS = 5000;      // Fuß, Starthöhe des Steigflugs
const HOEHE_STEIGFLUG = 1000;  // Fuß, immer steigen
const FAHRT_ZIEL_START = 100;  // Knoten, Startvorgabe der Fahrt
const FAHRT_ZIEL_ZIEL = 140;   // Knoten, Zielvorgabe der Fahrt

// Physischer Fahrtbereich, den der Schub kommandiert (bleibt breiter als die
// Aufgabe, die Nadel läuft von 60 bis 320 kt).
const FAHRT_MIN = 60, FAHRT_MAX = 320;

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

// Festes Standardszenario (Willis Vorgabe vom 28.08.2026): Kurs immer eine
// volle Drehung ab Norden, im Uhrzeigersinn, Ziel damit wieder Norden. Kein
// Zufall mehr, jeder Kurs-Durchgang ist gleich.
function wuerfleKurs() {
  return { start: 0, aenderung: 360, ziel: 0 };
}

// Höhe: fester Steigflug um 1000 Fuß ab 5000 Fuß (festes Standardszenario,
// Willis Vorgabe vom 28.08.2026, Höhenmesser zeigt Fuß).
function wuerfleHoehe() {
  return { start: HOEHE_BASIS, aenderung: HOEHE_STEIGFLUG, ziel: HOEHE_BASIS + HOEHE_STEIGFLUG };
}

// Fahrt: fest von 100 auf 140 Knoten (festes Standardszenario, Willis Vorgabe
// vom 28.08.2026). Die Zelle beginnt weiter bei 60 kt und wird in der
// Einrichtzeit auf den Startwert hochgezogen (siehe erzeugeFlugzustand).
function wuerfleFahrt() {
  return { start: FAHRT_ZIEL_START, ziel: FAHRT_ZIEL_ZIEL };
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
  // Ohne Messungen gibt es null Punkte: ein Durchgang, der nie getaktet
  // wurde, darf nicht als perfekt in die Kennzahl eingehen, sonst
  // verdeckte ein Fehler im Laufmodul sich selbst mit Bestnote.
  if (!messungen) return 0;
  return Math.round(100 * (1 - fehlerSumme / messungen));
}

// Kennzahl des Laufs: gerundetes Mittel der Durchgangspunkte.
// Schwierigkeitsfaktor: Stufe 1 fliegt nur ein Instrument, Stufe 3 alle,
// Stufe 4 rechnet nebenbei; nur Stufe 4 erreicht den Faktor 1,0. So kommt
// eine leichte Einstellung nie auf 100 Prozent.
const STUFENFAKTOR = { 1: 0.65, 2: 0.8, 3: 0.9, 4: 1.0 };
export function schwierigkeitsfaktor3(stufe) {
  return STUFENFAKTOR[stufe] ?? 0.65;
}

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
