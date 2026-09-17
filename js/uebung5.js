// Übungslogik Mission 5 (Test Flugphysik): Aufgabenerzeugung rückwärts vom
// glatten Ergebnis, Ablenker, Eingabeprüfung und Punktrechnung. Reine Logik
// ohne DOM, der Zufall ist einspeisbar, damit alles mit node --test prüfbar
// bleibt.
import { mische } from "./zufall.js";
import { zufallswerte } from "./instrumente.js";

// Antwortzeit je Aufgabe im gewerteten Test. Am 17.09.2026 auf Willis Auftrag
// von 20 auf 40 Sekunden verdoppelt. Die beiden NUR-ÜBEN-Blöcke laufen
// weiterhin ohne Zeitdruck, die Zahl wirkt nur im Test.
// ACHTUNG für die Wertung: VOLLE_PUNKTE_MS ist eine absolute Schranke (volle
// Punkte, wer binnen acht Sekunden antwortet) und wandert nicht mit. Bei
// längerem Fenster bringt dieselbe Antwortgeschwindigkeit darum mehr Punkte:
// Wer 20 Sekunden braucht, bekam vorher die Grundpunkte 7, jetzt rund 8,9.
// Alte M5-Läufe sind damit nicht mehr direkt vergleichbar.
export const AUFGABENZEIT = 40; // Sekunden je Aufgabe
export const TESTDAUERN = [5, 10, 30]; // Minuten
export const PRINZIPIEN = ["zeit", "weg", "geschwindigkeit", "rate"];
// Nur diese drei tragen zwei echte Dreisatzschritte: erst der Wert für eine
// Minute, dann der gesuchte Wert. Bei den Raten wäre der erste Schritt schon
// die Antwort ("eine Minute bringt 600 ft"), darum bleibt die Dreisatz-Übung
// bei den dreien. Der gewertete Test und die Schnellrechnen-Übung fragen
// weiterhin alle vier Prinzipien ab.
export const DREISATZ_PRINZIPIEN = ["zeit", "weg", "geschwindigkeit"];

// Zahl mit Komma für die Oberfläche, und die Prüfung auf einen Zwischenwert,
// der im Kopf trägt (ganz oder ,5). Beides steht oben, weil schon der
// Aufgabenbestand damit gebaut wird.
const zk = (n) => String(n).replace(".", ",");
const istGlatt = (n) => Number.isInteger(n * 2);
// Knoten, bei denen die eine Minute aufgeht: 240 kt sind 4 NM je Minute,
// 210 kt sind 3,5. Das ist genau jeder Wert, der durch 30 teilbar ist.
const minutenGlatt = (v) => istGlatt(v / 60);

// Rundungsregel des Dreisatz-Bestands (Willis Rückmeldung vom 17.09.2026:
// "die werte in den dreisatz übungen sind mir jetzt zu krumm"). Beim Dreisatz
// rechnet man mit der Minutenzahl und liest den Weg ab, diese beiden Zahlen
// müssen also im Kopf tragen; der Zwischenwert ist durch minutenGlatt ohnehin
// ganz oder halb. Rund heißt hier: Die Minute ist gerade oder endet auf 5, der
// Weg ist gerade und bleibt unter DREISATZ_WEG_MAX.
//
// Bewusst NICHT "der Weg endet auf 0 oder 5": Bei 1,5 / 3,5 und 4,5 NM je
// Minute ginge das nur mit Minutenzahlen, die durch 10 teilbar sind. Über alle
// Geschwindigkeiten nachgerechnet blieben davon 4, 3 und 2 Paare übrig, die
// halben Zwischenwerte wären praktisch weg und Stufe 2 und 3 führen fast immer
// 150 kt. Willis Entscheid vom 17.09.2026 nach Vorlage beider Fassungen:
// lieber gerade Wege als eine Hausgeschwindigkeit.
export const DREISATZ_WEG_MAX = 150;
const rundeMinute = (t) => t % 2 === 0 || t % 5 === 0;
const runderWeg = (s) => s % 2 === 0 && s <= DREISATZ_WEG_MAX;
export const istRunderDreisatz = (p) => rundeMinute(p.t) && runderWeg(p.s);

// Je Minutenzahl der Stundenbruch in Worten und die Rechenoperation in
// beide Richtungen: weg rechnet s aus v (mal Stundenanteil), tempo rechnet
// v aus s (die Umkehrung). Bei 45 Minuten ist der Doppelschritt über
// Viertel der schnellste Kopfweg.
// Seit 17.09.2026 entscheidet diese Tabelle zusätzlich, welche Zeiten als
// glatter Stundenbruch gelten: Die Formel-Übung zieht nur aus ihnen, die
// Dreisatz-Übung nur aus den Zeiten, die hier nicht stehen.
const STUNDENBRUECHE = {
  12: { wort: "ein Fünftel einer Stunde", weg: "geteilt durch 5", tempo: "mal 5" },
  15: { wort: "eine Viertelstunde", weg: "geteilt durch 4", tempo: "mal 4" },
  20: { wort: "ein Drittel einer Stunde", weg: "geteilt durch 3", tempo: "mal 3" },
  30: { wort: "eine halbe Stunde", weg: "geteilt durch 2", tempo: "mal 2" },
  40: { wort: "zwei Drittel einer Stunde", weg: "mal 2, geteilt durch 3", tempo: "mal 3, geteilt durch 2" },
  45: { wort: "eine Dreiviertelstunde", weg: "mal 3, geteilt durch 4", tempo: "mal 4, geteilt durch 3" },
  60: { wort: "genau eine Stunde", weg: "mal 1", tempo: "mal 1" },
  90: { wort: "anderthalb Stunden", weg: "mal 1,5", tempo: "geteilt durch 1,5" },
  120: { wort: "zwei Stunden", weg: "mal 2", tempo: "geteilt durch 2" },
  150: { wort: "zweieinhalb Stunden", weg: "mal 2,5", tempo: "geteilt durch 2,5" },
  180: { wort: "drei Stunden", weg: "mal 3", tempo: "geteilt durch 3" },
  240: { wort: "vier Stunden", weg: "mal 4", tempo: "geteilt durch 4" },
  300: { wort: "fünf Stunden", weg: "mal 5", tempo: "geteilt durch 5" },
};
export const STUNDENBRUCH_ZEITEN = Object.keys(STUNDENBRUECHE).map(Number);

