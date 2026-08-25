// Die fünf Instrumente für Mission 4, gezeichnet nach Fotos echter
// Rundinstrumente (Sechserpaket einer Cessna, Dreizeiger-Höhenmesser,
// Kurskreisel, Variometer): Gehäuseplatte mit Schrauben, Metallring,
// Farbbögen am Fahrtmesser, Druckfenster am Höhenmesser, Umriss-Flugzeug
// im Kurskreisel, orangefarbenes Flugzeugsymbol im Horizont. Die Beschriftung
// der Skalen ist wie am echten Gerät englisch.
// Reine Funktionen ohne DOM, die Winkelrechnung ist mit node --test prüfbar.

export const INSTRUMENTE = [
  { id: "fahrt", name: "Fahrtmesser", frage: "Welche Geschwindigkeit zeigte der FAHRTMESSER?" },
  { id: "horizont", name: "Künstlicher Horizont", frage: "Welche Fluglage zeigte der HORIZONT?" },
  { id: "hoehe", name: "Höhenmesser", frage: "Welche Höhe zeigte der HÖHENMESSER?" },
  { id: "kurs", name: "Steuerkurs", frage: "Welchen Steuerkurs zeigte der KOMPASS?" },
  { id: "vario", name: "Variometer", frage: "Welches Steigen oder Sinken zeigte das VARIOMETER?" },
];

// Werteraster je Instrument: daraus kommen Zufallswerte und Antwortauswahlen.
export const RASTER = {
  fahrt: { min: 60, max: 320, schritt: 10 },
  hoehe: { min: 1000, max: 9900, schritt: 100 },
  kurs: { min: 0, max: 355, schritt: 5 },
  vario: { min: -2000, max: 2000, schritt: 100 },
  roll: { min: -45, max: 45, schritt: 15 },
  nick: { min: -20, max: 20, schritt: 10 },
};

export function rasterwerte(raster) {
  const werte = [];
  for (let w = raster.min; w <= raster.max; w += raster.schritt) werte.push(w);
  return werte;
}

function zufallAus(werte, rnd) {
  return werte[Math.floor(rnd() * werte.length)];
}

export function zufallswerte(rnd = Math.random) {
  return {
    fahrt: zufallAus(rasterwerte(RASTER.fahrt), rnd),
    hoehe: zufallAus(rasterwerte(RASTER.hoehe), rnd),
    kurs: zufallAus(rasterwerte(RASTER.kurs), rnd),
    vario: zufallAus(rasterwerte(RASTER.vario), rnd),
    horizont: {
      roll: zufallAus(rasterwerte(RASTER.roll), rnd),
      nick: zufallAus(rasterwerte(RASTER.nick), rnd),
    },
  };
}

export function formatiere(id, wert) {
  if (id === "fahrt") return `${wert} kt`;
  if (id === "hoehe") return `${wert} ft`;
  if (id === "kurs") return `${String(wert).padStart(3, "0")}°`;
  if (id === "vario") return `${wert > 0 ? "+" : ""}${wert} ft/min`;
  const quer = wert.roll === 0 ? "Flügel waagerecht" : `${Math.abs(wert.roll)}° ${wert.roll < 0 ? "links" : "rechts"}`;
  const laengs = wert.nick === 0 ? "Nase gerade" : `Nase ${Math.abs(wert.nick)}° ${wert.nick < 0 ? "tief" : "hoch"}`;
  return `${quer}, ${laengs}`;
}

// Zeigerwinkel in Grad, 0 zeigt nach oben, positiv im Uhrzeigersinn.
// Die Fahrtskala läuft von 40 bis 340 Knoten über 300 Grad, also 1 Grad je Knoten.
export const FAHRTSKALA = { von: 40, bis: 340 };
export function gradFahrt(wert) { return -150 + ((wert - FAHRTSKALA.von) * 300) / (FAHRTSKALA.bis - FAHRTSKALA.von); }
export function gradHoehe100(wert) { return ((wert % 1000) / 1000) * 360; }
export function gradHoehe1000(wert) { return ((wert % 10000) / 10000) * 360; }
export function gradHoehe10000(wert) { return ((wert % 100000) / 100000) * 360; }
export function gradVario(wert) { return (wert / RASTER.vario.max) * 150; }

