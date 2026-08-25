// Maße und statische SVG-Bühne für Mission 2 (SMT-Nachbau). Gezeichnet wird
// im festen 1600 mal 900 Raster; die Laufzeit schreibt nur Verschiebungen und
// Drehungen der gekennzeichneten Gruppen fort. Farben und Aufbau folgen den
// Referenzbildern unter entwurf/bilder/smt-referenz-*.jpg.
import { NADEL_MIN, NADEL_MAX, RAHMEN_VERHAELTNIS } from "./uebung2.js";

export const BILD = { b: 1600, h: 900 };
export const RAHMEN = { x: 100, y: 45, b: 1400, h: 1400 * RAHMEN_VERHAELTNIS };
export const STRICH_Y = RAHMEN.y + RAHMEN.h * 0.18;
export const TACHO = { cx: 240, cy: 770, r: 95 };

export const LINIE = "#dfe9f5";      // weiß mit Röhrenschimmer
export const ROT = "#e5312b";
export const TUERKIS = "#6ed8d2";
// Bandende der Skala: das Original ist reines Rot, die Bildröhre strahlt es
// aber hell-rosa aus; der aufgehellte Ton trifft den Videoscreenshot.
export const ROT_BAND = "#e8564e";

export const xImBild = (x) => RAHMEN.x + x * RAHMEN.b;
export const yImBild = (y) => RAHMEN.y + y * RAHMEN.h;

// 40 Knoten rechts oben, im Uhrzeigersinn über unten bis 160 links oben;
// Spannweite 280 Grad wie in Abbildung 3-9 (40 kt bei 40 Grad, 160 kt bei
// 320 Grad).
export function gradFuerKnoten(kt) {
  return 40 + ((kt - NADEL_MIN) / (NADEL_MAX - NADEL_MIN)) * 280;
}

// 0 Grad zeigt nach oben, positive Winkel laufen im Uhrzeigersinn: in
// Bildkoordinaten (y wächst nach unten) ergibt das x = cx + sin(w) * r und
// y = cy - cos(w) * r. Geprüft an den drei Testwinkeln gegen das Referenzbild
// smt-referenz-anzeige.jpg: 60 Grad (40 kt) landet rechts oben, 180 Grad
// (100 kt) unten, 300 Grad (160 kt) links oben. Vorzeichen stimmen bereits.
const punktAmTacho = (grad, r) => {
  const w = (grad * Math.PI) / 180;
  return { x: TACHO.cx + Math.sin(w) * r, y: TACHO.cy - Math.cos(w) * r };
};

// Zifferblatt exakt nach der Geschwindigkeitsanzeige in Abbildung 3-9 der
// Dissertation (Willis Festlegung vom 25.08.2026), bewusst ohne Gehäuse:
// schwarzes rundes Blatt, Zahlen im äußeren Ring, das Band auf mittlerem
// Radius, durchgehend mit weißen Fünf-Knoten-Kerben, ab 140 sandfarben mit
// dunkelrotem Ende, große dunkle Nabe, breite weiße Nadel bis ans Band,
// AIRSPEED und KNOTS oben in der Skalenlücke.
const BLATT_R = 113;
const GRUEN_BIS_KT = 140;
const SAND_BIS_KT = 155;
const BAND_R = 64;
const BAND_BREITE = 13;
const SAND = "#d9c193";
const ROTBRAUN = "#a8524a";

function bandbogen(vonKt, bisKt, farbe) {
  const von = punktAmTacho(gradFuerKnoten(vonKt), BAND_R);
  const bis = punktAmTacho(gradFuerKnoten(bisKt), BAND_R);
  // Der Großbogen-Schalter hängt am Winkel, nicht an den Knoten: 280 Grad
  // Spannweite auf 120 Knoten ergeben mehr als 180 Grad ab 78 Knoten Spanne.
  const gross = ((bisKt - vonKt) / (NADEL_MAX - NADEL_MIN)) * 280 > 180 ? 1 : 0;
  return `<path d="M ${von.x.toFixed(1)} ${von.y.toFixed(1)} A ${BAND_R} ${BAND_R} 0 ${gross} 1 ${bis.x.toFixed(1)} ${bis.y.toFixed(1)}" fill="none" stroke="${farbe}" stroke-width="${BAND_BREITE}"/>`;
}