// Schwierigkeitsstufen (Willis Auftrag vom 17.09.2026), einstellbar im
// gewerteten Test und in beiden Übungen getrennt. Gesteuert wird nicht die
// Größe der Zahlen, sondern wie schwer der Zwischenwert ist. Willis Vorgabe
// wörtlich: "Die Zahlen sollen nicht zu gross oder zu krumm werden aber
// etwas anspruchsvoller, damit man mit Dreisatz nicht fast ohne Umrechnung
// schon erkennbar ist was die Loesung ist."
//
// Stufe 1, LEICHT: Knoten durch 60 ergibt eine ganze, kleine Zahl (120 kt
//   sind 2 NM je Minute, 300 kt sind 5). Die Stundenbrüche sind ein einziger
//   Griff: Viertel-, Drittel- und halbe Stunde. Gerechnet werden muss
//   trotzdem, der zweite Schritt ist eine Multiplikation mit 7 bis 14.
// Stufe 2, MITTEL: Knoten durch 60 ergibt einen halben Wert (90 kt sind 1,5,
//   150 kt sind 2,5), dazu die krummen Knoten 80, 100 und 200, bei denen die
//   eine Minute gar nicht aufgeht und der Stundenbruch ran muss. Der
//   Stundenbruch wird schwerer: Fünftel und Dreiviertelstunde.
// Stufe 3, SCHWER: halbe Werte im oberen Bereich (210 kt sind 3,5 NM je
//   Minute, 270 kt sind 4,5) und die Zweidrittel- und Dreiviertelstunde. Hier
//   ist jeder zweite Schritt eine echte Multiplikation, keine Verdopplung:
//   3,5 mal 26 rechnet niemand nebenbei ab.
//
// Auf keiner Stufe steht die Antwort ohne Rechnung da. Dafür sorgt der
// Trivialfilter in wzgPaare: 60 kt wären 1 NM je Minute, 60 Minuten wären
// eine ganze Stunde (dann entspricht der Weg schon den Knoten), und trügen
// Knoten und Minuten dieselbe Zahl, stünde die gesuchte Zahl bereits im Text.
// Die Zeiten der Dreisatz-Bestände sind bewusst keine griffigen
// Stundenbrüche, sonst wäre der Umweg über die eine Minute überflüssig.
export const STUFEN5 = [1, 2, 3];
export const STUFENNAMEN = { 1: "LEICHT", 2: "MITTEL", 3: "SCHWER" };
export const STUFE_STANDARD = 1;

// Am 17.09.2026 auf Willis Rückmeldung deutlich verbreitert ("die Aufgaben
// und Werte wiederholen sich zu oft in den Übungen, baue mehr besonders für
// schwer"). Vorher hatte die schwerste Stufe 10 Formel- und 15
// Dreisatz-Paare, nach ein paar Aufgaben kannte man sie. Der Charakter der
// Stufen bleibt: Bei den Dreisatz-Zeiten entscheidet der Zwischenwert (ganze
// NM je Minute unten, halbe oben), bei den Formel-Zeiten die Sperrigkeit des
// Stundenbruchs. Neue Werte muss der Bestandsfilter tragen: Der Weg muss
// ganzzahlig bleiben, darum passen zu halben NM je Minute nur gerade Zeiten.
//
// Noch am selben Tag zurückgenommen, soweit es zu weit ging ("die werte in
// den dreisatz übungen sind mir jetzt zu krumm"): Die dreisatzZeiten stehen
// jetzt im runden Raster, und istRunderDreisatz wirft aus, was trotzdem
// krumm herauskommt. Damit sind Minuten wie 7, 11, 13, 17, 27 und 58 sowie
// Wege wie 91, 119, 203, 234 und 261 aus dem Bestand verschwunden. Die
// Listen dürfen großzügig bleiben, die Regel wählt aus; das ist absichtlich
// so gebaut, damit ein neuer Wert nichts Krummes einschleppen kann.
export const STUFENZAHLEN = {
  1: {
    tempi: [120, 180, 240, 300],          // 2, 3, 4, 5 NM je Minute
    formelZeiten: [12, 15, 20, 30, 45],   // Fünftel bis Dreiviertelstunde
    // Kein Stundenbruch, kleiner zweiter Schritt. Bei ganzen NM je Minute
    // geht jede Zeit auf, darum ist hier viel Platz. Die Minuten stehen im
    // runden Raster (gerade oder auf 5), der Rest fällt über istRunderDreisatz.
    dreisatzZeiten: [5, 8, 10, 14, 16, 18, 22, 24, 25, 26, 28, 32, 34, 35, 36, 38],
    raten: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    ratenZeiten: [3, 4, 5, 6, 7],
  },
  2: {
    // 1,5 / 2,5 / 3,5 NM je Minute, dazu die krummen Knoten, bei denen die
    // Minute nicht aufgeht und nur der Stundenbruch trägt.
    tempi: [90, 150, 210, 80, 100, 110, 140, 160, 200, 220],
    formelZeiten: [12, 15, 20, 30, 40, 45, 90, 120],
    // Gerade Zeiten, sonst wird der Weg bei halben NM je Minute krumm.
    // Übrig bleiben davon die Vielfachen von vier: Bei 1,5 / 2,5 / 3,5 NM je
    // Minute ist der Weg nur dann gerade, und gerade muss er seit Willis
    // Rückmeldung vom 17.09.2026 sein.
    dreisatzZeiten: [8, 10, 14, 16, 18, 22, 24, 26, 28, 32, 34, 36, 38, 44, 46, 48, 50, 52, 56],
    raten: [250, 450, 550, 600, 700, 900, 1050, 1200],
    ratenZeiten: [4, 5, 6, 7, 8],
  },
  3: {
    // 1,5 / 2,5 / 3,5 / 4,5 NM je Minute für den Dreisatz, dazu ein breites
    // Feld krummer Knoten für die Formel.
    tempi: [90, 150, 210, 270, 100, 110, 130, 140, 160, 170, 190, 200, 220, 230, 260, 280, 310, 320],
    formelZeiten: [20, 40, 45, 90, 120, 150, 180],
    dreisatzZeiten: [8, 10, 14, 16, 18, 22, 24, 26, 28, 32, 34, 36, 38, 44, 46, 48, 50, 52, 54, 56, 58],
    raten: [350, 450, 550, 650, 700, 750, 850, 900, 950, 1050, 1100, 1200, 1250, 1300, 1400, 1600, 1800],
    ratenZeiten: [3, 4, 5, 6, 7, 8, 9],
  },
};

