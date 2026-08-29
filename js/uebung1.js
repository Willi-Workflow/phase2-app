// Übungslogik Mission 1 (Flugzeugverfolgung): Nachbau des PMT aus dem ICA.
// Eigenflug: Stick rollt und nickt, Pedale gieren; das Zielflugzeug fliegt
// mit träger Zufallsdrift voraus und darf das Bild verlassen, dann zeigt ein
// Pfeil am Bildrand die Richtung. Reine Logik ohne DOM und
// ohne three.js, Zufall und Zeitschritt sind einspeisbar (node --test).
// Die Drifthelfer sind bewusst eine Kopie aus uebung2.js; das gemeinsame
// Laufgerüst zieht die Sammel-Härtung später heraus.

export const TESTDAUERN = [3, 5, 10]; // Minuten
export const HALTEZEIT_MS = 1000;
// Deckungsradius = gezeichneter Kreis: 7 Prozent Bildbreite mal Radius
// 46/100 aus der SVG-Vorlage; nach Videomessung, auf Willis Wunsch noch
// etwas kleiner als das Original.
export const KREIS_R = 0.032;          // Anteil der Bildbreite
export const BILDVERHAELTNIS = 9 / 16; // Höhe zu Breite des Sichtfelds
export const MINDESTABSTAND = 0.18;    // Kreis springt nie näher ans Ziel
// Startkegel: Neusetzung nach Treffer und Startlage liegen immer im Bild.
export const KEGEL = { xMin: 0.12, xMax: 0.88, yMin: 0.15, yMax: 0.85 };
// Im Flug darf das Ziel den Bildschirm verlassen (Willis Festlegung vom
// 29.08.2026, der Pfeil am Bildrand zeigt dann die Richtung). Die Außengrenze
// ist nur ein fernes Sicherheitsnetz, damit Drift und Dauerkurve das Ziel
// nicht beliebig weit wegtragen; sie liegt unerreichbar weit außerhalb.
export const AUSSENGRENZE = { xMin: -1.0, xMax: 2.0, yMin: -0.7, yMax: 1.7 };
export const MAXROLL = 1.0;            // rad, etwa 57 Grad
// Umrechnung von Bildanteil in Kurswinkel: das waagerechte Sichtfeld der
// Kamera (62 Grad senkrecht bei 16:9 ergibt rund 94 Grad). Ziel und Kulisse
// drehen damit aus derselben Gierbewegung und laufen nie auseinander.
export const SICHTWINKEL = 1.64;       // rad

// Raten bei Vollausschlag (je Sekunde) und Driftstärken. Steuerdynamik nach
// Simulator-Art, abgeglichen mit dem Vorführlauf im Video (12:40 bis 13:10):
// Die Raten laufen träge an (Anlaufzeit), die Fluglage bleibt stehen statt
// zurückzufedern, nur eine schwache Eigenstabilität richtet langsam auf.
// Kalibrierung vom 28.08.2026 nach Willis Rückmeldung (Steuerung zu
// empfindlich und zu impulsartig). Aufgeteilt auf die passenden Hebel: Die
// weiche, feinfühlige Mittellage kommt aus der Empfindlichkeitskurve in
// controls/kurve (tote Mitte plus Expo, im Video fliegt der Bewerber mit
// feinen kleinen Ausschlägen), die längere Anlaufzeit nimmt das Impulsartige
// (weicher Steuereinsatz statt Anreißen), und die Raten bleiben nur leicht
// unter dem Ursprung, damit am Vollausschlag die Autorität für die kräftigen
// Bankmomente aus dem Referenzvideo erhalten bleibt.
// Stickraten am 29.08.2026 auf Willis Wunsch um rund ein Viertel angehoben
// (der echte Teststick gilt als sehr empfindlich); Ruder unverändert.
const RATE_NICK = 0.31;
const RATE_GIER = 0.29;
const ROLLRATE = 0.62;
const ANLAUF_MS = 300;    // Trägheit, bis eine Steuerrate voll anliegt
const STABIL = 0.12;      // schwache Eigenstabilität je Sekunde
const NICK_SICHT = 0.5;   // rad Blickneigung je Einheit Nickbewegung
export const MAXNICK = 0.3; // rad
const KOPPLUNG = 0.3;     // Kurvenzug bei vollem Rollen, Einheiten je Sekunde
const DRIFT_ZIEL = 0.05;
const DRIFTWECHSEL_MIN_MS = 1500;
const DRIFTWECHSEL_MAX_MS = 3000;

