import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TESTDAUERN, HALTEZEIT_MS, KREIS_R, BILDVERHAELTNIS, MINDESTABSTAND, KEGEL, MAXROLL, TEMPOS,
  zufallsZiel, erzeugeLaufzustand, takt, inDeckung,
  deckungsquote, ergebnisWerte,
  BUCHSTABEN_ABSTAND_MS, SLA_FENSTER_MS, EREIGNIS_LUECKE_MIN, EREIGNIS_LUECKE_MAX, erzeugeBuchstabenreihe, erzeugeSlaZaehler,
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

test("Ziel bleibt auch bei langem Vollausschlag im Kegel", () => {
  const z = erzeugeLaufzustand(halb);
  for (let i = 0; i < 2000; i++) takt(z, { stickX: 1, stickY: 1, ruder: 1 }, 50, Math.random);
  assert.ok(z.ziel.x >= KEGEL.xMin && z.ziel.x <= KEGEL.xMax);
  assert.ok(z.ziel.y >= KEGEL.yMin && z.ziel.y <= KEGEL.yMax);
  assert.ok(Math.abs(z.roll) <= MAXROLL);
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

test("Eine Sekunde Deckung gibt den Treffer, das Flugzeug springt", () => {
  const z = erzeugeLaufzustand(halb);
  z.ziel = { x: 0.5, y: 0.5 };   // direkt unter dem Kreis
  let ereignisse = [];
  for (let i = 0; i < 10; i++) ereignisse = ereignisse.concat(takt(z, still, 100, halb));
  assert.equal(z.treffer, 1);
  assert.deepEqual(ereignisse, [{ treffer: true }]);
  assert.equal(z.ersterTrefferMs, 1000);
  assert.equal(z.letzterTrefferMs, 1000);
  // Der Kreis bleibt fest in der Bildmitte, das Flugzeug wird neu gesetzt:
  // im Kegel und deutlich außerhalb der Deckung.
  assert.deepEqual(z.kreis, { x: 0.5, y: 0.5 });
  assert.ok(abstandFuerTest(z.ziel, z.kreis) >= MINDESTABSTAND);
  assert.ok(z.ziel.x >= KEGEL.xMin && z.ziel.x <= KEGEL.xMax);
  assert.ok(z.ziel.y >= KEGEL.yMin && z.ziel.y <= KEGEL.yMax);
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

test("Buchstabenreihe: Ereignisse zufällig, aber verlässlich wiederkehrend", () => {
  const reihe = erzeugeBuchstabenreihe(5, Math.random);
  assert.equal(reihe.length, Math.floor(5 * 60_000 / BUCHSTABEN_ABSTAND_MS));
  const text = reihe.map((e) => e.b).join("");
  // Jedes S beginnt ein Ereignis S-L-?; die Anfänge liegen im Abstandsband,
  // nie drei Fallen nacheinander, jedes gesprochene SLA ist auch markiert.
  const anfaenge = [];
  for (let i = 0; i < text.length; i++) if (text[i] === "S") anfaenge.push(i);
  assert.ok(anfaenge.length >= 6);
  for (const a of anfaenge) assert.equal(text[a + 1], "L");
  for (let i = 1; i < anfaenge.length; i++) {
    const abstand = anfaenge[i] - anfaenge[i - 1];
    assert.ok(abstand >= 3 + EREIGNIS_LUECKE_MIN && abstand <= 3 + EREIGNIS_LUECKE_MAX);
  }
  let fallenNacheinander = 0;
  let echte = 0;
  for (const a of anfaenge) {
    if (text[a + 2] === "A") {
      echte += 1;
      fallenNacheinander = 0;
      assert.equal(reihe[a + 2].sla, true);
    } else {
      fallenNacheinander += 1;
      assert.ok(fallenNacheinander <= 2);
    }
  }
  assert.ok(echte >= 2);
  assert.equal(reihe.filter((e) => e.sla).length, echte);
});

test("Buchstabenreihe ist mit gleichem Zufall gleich", () => {
  const zaehler = () => { let n = 0; return () => (Math.sin(n++) + 1) / 2; };
  const a = erzeugeBuchstabenreihe(3, zaehler());
  const b = erzeugeBuchstabenreihe(3, zaehler());
  assert.deepEqual(a, b);
});

test("SLA-Zähler: erkannt, Fehlalarm und verpasst", () => {
  const reihe = [
    { b: "S", sla: false }, { b: "L", sla: false }, { b: "A", sla: true },
    { b: "K", sla: false },
    { b: "S", sla: false }, { b: "L", sla: false }, { b: "A", sla: true },
  ];
  const z = erzeugeSlaZaehler(reihe);
  z.sprich(0, 0); z.sprich(1, 2000); z.sprich(2, 4000);
  z.druck(5000);                      // im Antwortfenster nach dem A: erkannt
  z.druck(5500);                      // Fenster verbraucht: Fehlalarm
  z.sprich(3, 6000);
  z.druck(9000);                      // kein offenes A: Fehlalarm
  z.sprich(4, 8000); z.sprich(5, 10000); z.sprich(6, 12000); // zweites A ohne Druck
  assert.deepEqual(z.auswertung(), { erkannt: 1, verpasst: 1, fehlalarm: 2 });
});

test("Tempostufen der Buchstabenreihe", () => {
  assert.deepEqual(TEMPOS, [2500, 2000, 1500, 1000]);
});

test("Buchstabenreihe folgt dem gewählten Tempo", () => {
  const schnell = erzeugeBuchstabenreihe(2, Math.random, 1000);
  assert.equal(schnell.length, Math.floor(2 * 60_000 / 1000));
  const text = schnell.map((e) => e.b).join("");
  assert.ok((text.match(/SL/g) ?? []).length >= 5);  // dichteres Raster, mehr Ereignisse
  assert.ok((text.match(/SLA/g) ?? []).length >= 1);
});

test("SLA-Zähler meldet Treffer, Fehlalarm und Fensterablauf als Ereignis", () => {
  const reihe = [
    { b: "S", sla: false }, { b: "L", sla: false }, { b: "A", sla: true },
    { b: "S", sla: false }, { b: "L", sla: false }, { b: "A", sla: true },
  ];
  const z = erzeugeSlaZaehler(reihe);
  z.sprich(2, 4000);
  assert.equal(z.druck(5000), true);   // im Fenster: erkannt
  assert.equal(z.druck(5500), false);  // Fenster verbraucht: Fehlalarm
  z.sprich(5, 10000);
  assert.equal(z.ablauf(12800), 0);    // Anhörzeit plus Reaktionszeit läuft noch
  assert.equal(z.ablauf(13000), 1);    // jetzt ungenutzt abgelaufen
  assert.equal(z.ablauf(14000), 0);    // wird nur einmal gemeldet
  assert.deepEqual(z.auswertung(), { erkannt: 1, verpasst: 1, fehlalarm: 1 });
});

test("Antwortfenster umfasst die Anhörzeit der Ansage", () => {
  const reihe = [{ b: "S", sla: false }, { b: "L", sla: false }, { b: "A", sla: true }];
  const z = erzeugeSlaZaehler(reihe);
  z.sprich(2, 4000);
  assert.equal(z.druck(6400), true);   // 2,4 s nach Ansagebeginn: menschliches Timing, vorher fälschlich rot
  const z2 = erzeugeSlaZaehler(reihe);
  z2.sprich(2, 4000);
  assert.equal(z2.druck(7000), false); // deutlich zu spät bleibt ein Fehldruck
});