// Anzeigegrenzen, die der Bestand einhalten muss: Der Höhenmesser zeigt nur
// Hunderterschritte, und das Panel spiegelt die Aufgabenwerte auch dann,
// wenn sie im Text stehen (Willis Vorgabe vom 25.08.2026). Der Fahrtmesser
// zeigt jede Geschwindigkeit des Bestands (Raster 60 bis 320 kt), das
// Variometer nur Hunderterschritte bis 2000 ft/min.
const HOEHE_UNTEN = 1000;
const HOEHE_OBEN = 8900;
const VARIO_MAX = 2000;
// Höchste Rate, die als ANTWORT vorkommen darf, in Aufgaben wie in Übungen
// (Willis Vorgabe vom 17.09.2026). Deckt sich mit dem Skalenende des
// Variometers, ist aber die andere Frage: VARIO_MAX sagt, was das
// Instrument zeigen kann, RATE_MAX, was gefragt werden darf.
const RATE_MAX = 2000;
// Kürzeste und längste Strecke: unter 10 NM wird die Aufgabe albern, über
// 1200 NM zu groß für einen Kopfrechenweg.
const WEG_MIN = 10;
const WEG_MAX = 1200;

// Alle Weg-Zeit-Geschwindigkeits-Paare aus zwei Wertelisten, die ganzzahlig
// aufgehen und nichts verschenken. Der Trivialfilter hält alles draußen,
// dessen Antwort ohne Rechnung ablesbar wäre.
function wzgPaare(tempi, zeiten) {
  const paare = [];
  for (const v of tempi) for (const t of zeiten) {
    const s = (v * t) / 60;
    if (!Number.isInteger(s) || s < WEG_MIN || s > WEG_MAX) continue;
    if (v === 60 || t === 60 || v === t) continue;
    paare.push({ v, t, s });
  }
  return paare;
}

// Ratenpaare: Die Höhe ist das Produkt aus Rate und Minuten und muss im
// Raster des Höhenmessers liegen, denn jede Ratenaufgabe spiegelt ihre Höhe
// aufs Panel.
function ratenPaare(raten, zeiten) {
  const paare = [];
  for (const r of raten) for (const t of zeiten) {
    // Deckel der gesuchten Rate (Willis Vorgabe vom 17.09.2026): Höher als
    // 2000 ft je Minute steigt oder sinkt in dieser Prüfung nichts, und eine
    // Antwort, die das Variometer gar nicht anzeigen könnte, ist unsinnig.
    // Der Bestand vor dem Umbau desselben Tages ließ bis 4000 ft/min zu
    // (etwa "6200 ft in 2 Minuten steigen" mit der Antwort 3100); der neue
    // Bestand bleibt von sich aus bei 1300, der Deckel hält das fest, wenn
    // die Stufen später wachsen.
    if (r > RATE_MAX) continue;
    const h = r * t;
    if (h < HOEHE_UNTEN || h > HOEHE_OBEN || h % 100 !== 0) continue;
    paare.push({ r, t, h });
  }
  return paare;
}

// Der ganze Bestand je Stufe, einmal beim Laden gerechnet. formel und
// dreisatz sind die beiden Methodenbestände (Willis Auftrag vom 17.09.2026:
// "die erste Uebung soll Aufgaben abfragen, die sich mit den Formeln gut
// loesen lassen und die zweite soll Aufgaben abfragen, die sich mit 3 Satz
// gut loesen lassen"), gemischt ist der Bestand des gewerteten Tests.
function baueBestand(stufe) {
  const z = STUFENZAHLEN[stufe];
  const formel = wzgPaare(z.tempi, z.formelZeiten);
  // Nur der Dreisatz-Bestand hält die Rundungsregel ein: Dort rechnet man
  // Schritt für Schritt mit Minute und Weg. Der Formel-Bestand lebt vom
  // Stundenbruch und darf krummer sein, dort trägt der Kniff.
  const dreisatz = wzgPaare(z.tempi.filter(minutenGlatt), z.dreisatzZeiten).filter(istRunderDreisatz);
  const raten = ratenPaare(z.raten, z.ratenZeiten);
  return {
    formel,
    dreisatz,
    gemischt: [...formel, ...dreisatz],
    raten,
    // Die Höhe steht im Raster, sobald das Paar überhaupt gebaut wurde.
    ratenHoehenmesser: raten,
    ratenVariometer: raten.filter((p) => p.r % 100 === 0 && p.r <= VARIO_MAX),
    // Zielhöhenaufgabe: Ausgangs- und Zielhöhe müssen beide ins Raster
    // passen, also bleibt für die Differenz nur der Platz dazwischen.
    ratenZielhoehe: raten.filter((p) => p.h <= HOEHE_OBEN - HOEHE_UNTEN),
  };
}

const BESTAND = {};
for (const stufe of STUFEN5) BESTAND[stufe] = baueBestand(stufe);

// Gesamtbestand über alle Stufen, für Prüfungen und als Überblick.
export const WZG_PAARE = STUFEN5.flatMap((s) => BESTAND[s].gemischt);
// Dreisatzfreundliche Paare (Willis Auftrag vom 14.09.2026): Geht die
// Geschwindigkeit glatt auf die eine Minute herunter, ergibt das eine
// handliche Zahl (240 kt sind 4 NM je Minute, 210 kt sind 3,5). Bei 80, 100
// und 200 kt ist die Minute krumm, dort trägt nur der Stundenbruch.
export const WZG_PAARE_GLATT = WZG_PAARE.filter((p) => minutenGlatt(p.v));

export function aufgabenbestand(stufe = STUFE_STANDARD) {
  return BESTAND[STUFEN5.includes(stufe) ? stufe : STUFE_STANDARD];
}

const zufallAus = (feld, rnd) => feld[Math.floor(rnd() * feld.length)];

// Anteil der Aufgaben, die im gewerteten Test aus dem Dreisatz-Bestand
// kommen; der Rest kommt aus dem Formel-Bestand. So bleibt der Test gemischt,
// während jede Übung bei ihrer Methode bleibt.
export const DREISATZ_ANTEIL = 0.5;
function ziehePaar(bestand, methode, rnd) {
  if (methode === "formel") return zufallAus(bestand.formel, rnd);
  if (methode === "dreisatz") return zufallAus(bestand.dreisatz, rnd);
  return zufallAus(rnd() < DREISATZ_ANTEIL ? bestand.dreisatz : bestand.formel, rnd);
}

