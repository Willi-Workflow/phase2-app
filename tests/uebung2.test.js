import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, ELEMENTE, HALTEZEIT_MS, NADEL_MIN, NADEL_MAX,
  ZIELKREIS_R, STRICH_TOLERANZ, SOLL_KT, FADEN_RAND,
  erzeugeLaufzustand, takt, zufallsFadenkreuz, zufallsStrich,
  inDeckung, punkte, pruefeAuswahl, zufallsNadel, deckungsquote, erfuellung2,
} from "../js/uebung2.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const ALLE = ["stick", "ruder", "schub"];
const RUHE = { stickX: 0, stickY: 0, ruder: 0, schub: 0 };

test("Rahmenwerte des Nachbaus", () => {
  assert.deepEqual(TESTDAUERN, [5, 10, 30]);
  assert.deepEqual(ELEMENTE, ["stick", "ruder", "schub"]);
  assert.equal(HALTEZEIT_MS, 1000);
  assert.equal(NADEL_MIN, 40);
  assert.equal(NADEL_MAX, 160);
  assert.equal(SOLL_KT, 95);
});

test("takt: Stickrate läuft an statt sofort voll anzuliegen", () => {
  // Willis Rückmeldung vom 01.09.2026 ("zu direkt, gerade bei Mission 2"):
  // Die Sollrate baut sich wie in Mission 1 über die Anlaufzeit auf. Seit
  // dem 14.09.2026 wirkt ohnehin nur noch die Eingabe, kein Gegensteuern.
  const rnd = saatZufall(7);
  const z = erzeugeLaufzustand(ALLE, rnd);
  z.fadenkreuz = { x: 0.5, y: 0.5 };
  takt(z, { ...RUHE, stickX: 1 }, 50, rnd);
  const erster = z.fadenkreuz.x - 0.5;
  assert.ok(erster > 0 && erster < 0.015); // ein Drittel der vollen Rate
  for (let i = 0; i < 100; i++) takt(z, { ...RUHE, stickX: 1 }, 50, rnd);
  z.fadenkreuz.x = 0.5; // von der Randbegrenzung lösen
  takt(z, { ...RUHE, stickX: 1 }, 50, rnd);
  const voll = z.fadenkreuz.x - 0.5;
  assert.ok(voll > 0.025); // volle Rate: 0,56 je Sekunde mal 0,05 s

  // Nachschwenken (Willis Videobefund vom 01.09.2026): Nach dem Loslassen
  // trägt das Fadenkreuz Restschwung und läuft spürbar weiter, statt sofort
  // zu stehen. Eine halbe Sekunde Auslauf muss deutlich Weg machen.
  z.fadenkreuz.x = 0.5;
  for (let i = 0; i < 10; i++) takt(z, RUHE, 50, rnd);
  const auslauf = z.fadenkreuz.x - 0.5;
  assert.ok(auslauf > 0.05, `Auslauf ${auslauf} zu kurz`);
});

test("erzeugeLaufzustand: Startlage gültig und außerhalb der Deckung", () => {
  const rnd = saatZufall(7);
  for (let i = 0; i < 50; i++) {
    const z = erzeugeLaufzustand(ALLE, rnd);
    assert.ok(z.fadenkreuz.x >= 0 && z.fadenkreuz.x <= 1);
    assert.ok(z.fadenkreuz.y >= 0 && z.fadenkreuz.y <= 1);
    assert.ok(Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) > ZIELKREIS_R * 3);
    assert.ok(Math.abs(z.strich.x - 0.5) > STRICH_TOLERANZ * 3);
    assert.equal(z.soll, 95);
    assert.ok(Math.abs(z.nadel - 95) >= 20);
    assert.ok(z.nadel >= NADEL_MIN && z.nadel <= NADEL_MAX && z.nadel % 5 === 0);
  }
});

test("takt: Stickauslenkung bewegt das Fadenkreuz mit begrenzter Rate", () => {
  const rnd = saatZufall(11);
  const z = erzeugeLaufzustand(ALLE, rnd);
  const vorher = { ...z.fadenkreuz };
  takt(z, { ...RUHE, stickX: 1 }, 100, rnd);
  assert.ok(z.fadenkreuz.x > vorher.x);
  assert.ok(z.fadenkreuz.x - vorher.x < 0.1);
});

