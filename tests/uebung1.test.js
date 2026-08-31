import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, HALTEZEIT_MS, KREIS_R, BILDVERHAELTNIS, MINDESTABSTAND, KEGEL, UMLAUF, MAXROLL, MAXNICK, TEMPOS, SICHTWINKEL, zielHinweis, PFEILRAND,
  wuerfleSprung, SPRUNGWEITE, trefferErfuellung, letterErfuellung, erfuellung1, TREFFER_BESTWERT,
  zufallsZiel, erzeugeLaufzustand, takt, inDeckung,
  deckungsquote, ergebnisWerte,
  BUCHSTABEN_ABSTAND_MS, EREIGNIS_LUECKE_MIN, EREIGNIS_LUECKE_MAX, erzeugeBuchstabenreihe, erzeugeSlaZaehler,
} from "../js/uebung1.js";

const still = { stickX: 0, stickY: 0, ruder: 0 };
// Fester Zufall: keine Drift (Zielwert 0 entsteht bei rnd()=0.5), planbare Sprünge.
const halb = () => 0.5;

const abstandFuerTest = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * BILDVERHAELTNIS);

test("Konstanten der Verfolgung", () => {
  assert.deepEqual(TESTDAUERN, [3, 5, 10]);
  assert.equal(HALTEZEIT_MS, 1000);
  assert.ok(KREIS_R > 0 && KREIS_R < 0.1);
  assert.equal(BILDVERHAELTNIS, 9 / 16);
});

test("zufallsZiel liegt im Kegel und nicht in der Mitte", () => {
  let rufe = 0;
  const rnd = () => [0.1, 0.9, 0.5, 0.2][rufe++ % 4];
  for (let i = 0; i < 50; i++) {
    const z = zufallsZiel(rnd);
    assert.ok(z.x >= KEGEL.xMin && z.x <= KEGEL.xMax);
    assert.ok(z.y >= KEGEL.yMin && z.y <= KEGEL.yMax);
    assert.ok(Math.hypot(z.x - 0.5, (z.y - 0.5) * BILDVERHAELTNIS) >= MINDESTABSTAND);
  }
});

test("Anfangszustand: Kreis mittig, Ziel im Kegel", () => {
  const z = erzeugeLaufzustand(halb);
  assert.deepEqual(z.kreis, { x: 0.5, y: 0.5 });
  assert.equal(z.roll, 0);
  assert.equal(z.treffer, 0);
  assert.ok(z.ziel.x >= KEGEL.xMin && z.ziel.x <= KEGEL.xMax);
});

test("Nicken verschiebt das Ziel senkrecht", () => {
  const z = erzeugeLaufzustand(halb);
  const vorher = z.ziel.y;
  takt(z, { ...still, stickY: 1 }, 100, halb);
  assert.ok(z.ziel.y > vorher);
});

test("Gieren verschiebt das Ziel waagerecht entgegen", () => {
  const z = erzeugeLaufzustand(halb);
  const vorher = z.ziel.x;
  takt(z, { ...still, ruder: 1 }, 100, halb);
  assert.ok(z.ziel.x < vorher);
});

test("Rollen baut sich auf, koppelt in die Kurve und bleibt begrenzt", () => {
  const z = erzeugeLaufzustand(halb);
  for (let i = 0; i < 100; i++) takt(z, { ...still, stickX: 1 }, 50, halb);
  assert.ok(z.roll > 0 && z.roll <= MAXROLL);
  z.ziel = { x: 0.6, y: 0.5 };  // frei von der Kegelgrenze, sonst klemmt der Vergleich
  takt(z, still, 100, halb);    // Rollage steht, Kurve zieht das Ziel zur Seite
  assert.ok(z.ziel.x < 0.6);
});

