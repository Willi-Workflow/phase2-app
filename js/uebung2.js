// Übungslogik Mission 2 (Multitasking Controls): Nachbau des SMT aus dem
// ICA 90 II. Bewegung als träge Ratensteuerung, Deckungs- und Trefferprüfung,
// Kennzahl. Reine Logik ohne DOM, Zufall und Zeitschritt sind einspeisbar,
// damit alles mit node --test prüfbar bleibt.
// Seit Willis Auftrag vom 14.09.2026 gibt es kein Gegensteuern mehr: Die
// Zufallsdrift auf Fadenkreuz, Strich und Nadel ist vollständig aus dem
// Modul heraus. Wer sich bewegt, bewegt sich nur noch selbst. Der Zufall
// bleibt für die Startlage und die Neusetzung nach einem Treffer.

export const TESTDAUERN = [5, 10, 30]; // Minuten
export const ELEMENTE = ["stick", "ruder", "schub"];
export const HALTEZEIT_MS = 1000;
export const NADEL_MIN = 40;
export const NADEL_MAX = 160;
export const ZIELKREIS_R = 0.02;     // Anteil der Rahmenbreite
export const STRICH_TOLERANZ = 0.01; // Anteil der Rahmenbreite
export const RAHMEN_VERHAELTNIS = 3 / 7; // Höhe zu Breite des Rahmens; das Bildmodul leitet seine Maße daraus ab
export const NADEL_TOLERANZ = 2;     // Knoten
export const SOLL_KT = 95; // fester Sollwert der Geschwindigkeit, Willis Festlegung
// Randabstand des Fadenkreuzes (Willis Vorgabe vom 28.08.2026): Es darf nicht
// bis an den Bildrand laufen. Die Mitte bleibt erreichbar, das Fadenkreuz
// bleibt aber immer sichtbar im Rahmen. Der Abstand galt ursprünglich der
// Drift; seit deren Wegfall am 14.09.2026 fängt er den Vollausschlag der
// Steuerung ab und bleibt damit unverändert nötig.
export const FADEN_RAND = 0.06;

// Raten bei Vollausschlag (je Sekunde).
// Stickrate am 29.08.2026 auf Willis Wunsch um rund ein Viertel angehoben
// (der echte Teststick gilt als sehr empfindlich); Ruder unverändert.
// Driftstärken gab es hier bis zum 14.09.2026; sie sind mit dem Gegensteuern
// gestrichen, nicht auf 0 gesetzt.
// Vorsprung, den die unterlegene Achse braucht, um die Führung zu
// übernehmen (Haltewirkung der Achsenrastung, siehe takt). Handzittern
// liegt bei rund 0,01 bis 0,02 Ausschlag, ein gewollter Richtungswechsel
// führt den Stick weit über 0,08 hinaus.
const RASTUNG_VORSPRUNG = 0.08;
const RATE_STICK = 0.56;
const RATE_RUDER = 0.5;
const RATE_NADEL = 30;
// Trägheit der Steuerrate: Sie bestimmt beides, den Aufbau der Bewegung und
// das Nachschwenken nach dem Loslassen (der Restschwung klingt mit derselben
// Zeitkonstante ab). Am 01.09.2026 nach Willis Videobefund von 150 auf 400
// angehoben: Im SMT-Original läuft das rote Fadenkreuz beim Einfangen rund
// 40 Prozent über das Ziel hinaus und pendelt zurück (Reportage 3:26 bis
// 3:28), das ist ein Schwenken mit Masse, keine direkte Geschwindigkeit.
// Auslaufweg im Video etwa 0,08 Feldbreiten bei 0,25 je Sekunde Einlauf,
// also rund 0,3 bis 0,4 s Zeitkonstante. Tracking-Aufgaben der Literatur
// unterlegen dem Cursor genauso bewusst ein träges System.
const ANLAUF_MS = 400;

const begrenze = (w, min, max) => Math.min(max, Math.max(min, w));