// ---------- Zeichenhelfer ----------
const S = (n) => n.toFixed(2);
const HELL = "#e8e6dd";
const GEDECKT = "#b9b6ab";
const ORANGE = "#e59a2f";

function punktAuf(grad, r) {
  const a = ((grad - 90) * Math.PI) / 180;
  return [60 + r * Math.cos(a), 60 + r * Math.sin(a)];
}

function strich(grad, r1, r2, staerke, farbe = HELL) {
  const [x1, y1] = punktAuf(grad, r1);
  const [x2, y2] = punktAuf(grad, r2);
  return `<line x1="${S(x1)}" y1="${S(y1)}" x2="${S(x2)}" y2="${S(y2)}" stroke="${farbe}" stroke-width="${staerke}"/>`;
}

function zahl(grad, r, text, groesse = 9, farbe = HELL) {
  const [x, y] = punktAuf(grad, r);
  return `<text x="${S(x)}" y="${S(y)}" font-size="${groesse}" fill="${farbe}" text-anchor="middle" dominant-baseline="central">${text}</text>`;
}

function bogen(gradVon, gradBis, r, farbe, breite) {
  const [x1, y1] = punktAuf(gradVon, r);
  const [x2, y2] = punktAuf(gradBis, r);
  const gross = gradBis - gradVon > 180 ? 1 : 0;
  return `<path d="M ${S(x1)} ${S(y1)} A ${r} ${r} 0 ${gross} 1 ${S(x2)} ${S(y2)}" fill="none" stroke="${farbe}" stroke-width="${breite}"/>`;
}

// Gemeinsame Verläufe, Muster und Filter; die Kennungen sind in jedem SVG
// identisch, doppelte Definitionen im selben Dokument sind dadurch unschädlich.
// Die Gehäuseanmutung (Platte, Fase, Schrauben, Bezel, Glasreflex) hängt
// vollständig an diesem Block und an PLATTE/GEHAEUSE/SCHLIFF, damit alle
// fünf Instrumente gleich behandelt sind.
const DEFS = `<defs>
  <linearGradient id="ins-platte" x1="0.18" y1="0" x2="0.82" y2="1">
    <stop offset="0%" stop-color="#313336"/><stop offset="48%" stop-color="#25272a"/><stop offset="100%" stop-color="#1a1c1e"/>
  </linearGradient>
  <pattern id="ins-schraffur" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="4" height="4" fill="#0b0c0d"/><rect width="1.8" height="4" fill="${GEDECKT}"/>
  </pattern>
  <clipPath id="ins-fase-hell"><polygon points="0,0 120,0 0,120"/></clipPath>
  <clipPath id="ins-fase-dunkel"><polygon points="120,0 120,120 0,120"/></clipPath>
  <radialGradient id="ins-schraube" cx="35%" cy="30%" r="85%">
    <stop offset="0%" stop-color="#93969a"/><stop offset="55%" stop-color="#54575b"/><stop offset="100%" stop-color="#26282a"/>
  </radialGradient>
  <radialGradient id="ins-senkung" cx="50%" cy="50%" r="50%">
    <stop offset="52%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
  </radialGradient>
  <radialGradient id="ins-bezel-aussen" cx="40%" cy="32%" r="78%">
    <stop offset="0%" stop-color="#95989c"/><stop offset="45%" stop-color="#404346"/><stop offset="100%" stop-color="#0e0f10"/>
  </radialGradient>
  <radialGradient id="ins-bezel-innen" cx="46%" cy="38%" r="72%">
    <stop offset="0%" stop-color="#5a5d61"/><stop offset="55%" stop-color="#28292b"/><stop offset="100%" stop-color="#0a0b0c"/>
  </radialGradient>
  <radialGradient id="ins-schatten" cx="50%" cy="46%" r="58%">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/><stop offset="70%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,0.62)"/>
  </radialGradient>
  <filter id="ins-weich" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="1.6"/>
  </filter>
</defs>`;