function tachoSvg() {
  const striche = [];
  // Lange Striche und Zahlen im äußeren Ring (alle 20 kt), kurze Striche
  // alle 10 kt; die weißen Kerben alle 5 kt schneiden nur das Band.
  for (let kt = NADEL_MIN; kt <= NADEL_MAX; kt += 5) {
    const grad = gradFuerKnoten(kt);
    if (kt % 10 === 0) {
      const lang = kt % 20 === 0;
      const a = punktAmTacho(grad, BAND_R + BAND_BREITE / 2 + 2);
      const b = punktAmTacho(grad, lang ? 96 : 88);
      striche.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${LINIE}" stroke-width="${lang ? 3 : 2}"/>`);
    } else {
      const a = punktAmTacho(grad, BAND_R - BAND_BREITE / 2 - 1);
      const b = punktAmTacho(grad, BAND_R + BAND_BREITE / 2 + 1);
      striche.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="#ffffff" stroke-width="2.2"/>`);
    }
    if (kt % 20 === 0) {
      const t = punktAmTacho(grad, 92);
      const versatz = punktAmTacho(grad, 78);
      // Zahl knapp außerhalb des langen Strichs, mittig auf dem Radius.
      const zx = (t.x + (t.x - versatz.x) * 0.55).toFixed(1);
      const zy = (t.y + (t.y - versatz.y) * 0.55 + 6).toFixed(1);
      striche.push(`<text x="${zx}" y="${zy}" fill="${LINIE}" font-size="19" text-anchor="middle">${kt}</text>`);
    }
  }
  const band = bandbogen(NADEL_MIN + 5, GRUEN_BIS_KT, TUERKIS)
    + bandbogen(GRUEN_BIS_KT, SAND_BIS_KT, SAND)
    + bandbogen(SAND_BIS_KT, NADEL_MAX - 1, ROTBRAUN);
  // Kerben über den Bandfarben erneut zeichnen, damit sie das Band teilen.
  const kerben = [];
  for (let kt = NADEL_MIN + 5; kt < NADEL_MAX; kt += 5) {
    if (kt % 10 === 0) continue;
    const a = punktAmTacho(gradFuerKnoten(kt), BAND_R - BAND_BREITE / 2 - 1);
    const b = punktAmTacho(gradFuerKnoten(kt), BAND_R + BAND_BREITE / 2 + 1);
    kerben.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="#ffffff" stroke-width="2.2"/>`);
  }
  // Bewusst ohne Leuchtfilter: Willi will die Zeichnung scharf (24.08.2026).
  return `
    <g font-family="Arial, Helvetica, sans-serif">
      <circle cx="${TACHO.cx}" cy="${TACHO.cy}" r="${BLATT_R}" fill="#0a0b0c"/>
      <text x="${TACHO.cx}" y="${(TACHO.cy - 84).toFixed(1)}" fill="${LINIE}" font-size="15" text-anchor="middle" letter-spacing="1.5">AIRSPEED</text>
      <text x="${TACHO.cx}" y="${(TACHO.cy - 62).toFixed(1)}" fill="${LINIE}" font-size="12" text-anchor="middle" letter-spacing="2">KNOTS</text>
      ${band}
      ${kerben.join("")}
      ${striche.join("")}
      <circle cx="${TACHO.cx}" cy="${TACHO.cy}" r="30" fill="#141618"/>
      <g id="nadel" transform="rotate(180 ${TACHO.cx} ${TACHO.cy})">
        <polygon points="${TACHO.cx},${TACHO.cy - BAND_R - 4} ${TACHO.cx - 5},${TACHO.cy - 8} ${TACHO.cx + 5},${TACHO.cy - 8}" fill="#ffffff"/>
      </g>
      <circle cx="${TACHO.cx}" cy="${TACHO.cy}" r="6" fill="#2a2d30"/>
    </g>`;
}

export function buehneSvg(auswahl) {
  const mitStick = auswahl.includes("stick");
  const mitRuder = auswahl.includes("ruder");
  const mitSchub = auswahl.includes("schub");
  const R = RAHMEN;

  const kreuz = `
    <line x1="${R.x}" y1="${R.y + R.h / 2}" x2="${R.x + R.b}" y2="${R.y + R.h / 2}" stroke="${LINIE}" stroke-width="2"/>
    <line id="mittellinie" x1="${R.x + R.b / 2}" y1="${R.y}" x2="${R.x + R.b / 2}" y2="${R.y + R.h}" stroke="${LINIE}" stroke-width="2"/>`;

  const zielkreis = mitStick
    ? `<circle id="zielkreis" cx="${R.x + R.b / 2}" cy="${R.y + R.h / 2}" r="${0.02 * R.b}" fill="none" stroke="${LINIE}" stroke-width="2.5"/>`
    : "";

  const fadenkreuz = mitStick ? `
    <g id="fadenkreuz" stroke="${ROT}" stroke-width="3" fill="none">
      <circle cx="0" cy="0" r="${0.014 * R.b}"/>
      <line x1="${-0.024 * R.b}" y1="0" x2="${0.024 * R.b}" y2="0"/>
      <line x1="0" y1="${-0.024 * R.b}" x2="0" y2="${0.024 * R.b}"/>
    </g>` : "";

  const strich = mitRuder
    ? `<line id="ruderstrich" x1="0" y1="${STRICH_Y - 28}" x2="0" y2="${STRICH_Y + 28}" stroke="${ROT}" stroke-width="6"/>`
    : "";

  return `<svg viewBox="0 0 ${BILD.b} ${BILD.h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <rect x="0" y="0" width="${BILD.b}" height="${BILD.h}" fill="#000"/>
    <rect x="${R.x}" y="${R.y}" width="${R.b}" height="${R.h}" fill="none" stroke="${LINIE}" stroke-width="2.5"/>
    ${kreuz}
    ${zielkreis}
    ${strich}
    ${fadenkreuz}
    ${mitSchub ? tachoSvg() : ""}
  </svg>`;
}