// Neusetzung nach einem Treffer beziehungsweise Startlage: immer deutlich
// außerhalb der Deckung, damit jede Aufgabe echte Arbeit verlangt.
export function zufallsFadenkreuz(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const x = 0.08 + rnd() * 0.84;
    const y = 0.08 + rnd() * 0.84;
    if (Math.hypot(x - 0.5, y - 0.5) >= 0.25) return { x, y };
  }
  return { x: 0.15, y: 0.15 };
}

export function zufallsStrich(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const x = 0.08 + rnd() * 0.84;
    if (Math.abs(x - 0.5) >= 0.15) return { x };
  }
  return { x: 0.2 };
}

export function zufallsNadel(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const kt = NADEL_MIN + 5 * Math.floor(rnd() * ((NADEL_MAX - NADEL_MIN) / 5 + 1));
    if (kt >= NADEL_MIN && kt <= NADEL_MAX && Math.abs(kt - SOLL_KT) >= 20) return kt;
  }
  return NADEL_MIN;
}

export function erzeugeLaufzustand(auswahl, rnd = Math.random) {
  return {
    auswahl: [...auswahl],
    fadenkreuz: zufallsFadenkreuz(rnd),
    strich: zufallsStrich(rnd),
    nadel: zufallsNadel(rnd),
    rate: { fx: 0, fy: 0, strich: 0 },
    // Führende Stickachse der Rastung, "quer" oder "laengs". Sie bleibt
    // über den Takt hinaus stehen, damit die Haltewirkung greift.
    fuehrung: "quer",
    soll: SOLL_KT,
    halte: { stick: 0, ruder: 0, schub: 0 },
    treffer: { stick: 0, ruder: 0, schub: 0 },
    kombitreffer: 0,
    deckungMs: { stick: 0, ruder: 0, schub: 0 },
    testMs: 0,
  };
}

export function inDeckung(z, element) {
  if (element === "stick") return Math.hypot(z.fadenkreuz.x - 0.5, (z.fadenkreuz.y - 0.5) * RAHMEN_VERHAELTNIS) <= ZIELKREIS_R;
  if (element === "ruder") return Math.abs(z.strich.x - 0.5) <= STRICH_TOLERANZ;
  return Math.abs(z.nadel - z.soll) <= NADEL_TOLERANZ;
}