// Schraube mit Senkungsschatten, radialem Glanz und Kreuzschlitz; der Winkel
// dreht den Schlitz je Schraube unterschiedlich, wie am echten Gerät.
function schraube(x, y, winkel, r = 5) {
  const arm = r * 0.62;
  return `<circle cx="${x}" cy="${y}" r="${S(r + 1.9)}" fill="url(#ins-senkung)"/>
    <circle cx="${x}" cy="${y}" r="${S(r)}" fill="url(#ins-schraube)" stroke="#17181a" stroke-width="0.8"/>
    <g transform="rotate(${winkel} ${x} ${y})">
      <line x1="${S(x - arm)}" y1="${y}" x2="${S(x + arm)}" y2="${y}" stroke="#131417" stroke-width="1.3"/>
      <line x1="${x}" y1="${S(y - arm)}" x2="${x}" y2="${S(y + arm)}" stroke="#131417" stroke-width="1" opacity="0.75"/>
    </g>`;
}

const PLATTE = `<rect x="1.5" y="1.5" width="117" height="117" rx="9" fill="url(#ins-platte)"/>
  <rect x="1.5" y="1.5" width="117" height="117" rx="9" fill="url(#ins-schraffur)" opacity="0.045"/>
  <rect x="2.4" y="2.4" width="115.2" height="115.2" rx="8.2" fill="none" stroke="#6f7276" stroke-width="0.9" opacity="0.5" clip-path="url(#ins-fase-hell)"/>
  <rect x="2.4" y="2.4" width="115.2" height="115.2" rx="8.2" fill="none" stroke="#000000" stroke-width="0.9" opacity="0.55" clip-path="url(#ins-fase-dunkel)"/>
  <rect x="1.5" y="1.5" width="117" height="117" rx="9" fill="none" stroke="#0f1011" stroke-width="1"/>
  ${schraube(11.5, 11.5, 28)}${schraube(108.5, 11.5, -37)}${schraube(11.5, 108.5, 64)}${schraube(108.5, 108.5, 8)}`;

// Plastischer Einfassring: zwei konzentrische Kreise mit radialem Verlauf,
// dazu ein schmaler Lichtbogen oben und ein dunklerer Bogen unten. Platte,
// Schrauben, Bezel und das schwarze Zifferblattfeld stecken zusammen in
// "svg-gehaeuse": Im Cockpit-Lauf blendet das Stylesheet diese Gruppe aus
// und legt stattdessen das Foto unter die SVG, überall sonst (Vorschau,
// Übersicht) bleibt die Gruppe sichtbar und die SVG zeigt das komplette Gerät.
const GEHAEUSE = `<g class="svg-gehaeuse">${PLATTE}
  <circle cx="60" cy="60" r="54.5" fill="url(#ins-bezel-aussen)"/>
  <circle cx="60" cy="60" r="50.6" fill="url(#ins-bezel-innen)"/>
  ${bogen(-56, 56, 52.6, "rgba(255,255,255,0.4)", 1.7)}
  ${bogen(120, 240, 52.6, "rgba(0,0,0,0.5)", 1.9)}
  <circle cx="60" cy="60" r="49" fill="#0b0c0d"/></g>`;