// Jedes Prinzip kommt mindestens einmal vor, der Rest wird gewürfelt. Die
// Dreisatz-Übung reicht ihre eigene, kürzere Prinzipienliste herein.
export function waehlePrinzipien(anzahl, rnd = Math.random, prinzipien = PRINZIPIEN) {
  const folge = [...prinzipien];
  while (folge.length < anzahl) folge.push(zufallAus(prinzipien, rnd));
  return mische(folge.slice(0, anzahl), rnd);
}

// Zielhöhenaufgabe (Willis Auftrag vom 17.09.2026, wörtlich: "Du sollst in
// Zeit X auf 3400 ft steigen (Instrument ist bereits bei 1000 ft und dies ist
// zu beachten)"). Der Text nennt Zielhöhe und Zeit, die Ausgangshöhe hängt am
// Höhenmesser. Der Bewerber bildet also erst die Differenz und rechnet dann
// die Rate. Nur im gewerteten Test, nicht in den Übungen.
function zielhoehenaufgabe(bestand, rnd) {
  const { r, t, h } = zufallAus(bestand.ratenZielhoehe, rnd);
  const steigen = rnd() < 0.5;
  // Ausgangshöhe so würfeln, dass Ausgangs- und Zielhöhe im Raster bleiben.
  // Träfe die Zielhöhe dabei die gesuchte Rate ("in 6 Minuten auf 1200 ft
  // sinken", Antwort 1200 ft/min), stünde die Antwort ablesbar im Text. Solche
  // Ausgangshöhen fallen darum weg. Betroffen ist nur das Sinken mit Raten ab
  // 1000 ft/min; beim Steigen liegt die Zielhöhe immer über der Differenz und
  // damit über der Rate, dort kann der Fall nicht eintreten. Es bleiben immer
  // Ausgangshöhen übrig, der engste Bereich im Bestand hat zwei.
  const von = steigen ? HOEHE_UNTEN : HOEHE_UNTEN + h;
  const bis = steigen ? HOEHE_OBEN - h : HOEHE_OBEN;
  const moeglich = [];
  for (let wert = von; wert <= bis; wert += 100) {
    if ((steigen ? wert + h : wert - h) !== r) moeglich.push(wert);
  }
  const start = zufallAus(moeglich, rnd);
  const ziel = steigen ? start + h : start - h;
  return {
    prinzip: "rate",
    frage: steigen
      ? `Du sollst in ${t} Minuten auf ${ziel} ft steigen. Deine jetzige Höhe zeigt der Höhenmesser. Berechne die Steigrate in ft/min.`
      : `Du sollst in ${t} Minuten auf ${ziel} ft sinken. Deine jetzige Höhe zeigt der Höhenmesser. Berechne die Sinkrate in ft/min.`,
    antwort: r,
    einheit: "ft/min",
    instrument: { id: "hoehe", wert: start },
    zielhoehe: { start, ziel, steigen },
    tipp: "zielhoehe",
    werte: { r, t, h },
  };
}

// Bei mitInstrument entfällt der Gegebenwert im Text, stattdessen verweist
// die Frage aufs Ablesen am Instrument, dessen Wert im Anzeigeraster liegen
// muss. Beim Prinzip Geschwindigkeit stünde der gesuchte Wert sonst ablesbar
// am Instrument, darum bleibt es dort immer bei der Textaufgabe.
// optionen: stufe (1 bis 3), methode ("formel", "dreisatz" oder "gemischt")
// und mitZielhoehe (nur der gewertete Lauf setzt es).
export function erzeugeAufgabe(prinzip, rnd = Math.random, mitInstrument = false, optionen = {}) {
  const { stufe = STUFE_STANDARD, methode = "gemischt", mitZielhoehe = false } = optionen;
  const bestand = aufgabenbestand(stufe);
  if (prinzip === "geschwindigkeit") mitInstrument = false;

  if (prinzip === "rate") {
    if (mitInstrument) {
      // Anteil von 0,5 auf 0,75 (Prüferbefund vom 17.09.2026): Bei jeder
      // zweiten Instrumenten-Rate kam die Zielhöhenaufgabe auf rund 0,8
      // Stück je Fünf-Minuten-Lauf, Willi hätte sie in der Hälfte der
      // kurzen Läufe gar nicht zu sehen bekommen. Er hat sie ausdrücklich
      // bestellt, also kommt sie häufiger.
      if (mitZielhoehe && rnd() < 0.75) return zielhoehenaufgabe(bestand, rnd);
      if (rnd() < 0.5) {
        const { r, t, h } = zufallAus(bestand.ratenHoehenmesser, rnd);
        return {
          prinzip,
          frage: `Du musst deine aktuelle Höhe (Höhenmesser) in ${t} Minuten vollständig abbauen. Berechne die Sinkrate in ft/min.`,
          antwort: r,
          einheit: "ft/min",
          instrument: { id: "hoehe", wert: h },
          werte: { r, t, h },
        };
      }
      const { r, t, h } = zufallAus(bestand.ratenVariometer, rnd);
      return {
        prinzip,
        frage: `Du sinkst mit deinem aktuellen Sinken (Variometer). Berechne die Flugzeit für ${h} ft in Minuten.`,
        antwort: t,
        einheit: "min",
        instrument: { id: "vario", wert: -r },
        werte: { r, t, h },
      };
    }
    const { r, t, h } = zufallAus(bestand.raten, rnd);
    const sinken = rnd() < 0.5;
    return {
      prinzip,
      frage: sinken
        ? `Du musst ${h} ft in ${t} Minuten abbauen. Berechne die Sinkrate in ft/min.`
        : `Du musst ${h} ft in ${t} Minuten steigen. Berechne die Steigrate in ft/min.`,
      antwort: r,
      einheit: "ft/min",
      instrument: null,
      lage: { aenderung: h, sinken },
      werte: { r, t, h },
    };
  }

  if (mitInstrument) {
    const { v, t, s } = ziehePaar(bestand, methode, rnd);
    if (prinzip === "zeit") return {
      prinzip,
      frage: `Du fliegst mit deiner aktuellen Geschwindigkeit (Fahrtmesser). Das Ziel liegt ${s} NM entfernt. Berechne die Flugzeit in Minuten.`,
      antwort: t,
      einheit: "min",
      instrument: { id: "fahrt", wert: v },
      werte: { v, t, s },
    };
    return {
      prinzip,
      frage: `Du fliegst ${t} Minuten mit deiner aktuellen Geschwindigkeit (Fahrtmesser). Berechne den zurückgelegten Weg in NM.`,
      antwort: s,
      einheit: "NM",
      instrument: { id: "fahrt", wert: v },
      werte: { v, t, s },
    };
  }

  const { v, t, s } = ziehePaar(bestand, methode, rnd);
  if (prinzip === "zeit") return {
    prinzip,
    frage: `Du fliegst ${v} kt. Das Ziel liegt ${s} NM entfernt. Berechne die Flugzeit in Minuten.`,
    antwort: t,
    einheit: "min",
    instrument: null,
    lage: { fahrt: v },
    werte: { v, t, s },
  };
  if (prinzip === "weg") return {
    prinzip,
    frage: `Du fliegst ${v} kt für ${t} Minuten. Berechne den zurückgelegten Weg in NM.`,
    antwort: s,
    einheit: "NM",
    instrument: null,
    lage: { fahrt: v },
    werte: { v, t, s },
  };
  return {
    prinzip,
    frage: `Du legst ${s} NM in ${t} Minuten zurück. Berechne deine Geschwindigkeit in Knoten.`,
    antwort: v,
    einheit: "kt",
    instrument: null,
    werte: { v, t, s },
  };
}