test("takt: Diagonaleingabe bewegt nur die dominante Achse", () => {
  // Willis Auftrag vom 14.09.2026: keine Diagonalen mehr. Die schwächer
  // ausgelenkte Achse bekommt die Eingabe 0 und steht in diesem Takt still.
  const rnd = saatZufall(5);
  const waagerecht = erzeugeLaufzustand(["stick"], rnd);
  waagerecht.fadenkreuz = { x: 0.5, y: 0.5 };
  for (let i = 0; i < 10; i++) takt(waagerecht, { ...RUHE, stickX: 0.8, stickY: 0.3 }, 50, rnd);
  assert.ok(waagerecht.fadenkreuz.x > 0.5);
  assert.equal(waagerecht.fadenkreuz.y, 0.5);

  const senkrecht = erzeugeLaufzustand(["stick"], rnd);
  senkrecht.fadenkreuz = { x: 0.5, y: 0.5 };
  for (let i = 0; i < 10; i++) takt(senkrecht, { ...RUHE, stickX: 0.3, stickY: 0.8 }, 50, rnd);
  assert.equal(senkrecht.fadenkreuz.x, 0.5);
  assert.ok(senkrecht.fadenkreuz.y < 0.5); // invertiert: ziehen lässt es steigen

  // Dieselbe Rastung im negativen Viertel: Die Führung hängt am Betrag, das
  // Vorzeichen geht ungekürzt in die geführte Achse.
  const linksHoch = erzeugeLaufzustand(["stick"], rnd);
  linksHoch.fadenkreuz = { x: 0.5, y: 0.5 };
  for (let i = 0; i < 10; i++) takt(linksHoch, { ...RUHE, stickX: -0.8, stickY: -0.3 }, 50, rnd);
  assert.ok(linksHoch.fadenkreuz.x < 0.5);
  assert.equal(linksHoch.fadenkreuz.y, 0.5);

  const gedrueckt = erzeugeLaufzustand(["stick"], rnd);
  gedrueckt.fadenkreuz = { x: 0.5, y: 0.5 };
  for (let i = 0; i < 10; i++) takt(gedrueckt, { ...RUHE, stickX: -0.3, stickY: -0.8 }, 50, rnd);
  assert.equal(gedrueckt.fadenkreuz.x, 0.5);
  assert.ok(gedrueckt.fadenkreuz.y > 0.5); // invertiert: drücken lässt es sinken

  // Gleichstand ist deterministisch geregelt: Er geht an die Waagerechte.
  const gleich = erzeugeLaufzustand(["stick"], rnd);
  gleich.fadenkreuz = { x: 0.5, y: 0.5 };
  takt(gleich, { ...RUHE, stickX: 0.5, stickY: 0.5 }, 50, rnd);
  assert.ok(gleich.fadenkreuz.x > 0.5);
  assert.equal(gleich.fadenkreuz.y, 0.5);

  // Gleichstand auch im negativen Viertel, damit der Betragsvergleich nicht
  // am Vorzeichen kippt.
  const gleichNegativ = erzeugeLaufzustand(["stick"], rnd);
  gleichNegativ.fadenkreuz = { x: 0.5, y: 0.5 };
  takt(gleichNegativ, { ...RUHE, stickX: -0.5, stickY: -0.5 }, 50, rnd);
  assert.ok(gleichNegativ.fadenkreuz.x < 0.5);
  assert.equal(gleichNegativ.fadenkreuz.y, 0.5);
});

