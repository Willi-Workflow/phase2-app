// Maße und statische SVG-Bühne für Mission 2 (SMT-Nachbau). Gezeichnet wird
// im festen 1600 mal 900 Raster; die Laufzeit schreibt nur Verschiebungen und
// Drehungen der gekennzeichneten Gruppen fort. Farben und Aufbau folgen den
// Referenzbildern unter entwurf/bilder/smt-referenz-*.jpg.
import { NADEL_MIN, NADEL_MAX, RAHMEN_VERHAELTNIS } from "./uebung2.js";

export const BILD = { b: 1600, h: 900 };
export const RAHMEN = { x: 160, y: 50, b: 1280, h: 1280 * RAHMEN_VERHAELTNIS };
export const STRICH_Y = RAHMEN.y + RAHMEN.h * 0.18;
export const TACHO = { cx: 230, cy: 780, r: 78 };

export const LINIE = "#dfe9f5";      // weiß mit Röhrenschimmer
export const ROT = "#e5312b";
export const TUERKIS = "#8fe3df";

export const xImBild = (x) => RAHMEN.x + x * RAHMEN.b;
export const yImBild = (y) => RAHMEN.y + y * RAHMEN.h;

// 40 Knoten rechts oben, im Uhrzeigersinn über unten bis 160 links oben.
export function gradFuerKnoten(kt) {
  return 60 + ((kt - NADEL_MIN) / (NADEL_MAX - NADEL_MIN)) * 240;
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

function tachoSvg() {
  const striche = [];
  for (let kt = NADEL_MIN; kt <= NADEL_MAX; kt += 10) {
    const grad = gradFuerKnoten(kt);
    const lang = kt % 40 === 0;
    const a = punktAmTacho(grad, TACHO.r - (lang ? 16 : 10));
    const b = punktAmTacho(grad, TACHO.r - 4);
    striche.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${LINIE}" stroke-width="${lang ? 2.4 : 1.4}"/>`);
    if (lang) {
      const t = punktAmTacho(grad, TACHO.r - 30);
      striche.push(`<text x="${t.x.toFixed(1)}" y="${(t.y + 4).toFixed(1)}" fill="${LINIE}" font-size="13" text-anchor="middle">${kt}</text>`);
    }
  }
  // Türkiser Bogen entlang der Skala, wie im Referenzbild.
  const von = punktAmTacho(gradFuerKnoten(NADEL_MIN), TACHO.r);
  const bis = punktAmTacho(gradFuerKnoten(NADEL_MAX), TACHO.r);
  const bogen = `<path id="tachobogen" d="M ${von.x.toFixed(1)} ${von.y.toFixed(1)} A ${TACHO.r} ${TACHO.r} 0 1 1 ${bis.x.toFixed(1)} ${bis.y.toFixed(1)}" fill="none" stroke="${TUERKIS}" stroke-width="4" opacity="0.85"/>`;
  return `
    <g font-family="Arial, Helvetica, sans-serif">
      <circle cx="${TACHO.cx}" cy="${TACHO.cy}" r="${TACHO.r + 14}" fill="#050607" stroke="#20262c" stroke-width="1.5"/>
      ${bogen}
      ${striche.join("")}
      <text x="${TACHO.cx}" y="${TACHO.cy - 26}" fill="${LINIE}" font-size="12" text-anchor="middle" letter-spacing="1">AIRSPEED</text>
      <text x="${TACHO.cx}" y="${TACHO.cy - 13}" fill="${LINIE}" font-size="9" text-anchor="middle" letter-spacing="2">KNOTS</text>
      <g id="nadel" transform="rotate(180 ${TACHO.cx} ${TACHO.cy})">
        <line x1="${TACHO.cx}" y1="${TACHO.cy}" x2="${TACHO.cx}" y2="${TACHO.cy - TACHO.r + 12}" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
      </g>
      <circle cx="${TACHO.cx}" cy="${TACHO.cy}" r="6" fill="#c8ccd2"/>
      <g id="sollkeil" transform="rotate(180 ${TACHO.cx} ${TACHO.cy})">
        <path d="M ${TACHO.cx} ${TACHO.cy - TACHO.r - 12} l -7 -12 l 14 0 z" fill="${ROT}"/>
      </g>
      <text id="solltext" x="${TACHO.cx + TACHO.r + 26}" y="${TACHO.cy + 8}" fill="${ROT}" font-size="15" text-anchor="start" letter-spacing="1">SOLL 75 kt</text>
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
    ? `<line id="ruderstrich" x1="0" y1="${STRICH_Y - 34}" x2="0" y2="${STRICH_Y + 34}" stroke="${ROT}" stroke-width="7"/>`
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