// Ein Lauf: Prinzipienfolge, je Aufgabe die gewürfelte Erscheinungsform.
// Zusätzlich wird rund ein Drittel der Aufgaben zu Instrumentenaufgaben, rein
// zufällig verteilt über die Positionen, deren Prinzip nicht Geschwindigkeit
// ist. Gibt es weniger geeignete Positionen als das Drittel, werden alle
// geeigneten genommen. Nur hier kommt die Zielhöhenaufgabe vor, denn sie
// gehört zum gewerteten Test und nicht in die Übungen.
export function erzeugeLauf(anzahl, rnd = Math.random, optionen = {}) {
  const einstellung = { methode: "gemischt", mitZielhoehe: true, ...optionen };
  const prinzipien = waehlePrinzipien(anzahl, rnd);
  const geeignete = prinzipien.reduce((liste, prinzip, i) => {
    if (prinzip !== "geschwindigkeit") liste.push(i);
    return liste;
  }, []);
  const anzahlInstrument = Math.min(Math.round(anzahl / 3), geeignete.length);
  const instrumentPositionen = new Set(mische(geeignete, rnd).slice(0, anzahlInstrument));
  // Seit dem 17.09.2026 hat jede Aufgabe dieselbe Form: getippte Zahl
  // (Willis Auftrag). Vorher würfelte hier ein form-Feld zwischen
  // Auswahlfrage und Eingabe. Wer aus vier Knöpfen aussuchen darf, schätzt
  // und schließt aus, statt den Weg zu rechnen, und genau das Rechnen ist
  // der Zweck dieser Mission.
  return prinzipien.map((prinzip, i) =>
    erzeugeAufgabe(prinzip, rnd, instrumentPositionen.has(i), einstellung));
}

// Der Ablenker-Bau (sechzigerFehler, ablenker, antwortenFuer) ist am
// 17.09.2026 mit der Auswahlfrage entfallen, weil ihn danach niemand mehr
// gerufen hat. Er baute drei falsche Antworten je Aufgabe, bevorzugt aus dem
// klassischen 60er-Fehler und, bei der Zielhöhenaufgabe, aus dem Fehlwert
// ohne Abzug der abgelesenen Ausgangshöhe. Beide Fallen bestehen weiter, der
// falsche Wert wird nur nicht mehr zur Wahl gestellt. Wer die Auswahlfrage
// zurückholt, findet den Baustein im Commit vor diesem.

// Eingaben gelten mit Komma oder Punkt, Leerzeichen werden ignoriert.
// Richtig ist nur der exakte Wert, die Erzeugung liefert glatte Zahlen.
export function pruefeEingabe(text, antwort) {
  const bereinigt = String(text ?? "").replace(/\s/g, "").replace(",", ".");
  if (bereinigt === "") return false;
  const zahl = Number(bereinigt);
  return Number.isFinite(zahl) && zahl === antwort;
}

// Punktrechnung je Aufgabe, Aufteilung von Willi festgelegt: falsch gibt
// nichts, richtig gibt den Grundanteil plus Bonus. Volle Punktzahl gibt es
// für jede Antwort innerhalb von acht Sekunden (Willis Vorgabe vom
// 28.08.2026), danach schmilzt der Bonus linear bis zum Zeitlimit. Eine
// langsame richtige Antwort schlägt so immer jede falsche.
// Schnellrechnen-Übung seit 07.09.2026 (Willis Auftrag): Zu jeder Aufgabe
// gibt es den schnellsten im Kopf rechenbaren Weg mit den konkreten
// Zahlen. Je nach Zahlenlage wird die passende Route gewählt: Knoten als
// NM je Minute (wenn v/60 glatt ist), der Stundenbruch (wenn die Minuten
// ein griffiger Teil einer Stunde sind) oder die nackte Formel. Bei den
// Raten streicht der Nullen-Trick beidseitig die Hunderter weg.
// Seit 14.09.2026 kommt der Dreisatz als eigener, benannter Weg dazu: erst
// auf eine Einheit herunterrechnen (eine Minute, eine Stunde, eine NM), dann
// auf die gesuchte Menge hochrechnen. Wo er der schnellste Weg ist, ist er
// der gezeigte; wo ein Kniff schneller geht, steht er als sicherer Weg
// darunter.