test("takt: die Führung hält gegen Handzittern, wechselt aber auf Ansage", () => {
  // Prüferbefund vom 14.09.2026: Ohne Haltewirkung kippte die Führung bei
  // schräg gehaltenem Stick durch das normale Handzittern mehrmals je
  // Sekunde, und weil die unterlegene Achse ausläuft, trugen beide Achsen
  // dauerhaft eine Rate. Genau das ist die Diagonale, die weg sollte.
  const z = erzeugeLaufzustand(["stick"], saatZufall(7));
  let beideAktiv = 0;
  for (let i = 0; i < 300; i++) {
    const zittern = 0.015 * Math.sin(i * 0.9); // rund 2,5 Hz, lebensechte Amplitude
    takt(z, { stickX: 0.6 + zittern, stickY: 0.6 - zittern, ruder: 0, schub: 0 }, 16.7, saatZufall(3));
    if (Math.abs(z.rate.fx) > 1e-9 && Math.abs(z.rate.fy) > 1e-9) beideAktiv++;
  }
  assert.equal(beideAktiv, 0, "bei Handzittern am Gleichstand entsteht wieder eine Diagonale");

  // Ein gewollter Richtungswechsel führt den Stick weit über den Vorsprung
  // hinaus und muss die Führung weiterhin übernehmen.
  const w = erzeugeLaufzustand(["stick"], saatZufall(9));
  for (let i = 0; i < 30; i++) takt(w, { stickX: 0.9, stickY: 0, ruder: 0, schub: 0 }, 16.7, saatZufall(3));
  assert.equal(w.fuehrung, "quer");
  for (let i = 0; i < 30; i++) takt(w, { stickX: 0, stickY: 0.9, ruder: 0, schub: 0 }, 16.7, saatZufall(3));
  assert.equal(w.fuehrung, "laengs");
});

test("takt: beim Führungswechsel steht die alte Achse sofort still", () => {
  // Willis Auftrag vom 17.09.2026: Das Fadenkreuz soll sich nur waagerecht
  // oder senkrecht bewegen. Die erste Fassung vom 14.09. nullte nur die
  // Eingabe und ließ die Rate auslaufen; beim Wechsel trugen dadurch rund
  // eine Sekunde lang beide Achsen eine Rate und das Fadenkreuz beschrieb
  // einen Bogen. Jetzt steht die unterlegene Achse sofort.
  const rnd = saatZufall(59);
  const z = erzeugeLaufzustand(["stick"], rnd);
  z.fadenkreuz = { x: 0.5, y: 0.5 };
  for (let i = 0; i < 20; i++) takt(z, { ...RUHE, stickY: 1 }, 50, rnd);
  const vorWechsel = { x: z.fadenkreuz.x, y: z.fadenkreuz.y };
  assert.ok(vorWechsel.y < 0.5, "die senkrechte Achse hat nicht gezogen");
  takt(z, { ...RUHE, stickX: 1, stickY: 0.2 }, 50, rnd);
  assert.equal(z.fadenkreuz.y, vorWechsel.y, "die senkrechte Achse läuft noch aus");
  assert.ok(z.fadenkreuz.x > vorWechsel.x, "die neue Führungsachse zieht nicht an");
  assert.equal(z.rate.fy, 0);
});

test("takt: das Fadenkreuz bewegt sich nie auf beiden Achsen zugleich", () => {
  // Gegenprobe über einen langen Flug mit wandernder Diagonaleingabe: In
  // keinem Takt darf sich sowohl x als auch y ändern.
  const rnd = saatZufall(17);
  const z = erzeugeLaufzustand(["stick"], rnd);
  let schraeg = 0;
  for (let i = 0; i < 3000; i++) {
    const vorher = { x: z.fadenkreuz.x, y: z.fadenkreuz.y };
    takt(z, { ...RUHE, stickX: Math.sin(i / 37), stickY: Math.cos(i / 23) }, 16.7, rnd);
    if (z.fadenkreuz.x !== vorher.x && z.fadenkreuz.y !== vorher.y) schraeg++;
  }
  assert.equal(schraeg, 0, "das Fadenkreuz bewegte sich schräg");
});

test("takt: die Hochachse ist invertiert, ziehen lässt das Fadenkreuz steigen", () => {
  // Willis Auftrag vom 14.09.2026, Richtung wie im Simulator. Im Bild wächst
  // y nach unten, Steigen heißt also kleineres y.
  const rnd = saatZufall(53);
  const ziehen = erzeugeLaufzustand(["stick"], rnd);
  ziehen.fadenkreuz = { x: 0.5, y: 0.5 };
  takt(ziehen, { ...RUHE, stickY: 1 }, 50, rnd);
  assert.ok(ziehen.fadenkreuz.y < 0.5, "ziehen muss das Fadenkreuz steigen lassen");

  const druecken = erzeugeLaufzustand(["stick"], rnd);
  druecken.fadenkreuz = { x: 0.5, y: 0.5 };
  takt(druecken, { ...RUHE, stickY: -1 }, 50, rnd);
  assert.ok(druecken.fadenkreuz.y > 0.5, "drücken muss das Fadenkreuz sinken lassen");

  // Waagerechte, Ruder und Schub behalten ihre bisherige Richtung.
  const uebrige = erzeugeLaufzustand(ALLE, rnd);
  uebrige.fadenkreuz = { x: 0.5, y: 0.5 };
  uebrige.strich.x = 0.5;
  uebrige.nadel = 100;
  takt(uebrige, { stickX: 1, stickY: 0, ruder: 1, schub: 1 }, 50, rnd);
  assert.ok(uebrige.fadenkreuz.x > 0.5);
  assert.ok(uebrige.strich.x > 0.5);
  assert.ok(uebrige.nadel > 100);
});