// Dialschatten unter dem Glasreflex, beides über den Zeigern: der Schatten
// lässt das Zifferblatt im Bezel eingelassen wirken, der weiche Reflex
// bleibt bei knapp 5 Prozent Deckkraft, damit die Ablesbarkeit bleibt. Der
// Schatten gehört zum Gehäuse (steckt mit in "svg-gehaeuse" und verschwindet
// im Lauf, weil ihn das Foto schon mitbringt), der Glasreflex bleibt darüber
// immer sichtbar, auch über dem Foto, für den einheitlichen Glaslook.
const DIALSCHATTEN = `<circle cx="60" cy="60" r="49" fill="url(#ins-schatten)"/>`;
const GLASREFLEX = `<ellipse cx="44" cy="32" rx="28" ry="12" fill="rgba(255,255,255,0.05)" transform="rotate(-25 44 32)" filter="url(#ins-weich)"/>`;
const SCHLIFF = `<g class="svg-gehaeuse">${DIALSCHATTEN}</g>${GLASREFLEX}`;

function zeiger(laenge, breite, grad, farbe = HELL) {
  return `<g transform="rotate(${S(grad)} 60 60)">
    <polygon points="60,${60 - laenge} ${60 - breite},${60 - laenge + 12} ${60 - breite},67 ${60 + breite},67 ${60 + breite},${60 - laenge + 12}" fill="${farbe}"/>
  </g>`;
}

const NABE = `<circle cx="60" cy="60" r="5.6" fill="#1d1f21" stroke="#43464a" stroke-width="1"/>`;

function svgRahmen(inhalt) {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" font-family="Arial, Helvetica, sans-serif">${DEFS}${inhalt}</svg>`;
}

// ---------- Fahrtmesser ----------
export function svgFahrt(wert) {
  let skala = "";
  for (let w = FAHRTSKALA.von; w <= FAHRTSKALA.bis; w += 10) {
    const gross = w % 40 === 0;
    skala += strich(gradFahrt(w), gross ? 39 : 42.5, 46.5, gross ? 1.8 : 1);
    if (gross) skala += zahl(gradFahrt(w), 32, w, 8);
  }
  const farbboegen = bogen(gradFahrt(60), gradFahrt(250), 48, "#3f8f4a", 2.6)
    + bogen(gradFahrt(250), gradFahrt(320), 48, "#d9b02f", 2.6)
    + bogen(gradFahrt(50), gradFahrt(140), 44.5, "#e6e4dc", 2)
    + strich(gradFahrt(320), 44, 49, 2.6, "#c33a2a");
  return svgRahmen(`${GEHAEUSE}${farbboegen}${skala}
    <text x="60" y="42" font-size="6.2" fill="${HELL}" text-anchor="middle" letter-spacing="1">AIRSPEED</text>
    <text x="60" y="49" font-size="5" fill="${GEDECKT}" text-anchor="middle" letter-spacing="1.4">KNOTS</text>
    ${zeiger(43, 3, gradFahrt(wert))}${NABE}${SCHLIFF}`);
}

// ---------- Höhenmesser ----------
export function svgHoehe(wert) {
  let skala = "";
  for (let i = 0; i < 50; i++) {
    const gross = i % 5 === 0;
    skala += strich(i * 7.2, gross ? 40 : 43, 46.5, gross ? 1.8 : 1);
    if (gross) skala += zahl(i * 7.2, 33, i / 5, 9.5);
  }
  return svgRahmen(`${GEHAEUSE}
    <text x="45" y="21.5" font-size="4.6" fill="${GEDECKT}" text-anchor="middle">100</text>
    <text x="75" y="21.5" font-size="4.6" fill="${GEDECKT}" text-anchor="middle">FEET</text>
    <text x="34" y="61" font-size="5.6" fill="${GEDECKT}" text-anchor="middle" letter-spacing="0.6">ALT</text>
    ${skala}
    ${zeiger(28, 4.6, gradHoehe1000(wert))}
    ${zeiger(42, 2.4, gradHoehe100(wert))}${NABE}${SCHLIFF}`);
}

