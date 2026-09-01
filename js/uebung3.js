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

// Gewürfelte Vorgaben seit 01.09.2026 (Willis Auftrag): Kurs und Höhe aus
// festen Rastern, die Fahrt frei über dem Fahrtmesserband. Nur der Startpunkt
// bleibt fest: Norden und 5000 Fuß.
const HOEHE_BASIS = 5000;                   // Fuß, feste Starthöhe
const HOEHEN_BETRAEGE = [500, 1000, 1500];  // Fuß, gewürfelter Betrag je Richtung
const FAHRT_RASTER = 10;                    // Knoten, Schrittweite der Fahrtvorgaben
const FAHRT_MINDESTAENDERUNG = 40;          // Knoten, kleinster Abstand Start zu Ziel

// Physischer Fahrtbereich, den der Schub kommandiert (bleibt breiter als die
// Aufgabe, die Nadel läuft von 60 bis 320 kt).
const FAHRT_MIN = 60, FAHRT_MAX = 320;

// Steuerdynamik des Takts.
// Kursrate seit 29.08.2026 auf 15: Die Doppeldrehung (720 Grad in 60 s
// braucht im Schnitt 12 Grad je Sekunde) muss mit Reserve fliegbar sein.
const KURSRATE = 15;             // Grad je Sekunde bei Vollausschlag
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

// Kurs: Richtung und Betrag wechseln je Durchgang, minus dreht gegen den
// Uhrzeigersinn. Seit 01.09.2026 nur noch halbe, ganze und doppelte Drehung
// (270 raus, Willis Auftrag). Der Start bleibt Norden.
const KURS_BETRAEGE = [180, 360, 720];
function wuerfleKurs(rnd = Math.random) {
  const betrag = KURS_BETRAEGE[wuerfelIndex(KURS_BETRAEGE.length, rnd)];
  const aenderung = rnd() < 0.5 ? -betrag : betrag;
  return { start: 0, aenderung, ziel: mod360(aenderung) };
}

// Höhe: Steig- oder Sinkflug um 500, 1000 oder 1500 Fuß ab fest 5000 Fuß
// (Willis Auftrag vom 01.09.2026, Höhenmesser zeigt Fuß). Alle Ziele liegen
// damit zwischen 3500 und 6500 Fuß, sicher innerhalb des Anzeigebereichs.
function wuerfleHoehe(rnd = Math.random) {
  const betrag = HOEHEN_BETRAEGE[wuerfelIndex(HOEHEN_BETRAEGE.length, rnd)];
  const aenderung = rnd() < 0.5 ? -betrag : betrag;
  return { start: HOEHE_BASIS, aenderung, ziel: HOEHE_BASIS + aenderung };
}

// Fahrt: Start und Ziel frei über dem ganzen Fahrtmesserband 60 bis 320 kt
// im Zehnerraster, mindestens 40 kt auseinander (Willis Auftrag vom
// 01.09.2026, "die Geschwindigkeit kann alles sein"). Die Nadel beginnt
// weiter bei 60 kt und wird in der Einrichtzeit auf den Startwert
// hochgezogen (siehe erzeugeFlugzustand).
function wuerfleFahrt(rnd = Math.random) {
  const werte = [];
  for (let kt = FAHRT_MIN; kt <= FAHRT_MAX; kt += FAHRT_RASTER) werte.push(kt);
  const start = werte[wuerfelIndex(werte.length, rnd)];
  const ziele = werte.filter((kt) => Math.abs(kt - start) >= FAHRT_MINDESTAENDERUNG);
  return { start, ziel: ziele[wuerfelIndex(ziele.length, rnd)] };
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

// Rechenaufgaben seit 29.08.2026 (Willis Auftrag): nur Plus und Minus, und
// eine anpassende Stufe deckelt die Operandengröße. Stufe 0 rechnet
// einstellig; jede richtig beantwortete Aufgabe hebt die Stufe im Lauf um
// eins, bis zur Obergrenze. Ergebnisse bleiben immer zwischen 0 und 99,
// die Operanden werden so gewürfelt, dass kein Neuwürfeln nötig ist.
export const RECHENSTUFEN_MAX = 4;
const STUFENDECKEL = [9, 20, 40, 70, 99]; // größter Operand je Stufe

export function erzeugeRechenaufgabe(rnd = Math.random, stufe = 0) {
  const deckel = STUFENDECKEL[begrenze(Math.floor(stufe), 0, RECHENSTUFEN_MAX)];
  const op = rnd() < 0.5 ? "+" : "-";
  if (op === "+") {
    const a = 1 + wuerfelIndex(deckel, rnd);                    // 1 bis deckel
    const b = wuerfelIndex(Math.min(deckel, 99 - a) + 1, rnd);  // Summe bleibt <= 99
    return { a, op, b, antwort: a + b };
  }
  const a = 1 + wuerfelIndex(deckel, rnd);                      // 1 bis deckel
  const b = wuerfelIndex(a + 1, rnd);                           // 0 bis a: Ergebnis >= 0
  return { a, op, b, antwort: a - b };
}

// Fünf gemischte Antwortmöglichkeiten: die richtige Antwort plus vier
// eindeutige, positive Ablenker aus ihrer Nähe (±1, ±2, ±10). Der
// Kandidatenpool wird vor der Auswahl gemischt. Reicht die Nähe nicht für
// vier eindeutige Werte, füllt eine Schlussschleife mit weiter entfernten,
// aber weiterhin eindeutigen Werten auf.
export function antworten5(aufgabe, rnd = Math.random) {
  const antwort = aufgabe.antwort;
  const kandidaten = [antwort - 1, antwort + 1, antwort - 2, antwort + 2, antwort - 10, antwort + 10];
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

// Erfüllungsanteil (Willis Festlegung vom 31.08.2026): In Stufe 4 fließt
// das Kopfrechnen mit 20 Prozent in die Kennzahl ein (verpasste Aufgaben
// zählen über gestellt als falsch); darunter bleibt es die Genauigkeit.
export const RECHNEN_GEWICHT = 0.2;

export function erfuellung3(genauigkeit, rechnen) {
  if (!rechnen || rechnen.gestellt === 0) return genauigkeit;
  const quote = (rechnen.richtig / rechnen.gestellt) * 100;
  return (1 - RECHNEN_GEWICHT) * genauigkeit + RECHNEN_GEWICHT * quote;
}