test("Das Ziel darf den Bildschirm verlassen, ohne je an einer Wand zu hängen", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.2 };
  // Anhaltender Sturzflug schiebt das Ziel über den oberen Bildrand hinaus;
  // gemessen mitten im Sturz, denn danach holt der Rückzug es wieder herein.
  for (let i = 0; i < 60; i++) takt(z, { ...still, stickY: -1 }, 50, halb);
  assert.ok(z.ziel.y < 0);
  for (let i = 0; i < 340; i++) takt(z, { ...still, stickY: -1 }, 50, halb);
  // Waagerecht ist die Welt rund: ziel.x bleibt im Umlauffenster um die
  // Bildmitte, senkrecht hält der Rückzug das Ziel in erreichbarer Nähe.
  for (let i = 0; i < 4000; i++) takt(z, { stickX: 1, stickY: 1, ruder: 1 }, 50, Math.random);
  assert.ok(Math.abs(z.ziel.x - 0.5) <= UMLAUF / 2 + 1e-9);
  assert.ok(z.ziel.y > -1 && z.ziel.y < 2.5);
  assert.ok(Math.abs(z.roll) <= MAXROLL);
});

test("Volle Eigendrehung bringt das Ziel von der anderen Seite herein", () => {
  const z = erzeugeLaufzustand(halb);
  // Ziel knapp vor der linken Umlaufkante: weiter nach rechts gieren
  // (Ziel wandert nach links) lässt es rechts wieder auftauchen.
  z.ziel = { x: 0.5 - UMLAUF / 2 + 0.01, y: 0.5 };
  takt(z, { ...still, ruder: 1 }, 200, halb);
  assert.ok(z.ziel.x > 0.5, `kam nicht herum: ${z.ziel.x}`);
});

test("Außerhalb des Bildes zieht das Ziel senkrecht sanft zurück", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 1.4 };
  const vorher = z.ziel.y;
  for (let i = 0; i < 20; i++) takt(z, still, 50, halb);
  assert.ok(z.ziel.y < vorher);          // es kommt zurück
  assert.ok(z.ziel.y > 1);               // aber nicht schlagartig
});

test("zielHinweis zeigt nur außerhalb des Bildes und klemmt an den Rand", () => {
  assert.equal(zielHinweis({ x: 0.5, y: 0.5 }), null);
  assert.equal(zielHinweis({ x: 0.02, y: 0.98 }), null);
  const links = zielHinweis({ x: -0.3, y: 0.4 });
  assert.deepEqual(links, { x: PFEILRAND, y: 0.4 });
  const oben = zielHinweis({ x: 0.7, y: -0.1 });
  assert.deepEqual(oben, { x: 0.7, y: PFEILRAND });
  const ecke = zielHinweis({ x: 1.4, y: 1.2 });
  assert.deepEqual(ecke, { x: 1 - PFEILRAND, y: 1 - PFEILRAND });
});

test("Am Nickanschlag schiebt der Stick das Ziel nicht weiter", () => {
  const z = erzeugeLaufzustand(halb);
  for (let i = 0; i < 400; i++) takt(z, { ...still, stickY: -1 }, 50, halb);
  assert.equal(z.nick, -MAXNICK);           // Nase steht am Anschlag
  z.ziel = { x: 0.5, y: 0.5 };              // frei von der Kegelgrenze
  takt(z, { ...still, stickY: -1 }, 100, halb);
  // Die Nase bewegt sich nicht mehr, also darf sich auch der Relativwinkel
  // zum Ziel nicht mehr ändern: keine unsichtbare Wand am Kegelrand.
  assert.ok(Math.abs(z.ziel.y - 0.5) < 1e-9);
});

test("Das Aufrichten der Eigenstabilität nimmt das Ziel mit", () => {
  const z = erzeugeLaufzustand(halb);
  for (let i = 0; i < 400; i++) takt(z, { ...still, stickY: -1 }, 50, halb);
  z.ziel = { x: 0.5, y: 0.5 };
  z.nickRate = 0;                           // Stick losgelassen, Rate schon abgeklungen
  const nickVorher = z.nick;
  takt(z, still, 100, halb);
  assert.ok(z.nick > nickVorher);           // Nase richtet sich langsam auf
  assert.ok(z.ziel.y > 0.5);                // und das Ziel wandert entsprechend
});

test("Gieren summiert den Kurs auf, entgegengesetzt zur Zielverschiebung", () => {
  const z = erzeugeLaufzustand(halb);
  assert.equal(z.kurs, 0);
  z.ziel = { x: 0.5, y: 0.5 };  // frei von der Kegelgrenze, sonst klemmt der Vergleich
  const vorher = z.ziel.x;
  takt(z, { ...still, ruder: 1 }, 100, halb);
  assert.ok(z.kurs > 0);
  // Ziel und Kulisse drehen aus derselben Gierbewegung: der Kurszuwachs ist
  // die Zielverschiebung, umgerechnet über das waagerechte Sichtfeld.
  assert.ok(Math.abs(z.kurs - (vorher - z.ziel.x) * SICHTWINKEL) < 1e-12);
});