// ---------- Kurskreisel ----------
export function svgKurs(wert) {
  const BUCHSTABEN = { 0: "N", 90: "E", 180: "S", 270: "W" };
  let rose = "";
  for (let g = 0; g < 360; g += 5) {
    const mittel = g % 10 === 0;
    const gross = g % 30 === 0;
    rose += strich(g, gross ? 40 : mittel ? 42 : 44, 46.5, gross ? 1.6 : 1);
    if (gross) {
      const beschriftung = BUCHSTABEN[g] ?? String(g / 10);
      rose += `<g transform="rotate(${g} 60 60)"><text x="60" y="27" font-size="8" fill="${HELL}" text-anchor="middle" dominant-baseline="central">${beschriftung}</text></g>`;
    }
  }
  const marken = strich(45, 47, 52.5, 1.8) + strich(135, 47, 52.5, 1.8)
    + strich(225, 47, 52.5, 1.8) + strich(315, 47, 52.5, 1.8)
    + `<polygon points="60,8 56.5,14.5 63.5,14.5" fill="${HELL}"/>`
    + strich(180, 47, 52.5, 1.8) + strich(90, 47, 52.5, 1.8) + strich(270, 47, 52.5, 1.8);
  const flugzeug = `<path fill="${HELL}" d="M60 30 C61.7 33.5 63 37 63 43.5 L63 50 L89 62 L89 68 L63 60.5
    L63 72.5 L74.5 78.5 L74.5 82.5 L61.7 79.5 L61.7 83.5 L58.3 83.5 L58.3 79.5 L45.5 82.5 L45.5 78.5 L57 72.5 L57 60.5
    L31 68 L31 62 L57 50 L57 43.5 C57 37 58.3 33.5 60 30 Z"/>`;
  return svgRahmen(`${GEHAEUSE}
    <g transform="rotate(${S(-wert)} 60 60)">${rose}</g>
    ${marken}${flugzeug}${SCHLIFF}`);
}

// ---------- Variometer ----------
export function svgVario(wert) {
  let skala = "";
  for (let w = -2000; w <= 2000; w += 250) {
    const gross = w % 500 === 0;
    const grad = gradVario(w) - 90;
    skala += strich(grad, gross ? 39.5 : 42.5, 46.5, gross ? 1.8 : 1);
    if (gross) skala += zahl(grad, 32.5, Math.abs(w) / 100, 8);
  }
  return svgRahmen(`${GEHAEUSE}${skala}
    <text x="60" y="44.5" font-size="5.4" fill="${HELL}" text-anchor="middle" letter-spacing="0.8">VERTICAL</text>
    <text x="60" y="51" font-size="5.4" fill="${HELL}" text-anchor="middle" letter-spacing="0.8">SPEED</text>
    <text x="33" y="51" font-size="4.8" fill="${GEDECKT}" text-anchor="middle">UP</text>
    <text x="33" y="71.5" font-size="4.8" fill="${GEDECKT}" text-anchor="middle">DOWN</text>
    <text x="60" y="87" font-size="4" fill="${GEDECKT}" text-anchor="middle" letter-spacing="0.3">100 FEET PER MINUTE</text>
    <g transform="rotate(${S(gradVario(wert))} 60 60)">
      <polygon points="${60 - 44},60 63,${60 - 2.8} 68,60 63,${60 + 2.8}" fill="${HELL}"/>
    </g>${NABE}${SCHLIFF}`);
}

// ---------- Künstlicher Horizont ----------
// Bildeinheiten je Grad Nicklage: bewusst gedämpft, damit der Ausschlag der
// Kugel bei vollem Nickwert nicht übertrieben wirkt.
const NICKMASSSTAB = 0.9;

