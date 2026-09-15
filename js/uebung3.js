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
// Rechenfluss seit 03.09.2026 (Willis Auftrag): Die Aufgaben laufen
// durchgehend nacheinander statt im festen 12-Sekunden-Raster. Ab
// Ansagebeginn läuft ein Antwortfenster; nach Antwort oder Fensterablauf
// folgt nach kurzer Pause sofort die nächste Aufgabe. Die Ansage lässt
// zwischen Zahl, Zeichen und Zahl eine Sprechpause, damit sie
// verständlich bleibt.
export const RECHNEN_START_S = 6;     // erste Aufgabe kurz nach der Einrichtzeit
export const ANTWORT_FENSTER_S = 10;  // Antwortfenster ab Ansagebeginn
export const FOLGE_PAUSE_S = 1.2;     // Luft zwischen zwei Aufgaben
export const ANSAGE_PAUSE_MS = 350;   // Sprechpause zwischen den Ansagegliedern
// Unter dieser Restzeit startet keine neue Aufgabe mehr: Ansage (rund
// 3,5 s) plus etwas Reaktionszeit müssen noch hineinpassen, sonst zählte
// eine unbeantwortbare Aufgabe am Ende als verpasst.
export const RECHNEN_MINDESTREST_S = 8;

const INSTRUMENTE = ["kurs", "hoehe", "fahrt"]; // feste Reihenfolge im Ergebnis

