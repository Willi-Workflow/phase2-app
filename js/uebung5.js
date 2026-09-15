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
// erlaubten Bereich liegt, einmal beim Laden gerechnet. Alle Werte bleiben
// im Anzeigebereich der Instrumente (Fahrt bis 300 kt, Höhenänderung bis
// 8900 ft), denn das Panel spiegelt die Aufgabenwerte auch dann, wenn sie
// im Text stehen (Willis Vorgabe vom 25.08.2026).
const GESCHWINDIGKEITEN = [60, 80, 90, 100, 120, 150, 180, 200, 240, 300];
const ZEITEN = [12, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300];
const WZG_PAARE = [];
for (const v of GESCHWINDIGKEITEN) for (const t of ZEITEN) {
  const s = (v * t) / 60;
  if (Number.isInteger(s) && s >= 20 && s <= 1500) WZG_PAARE.push({ v, t, s });
}
const RATEN_PAARE = [];
for (let r = 200; r <= 4000; r += 100) for (let t = 2; t <= 12; t++) {
  const h = r * t;
  if (h >= 1000 && h <= 8900) RATEN_PAARE.push({ r, t, h });
}

// Anzeigeraster der Instrumente für Instrumentenaufgaben: Der Höhenmesser
// zeigt nur Hunderterschritte zwischen 1000 und 9900 ft, das Variometer nur
// Werte bis 2000 ft/min. Wer den gegebenen Wert am Zeiger abliest, darf ihn
// also nur dort auch finden. Der Fahrtmesser braucht keine eigene Liste, er
// zeigt jede Geschwindigkeit aus GESCHWINDIGKEITEN an.
const RATEN_PAARE_HOEHENMESSER = RATEN_PAARE.filter((p) => p.h >= 1000);
const RATEN_PAARE_VARIOMETER = RATEN_PAARE.filter((p) => p.r <= 2000);

// Dreisatzfreundliche Paare (Willis Auftrag vom 14.09.2026): Geht die
// Geschwindigkeit glatt durch 60 auf, ergibt das Herunterrechnen auf eine
// Minute eine ganze Zahl (240 kt sind 4 NM je Minute, 180 NM in 45 Minuten
// sind 4 NM je Minute). Bei 80, 100 und 200 kt ist die Minute krumm.
const WZG_PAARE_GLATT = WZG_PAARE.filter((p) => Number.isInteger(p.v / 60));

const zufallAus = (feld, rnd) => feld[Math.floor(rnd() * feld.length)];

// Anteil der Aufgaben, die aus den dreisatzfreundlichen Paaren kommen. Der
// Rest wird weiter aus dem ganzen Bestand gezogen, damit keine
// Geschwindigkeit und keine Zeit aus den Aufgaben verschwindet.
export const DREISATZ_ANTEIL = 0.5;
const ziehePaar = (rnd) => zufallAus(rnd() < DREISATZ_ANTEIL ? WZG_PAARE_GLATT : WZG_PAARE, rnd);

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
          werte: { r, t, h },
        };
      }
      const { r, t, h } = zufallAus(RATEN_PAARE_VARIOMETER, rnd);
      return {
        prinzip,
        frage: `Du sinkst mit deinem aktuellen Sinken (Variometer). Berechne die Flugzeit für ${h} ft in Minuten.`,
        antwort: t,
        einheit: "min",
        instrument: { id: "vario", wert: -r },
        werte: { r, t, h },
      };
    }
    const { r, t, h } = zufallAus(RATEN_PAARE, rnd);
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
    const { v, t, s } = ziehePaar(rnd);
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

  const { v, t, s } = ziehePaar(rnd);
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
const zk = (n) => String(n).replace(".", ","); // Zahl mit Komma
const istGlatt = (n) => Number.isInteger(n * 2); // ganz oder ,5
// Je Minutenzahl der Stundenbruch in Worten und die Rechenoperation in
// beide Richtungen: weg rechnet s aus v (mal Stundenanteil), tempo rechnet
// v aus s (die Umkehrung). Bei 45 Minuten ist der Doppelschritt über
// Viertel der schnellste Kopfweg.
const STUNDENBRUECHE = {
  12: { wort: "ein Fünftel einer Stunde", weg: "geteilt durch 5", tempo: "mal 5" },
  15: { wort: "eine Viertelstunde", weg: "geteilt durch 4", tempo: "mal 4" },
  20: { wort: "ein Drittel einer Stunde", weg: "geteilt durch 3", tempo: "mal 3" },
  30: { wort: "eine halbe Stunde", weg: "geteilt durch 2", tempo: "mal 2" },
  45: { wort: "eine Dreiviertelstunde", weg: "mal 3, geteilt durch 4", tempo: "mal 4, geteilt durch 3" },
  60: { wort: "genau eine Stunde", weg: "mal 1", tempo: "mal 1" },
  90: { wort: "anderthalb Stunden", weg: "mal 1,5", tempo: "geteilt durch 1,5" },
  120: { wort: "zwei Stunden", weg: "mal 2", tempo: "geteilt durch 2" },
  150: { wort: "zweieinhalb Stunden", weg: "mal 2,5", tempo: "geteilt durch 2,5" },
  180: { wort: "drei Stunden", weg: "mal 3", tempo: "geteilt durch 3" },
  240: { wort: "vier Stunden", weg: "mal 4", tempo: "geteilt durch 4" },
  300: { wort: "fünf Stunden", weg: "mal 5", tempo: "geteilt durch 5" },
};