export const TIPPS5 = {
  zeit: "Knoten geteilt durch 60 sind NM je Minute: 120 kt = 2, 90 kt = 1,5. Zeit = Weg geteilt durch NM je Minute. Bei krummen Knoten (80, 100, 200) teile Weg durch Knoten: Das ergibt die Stunden, etwa 20 NM bei 80 kt = eine Viertelstunde. Der Dreisatz geht immer: erst eine Minute oder eine NM ausrechnen, dann auf den gesuchten Wert hoch.",
  weg: "Erst die Geschwindigkeit in NM je Minute umdenken (kt geteilt durch 60), dann mal die Minuten. Bei griffigen Zeiten hilft der Stundenbruch: 15 min = Viertelstunde, 45 min = Dreiviertelstunde. Das ist der Dreisatz: herunter auf eine Minute, hoch auf die Minutenzahl der Aufgabe.",
  geschwindigkeit: "Weg geteilt durch Minuten ergibt NM je Minute, mal 60 sind es Knoten. Bei griffigen Zeiten direkt über den Stundenbruch: 30 min = halbe Stunde, also Weg mal 2. Der Dreisatz ist derselbe Gedanke in zwei Schritten: herunter auf eine Minute, hoch auf 60 Minuten.",
  rate: "Rate gesucht: Nullen der Höhe streichen, klein teilen, Nullen wieder dran (4800 durch 8: 48 durch 8 = 6, also 600 ft/min). Zeit gesucht: auf beiden Seiten gleich viele Nullen streichen und nichts anhängen (4800 durch 1200: 48 durch 12 = 4 Minuten). Sicher geht auch hier der Dreisatz: Was bringt eine Minute, und wie oft brauchst du sie?",
  // Merktipp zur Zielhöhenaufgabe (Willis Auftrag vom 17.09.2026): Der
  // Fallstrick ist die vergessene Ausgangshöhe.
  // Eigener Tipp für die Dreisatz-Übung (Prüferbefund vom 17.09.2026): Die
  // Tipps der Prinzipien raten unter anderem zum Stundenbruch, und genau
  // der kommt in dieser Übung nie vor, weil ihr Bestand aus den Zeiten
  // besteht, die keine Stundenbrüche sind. Ein Tipp, der auf einen dort
  // unmöglichen Weg zeigt, verwirrt gerade den, der sich schwertut.
  dreisatz: "Immer derselbe Zweischritt: erst herunter auf eine Einheit, dann hoch auf die gesuchte Menge. Knoten geteilt durch 60 sind die NM je Minute, das ist Schritt 1. Ob du danach malnimmst oder teilst, sagt dir die Frage: Suchst du eine Strecke, nimmst du mal die Minuten; suchst du eine Zeit, teilst du die Strecke durch die NM je Minute.",
  zielhoehe: "Im Text steht die Zielhöhe, deine jetzige Höhe hängt am Höhenmesser. Erst die Differenz bilden (die größere Höhe minus die kleinere), dann diese Differenz durch die Minuten teilen. Wer die Zielhöhe direkt teilt, rechnet mit Höhe, die du längst hast. Der Dreisatz danach: Was bringt eine Minute, und wie oft brauchst du sie?",
};

// Bausteine des Dreisatzes. Jeder gibt die zwei Schritte in Worten zurück,
// mit den echten Zahlen der Aufgabe, oder null, wenn der Schritt auf die eine
// Einheit krumm herauskäme. Krumme Zwischenwerte helfen niemandem, dort
// bleibt es beim Kniff.

// Weg über die eine Minute: Knoten geteilt durch 60 sind NM je Minute.
// Möglich, sobald v/60 ganz oder ,5 ist (also nicht bei 80, 100 und 200 kt).
function dreisatzMinute(aufgabe) {
  const { v, t, s } = aufgabe.werte;
  if (aufgabe.prinzip === "geschwindigkeit") {
    const je = s / t;
    if (!istGlatt(je)) return null;
    return [
      `${s} NM in ${t} Minuten, also ${s} geteilt durch ${t} = ${zk(je)} NM in einer Minute.`,
      `${zk(je)} NM mal 60 Minuten = ${v} kt.`,
    ];
  }
  const je = v / 60;
  if (!istGlatt(je)) return null;
  const herunter = `${v} kt heißt ${v} NM in 60 Minuten, also ${v} geteilt durch 60 = ${zk(je)} NM in einer Minute.`;
  if (aufgabe.prinzip === "weg") return [herunter, `${zk(je)} NM mal ${t} Minuten = ${s} NM.`];
  if (!Number.isInteger(s / je)) return null;
  return [herunter, `${s} NM geteilt durch ${zk(je)} NM = ${t} Minuten.`];
}

// Weg über die eine NM, für die krummen Knoten: 60 geteilt durch die Knoten
// sind die Minuten je NM, und die sind bei 80, 100 und 200 kt glatt (0,75 /
// 0,6 / 0,3). Nur bei gesuchter Zeit brauchbar, sonst müsste man durch einen
// Kommawert teilen. Die Prüfung mit 6000 hält die Nachkommastellen klein.
function dreisatzProNM(aufgabe) {
  const { v, t, s } = aufgabe.werte;
  if (aufgabe.prinzip !== "zeit" || !Number.isInteger(6000 / v)) return null;
  const proNM = 60 / v;
  return [
    `${v} NM brauchen 60 Minuten, eine NM also 60 geteilt durch ${v} = ${zk(proNM)} Minuten.`,
    `${s} NM mal ${zk(proNM)} = ${t} Minuten.`,
  ];
}

// Weg über die eine Stunde, für die krummen Knoten bei Weg und
// Geschwindigkeit: Die Knoten sind schon die NM je Stunde, und der
// Stundenanteil der Minuten geht bei genau diesen Paaren glatt auf (45
// Minuten sind 0,75 Stunden). Die Prüfung mit 100 hält die Nachkommastellen
// klein, sie schließt die krummen Drittelstunden aus.
function dreisatzStunde(aufgabe) {
  const { v, t, s } = aufgabe.werte;
  // Bei genau 60 Minuten steht die Aufgabe schon auf der einen Stunde, da
  // gibt es keinen zweiten Schritt.
  if (t === 60 || !Number.isInteger((100 * t) / 60)) return null;
  const stunden = t / 60;
  const anteil = `${t} Minuten sind ${t} geteilt durch 60 = ${zk(stunden)} Stunden.`;
  if (aufgabe.prinzip === "weg") return [
    anteil,
    `Eine Stunde bringt ${v} NM, also ${zk(stunden)} mal ${v} = ${s} NM.`,
  ];
  return [
    anteil,
    `In ${zk(stunden)} Stunden sind es ${s} NM, in einer Stunde also ${s} geteilt durch ${zk(stunden)} = ${v} kt.`,
  ];
}

// Bei den Raten ist die eine Minute immer glatt, denn die Höhe ist das
// Produkt aus Rate und Minuten. Ist die Rate gesucht, ist das Herunterrechnen
// schon die Antwort; ist die Zeit gesucht, wird von der einen Minute aus
// hochgerechnet.
function dreisatzRate(aufgabe) {
  const { r, t, h } = aufgabe.werte;
  if (aufgabe.antwort === t) return [
    `Eine Minute bringt ${r} ft.`,
    `Für ${h} ft brauchst du ${h} geteilt durch ${r} = ${t} Minuten.`,
  ];
  return [
    `${t} Minuten bringen ${h} ft.`,
    `Eine Minute bringt ${h} geteilt durch ${t} = ${r} ft, das sind ${r} ft/min.`,
  ];
}