// Gewürfelte Vorgaben seit 01.09.2026 (Willis Auftrag): Kurs und Höhe aus
// festen Rastern, die Fahrt frei über dem Fahrtmesserband. Nur der Startpunkt
// bleibt fest: Norden und 5000 Fuß.
const HOEHE_BASIS = 5000;                   // Fuß, feste Starthöhe
const HOEHEN_BETRAEGE = [500, 1000, 1500];  // Fuß, gewürfelter Betrag je Richtung
// Zwanzigerraster und gedeckelte Spanne seit 10.09.2026 (Willis Auftrag):
// jeder Wert und jede Spanne ist glatt durch 4 teilbar, fürs Kopfrechnen
// im Flug; riesige Sprünge über das halbe Band gibt es nicht mehr.
const FAHRT_RASTER = 20;                    // Knoten, Schrittweite der Fahrtvorgaben
const FAHRT_MINDESTAENDERUNG = 40;          // Knoten, kleinster Abstand Start zu Ziel
const FAHRT_HOECHSTAENDERUNG = 160;         // Knoten, größter Abstand Start zu Ziel

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
// im Zwanzigerraster, 40 bis 160 kt auseinander (Willis Aufträge vom
// 01.09. und 10.09.2026). Die Nadel beginnt weiter bei 60 kt und wird in
// der Einrichtzeit auf den Startwert hochgezogen (siehe erzeugeFlugzustand).
function wuerfleFahrt(rnd = Math.random) {
  const werte = [];
  for (let kt = FAHRT_MIN; kt <= FAHRT_MAX; kt += FAHRT_RASTER) werte.push(kt);
  const start = werte[wuerfelIndex(werte.length, rnd)];
  const ziele = werte.filter((kt) => {
    const abstand = Math.abs(kt - start);
    return abstand >= FAHRT_MINDESTAENDERUNG && abstand <= FAHRT_HOECHSTAENDERUNG;
  });
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
// kursWeg zählt die Drehung unaufgewickelt (ohne 360er-Umlauf) mit, damit
// die Fehlerrechnung Volldrehungen von Stillstand unterscheiden kann.
export function erzeugeFlugzustand(vorgaben) {
  return { kurs: vorgaben.kurs.start, kursWeg: vorgaben.kurs.start, hoehe: vorgaben.hoehe.start, fahrt: 60 };
}

// Ein Zeitschritt der Steuerung. dt wird je Aufruf auf höchstens 0,05 s
// gedeckelt, damit ein ausgesetzter Takt (etwa nach Tabwechsel) die Lage
// nicht in einem Sprung verändert.
export function takt(zustand, achsen, dtMs) {
  const dt = Math.min(dtMs / 1000, TAKT_DT_MAX);
  zustand.kursWeg = (zustand.kursWeg ?? zustand.kurs) + achsen.stickX * KURSRATE * dt;
  zustand.kurs = mod360(zustand.kursWeg);
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

// Kurssoll ohne 360er-Umlauf: dieselbe lineare Interpolation wie sollwert,
// aber unaufgewickelt, für die Fehlerrechnung gegen zustand.kursWeg.
export function kursSollWeg(vorgaben, tS) {
  const t = begrenze(tS, 0, FLUGZEIT_S);
  return vorgaben.kurs.start + vorgaben.kurs.aenderung * (t / FLUGZEIT_S);
}

// Kleinster Winkelabstand zweier Kurse, unabhängig von der Umlaufrichtung
// (350 zu 10 ist 20, nicht 340).
export function winkelabstand(a, b) {
  const d = Math.abs(mod360(a) - mod360(b));
  return Math.min(d, 360 - d);
}

// Normierte Abweichungen der aktiven Instrumente zur Sekunde tS, je
// Instrument bei 1 gedeckelt. Die Fahrt zählt erst ab der Einrichtzeit.
function fehlerteile(zustand, vorgaben, tS) {
  const teile = [];
  if (vorgaben.aktive.includes("kurs")) {
    // Aufgewickelt statt kleinster Winkelabstand (Willis Entscheid vom
    // 03.09.2026, bewusste Abweichung vom Original): Bei Volldrehungen
    // wanderte das Soll sonst am stehenden Flugzeug vorbei, und Säule wie
    // Wertung sanken, obwohl nichts richtig lief.
    const abweichung = Math.abs((zustand.kursWeg ?? zustand.kurs) - kursSollWeg(vorgaben, tS));
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
  return teile;
}

// Momentanfehler zur Sekunde tS: Mittel der normierten Abweichungen über die
// aktiven Instrumente. Geht in die Wertung ein; ist die Fahrt vor der
// Einrichtzeit das einzige aktive Instrument, bleibt der Momentanfehler 0.
export function momentanfehler(zustand, vorgaben, tS) {
  const teile = fehlerteile(zustand, vorgaben, tS);
  if (teile.length === 0) return 0;
  return teile.reduce((summe, w) => summe + w, 0) / teile.length;
}

// Säulenfehler zur Sekunde tS: das schlechteste aktive Instrument statt des
// Mittels (Willis Auftrag vom 10.09.2026). Nur für die Anzeige der
// Fehlersäule; die Wertung rechnet weiter mit momentanfehler, damit die
// Genauigkeit mit den gespeicherten Läufen vergleichbar bleibt.
export function saeulenfehler(zustand, vorgaben, tS) {
  const teile = fehlerteile(zustand, vorgaben, tS);
  if (teile.length === 0) return 0;
  return Math.max(...teile);
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

// Rechenaufgaben seit 29.08.2026 (Willis Auftrag) mit einer anpassenden
// Stufe, die die Operandengröße deckelt. Die Operanden werden so
// gewürfelt, dass kein Neuwürfeln nötig ist. Die Leiter ist seit
// 03.09.2026 feiner gestuft, damit die Treppenregel nur langsam steigt;
// der Einstieg liegt nach Willis Nachjustierung vom selben Tag einstellig
// bei Deckel 9 (Aufgaben wie 4+9), nicht mehr bei Deckel 5 (1+2 war zu
// leicht).
export const RECHENSTUFEN_MAX = 8;
const STUFENDECKEL = [9, 15, 20, 30, 40, 55, 70, 85, 99]; // größter Operand je Stufe

// Vier Rechenarten seit 14.09.2026 (Willis Auftrag): Mal und Geteilt
// kommen dazu, und bei Minus darf das Ergebnis ins Negative laufen.
//
// Harte Grenze bleibt die Ansage: Klänge gibt es nur für die Zahlen 0 bis
// 99 (klaenge/zahlen/n0 bis n99) und für die Rechenzeichen. BEIDE
// Operanden müssen darum ganzzahlig zwischen 0 und 99 liegen. Das
// Ergebnis wird nicht angesagt und darf außerhalb liegen, also auch über
// 99 (Malnehmen) oder unter null (Minus).
//
// Verteilung über die neun Sprossen. Die Leiter steigt erst nach drei
// Richtigen in Folge und beginnt jeden Lauf wieder unten (Willis Wahl vom
// 03.09.2026), die Sprossen sind also teuer: Stufe 3 erreicht frühestens,
// wer neun Aufgaben am Stück getroffen hat, Stufe 5 erst nach fünfzehn.
// Die erste Fassung vom 14.09.2026 hängte Mal und negative Differenzen an
// Stufe 3 und Teilen an Stufe 5. Nachgemessen über je 1500 simulierte
// Fünf-Minuten-Läufe kam Teilen damit 0,03 mal je Lauf vor, war also
// praktisch nicht vorhanden, und Willis Auftrag blieb auf dem Papier.
// Darum jetzt tief gehängt: Nur die unterste Sprosse bleibt reines Plus
// und Minus im Positiven, damit der Einstieg leicht ist; ab der ersten
// kommen Malnehmen und negative Differenzen dazu, ab der zweiten das
// Teilen (die anspruchsvollste Art, weil sie rückwärts gedacht wird).
// Gemessen ergibt das je Fünf-Minuten-Lauf bei 70 Prozent Trefferquote
// rund 3,6 Malaufgaben, 1,2 Teilungen und 1,6 negative Ergebnisse; die
// Schwierigkeit steuern weiter die Zahlengrößen über STUFENDECKEL.
const MAL_AB_STUFE = 1;
const NEGATIV_AB_STUFE = 1;
const GETEILT_AB_STUFE = 2;

// Rechenarten, die auf einer Stufe vorkommen können. Die Auswahl darunter
// würfelt gleichverteilt aus dieser Liste.
export function rechenarten(stufe) {
  const s = begrenze(Math.floor(stufe), 0, RECHENSTUFEN_MAX);
  const arten = ["+", "-"];
  if (s >= MAL_AB_STUFE) arten.push("*");
  if (s >= GETEILT_AB_STUFE) arten.push("/");
  return arten;
}

// Malnehmen muss im Cockpit in rund zehn Sekunden zu schaffen sein. Ein
// Faktor bleibt darum immer einstellig (2 bis 9), der zweite wächst mit
// der Stufe von 10 auf 20. Größtes Produkt ist damit 9 mal 20, also 180;
// beide Faktoren bleiben weit unter 100 und sind ansagbar. Welcher der
// beiden vorn steht, entscheidet der Wurf, damit auch "3 mal 14" kommt.
const MAL_KLEIN_MAX = 9;
const MAL_GROSS_START = 10;
const MAL_GROSS_MAX = 20;

function wuerfleMal(stufe, rnd) {
  const grossDeckel = begrenze(MAL_GROSS_START + 2 * (stufe - MAL_AB_STUFE), MAL_GROSS_START, MAL_GROSS_MAX);
  const klein = 2 + wuerfelIndex(MAL_KLEIN_MAX - 1, rnd);   // 2 bis 9
  const gross = 2 + wuerfelIndex(grossDeckel - 1, rnd);     // 2 bis grossDeckel
  const [a, b] = rnd() < 0.5 ? [klein, gross] : [gross, klein];
  return { a, op: "*", b, antwort: a * b };
}

// Teilen wird rückwärts gebaut, aus Teiler und Ergebnis: So geht es immer
// glatt auf, es wird nie durch null geteilt, und es muss nichts neu
// gewürfelt werden. Der Dividend ist das Produkt der beiden und bleibt
// unter dem Stufendeckel (und damit unter 100), also ansagbar. Auf den
// ersten beiden Sprossen mit Geteilt bleibt der Teiler bei höchstens 5
// (Hälfte bis Fünftel), darüber geht er bis 9.
const TEILER_MIN = 2;

function wuerfleGeteilt(stufe, deckel, rnd) {
  // Der zweite Deckel sichert, dass zum Teiler immer ein Ergebnis von
  // mindestens 2 passt, ohne den Dividenden über den Stufendeckel zu heben.
  const teilerMax = Math.min(stufe >= GETEILT_AB_STUFE + 2 ? 9 : 5, Math.floor(deckel / 2));
  const teiler = TEILER_MIN + wuerfelIndex(teilerMax - TEILER_MIN + 1, rnd);
  const ergebnis = 2 + wuerfelIndex(Math.floor(deckel / teiler) - 1, rnd);
  return { a: teiler * ergebnis, op: "/", b: teiler, antwort: ergebnis };
}

export function erzeugeRechenaufgabe(rnd = Math.random, stufe = 0) {
  const s = begrenze(Math.floor(stufe), 0, RECHENSTUFEN_MAX);
  const deckel = STUFENDECKEL[s];
  const arten = rechenarten(s);
  const op = arten[wuerfelIndex(arten.length, rnd)];
  if (op === "+") {
    const a = 1 + wuerfelIndex(deckel, rnd);                    // 1 bis deckel
    // Summe weiter bei 99 gedeckelt: Willi hat nur Minus ins Negative
    // geöffnet, Plus bleibt wie gehabt zweistellig.
    const b = wuerfelIndex(Math.min(deckel, 99 - a) + 1, rnd);
    return { a, op, b, antwort: a + b };
  }
  if (op === "-") {
    const a = 1 + wuerfelIndex(deckel, rnd);                    // 1 bis deckel
    // Ab NEGATIV_AB_STUFE darf b größer als a sein, das Ergebnis geht dann
    // ins Minus; darunter bleibt b bei höchstens a, Ergebnis also >= 0.
    const b = s >= NEGATIV_AB_STUFE ? wuerfelIndex(deckel + 1, rnd) : wuerfelIndex(a + 1, rnd);
    return { a, op, b, antwort: a - b };
  }
  if (op === "*") return wuerfleMal(s, rnd);
  return wuerfleGeteilt(s, deckel, rnd);
}

// Treppenregel seit 03.09.2026 (Willis Festlegung): Erst drei Richtige in
// Folge heben die Rechenstufe um eins, jede falsche oder verpasste Aufgabe
// senkt sie sofort um eins und bricht die Serie. Jeder Lauf und jede Übung
// beginnt wieder bei der leichtesten Stufe.
export const ANSTIEG_SERIE = 3;

export function rechenstandStart() {
  return { stufe: 0, serie: 0 };
}

export function passeRechenstufeAn(stand, richtig) {
  if (!richtig) return { stufe: Math.max(0, stand.stufe - 1), serie: 0 };
  const serie = stand.serie + 1;
  if (serie < ANSTIEG_SERIE) return { stufe: stand.stufe, serie };
  return { stufe: Math.min(RECHENSTUFEN_MAX, stand.stufe + 1), serie: 0 };
}

// Fünf gemischte Antwortmöglichkeiten: die richtige Antwort plus vier
// eindeutige Ablenker aus ihrer Nähe, zwei dicht daneben (±1, ±2) und
// zwei weiter weg. Der Kandidatenpool wird vor der Auswahl gemischt.
//
// Zwei Anpassungen vom 14.09.2026 (Willis Auftrag, Rechenarten erweitert):
// Ablenker dürfen null oder negativ sein, sobald die Antwort selbst dort
// liegt. Wären sie auch dann auf positiv gezwungen, stäche bei einem
// negativen Ergebnis die richtige Antwort als einzige negative Zahl sofort
// heraus, ohne dass jemand rechnen müsste. Bei positiver Antwort bleiben
// sie dagegen positiv: Plus, Mal und Geteilt liefern nie ein Ergebnis
// unter 1, ein Ablenker unter 1 wäre dort ohne jedes Rechnen auszuschließen
// und verschenkte einen der fünf Knöpfe. Und der weite Ablenker wächst mit
// der Größe der Antwort, rund ein Fünftel davon, mindestens 3 und höchstens
// 20: Bei einer Antwort von 3 wären ±10 keine ernsthafte Wahl, bei einem
// Produkt von 180 wären sie zu dicht am Rest. Bei den bisherigen
// zweistelligen Antworten bleibt es praktisch bei ±10.
const ABLENKER_WEIT_MIN = 3;
const ABLENKER_WEIT_MAX = 20;

export function ablenkerStreuung(antwort) {
  return begrenze(Math.round(Math.abs(antwort) / 5), ABLENKER_WEIT_MIN, ABLENKER_WEIT_MAX);
}

export function antworten5(aufgabe, rnd = Math.random) {
  const antwort = aufgabe.antwort;
  const weit = ablenkerStreuung(antwort);
  // Die Schwelle ist die Antwort selbst und nicht die Rechenart: Bei einer
  // Antwort von genau 0 müssen negative Ablenker erlaubt bleiben, sonst
  // wäre die 0 die einzige nicht positive Zahl der Liste und damit verraten.
  const zulaessig = (k) => k !== antwort && (antwort <= 0 || k > 0);
  // Die sechs Verschiebungen sind wegen weit >= 3 immer paarweise
  // verschieden und nie null.
  const kandidaten = [antwort - 1, antwort + 1, antwort - 2, antwort + 2, antwort - weit, antwort + weit];
  const eindeutig = [];
  for (const k of mische(kandidaten, rnd)) {
    if (zulaessig(k)) eindeutig.push(k);
    if (eindeutig.length === 4) break;
  }
  // Nur bei Antwort 1 bleiben aus der Nähe weniger als vier zulässige Werte
  // übrig (0 und die beiden negativen fallen weg); dann füllt eine
  // Schlussschleife mit weiter entfernten, aber eindeutigen Werten auf.
  for (let k = 3; eindeutig.length < 4; k++) {
    const kandidat = antwort + k;
    if (zulaessig(kandidat) && !eindeutig.includes(kandidat)) eindeutig.push(kandidat);
  }
  return mische([antwort, ...eindeutig], rnd);
}

// Antwortwahl ohne Pedale (Willis Auftrag vom 03.09.2026): Sind keine
// Pedale verbunden, schieben die Pfeiltasten die gewählte Zone in der
// Kopfrechen-Übung schrittweise nach links oder rechts, geklemmt an den
// Rändern; bestätigt wird weiter über die Schusstaste (Ersatz Leertaste).
export function schiebeZone(zone, schritt) {
  return begrenze(zone + schritt, 0, PEDALZONEN - 1);
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