test("takt: Grenzen halten alle Elemente im erlaubten Bereich", () => {
  // Seit der Achsenrastung vom 14.09.2026 fährt der Stick die beiden Achsen
  // nacheinander an die Grenze, eine diagonale Eingabe bewegt nur noch eine.
  const rnd = saatZufall(13);
  const z = erzeugeLaufzustand(ALLE, rnd);
  for (let i = 0; i < 200; i++) takt(z, { stickX: 1, stickY: 0, ruder: 1, schub: 1 }, 50, rnd);
  for (let i = 0; i < 200; i++) takt(z, { stickX: 0, stickY: -1, ruder: 1, schub: 1 }, 50, rnd);
  // Das Fadenkreuz bleibt innerhalb des Randabstands, nie am Bildrand.
  // Senkrecht drücken (negativer Wert) lässt es sinken, also y wachsen.
  assert.ok(z.fadenkreuz.x <= 1 - FADEN_RAND && z.fadenkreuz.y <= 1 - FADEN_RAND);
  assert.ok(z.strich.x <= 1);
  assert.ok(z.nadel <= NADEL_MAX);
  for (let i = 0; i < 400; i++) takt(z, { stickX: -1, stickY: 0, ruder: -1, schub: -1 }, 50, rnd);
  for (let i = 0; i < 400; i++) takt(z, { stickX: 0, stickY: 1, ruder: -1, schub: -1 }, 50, rnd);
  assert.ok(z.fadenkreuz.x >= FADEN_RAND && z.fadenkreuz.y >= FADEN_RAND);
  assert.ok(z.strich.x >= 0);
  assert.ok(z.nadel >= NADEL_MIN);
});

test("takt: ohne Eingabe bewegt sich nichts, es gibt kein Gegensteuern mehr", () => {
  // Willis Auftrag vom 14.09.2026: Die Drift ist raus, nicht auf 0 gesetzt.
  // Zwanzig Sekunden Ruhe dürfen keinen einzigen Schritt Weg erzeugen, in
  // keiner Richtung und bei keinem der drei Steuerelemente.
  const rnd = saatZufall(17);
  const z = erzeugeLaufzustand(ALLE, rnd);
  const start = { x: z.fadenkreuz.x, y: z.fadenkreuz.y, strich: z.strich.x, nadel: z.nadel };
  for (let i = 0; i < 400; i++) takt(z, RUHE, 50, rnd);
  assert.equal(z.fadenkreuz.x, start.x);
  assert.equal(z.fadenkreuz.y, start.y);
  assert.equal(z.strich.x, start.strich);
  assert.equal(z.nadel, start.nadel);
  assert.equal(z.treffer.stick + z.treffer.ruder + z.treffer.schub, 0);
  assert.equal(z.deckungMs.stick + z.deckungMs.ruder + z.deckungMs.schub, 0);
  assert.equal(z.drift, undefined); // das Feld ist aus dem Laufzustand entfernt
});

test("takt: eine in Deckung gelegte Nadel bleibt ohne Eingabe in Deckung", () => {
  // Gegenprobe zum Gegensteuern: Früher schob die Drift die Nadel wieder
  // heraus, jetzt hält sie von selbst und der Treffer fällt nach der
  // Haltezeit ohne weiteres Zutun.
  const rnd = saatZufall(61);
  const z = erzeugeLaufzustand(["schub"], rnd);
  z.nadel = z.soll;
  let ereignisse = [];
  for (let i = 0; i < 20; i++) ereignisse = takt(z, RUHE, 50, rnd);
  assert.deepEqual(ereignisse, [{ element: "schub", kombi: false }]);
  assert.equal(z.deckungMs.schub, 1000);
});