export function svgHorizont(wert) {
  const { roll, nick } = wert;
  const versatz = nick * NICKMASSSTAB;
  const leitersprosse = (p) => {
    const y = 60 + p * NICKMASSSTAB;
    const halb = Math.abs(p) % 10 === 0 ? 13 : 6;
    const beschriftung = Math.abs(p) % 10 === 0
      ? `<text x="${60 - halb - 6}" y="${S(y)}" font-size="4.6" fill="#f4f2ea" text-anchor="middle" dominant-baseline="central">${Math.abs(p)}</text>
         <text x="${60 + halb + 6}" y="${S(y)}" font-size="4.6" fill="#f4f2ea" text-anchor="middle" dominant-baseline="central">${Math.abs(p)}</text>`
      : "";
    return `<line x1="${60 - halb}" y1="${S(y)}" x2="${60 + halb}" y2="${S(y)}" stroke="#f4f2ea" stroke-width="1.6"/>${beschriftung}`;
  };
  let leiter = "";
  for (const p of [-20, -15, -10, -5, 5, 10, 15, 20]) leiter += leitersprosse(p);
  // Rollskala und ihr Nullpfeil sitzen auf der Kugel und drehen mit der Rolllage,
  // der Ablesezeiger oben ist fest am Gehäuse: so steht die Anzeige bei Linkslage
  // links vom Zeiger, wie am echten Gerät. Die Nickleiter ist auf ein inneres
  // Sichtfenster begrenzt, damit sie bei starken Lagen nicht in die Rollskala
  // und die Pfeile läuft.
  let rollskala = `<polygon points="60,19 56,26.5 64,26.5" fill="#f4f2ea"/>`;
  for (const g of [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60]) {
    rollskala += strich(g, g % 30 === 0 ? 41 : 43.5, 47.5, g % 30 === 0 ? 1.8 : 1.1, "#f4f2ea");
  }
  const kugeldrehung = `rotate(${S(-roll)} 60 60)`;
  return svgRahmen(`${GEHAEUSE}
    <defs>
      <clipPath id="ins-hzkreis"><circle cx="60" cy="60" r="48"/></clipPath>
      <clipPath id="ins-hzleiter"><circle cx="60" cy="60" r="36.5"/></clipPath>
    </defs>
    <g clip-path="url(#ins-hzkreis)">
      <g transform="${kugeldrehung}">
        <g transform="translate(0 ${S(versatz)})">
          <rect x="-45" y="-105" width="210" height="165" fill="#4d8ec9"/>
          <rect x="-45" y="60" width="210" height="165" fill="#7d5a33"/>
          <line x1="-45" y1="60" x2="165" y2="60" stroke="#f4f2ea" stroke-width="2.4"/>
        </g>
        ${rollskala}
      </g>
      <g clip-path="url(#ins-hzleiter)">
        <g transform="${kugeldrehung}"><g transform="translate(0 ${S(versatz)})">${leiter}</g></g>
      </g>
    </g>
    <polygon points="60,13.5 55.5,7 64.5,7" fill="#f4f2ea" stroke="#141516" stroke-width="0.7"/>
    <path d="M32 60 L50 60 L56 65 L60 60 L64 65 L70 60 L88 60" stroke="#141516" stroke-width="3.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M32 60 L50 60 L56 65 L60 60 L64 65 L70 60 L88 60" stroke="${ORANGE}" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="1.4" fill="${ORANGE}" stroke="#141516" stroke-width="0.6"/>
    ${SCHLIFF}`);
}

export function svgInstrument(id, wert) {
  if (id === "fahrt") return svgFahrt(wert);
  if (id === "hoehe") return svgHoehe(wert);
  if (id === "kurs") return svgKurs(wert);
  if (id === "vario") return svgVario(wert);
  return svgHorizont(wert);
}

// Die komplette Tafel: drei Hauptinstrumente, Trennsteg, zwei Ergänzungen.
export function tafelHtml(werte) {
  const links = ["fahrt", "horizont", "hoehe"].map((id) => `<span class="instrument" data-id="${id}">${svgInstrument(id, id === "horizont" ? werte.horizont : werte[id])}</span>`).join("");
  const rechts = ["kurs", "vario"].map((id) => `<span class="instrument" data-id="${id}">${svgInstrument(id, werte[id])}</span>`).join("");
  return `<div class="instrumententafel"><div class="tafelgruppe">${links}</div><div class="tafelsteg"></div><div class="tafelgruppe">${rechts}</div></div>`;
}