// Die zwei Schritte des Dreisatzes als eigene Fragen (Willis Auftrag vom
// 17.09.2026): Die Dreisatz-Übung fragt sie einzeln ab, nicht nur das
// Endergebnis. Erst der Wert für eine Minute, dann der gesuchte Wert. Der
// zweite Schritt nennt den richtigen Zwischenwert im Fragetext, damit sich
// ein Fehler aus Schritt 1 nicht in Schritt 2 weiterschleppt.
// Gibt null zurück, wo der Zwischenwert krumm wäre oder es gar keinen zweiten
// Schritt gibt (Raten).
export function dreisatzSchritte(aufgabe) {
  if (aufgabe.prinzip === "rate" || !aufgabe.werte) return null;
  const { v, t, s } = aufgabe.werte;
  const je = aufgabe.prinzip === "geschwindigkeit" ? s / t : v / 60;
  if (!istGlatt(je)) return null;
  const schritt1 = {
    frage: aufgabe.prinzip === "geschwindigkeit"
      ? `Du legst ${s} NM in ${t} Minuten zurück. Wie weit kommst du in einer Minute?`
      : `Du fliegst ${v} kt, das sind ${v} NM in 60 Minuten. Wie weit kommst du in einer Minute?`,
    antwort: je,
    einheit: "NM je Minute",
  };
  const vorspann = `Eine Minute bringt ${zk(je)} NM.`;
  if (aufgabe.prinzip === "zeit") return {
    zwischenwert: je,
    schritt1,
    schritt2: { frage: `${vorspann} Wie lange brauchst du für ${s} NM?`, antwort: t, einheit: "min" },
  };
  if (aufgabe.prinzip === "weg") return {
    zwischenwert: je,
    schritt1,
    schritt2: { frage: `${vorspann} Wie weit kommst du in ${t} Minuten?`, antwort: s, einheit: "NM" },
  };
  return {
    zwischenwert: je,
    schritt1,
    schritt2: { frage: `${vorspann} Wie weit kommst du in 60 Minuten, also wie viele Knoten sind das?`, antwort: v, einheit: "kt" },
  };
}

// Als gezeigter Weg beginnt der Dreisatz die Liste, als sicherer Weg steht er
// unter dem Kniff und sagt das in der ersten Zeile.
const alsWeg = (schritte) => [`Dreisatz, Schritt 1: ${schritte[0]}`, `Dreisatz, Schritt 2: ${schritte[1]}`];
const alsHinweis = (schritte) => (schritte ? [
  `Sicher geht auch der Dreisatz, Schritt 1: ${schritte[0]}`,
  `Dreisatz, Schritt 2: ${schritte[1]}`,
] : []);

export function loesungsweg(aufgabe) {
  const w = aufgabe.werte;
  if (!w) return [];
  if (aufgabe.prinzip === "rate") {
    const { r, t, h } = w;
    // Der Nullen-Trick bleibt der schnellste Weg, der Dreisatz steht darunter.
    const dreisatz = alsHinweis(dreisatzRate(aufgabe));
    // Zielhöhenaufgabe: Die Ausgangshöhe steht nicht im Text, sie hängt am
    // Höhenmesser. Ohne die Differenz rechnet man mit einer Höhe, die längst
    // geflogen ist, darum führt der Weg sie als ersten Schritt mit.
    const z = aufgabe.zielhoehe;
    const differenz = z ? [z.steigen
      ? `Erst die Differenz: Zielhöhe ${z.ziel} ft minus abgelesene ${z.start} ft = ${h} ft zu steigen.`
      : `Erst die Differenz: abgelesene ${z.start} ft minus Zielhöhe ${z.ziel} ft = ${h} ft abzubauen.`] : [];
    // zk auch auf den gestrichenen Raten: Seit den halben Raten der höheren
    // Stufen (450 ft/min werden zu 4,5) fällt hier sonst ein Punkt statt
    // eines Kommas ins Bild.
    if (aufgabe.antwort === t) return [
      ...differenz,
      `Nullen weg: aus ${h} ft und ${r} ft/min werden ${zk(h / 100)} und ${zk(r / 100)}.`,
      `${zk(h / 100)} geteilt durch ${zk(r / 100)} = ${t} Minuten.`,
      ...dreisatz,
    ];
    return [
      ...differenz,
      `Nullen weg: aus ${h} ft werden ${zk(h / 100)}.`,
      `${zk(h / 100)} geteilt durch ${t} Minuten = ${zk(r / 100)}, Nullen dran: ${r} ft/min.`,
      ...dreisatz,
    ];
  }
  const { v, t, s } = w;
  const bruch = STUNDENBRUECHE[t];
  const minute = dreisatzMinute(aufgabe); // null, wenn die eine Minute krumm ist
  if (aufgabe.prinzip === "zeit") {
    // Geht die eine Minute auf, ist der Dreisatz selbst der schnellste Weg.
    if (minute) return alsWeg(minute);
    // Krumme Knoten (80/100/200): Weg durch Knoten ergibt die Stunden,
    // und die sind über den ganzen Wertepool immer ein griffiger Bruch.
    // Der Dreisatz kommt hier über die eine NM ans Ziel.
    const dreisatz = alsHinweis(dreisatzProNM(aufgabe));
    if (bruch) return [
      `${s} NM geteilt durch ${v} kt = ${bruch.wort}.`,
      `Also ${t} Minuten.`,
      ...dreisatz,
    ];
    return [
      `Zeit = Weg mal 60, geteilt durch die Knoten.`,
      `${s} mal 60 = ${s * 60}, geteilt durch ${v} = ${t} Minuten.`,
      ...dreisatz,
    ];
  }
  // Ist die eine Minute krumm (80, 100 und 200 kt), führt der Dreisatz über
  // die eine Stunde ans Ziel, denn die Knoten sind die NM je Stunde.
  const sicher = alsHinweis(minute ?? dreisatzStunde(aufgabe));
  if (aufgabe.prinzip === "weg") {
    // Bei genau einer Stunde ist nichts zu rechnen: Die Aufgabe steht schon
    // auf der einen Einheit, ein zweiter Schritt wäre nur Ballast. Ab über
    // einer Stunde ist der Stundenbruch griffiger als die NM je Minute
    // (90 kt mal 5 schlägt 1,5 mal 300), der Dreisatz steht dann darunter.
    if (t === 60) return [
      `60 Minuten sind genau eine Stunde.`,
      `Der Weg entspricht den Knoten: ${s} NM.`,
    ];
    if (t > 60 && bruch) return [
      `${t} Minuten sind ${bruch.wort}.`,
      `${v} kt ${bruch.weg} = ${s} NM.`,
      ...sicher,
    ];
    if (minute) return alsWeg(minute);
    if (bruch) return [
      `${t} Minuten sind ${bruch.wort}.`,
      `${v} kt ${bruch.weg} = ${s} NM.`,
      ...sicher,
    ];
    return [
      `Weg = Knoten mal Minuten, geteilt durch 60.`,
      `${v} mal ${t} = ${v * t}, geteilt durch 60 = ${s} NM.`,
      ...sicher,
    ];
  }
  // Prinzip Geschwindigkeit: v gesucht, gleiche Routenordnung wie beim Weg.
  if (t === 60) return [
    `60 Minuten sind genau eine Stunde.`,
    `Die Knoten entsprechen dem Weg: ${v} kt.`,
  ];
  if (t > 60 && bruch) return [
    `${t} Minuten sind ${bruch.wort}.`,
    `${s} NM ${bruch.tempo} = ${v} kt.`,
    ...sicher,
  ];
  if (minute) return alsWeg(minute);
  if (bruch) return [
    `${t} Minuten sind ${bruch.wort}.`,
    `${s} NM ${bruch.tempo} = ${v} kt.`,
    ...sicher,
  ];
  return [
    `Knoten = Weg mal 60, geteilt durch die Minuten.`,
    `${s} mal 60 = ${s * 60}, geteilt durch ${t} = ${v} kt.`,
    ...sicher,
  ];
}