test("takt: nicht gewählte Elemente bleiben unbewegt", () => {
  const rnd = saatZufall(19);
  const z = erzeugeLaufzustand(["stick"], rnd);
  const strichVorher = z.strich.x;
  const nadelVorher = z.nadel;
  for (let i = 0; i < 100; i++) takt(z, { ...RUHE, ruder: 1, schub: 1 }, 50, rnd);
  assert.equal(z.strich.x, strichVorher);
  assert.equal(z.nadel, nadelVorher);
});

test("takt: gleichzeitige Treffer im selben Takt zählen beide als Kombitreffer", () => {
  const rnd = saatZufall(41);
  const z = erzeugeLaufzustand(["stick", "ruder"], rnd);
  let ereignisse = [];
  for (let i = 0; i < 30 && ereignisse.length === 0; i++) {
    z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5;
    z.strich.x = 0.5;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  assert.equal(ereignisse.length, 2);
  assert.ok(ereignisse.every((e) => e.kombi === true));
  assert.equal(z.kombitreffer, 2);
});

test("Neusetzung: liefert auch bei entartetem Zufall eine gültige Lage", () => {
  const fest = () => 0.5;
  const p = zufallsFadenkreuz(fest);
  assert.deepEqual(p, { x: 0.15, y: 0.15 });
  const s = zufallsStrich(fest);
  assert.deepEqual(s, { x: 0.2 });
});

function halteInDeckung(z, element, rnd) {
  // Setzt das Element in Deckung und hält es rechnerisch eine Sekunde. Die
  // Deckung wird vor jedem Takt erneuert, damit der Nachschwung der Rate die
  // Probe nicht stört (Gegensteuern gibt es seit 14.09.2026 keines mehr).
  let ereignisse = [];
  for (let i = 0; i < 20 && ereignisse.length === 0; i++) {
    if (element === "stick") { z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5; }
    if (element === "ruder") z.strich.x = 0.5;
    if (element === "schub") z.nadel = z.soll;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  return ereignisse;
}

test("takt: eine Sekunde Deckung gibt einen Treffer und setzt neu", () => {
  const rnd = saatZufall(23);
  const z = erzeugeLaufzustand(["stick"], rnd);
  const ereignisse = halteInDeckung(z, "stick", rnd);
  assert.deepEqual(ereignisse, [{ element: "stick", kombi: false }]);
  assert.equal(z.treffer.stick, 1);
  assert.equal(z.kombitreffer, 0);
  assert.ok(Math.hypot(z.fadenkreuz.x - 0.5, z.fadenkreuz.y - 0.5) >= 0.25);
});

test("takt: unterbrochene Deckung setzt die Haltezeit zurück", () => {
  const rnd = saatZufall(29);
  const z = erzeugeLaufzustand(["ruder"], rnd);
  z.strich.x = 0.5;
  takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 600, rnd);
  z.strich.x = 0.9; // Deckung verlassen
  takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  assert.equal(z.halte.ruder, 0);
  assert.equal(z.treffer.ruder, 0);
});

test("takt: Kombitreffer nur, wenn die übrigen gewählten Elemente in Deckung stehen", () => {
  const rnd = saatZufall(31);
  const z = erzeugeLaufzustand(["stick", "schub"], rnd);
  z.nadel = z.soll; // Schub in Deckung
  z.halte.schub = 0;
  let ereignisse = [];
  for (let i = 0; i < 20 && ereignisse.length === 0; i++) {
    z.fadenkreuz.x = 0.5; z.fadenkreuz.y = 0.5;
    z.nadel = z.soll;
    ereignisse = takt(z, { stickX: 0, stickY: 0, ruder: 0, schub: 0 }, 50, rnd);
  }
  const stickEreignis = ereignisse.find((e) => e.element === "stick");
  assert.ok(stickEreignis);
  assert.equal(stickEreignis.kombi, true);
  assert.ok(z.kombitreffer >= 1);
});

test("zufallsNadel: Fünferraster, in den Grenzen, mindestens 20 Knoten vom Sollwert", () => {
  const rnd = saatZufall(37);
  for (let i = 0; i < 100; i++) {
    const kt = zufallsNadel(rnd);
    assert.ok(kt >= NADEL_MIN && kt <= NADEL_MAX);
    assert.equal(kt % 5, 0);
    assert.ok(Math.abs(kt - SOLL_KT) >= 20);
  }
});

test("punkte: Treffer je Minute, Kombitreffer doppelt", () => {
  const z = { treffer: { stick: 10, ruder: 6, schub: 4 }, kombitreffer: 5 };
  assert.equal(punkte(z, 5), 6);   // (20 + 10) / 5
  assert.equal(punkte(z, 10), 3);  // (20 + 10) / 10
  assert.equal(punkte(z, 0), 0);
});

test("pruefeAuswahl: mindestens ein gültiges Element", () => {
  assert.ok(pruefeAuswahl(["stick"]));
  assert.ok(pruefeAuswahl(["stick", "ruder", "schub"]));
  assert.ok(!pruefeAuswahl([]));
  assert.ok(!pruefeAuswahl(["quatsch"]));
});

test("inDeckung: senkrechter Rand des Zielkreises zählt wie der sichtbare Kreis", () => {
  const rnd = saatZufall(43);
  const z = erzeugeLaufzustand(["stick"], rnd);
  z.fadenkreuz = { x: 0.5, y: 0.5 + 0.038 };
  assert.ok(inDeckung(z, "stick"));
  z.fadenkreuz = { x: 0.5 + 0.038, y: 0.5 };
  assert.ok(!inDeckung(z, "stick"));
});

test("deckungsquote: Anteil der Testzeit in Deckung, gemittelt", () => {
  const z = { auswahl: ["stick", "ruder"], testMs: 10000, deckungMs: { stick: 5000, ruder: 2500, schub: 0 } };
  assert.equal(deckungsquote(z), 38);
  assert.equal(deckungsquote({ auswahl: ["stick"], testMs: 0, deckungMs: { stick: 0, ruder: 0, schub: 0 } }), 0);
});

test("takt: sammelt Deckungszeit und Testzeit", () => {
  const rnd = saatZufall(47);
  const z = erzeugeLaufzustand(["ruder"], rnd);
  z.strich.x = 0.5;
  takt(z, RUHE, 300, rnd);
  assert.equal(z.testMs, 300);
  assert.equal(z.deckungMs.ruder, 300);
  z.strich.x = 0.9;
  takt(z, RUHE, 100, rnd);
  assert.equal(z.testMs, 400);
  assert.equal(z.deckungMs.ruder, 300);
});

test("Erfüllung Mission 2: Erledigungen je Element am eigenen Bestwert, gemittelt", () => {
  // Willis Auftrag vom 07.09.2026 (Muster Mission 1), Bestwerte je Element
  // datengeleitet verschieden: Stick 7, Ruder 4, Schub 4 je Minute.
  const z = (auswahl, treffer) => ({ auswahl, treffer });
  // Stick am Bestwert: 7 je Minute -> 100.
  assert.equal(erfuellung2(z(["stick"], { stick: 35, ruder: 0, schub: 0 }), 5), 100);
  // Halber Bestwert -> 50, auch beim Ruder mit seinem eigenen Bestwert.
  assert.ok(Math.abs(erfuellung2(z(["stick"], { stick: 17.5, ruder: 0, schub: 0 }), 5) - 50) < 1e-9);
  assert.ok(Math.abs(erfuellung2(z(["ruder"], { stick: 0, ruder: 10, schub: 0 }), 5) - 50) < 1e-9);
  // Deckel je Element: Überschuss beim Stick gleicht fehlendes Ruder nicht aus.
  assert.equal(erfuellung2(z(["stick", "ruder"], { stick: 99, ruder: 0, schub: 0 }), 5), 50);
  // Drei Elemente je am Bestwert -> 100.
  assert.equal(erfuellung2(z(["stick", "ruder", "schub"], { stick: 35, ruder: 20, schub: 20 }), 5), 100);
  // Ohne Dauer oder ohne Auswahl 0.
  assert.equal(erfuellung2(z(["stick"], { stick: 35, ruder: 0, schub: 0 }), 0), 0);
  assert.equal(erfuellung2(z([], { stick: 35, ruder: 0, schub: 0 }), 5), 0);
});