export const TIPPS5 = {
  zeit: "Knoten geteilt durch 60 sind NM je Minute: 120 kt = 2, 90 kt = 1,5. Zeit = Weg geteilt durch NM je Minute. Bei krummen Knoten (80, 100, 200) teile Weg durch Knoten: Das ergibt die Stunden, etwa 20 NM bei 80 kt = eine Viertelstunde. Der Dreisatz geht immer: erst eine Minute oder eine NM ausrechnen, dann auf den gesuchten Wert hoch.",
  weg: "Erst die Geschwindigkeit in NM je Minute umdenken (kt geteilt durch 60), dann mal die Minuten. Bei griffigen Zeiten hilft der Stundenbruch: 15 min = Viertelstunde, 45 min = Dreiviertelstunde. Das ist der Dreisatz: herunter auf eine Minute, hoch auf die Minutenzahl der Aufgabe.",
  geschwindigkeit: "Weg geteilt durch Minuten ergibt NM je Minute, mal 60 sind es Knoten. Bei griffigen Zeiten direkt über den Stundenbruch: 30 min = halbe Stunde, also Weg mal 2. Der Dreisatz ist derselbe Gedanke in zwei Schritten: herunter auf eine Minute, hoch auf 60 Minuten.",
  rate: "Rate gesucht: Nullen der Höhe streichen, klein teilen, Nullen wieder dran (4800 durch 8: 48 durch 8 = 6, also 600 ft/min). Zeit gesucht: auf beiden Seiten gleich viele Nullen streichen und nichts anhängen (4800 durch 1200: 48 durch 12 = 4 Minuten). Sicher geht auch hier der Dreisatz: Was bringt eine Minute, und wie oft brauchst du sie?",
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
    if (aufgabe.antwort === t) return [
      `Nullen weg: aus ${h} ft und ${r} ft/min werden ${h / 100} und ${r / 100}.`,
      `${h / 100} geteilt durch ${r / 100} = ${t} Minuten.`,
      ...dreisatz,
    ];
    return [
      `Nullen weg: aus ${h} ft werden ${h / 100}.`,
      `${h / 100} geteilt durch ${t} Minuten = ${r / 100}, Nullen dran: ${r} ft/min.`,
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

  // Höhe am Zeiger ablesen, der Abbau steht erst bevor: noch waagerecht.
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
// Variometer, wenn die Rate die Antwort ist.
export function verdeckteInstrumente(aufgabe) {
  if (aufgabe.prinzip === "geschwindigkeit") return ["fahrt"];
  if (aufgabe.prinzip === "rate" && aufgabe.einheit === "ft/min") return ["vario"];
  return [];
}