const begrenze = (w, min, max) => Math.min(max, Math.max(min, w));

function neueDrift(staerke, rnd) {
  return {
    ziel: (rnd() * 2 - 1) * staerke,
    wert: 0,
    restMs: DRIFTWECHSEL_MIN_MS + rnd() * (DRIFTWECHSEL_MAX_MS - DRIFTWECHSEL_MIN_MS),
    staerke,
  };
}

function taktDrift(d, dtMs, rnd) {
  d.restMs -= dtMs;
  if (d.restMs <= 0) {
    d.ziel = (rnd() * 2 - 1) * d.staerke;
    d.restMs = DRIFTWECHSEL_MIN_MS + rnd() * (DRIFTWECHSEL_MAX_MS - DRIFTWECHSEL_MIN_MS);
  }
  d.wert += (d.ziel - d.wert) * Math.min(1, dtMs / 600);
  return d.wert;
}

const abstand = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * BILDVERHAELTNIS);

// Startlage des Zielflugzeugs: im Kegel, deutlich außerhalb der Mitte.
export function zufallsZiel(rnd) {
  for (let versuch = 0; versuch < 100; versuch++) {
    const z = {
      x: KEGEL.xMin + rnd() * (KEGEL.xMax - KEGEL.xMin),
      y: KEGEL.yMin + rnd() * (KEGEL.yMax - KEGEL.yMin),
    };
    if (abstand(z, { x: 0.5, y: 0.5 }) >= MINDESTABSTAND) return z;
  }
  return { x: 0.25, y: 0.3 };
}
// Die Funktion dient auch der Neusetzung nach einem Treffer: Der Mindest-
// abstand zur Mitte liegt über dem Kreisradius, das Flugzeug landet also
// immer außerhalb der Deckung und muss neu eingefangen werden.

export function inDeckung(z) {
  return abstand(z.ziel, z.kreis) <= KREIS_R;
}

// Pfeilhinweis am Bildrand: Liegt das Ziel außerhalb des Bildes, liefert die
// Funktion den Ankerpunkt des Richtungspfeils (an den Rand geklemmt, mit
// kleinem Abstand), sonst null. Die Drehung des Pfeils rechnet die
// Darstellung aus Anker und Zielposition in Bildpunkten aus.
export const PFEILRAND = 0.045;
export function zielHinweis(ziel) {
  if (ziel.x >= 0 && ziel.x <= 1 && ziel.y >= 0 && ziel.y <= 1) return null;
  return {
    x: begrenze(ziel.x, PFEILRAND, 1 - PFEILRAND),
    y: begrenze(ziel.y, PFEILRAND, 1 - PFEILRAND),
  };
}

export function erzeugeLaufzustand(rnd = Math.random) {
  return {
    ziel: zufallsZiel(rnd),
    kreis: { x: 0.5, y: 0.5 }, // fest in der Bildmitte, wie das Visier im Original
    roll: 0,
    nick: 0,
    kurs: 0, // aufsummierter Gierwinkel, dreht in der Darstellung die Kulisse
    rollRate: 0,
    nickRate: 0,
    gierRate: 0,
    drift: { zx: neueDrift(DRIFT_ZIEL, rnd), zy: neueDrift(DRIFT_ZIEL, rnd) },
    halteMs: 0,
    treffer: 0,
    deckungMs: 0,
    testMs: 0,
    ersterTrefferMs: null,
    letzterTrefferMs: 0,
  };
}

