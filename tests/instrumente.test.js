import { test } from "node:test";
import assert from "node:assert/strict";
import { RASTER, rasterwerte, zufallswerte, formatiere, gradFahrt, gradHoehe100, gradHoehe1000, gradVario, svgInstrument, TAFELREIHE, tafelHtml, svgLage,
} from "../js/instrumente.js";

function saatZufall(saat) {
  let s = saat;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test("gradFahrt: Skalenanfang, Mitte und Ende", () => {
  assert.equal(gradFahrt(40), -150);
  assert.equal(gradFahrt(190), 0);
  assert.equal(gradFahrt(340), 150);
});

test("gradHoehe: Hunderter- und Tausenderzeiger", () => {
  assert.equal(gradHoehe100(4300), 108);
  assert.ok(Math.abs(gradHoehe1000(4300) - 154.8) < 0.001);
  assert.equal(gradHoehe100(9000), 0);
});

test("gradVario: Steigen dreht im Uhrzeigersinn nach oben", () => {
  assert.equal(gradVario(0), 0);
  assert.equal(gradVario(2000), 150);
  assert.equal(gradVario(-1000), -75);
});

test("zufallswerte liegen im Raster und auf den Schritten", () => {
  const rnd = saatZufall(7);
  for (let i = 0; i < 25; i++) {
    const w = zufallswerte(rnd);
    assert.ok(w.fahrt >= RASTER.fahrt.min && w.fahrt <= RASTER.fahrt.max);
    assert.equal(w.fahrt % RASTER.fahrt.schritt, 0);
    assert.ok(w.kurs >= 0 && w.kurs <= 355 && w.kurs % 5 === 0);
    assert.ok(rasterwerte(RASTER.roll).includes(w.horizont.roll));
    assert.ok(rasterwerte(RASTER.nick).includes(w.horizont.nick));
  }
});

test("formatiere: Einheiten und Vorzeichen", () => {
  assert.equal(formatiere("fahrt", 230), "230 kt");
  assert.equal(formatiere("kurs", 5), "005°");
  assert.equal(formatiere("vario", 700), "+700 ft/min");
  assert.equal(formatiere("vario", -300), "-300 ft/min");
  assert.equal(formatiere("horizont", { roll: -15, nick: 10 }), "15° links, Nase 10° hoch");
  assert.equal(formatiere("horizont", { roll: 0, nick: 0 }), "Flügel waagerecht, Nase gerade");
});

test("svgInstrument: Zeiger stehen im Bild auf dem gerechneten Winkel", () => {
  assert.ok(svgInstrument("fahrt", 230).includes('rotate(40.00 60 60)'));
  assert.ok(svgInstrument("kurs", 285).includes('rotate(-285.00 60 60)'));
  assert.ok(svgInstrument("horizont", { roll: 30, nick: 0 }).includes('rotate(-30.00 60 60)'));
});

test("Tafelreihe folgt der Anordnung aus Abbildung 3-10", () => {
  assert.deepEqual(TAFELREIHE, ["kurs", "fahrt", "horizont", "hoehe", "vario"]);
  const html = tafelHtml({ fahrt: 120, hoehe: 3000, kurs: 90, vario: 500, horizont: { roll: 0, nick: 0 } });
  const reihenfolge = [...html.matchAll(/data-id="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(reihenfolge, TAFELREIHE);
  assert.ok(!html.includes("tafelsteg"));
});

test("svgLage: Heckansicht kippt mit der Querlage, Seitenansicht mit der Nicklage", () => {
  // Rechte Querlage senkt den rechten Flügel: Drehung im Uhrzeigersinn,
  // also positiver Winkel. Nase hoch dreht die Seitenansicht gegen den
  // Uhrzeigersinn, also negativer Winkel.
  const quer = svgLage({ roll: 30, nick: 0 });
  assert.ok(quer.includes("rotate(30.00)"), "Querlage rechts dreht positiv");
  const laengs = svgLage({ roll: 0, nick: 20 });
  assert.ok(laengs.includes("rotate(-20.00)"), "Nase hoch dreht negativ");
  const gerade = svgLage({ roll: 0, nick: 0 });
  assert.equal((gerade.match(/rotate\(0\.00\)/g) ?? []).length, 2);
  assert.ok(gerade.startsWith("<svg") && gerade.includes("viewBox"));
});