test("Schräglage zieht den Kurs in die Kurve, Stillhalten dreht nicht weiter zurück", () => {
  const z = erzeugeLaufzustand(halb);
  for (let i = 0; i < 100; i++) takt(z, { ...still, stickX: 1 }, 50, halb);
  const stand = z.kurs;
  takt(z, still, 100, halb);   // Rollage steht, die Kurve dreht den Kurs weiter
  assert.ok(z.kurs > stand);
});

test("inDeckung misst den Winkelabstand mit Bildverhältnis", () => {
  const z = erzeugeLaufzustand(halb);
  z.kreis = { x: 0.5, y: 0.5 };
  z.ziel = { x: 0.5 + KREIS_R - 0.001, y: 0.5 };
  assert.equal(inDeckung(z), true);
  z.ziel = { x: 0.5 + KREIS_R + 0.001, y: 0.5 };
  assert.equal(inDeckung(z), false);
  // Senkrecht zählt der Abstand gestaucht: derselbe Versatz in y liegt noch drin.
  z.ziel = { x: 0.5, y: 0.5 + KREIS_R + 0.001 };
  assert.equal(inDeckung(z), true);
});

test("Eine Sekunde Deckung gibt den Treffer, der Blick springt statt des Flugzeugs", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.5 };   // direkt unter dem Kreis
  let ereignisse = [];
  for (let i = 0; i < 10; i++) ereignisse = ereignisse.concat(takt(z, still, 100, halb));
  assert.equal(z.treffer, 1);
  assert.deepEqual(ereignisse, [{ treffer: true }]);
  assert.equal(z.ersterTrefferMs, 1000);
  assert.equal(z.letzterTrefferMs, 1000);
  // Der Kreis bleibt fest in der Bildmitte, das Ziel springt im Umkreis um
  // seine alte Lage (halb würfelt Winkel Pi und mittlere Weite 0,375):
  // deutlich außerhalb der Deckung und noch im Bild.
  assert.deepEqual(z.kreis, { x: 0.5, y: 0.5 });
  assert.ok(Math.hypot(z.ziel.x - 0.5, z.ziel.y - 0.5) >= MINDESTABSTAND - 1e-9);
  assert.ok(z.ziel.x >= 0 && z.ziel.x <= 1 && z.ziel.y >= 0 && z.ziel.y <= 1);
  assert.ok(Math.abs(z.ziel.x - 0.125) < 1e-9);
  // Der Sprung kommt aus der eigenen Blickrichtung: Kurs und Neigung springen
  // passend zur Zielverschiebung mit.
  assert.ok(Math.abs(z.kurs - 0.375 * SICHTWINKEL) < 1e-9);
  assert.ok(Math.abs(z.nick) < 1e-9);
});

test("wuerfleSprung: Weite im Ring, alle Richtungen kommen vor", () => {
  const quadranten = new Set();
  for (let i = 0; i < 500; i++) {
    const s = wuerfleSprung(Math.random);
    const weite = Math.hypot(s.dx, s.dy);
    assert.ok(weite >= MINDESTABSTAND - 1e-9 && weite <= SPRUNGWEITE + 1e-9);
    quadranten.add(`${s.dx >= 0 ? "r" : "l"}${s.dy >= 0 ? "u" : "o"}`);
  }
  assert.equal(quadranten.size, 4);
});

test("Verlorene Deckung setzt die Haltezeit zurück", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.5 };
  takt(z, still, 600, halb);
  z.ziel = { x: 0.9, y: 0.5 };   // Deckung weg
  takt(z, still, 100, halb);
  assert.equal(z.halteMs, 0);
  z.ziel = { x: z.kreis.x, y: z.kreis.y };
  for (let i = 0; i < 9; i++) takt(z, still, 100, halb);
  assert.equal(z.treffer, 0);    // 900 ms reichen nicht
  takt(z, still, 100, halb);
  assert.equal(z.treffer, 1);
});

test("Deckungszeit summiert sich", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.5 };
  takt(z, still, 400, halb);
  assert.equal(z.deckungMs, 400);
});