export const VOLLE_PUNKTE_MS = 8000;
export function punkteFuerAntwort(richtig, restzeitMs, limitMs) {
  if (!richtig) return 0;
  const spielraum = Math.max(1, limitMs - VOLLE_PUNKTE_MS);
  const anteil = Math.max(0, Math.min(1, restzeitMs / spielraum));
  return 7 + 3 * anteil;
}

// Kennzahl des Laufs: Punkteschnitt je gestellter Aufgabe, auf 0 bis 100
// gebracht. So bleiben Läufe verschiedener Testdauern vergleichbar.
// Bewusst unangetastet, obwohl es seit 17.09.2026 drei Schwierigkeitsstufen
// gibt (Willis Wahl: "Stufe ja, Wertung spaeter"). Ein leichter und ein
// schwerer Lauf landen damit vorerst in derselben Statistik, ohne dass die
// Stufe die Prozentzahl anhebt oder deckelt. Das ist nach ein paar Läufen zu
// eichen: erst wenn Willi weiß, wie viel Prozent er je Stufe schafft, lässt
// sich ein Stufenfaktor festlegen, der die Stufen vergleichbar macht.
export function kennzahl(punkteSumme, anzahl) {
  if (anzahl === 0) return 0;
  return Math.round((punkteSumme / (anzahl * 10)) * 100);
}

// Vollständiges, widerspruchsfreies Panel zur Aufgabe (Willis Vorgabe vom
// 25.08.2026): Werte, die die Aufgabe verwendet, zeigt das Panel, egal ob
// sie im Text stehen oder abgelesen werden sollen; der Rest passt zur
// Fluglage. Nur die Geschwindigkeitsfrage lässt das Panel frei würfeln,
// dort ist die Geschwindigkeit die gesuchte Antwort, der Fahrtmesser
// würde sie verraten (ihr Text spricht darum von einem fremden
// Luftfahrzeug).
export function panelwerte(aufgabe, rnd = Math.random) {
  const werte = zufallswerte(rnd);
  const instrument = aufgabe.instrument;

  // Die Geschwindigkeitsfrage: der Fahrtmesser wird im Lauf verdeckt
  // (siehe verdeckteInstrumente), der Rest fliegt ruhigen Reiseflug.
  if (aufgabe.prinzip === "geschwindigkeit") {
    werte.vario = 0;
    werte.horizont = { roll: 0, nick: 0 };
    return werte;
  }

  // Geschwindigkeit gegeben, im Text oder am Zeiger: Reiseflug, waagerecht.
  const fahrt = instrument?.id === "fahrt" ? instrument.wert : aufgabe.lage?.fahrt;
  if (fahrt !== undefined) {
    werte.fahrt = fahrt;
    werte.vario = 0;
    werte.horizont = { roll: 0, nick: 0 };
    return werte;
  }

  // Höhe am Zeiger ablesen, der Abbau oder der Steigflug steht erst bevor:
  // noch waagerecht. Das gilt auch für die Zielhöhenaufgabe, deren
  // Ausgangshöhe hier wörtlich am Höhenmesser steht.
  if (instrument?.id === "hoehe") {
    werte.hoehe = instrument.wert;
    werte.vario = 0;
    werte.horizont = { roll: 0, nick: 0 };
    return werte;
  }

  // Sinken am Zeiger ablesen, der Sinkflug läuft: Nase leicht gesenkt, der
  // Höhenmesser zeigt mehr Höhe, als abgebaut wird (h = Rate mal Zeit).
  if (instrument?.id === "vario") {
    werte.vario = instrument.wert;
    const h = -instrument.wert * aufgabe.antwort;
    const mindest = Math.max(1000, Math.ceil((h + 100) / 100) * 100);
    werte.hoehe = Math.min(9900, mindest + 100 * Math.floor(rnd() * 5));
    werte.horizont = { roll: 0, nick: -10 };
    return werte;
  }

  // Höhenwert im Text: der Höhenmesser zeigt wörtlich die genannte Zahl
  // (Willis Vorgabe: was in der Aufgabe steht, steht auch am Instrument).
  // Waagerecht mit Variometer null, die Änderung steht erst bevor und die
  // Rate ist die gesuchte Antwort.
  if (aufgabe.lage?.aenderung !== undefined) {
    werte.vario = 0;
    werte.horizont = { roll: 0, nick: 0 };
    werte.hoehe = aufgabe.lage.aenderung;
    return werte;
  }

  return werte;
}

// Instrumente, die die gesuchte Antwort verrieten, zeigt der Lauf nicht mit
// einem falschen Wert, sondern verdeckt sie (Willis Vorgabe vom
// 25.08.2026): der Fahrtmesser bei der Geschwindigkeitsfrage, das
// Variometer, wenn die Rate die Antwort ist. Der Höhenmesser bleibt immer
// sichtbar, die Zielhöhenaufgabe ist ohne ihn nicht lösbar.
export function verdeckteInstrumente(aufgabe) {
  if (aufgabe.prinzip === "geschwindigkeit") return ["fahrt"];
  if (aufgabe.prinzip === "rate" && aufgabe.einheit === "ft/min") return ["vario"];
  return [];
}