// Ein Zeitschritt: Stick und Pedale bewegen den Blick, das Ziel wandert im
// Sichtfeld entgegen; dazu kommt die eigene Drift des Zielflugzeugs.
export function takt(z, eingaben, dtMs, rnd = Math.random) {
  const dt = dtMs / 1000;

  // Simulator-Anlauf: Die Sollrate aus dem Stick liegt erst nach der
  // Anlaufzeit voll an, die Lage bleibt danach stehen (kein Zurückfedern).
  const glatt = Math.min(1, dtMs / ANLAUF_MS);
  z.rollRate += (eingaben.stickX * ROLLRATE - z.rollRate) * glatt;
  z.nickRate += (eingaben.stickY * RATE_NICK - z.nickRate) * glatt;
  z.gierRate += (eingaben.ruder * RATE_GIER - z.gierRate) * glatt;

  z.roll = begrenze(z.roll + (z.rollRate - z.roll * STABIL) * dt, -MAXROLL, MAXROLL);
  const nickBewegung = z.nickRate * dt;
  const nickVorher = z.nick;
  z.nick = begrenze(nickVorher + nickBewegung * NICK_SICHT - nickVorher * STABIL * dt, -MAXNICK, MAXNICK);
  // Auf das Ziel wirkt nur die tatsächlich erreichte Nickänderung: Steht die
  // Nase am Anschlag, ändert sich der Relativwinkel nicht mehr (sonst klemmt
  // das Ziel als unsichtbare Wand am Kegelrand), und das langsame Aufrichten
  // der Eigenstabilität nimmt das Ziel mit statt nur den Horizont.
  const nickAngewandt = (z.nick - nickVorher) / NICK_SICHT;
  const gierBewegung = (z.gierRate + Math.sin(z.roll) * KOPPLUNG) * dt;
  z.kurs += gierBewegung * SICHTWINKEL;

  z.ziel.x = begrenze(z.ziel.x - gierBewegung + taktDrift(z.drift.zx, dtMs, rnd) * dt, AUSSENGRENZE.xMin, AUSSENGRENZE.xMax);
  z.ziel.y = begrenze(z.ziel.y + nickAngewandt + taktDrift(z.drift.zy, dtMs, rnd) * dt, AUSSENGRENZE.yMin, AUSSENGRENZE.yMax);

  z.testMs += dtMs;
  const ereignisse = [];
  if (inDeckung(z)) {
    z.deckungMs += dtMs;
    z.halteMs += dtMs;
    if (z.halteMs >= HALTEZEIT_MS) {
      z.treffer += 1;
      if (z.ersterTrefferMs == null) z.ersterTrefferMs = z.testMs;
      z.letzterTrefferMs = z.testMs;
      z.halteMs = 0;
      z.ziel = zufallsZiel(rnd);
      ereignisse.push({ treffer: true });
    }
  } else {
    z.halteMs = 0;
  }
  return ereignisse;
}

// Führende Kennzahl: Anteil der Laufzeit, in der der Kreis auf dem Flugzeug
// lag, in ganzen Prozent. Die Zeiten daneben folgen den Messgrößen des
// Originals (Zeit bis zum ersten Treffer, mittlere Zeit je Treffer).
export function deckungsquote(z) {
  if (!z.testMs) return 0;
  return Math.round((z.deckungMs / z.testMs) * 100);
}

const zehntel = (ms) => Math.round(ms / 100) / 10;

export function ergebnisWerte(z) {
  return {
    treffer: z.treffer,
    deckungsquote: deckungsquote(z),
    ersterTrefferS: z.ersterTrefferMs == null ? null : zehntel(z.ersterTrefferMs),
    mittelS: z.treffer ? zehntel(z.letzterTrefferMs / z.treffer) : null,
  };
}

// Letter-Task nach Willis Regel vom 25.08.2026 (ersetzt bewusst die
// S-L-A-Folge aus der Dissertation): Gedrückt wird, wenn ein Buchstabe mit
// genau einem Buchstaben Versatz doppelt kommt (etwa K, F, K), und zwar
// bevor der nächste Buchstabe angesagt wird. Die Fülltakte wiederholen nie
// einen Buchstaben im Drückabstand, ungeplante Ziele entstehen nicht.
// Die Ereignisse kommen zufällig verteilt, aber verlässlich wiederkehrend:
// Lücke zwischen den Ereignissen 6 bis 20 Buchstaben, höchstens zwei
// Fallen nacheinander (Willis Festlegung vom 25.08.2026 gegen
// minutenlanges Zuhören ohne Ereignis). Fallen sind Beinahe-Doppelungen
// ohne Versatz (K, K) oder mit zwei dazwischen (K, F, G, K); bei ihnen
// darf nicht gedrückt werden.
export const BUCHSTABEN_ABSTAND_MS = 2000;
export const EREIGNIS_LUECKE_MIN = 6;
export const EREIGNIS_LUECKE_MAX = 20;
// Wählbare Tempostufen für den Buchstabenabstand; 2000 ms entspricht dem
// Original, schnellere Stufen erhöhen die Schwierigkeit. Das Tempo ist
// zugleich das Antwortfenster: mit der nächsten Ansage ist es zu.
export const TEMPOS = [2500, 2000, 1500, 1000];