test("zufallsZiel: Schleifenwächter greift bei sturem Zufall", () => {
  const stur = () => 0.5;        // träfe immer die Bildmitte
  const zNeu = zufallsZiel(stur);
  assert.ok(abstandFuerTest(zNeu, { x: 0.5, y: 0.5 }) >= MINDESTABSTAND);
});

test("Deckungsquote in Prozent", () => {
  const z = erzeugeLaufzustand(halb);
  z.testMs = 60_000;
  z.deckungMs = 21_000;
  assert.equal(deckungsquote(z), 35);
  assert.equal(deckungsquote(erzeugeLaufzustand(halb)), 0); // ohne Laufzeit
});

test("Ergebniswerte: Zeiten in Sekunden mit einer Nachkommastelle", () => {
  const z = erzeugeLaufzustand(halb);
  z.testMs = 120_000;
  z.deckungMs = 30_000;
  z.treffer = 4;
  z.ersterTrefferMs = 8_460;
  z.letzterTrefferMs = 100_000;
  assert.deepEqual(ergebnisWerte(z), {
    treffer: 4, deckungsquote: 25, ersterTrefferS: 8.5, mittelS: 25,
  });
});

test("Ergebniswerte ohne Treffer bleiben leer", () => {
  const z = erzeugeLaufzustand(halb);
  z.testMs = 60_000;
  const w = ergebnisWerte(z);
  assert.equal(w.ersterTrefferS, null);
  assert.equal(w.mittelS, null);
});

test("Buchstabenreihe: Doppelungen zufällig, aber verlässlich wiederkehrend", () => {
  const reihe = erzeugeBuchstabenreihe(5, Math.random);
  assert.equal(reihe.length, Math.floor(5 * 60_000 / BUCHSTABEN_ABSTAND_MS));
  const text = reihe.map((e) => e.b).join("");
  // Jede markierte Stelle ist die zweite Hälfte einer versetzten Doppelung
  // (K, F, K), und jede Wiederholung im Drückabstand ist auch markiert:
  // ungeplante Ziele gibt es nicht.
  const ziele = [];
  for (let i = 0; i < reihe.length; i++) {
    if (reihe[i].sla) {
      ziele.push(i);
      assert.equal(text[i], text[i - 2]);
      assert.notEqual(text[i], text[i - 1]);
    }
    if (i >= 2) assert.equal(text[i] === text[i - 2], reihe[i].sla);
    if (i < 2) assert.equal(reihe[i].sla, false);
  }
  assert.ok(ziele.length >= 2);
  // Verlässlich wiederkehrend: zwischen zwei echten Doppelungen liegen
  // höchstens zwei Fallen samt Lücken (Fallenbreite bis 4, Lücke bis 20).
  for (let i = 1; i < ziele.length; i++) {
    assert.ok(ziele[i] - ziele[i - 1] <= 3 * (4 + EREIGNIS_LUECKE_MAX) + 3);
  }
  // Beinahe-Fallen (ohne Versatz oder mit zwei dazwischen) kommen vor.
  let fallen = 0;
  for (let i = 1; i < text.length; i++) {
    if (text[i] === text[i - 1]) fallen += 1;
    if (i >= 3 && text[i] === text[i - 3]) fallen += 1;
  }
  assert.ok(fallen >= 1);
});

test("Buchstabenreihe ist mit gleichem Zufall gleich", () => {
  const zaehler = () => { let n = 0; return () => (Math.sin(n++) + 1) / 2; };
  const a = erzeugeBuchstabenreihe(3, zaehler());
  const b = erzeugeBuchstabenreihe(3, zaehler());
  assert.deepEqual(a, b);
});

test("Zähler: erkannt, Fehlalarm und verpasst", () => {
  const reihe = [
    { b: "K", sla: false }, { b: "F", sla: false }, { b: "K", sla: true },
    { b: "B", sla: false },
    { b: "N", sla: false }, { b: "U", sla: false }, { b: "N", sla: true },
  ];
  const z = erzeugeSlaZaehler(reihe, 2000);
  z.sprich(0, 0); z.sprich(1, 2000); z.sprich(2, 4000);
  z.druck(5000);                      // vor der nächsten Ansage: erkannt
  z.druck(5500);                      // Fenster verbraucht: Fehlalarm
  z.sprich(3, 6000);
  z.druck(9000);                      // keine offene Doppelung: Fehlalarm
  z.sprich(4, 8000); z.sprich(5, 10000); z.sprich(6, 12000); // zweite Doppelung ohne Druck
  assert.deepEqual(z.auswertung(), { erkannt: 1, verpasst: 1, fehlalarm: 2 });
});