// Ein Zeitschritt: Eingaben wirken als Rate, sonst wirkt nichts.
// Stick- und Ruderrate laufen seit 01.09.2026 mit derselben Trägheit an
// wie in Mission 1 (Willis Rückmeldung "zu direkt, gerade bei Mission 2"):
// Die Sollrate liegt erst nach der Anlaufzeit voll an, die Kennlinie und
// damit die Anfangsempfindlichkeit bleiben unverändert. Der Schub bleibt
// unverzögert, er ist ein Stellhebel. Seit dem 14.09.2026 kommt nichts mehr
// obendrauf: kein Gegensteuern, keine Störgröße.
// Rückgabe: Trefferereignisse dieses Takts, je Element höchstens eines.
export function takt(z, eingaben, dtMs, rnd = Math.random) {
  const dt = dtMs / 1000;
  const aktiv = z.auswahl;
  const ereignisse = [];

  const glatt = Math.min(1, dtMs / ANLAUF_MS);
  if (aktiv.includes("stick")) {
    // Rastung auf die dominante Achse (Willis Auftrag vom 14.09.2026, keine
    // Diagonalen mehr): Verglichen werden die Beträge beider Auslenkungen,
    // die unterlegene Achse bekommt in diesem Takt die Eingabe 0.
    // Seit dem 17.09.2026 wird zusätzlich ihre RATE hart auf 0 gesetzt
    // (Willis Auftrag: "das Fadenkreuz soll sich auch nur waagerecht und
    // senkrecht bewegen"). Die erste Fassung hatte nur die Eingabe
    // genullt und die Rate mit ANLAUF_MS auslaufen lassen; beim
    // Richtungswechsel trugen dadurch rund eine Sekunde lang beide Achsen
    // eine Rate, und das Fadenkreuz beschrieb einen Bogen statt eines
    // rechten Winkels. Jetzt bewegt es sich zu jedem Zeitpunkt auf genau
    // einer Achse. Der Preis ist ein harter Übergang beim Wechsel, die
    // Trägheit der führenden Achse bleibt davon unberührt.
    // Der Fang selbst (Zielkreis, Haltezeit) bleibt unverändert.
    // Gleichstand geht deterministisch an die Waagerechte, auch im Ruhefall
    // 0 gegen 0: Derselbe Eingabestand soll immer dieselbe Bewegung ergeben,
    // und bei Gleichstand ist die Wahl ohnehin beliebig.
    // Haltewirkung (Prüferbefund vom 14.09.2026): Ohne sie kippte die
    // Führung bei schräg gehaltenem Stick durch das normale Handzittern
    // mehrmals je Sekunde hin und her, und das Fadenkreuz zappelte im
    // Zickzack. Die führende Achse behält darum ihre Führung, bis die
    // andere sie um RASTUNG_VORSPRUNG überholt. Das Zittern liegt weit
    // darunter, ein gewollter Richtungswechsel weit darüber.
    const vorher = z.fuehrung ?? "quer";
    const querBetrag = Math.abs(eingaben.stickX);
    const laengsBetrag = Math.abs(eingaben.stickY);
    if (vorher === "quer" && laengsBetrag > querBetrag + RASTUNG_VORSPRUNG) z.fuehrung = "laengs";
    else if (vorher === "laengs" && querBetrag > laengsBetrag + RASTUNG_VORSPRUNG) z.fuehrung = "quer";
    else z.fuehrung = vorher;
    const waagerechtFuehrt = z.fuehrung === "quer";
    const quer = waagerechtFuehrt ? eingaben.stickX : 0;
    // Hochachse invertiert (Willis Auftrag vom 14.09.2026, wie im Simulator):
    // Ziehen lässt das Fadenkreuz steigen. Ziehen liefert einen positiven
    // Wert der Längsachse, im Bild wächst y nach unten (yImBild in
    // uebung2-bild.js). Positive Eingabe muss also eine negative y-Rate
    // ergeben, daher das Minus. Das ist die einzige Stelle der Umkehr;
    // Querachse, Ruder und Schub bleiben unverändert.
    const laengs = waagerechtFuehrt ? 0 : -eingaben.stickY;
    z.rate.fx += (quer * RATE_STICK - z.rate.fx) * glatt;
    z.rate.fy += (laengs * RATE_STICK - z.rate.fy) * glatt;
    // Die unterlegene Achse steht sofort still, sonst entstünde beim
    // Wechsel wieder ein Bogen (siehe oben).
    if (waagerechtFuehrt) z.rate.fy = 0;
    else z.rate.fx = 0;
    z.fadenkreuz.x = begrenze(z.fadenkreuz.x + z.rate.fx * dt, FADEN_RAND, 1 - FADEN_RAND);
    z.fadenkreuz.y = begrenze(z.fadenkreuz.y + z.rate.fy * dt, FADEN_RAND, 1 - FADEN_RAND);
  }
  if (aktiv.includes("ruder")) {
    z.rate.strich += (eingaben.ruder * RATE_RUDER - z.rate.strich) * glatt;
    z.strich.x = begrenze(z.strich.x + z.rate.strich * dt, 0, 1);
  }
  if (aktiv.includes("schub")) {
    z.nadel = begrenze(z.nadel + eingaben.schub * RATE_NADEL * dt, NADEL_MIN, NADEL_MAX);
  }

  const deckung = {};
  for (const element of aktiv) deckung[element] = inDeckung(z, element);
  z.testMs += dtMs;
  for (const element of aktiv) if (deckung[element]) z.deckungMs[element] += dtMs;
  for (const element of aktiv) {
    if (deckung[element]) {
      z.halte[element] += dtMs;
      if (z.halte[element] >= HALTEZEIT_MS) {
        z.treffer[element] += 1;
        const kombi = aktiv.length > 1 && aktiv.filter((e) => e !== element).every((e) => deckung[e]);
        if (kombi) z.kombitreffer += 1;
        ereignisse.push({ element, kombi });
        z.halte[element] = 0;
        if (element === "stick") z.fadenkreuz = zufallsFadenkreuz(rnd);
        else if (element === "ruder") z.strich = zufallsStrich(rnd);
        else z.nadel = zufallsNadel(rnd);
      }
    } else {
      z.halte[element] = 0;
    }
  }
  return ereignisse;
}