// Schwierigkeitsfaktor: ohne Letter-Task bleibt die Wertung gedeckelt, mit
// Letter-Task steigt sie mit dem Sprechtempo; nur die schnellste Stufe
// erreicht 1,0. So kommt eine leichte Einstellung nie auf 100 Prozent.
const TEMPOFAKTOR = { 2500: 0.85, 2000: 0.9, 1500: 0.95, 1000: 1.0 };
export function schwierigkeitsfaktor1(sla, tempo) {
  return sla ? (TEMPOFAKTOR[tempo] ?? 0.85) : 0.75;
}
const FUELLER = "BCDEFGHKMNPRTUWXZ".split("");

export function erzeugeBuchstabenreihe(dauerMin, rnd = Math.random, abstandMs = BUCHSTABEN_ABSTAND_MS) {
  const laenge = Math.floor(dauerMin * 60_000 / abstandMs);
  const plan = new Array(laenge).fill(null);
  const ziel = new Array(laenge).fill(false);
  let stelle = 1 + Math.floor(rnd() * 5);
  let fallenNacheinander = 0;
  while (stelle + 4 <= laenge) {
    const b = FUELLER[Math.floor(rnd() * FUELLER.length)];
    const falle = fallenNacheinander < 2 && rnd() < 0.5;
    let breite;
    if (!falle) {
      plan[stelle] = b; plan[stelle + 2] = b; ziel[stelle + 2] = true;
      breite = 3;
      fallenNacheinander = 0;
    } else if (rnd() < 0.5) {
      plan[stelle] = b; plan[stelle + 1] = b;   // Falle ohne Versatz
      breite = 2;
      fallenNacheinander += 1;
    } else {
      plan[stelle] = b; plan[stelle + 3] = b;   // Falle mit zwei dazwischen
      breite = 4;
      fallenNacheinander += 1;
    }
    stelle += breite + EREIGNIS_LUECKE_MIN
      + Math.floor(rnd() * (EREIGNIS_LUECKE_MAX - EREIGNIS_LUECKE_MIN + 1));
  }
  // Fülltakte von links nach rechts: nie gleich einem Nachbarn im
  // Drückabstand (eins oder zwei daneben), sonst entstünden ungeplante
  // Ziele. FUELLER hat 17 Buchstaben, es bleibt immer eine Wahl.
  for (let i = 0; i < laenge; i++) {
    if (plan[i] !== null) continue;
    const verboten = [plan[i - 2], plan[i - 1], plan[i + 1], plan[i + 2]];
    const erlaubt = FUELLER.filter((b) => !verboten.includes(b));
    plan[i] = erlaubt[Math.floor(rnd() * erlaubt.length)];
  }
  return plan.map((b, i) => ({ b, sla: ziel[i] }));
}

export function erzeugeSlaZaehler(reihe, fensterMs = BUCHSTABEN_ABSTAND_MS) {
  const offen = [];
  let erkannt = 0;
  let fehlalarm = 0;
  return {
    sprich(index, tMs) { if (reihe[index]?.sla) offen.push(tMs); },
    // Rückgabe true bei erkannter Doppelung, false bei Fehlalarm, damit die
    // Anzeige unmittelbar rückmelden kann. Das Fenster reicht von der
    // Ansage der Doppelung bis zur nächsten Ansage (fensterMs = Tempo).
    druck(tMs) {
      const i = offen.findIndex((t) => tMs >= t && tMs - t < fensterMs);
      if (i >= 0) { offen.splice(i, 1); erkannt += 1; return true; }
      fehlalarm += 1;
      return false;
    },
    // Meldet, wie viele Antwortfenster seit dem letzten Aufruf ungenutzt
    // abgelaufen sind (für die rote Rückmeldung der Übung). Abgelaufene
    // Fenster können ohnehin keinen Druck mehr annehmen.
    ablauf(tMs) {
      let neu = 0;
      for (let i = offen.length - 1; i >= 0; i--) {
        if (tMs - offen[i] >= fensterMs) { offen.splice(i, 1); neu += 1; }
      }
      return neu;
    },
    // Auswertung am Testende: verpasst sind alle geplanten Doppelungen ohne Druck.
    auswertung() {
      const geplant = reihe.filter((e) => e.sla).length;
      return { erkannt, verpasst: geplant - erkannt, fehlalarm };
    },
  };
}