test("Tempostufen der Buchstabenreihe", () => {
  assert.deepEqual(TEMPOS, [2500, 2000, 1500, 1000]);
});

test("Buchstabenreihe folgt dem gewählten Tempo", () => {
  const schnell = erzeugeBuchstabenreihe(2, Math.random, 1000);
  assert.equal(schnell.length, Math.floor(2 * 60_000 / 1000));
  assert.ok(schnell.filter((e) => e.sla).length >= 1);
});

test("Zähler meldet Treffer, Fehlalarm und Fensterablauf als Ereignis", () => {
  const reihe = [
    { b: "K", sla: false }, { b: "F", sla: false }, { b: "K", sla: true },
    { b: "N", sla: false }, { b: "U", sla: false }, { b: "N", sla: true },
  ];
  const z = erzeugeSlaZaehler(reihe, 2000);
  z.sprich(2, 4000);
  assert.equal(z.druck(5000), true);   // vor der nächsten Ansage: erkannt
  assert.equal(z.druck(5500), false);  // Fenster verbraucht: Fehlalarm
  z.sprich(5, 10000);
  assert.equal(z.ablauf(11900), 0);    // das Fenster läuft bis zur nächsten Ansage
  assert.equal(z.ablauf(12000), 1);    // mit ihr ungenutzt abgelaufen
  assert.equal(z.ablauf(14000), 0);    // wird nur einmal gemeldet
  assert.deepEqual(z.auswertung(), { erkannt: 1, verpasst: 1, fehlalarm: 1 });
});

test("Antwortfenster endet mit der nächsten Ansage, auch bei schnellem Tempo", () => {
  const reihe = [{ b: "K", sla: false }, { b: "F", sla: false }, { b: "K", sla: true }];
  const z = erzeugeSlaZaehler(reihe, 1000);
  z.sprich(2, 4000);
  assert.equal(z.druck(5000), false);  // die nächste Ansage läuft schon: Fehlalarm
  const z2 = erzeugeSlaZaehler(reihe, 1000);
  z2.sprich(2, 4000);
  assert.equal(z2.druck(4900), true);  // knapp davor: erkannt
});

test("Erfüllung Mission 1: Abschüsse je Minute am Bestwert gemessen, Buchstaben fließen ein", () => {
  // Willis Festlegung vom 31.08.2026: Es zählt, wie oft das Flugzeug
  // abgeschossen wurde; 5 je Minute sind die vollen 100. Mit Letter-Task
  // 70/30, jeder Fehlalarm kostet 15 Punkte.
  assert.equal(TREFFER_BESTWERT, 5);
  assert.equal(trefferErfuellung(15, 3), 100);
  assert.equal(trefferErfuellung(99, 3), 100);                // Deckel
  assert.ok(Math.abs(trefferErfuellung(6, 3) - 40) < 1e-9);
  assert.equal(trefferErfuellung(0, 3), 0);
  assert.equal(trefferErfuellung(5, 0), 0);                   // ohne Dauer keine Wertung
  assert.equal(letterErfuellung({ erkannt: 4, verpasst: 0, fehlalarm: 0 }), 100);
  assert.equal(letterErfuellung({ erkannt: 3, verpasst: 1, fehlalarm: 0 }), 75);
  assert.equal(letterErfuellung({ erkannt: 4, verpasst: 0, fehlalarm: 2 }), 70);
  assert.equal(letterErfuellung({ erkannt: 0, verpasst: 0, fehlalarm: 8 }), 0); // nie unter 0
  // Ohne Letter-Task zählen nur die Abschüsse, mit ihr die 70/30-Mischung.
  assert.equal(erfuellung1(15, 3, null), 100);
  assert.ok(Math.abs(erfuellung1(15, 3, { erkannt: 1, verpasst: 1, fehlalarm: 0 }) - (0.7 * 100 + 0.3 * 50)) < 1e-9);
});
