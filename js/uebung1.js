// Übungslogik Mission 1 (Flugzeugverfolgung): Nachbau des PMT aus dem ICA.
// Eigenflug: Stick rollt und nickt, Pedale gieren; das Zielflugzeug fliegt
// mit träger Zufallsdrift in einem Kegel voraus. Reine Logik ohne DOM und
// ohne three.js, Zufall und Zeitschritt sind einspeisbar (node --test).
// Die Drifthelfer sind bewusst eine Kopie aus uebung2.js; das gemeinsame
// Laufgerüst zieht die Sammel-Härtung später heraus.

export const TESTDAUERN = [3, 5, 10]; // Minuten
export const HALTEZEIT_MS = 1000;
// Deckungsradius = gezeichneter Kreis: 8.2 Prozent Bildbreite mal Radius
// 46/100 aus der SVG-Vorlage; gemessen an der Steuerkonsole im Video.
export const KREIS_R = 0.038;          // Anteil der Bildbreite
export const BILDVERHAELTNIS = 9 / 16; // Höhe zu Breite des Sichtfelds
export const MINDESTABSTAND = 0.18;    // Kreis springt nie näher ans Ziel
export const KEGEL = { xMin: 0.12, xMax: 0.88, yMin: 0.15, yMax: 0.85 };
export const MAXROLL = 1.0;            // rad, etwa 57 Grad

// Raten bei Vollausschlag (je Sekunde) und Driftstärken.
const RATE_NICK = 0.35;
const RATE_GIER = 0.4;
const ROLLRATE = 1.6;
const RUECKSTELL = 0.6;
const NICK_SICHT = 0.5;   // rad Blickneigung je Einheit Nickbewegung
const MAXNICK = 0.3;      // rad
const KOPPLUNG = 0.25;    // Kurvenzug bei vollem Rollen, Einheiten je Sekunde
const DRIFT_ZIEL = 0.06;
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

export function erzeugeLaufzustand(rnd = Math.random) {
  return {
    ziel: zufallsZiel(rnd),
    kreis: { x: 0.5, y: 0.5 }, // fest in der Bildmitte, wie das Visier im Original
    roll: 0,
    nick: 0,
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

  z.roll = begrenze(z.roll + (eingaben.stickX * ROLLRATE - z.roll * RUECKSTELL) * dt, -MAXROLL, MAXROLL);
  const nickBewegung = eingaben.stickY * RATE_NICK * dt;
  z.nick = begrenze(z.nick + nickBewegung * NICK_SICHT - z.nick * RUECKSTELL * dt, -MAXNICK, MAXNICK);
  const gierBewegung = (eingaben.ruder * RATE_GIER + Math.sin(z.roll) * KOPPLUNG) * dt;

  z.ziel.x = begrenze(z.ziel.x - gierBewegung + taktDrift(z.drift.zx, dtMs, rnd) * dt, KEGEL.xMin, KEGEL.xMax);
  z.ziel.y = begrenze(z.ziel.y + nickBewegung + taktDrift(z.drift.zy, dtMs, rnd) * dt, KEGEL.yMin, KEGEL.yMax);

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

// Buchstabenaufgabe aus Testphase 3 des Originals: fortlaufende Reihe,
// die Folge S-L-A wird mit der Schusstaste bestätigt. Das Alphabet der
// Fülltakte enthält weder S noch L noch A, darum entstehen nie ungeplante
// Folgen. Je Minute eine echte Folge und eine Falle S-L-x.
export const BUCHSTABEN_ABSTAND_MS = 2000;
export const SLA_FENSTER_MS = 2000;
const FUELLER = "BCDEFGHKMNPRTUWXZ".split("");

export function erzeugeBuchstabenreihe(dauerMin, rnd = Math.random) {
  const jeMinute = Math.floor(60_000 / BUCHSTABEN_ABSTAND_MS);
  const reihe = Array.from({ length: dauerMin * jeMinute }, () =>
    ({ b: FUELLER[Math.floor(rnd() * FUELLER.length)], sla: false }));
  for (let minute = 0; minute < dauerMin; minute++) {
    const von = minute * jeMinute;
    // Zwei getrennte Drittel der Minute, damit Folge und Falle nie überlappen.
    const folgeStart = von + 1 + Math.floor(rnd() * (jeMinute / 3 - 3));
    const falleStart = von + Math.floor(jeMinute / 2) + Math.floor(rnd() * (jeMinute / 3 - 3));
    reihe[folgeStart] = { b: "S", sla: false };
    reihe[folgeStart + 1] = { b: "L", sla: false };
    reihe[folgeStart + 2] = { b: "A", sla: true };
    reihe[falleStart] = { b: "S", sla: false };
    reihe[falleStart + 1] = { b: "L", sla: false };
    reihe[falleStart + 2] = { b: FUELLER[Math.floor(rnd() * FUELLER.length)], sla: false };
  }
  return reihe;
}

export function erzeugeSlaZaehler(reihe) {
  const offen = [];
  let erkannt = 0;
  let fehlalarm = 0;
  return {
    sprich(index, tMs) { if (reihe[index]?.sla) offen.push(tMs); },
    druck(tMs) {
      const i = offen.findIndex((t) => tMs >= t && tMs - t <= SLA_FENSTER_MS);
      if (i >= 0) { offen.splice(i, 1); erkannt += 1; } else { fehlalarm += 1; }
    },
    // Auswertung am Testende: verpasst sind alle geplanten Folgen ohne Druck.
    auswertung() {
      const geplant = reihe.filter((e) => e.sla).length;
      return { erkannt, verpasst: geplant - erkannt, fehlalarm };
    },
  };
}