// Kennzahl des Laufs: Treffer je Minute, gemeinsame Treffer zählen doppelt.
// So bleiben Läufe verschiedener Testdauern vergleichbar.
export function punkte(z, dauerMin) {
  if (!dauerMin) return 0;
  const einzel = z.treffer.stick + z.treffer.ruder + z.treffer.schub;
  return Math.round((einzel + 2 * z.kombitreffer) / dauerMin);
}

// Deckungsquote: Anteil der Testzeit in Deckung, über die gewählten Elemente
// gemittelt und in Prozent gerundet. Nah am Original, das die Zeit auf dem
// Ziel misst; seit 28.08.2026 die gespeicherte Kennzahl (Willis Vorgabe:
// überall Prozent), die Treffer je Minute bleiben als Detail in den Daten.
export function deckungsquote(z) {
  if (!z.testMs || z.auswahl.length === 0) return 0;
  const summe = z.auswahl.reduce((s, e) => s + z.deckungMs[e], 0);
  return Math.round((summe / (z.testMs * z.auswahl.length)) * 100);
}

// Schwierigkeitsfaktor: ein Element zu halten ist deutlich leichter als
// drei gleichzeitig, darum erreicht nur die volle Auswahl den Faktor 1,0.
const ELEMENTFAKTOR = { 1: 0.6, 2: 0.85, 3: 1.0 };
export function schwierigkeitsfaktor2(anzahlElemente) {
  return ELEMENTFAKTOR[anzahlElemente] ?? 0.6;
}

export function pruefeAuswahl(auswahl) {
  return auswahl.length > 0 && auswahl.every((e) => ELEMENTE.includes(e));
}

// Erfüllungsanteil seit 07.09.2026 (Willis Auftrag, Muster Mission 1):
// Nicht mehr die Deckungsquote, sondern die Erledigungen tragen die
// Prozente. Je gewähltem Element zählen die Treffer je Minute am Bestwert
// des Elements, gedeckelt und über die Auswahl gemittelt; der
// Schwierigkeitsfaktor bleibt obendrauf. Die Bestwerte sind je Element
// verschieden (Willis Auftrag: datengeleitet statt ein gemeinsamer Wert),
// abgeleitet aus den sechs gespeicherten Läufen beider Piloten bis zum
// 07.09.2026: Stick schaffte 4 bis 8,8 je Minute, Ruder höchstens 2,8,
// Schub höchstens 3; je Element liegt rund ein Drittel Luft über dem
// besten Lauf. Die Deckungsquote bleibt als Anzeige- und Datenwert.
// Offener Punkt seit 14.09.2026: Diese Bestwerte stammen aus Läufen MIT
// Gegensteuern. Ohne Drift ist jede Erledigung leichter, die Prozente fallen
// also zu freundlich aus. Die Werte bleiben bis auf Weiteres stehen (Willis
// ausdrückliche Vorgabe) und müssen nach ein paar neuen Läufen beider
// Piloten neu geeicht werden.
export const TREFFER_BESTWERTE2 = { stick: 7, ruder: 4, schub: 4 }; // Erledigungen je Minute

export function erfuellung2(z, dauerMin) {
  if (!dauerMin || z.auswahl.length === 0) return 0;
  const anteile = z.auswahl.map((e) => Math.min(1, z.treffer[e] / dauerMin / TREFFER_BESTWERTE2[e]));
  return (anteile.reduce((s, a) => s + a, 0) / z.auswahl.length) * 100;
}
