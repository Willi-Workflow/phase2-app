// Die fünf Instrumente für Mission 4 nach dem Vorbild klassischer Rundinstrumente:
// Fahrtmesser, künstlicher Horizont, Höhenmesser, Steuerkurs, Variometer.
// Reine Funktionen: Wertebereiche, Zeigerwinkel und SVG-Zeichenketten ohne DOM,
// die Winkelrechnung ist mit node --test prüfbar.

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
export function gradVario(wert) { return (wert / RASTER.vario.max) * 150; }

// Gemeinsame Zeichenhelfer
const S = (n) => n.toFixed(2);

function zeiger(laenge, breite, grad, farbe = "#e8e6df") {
  return `<g transform="rotate(${S(grad)} 60 60)">
    <polygon points="60,${60 - laenge} ${60 - breite},62 60,66 ${60 + breite},62" fill="${farbe}"/>
  </g>`;
}

function strich(grad, r1, r2, staerke, farbe = "#cfccc2") {
  const a = ((grad - 90) * Math.PI) / 180;
  const [x1, y1] = [60 + r1 * Math.cos(a), 60 + r1 * Math.sin(a)];
  const [x2, y2] = [60 + r2 * Math.cos(a), 60 + r2 * Math.sin(a)];
  return `<line x1="${S(x1)}" y1="${S(y1)}" x2="${S(x2)}" y2="${S(y2)}" stroke="${farbe}" stroke-width="${staerke}"/>`;
}

function zahl(grad, r, text, groesse = 9) {
  const a = ((grad - 90) * Math.PI) / 180;
  const [x, y] = [60 + r * Math.cos(a), 60 + r * Math.sin(a)];
  return `<text x="${S(x)}" y="${S(y)}" font-size="${groesse}" fill="#dcd9cf" text-anchor="middle" dominant-baseline="central">${text}</text>`;
}

const GEHAEUSE = `<circle cx="60" cy="60" r="57" fill="#2a2c2e"/>
  <circle cx="60" cy="60" r="54" fill="#0f1113" stroke="#6a6d70" stroke-width="1.6"/>`;
const NABE = `<circle cx="60" cy="60" r="3.4" fill="#c9c6bc"/>`;

function svgRahmen(inhalt) {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" font-family="Arial, Helvetica, sans-serif">${inhalt}</svg>`;
}

export function svgFahrt(wert) {
  let skala = "";
  for (let w = FAHRTSKALA.von; w <= FAHRTSKALA.bis; w += 10) {
    const gross = w % 40 === 0;
    skala += strich(gradFahrt(w), gross ? 44 : 47, 51, gross ? 1.8 : 1);
    if (gross) skala += zahl(gradFahrt(w), 36, w, 8.5);
  }
  return svgRahmen(`${GEHAEUSE}${skala}
    <text x="60" y="42" font-size="6.5" fill="#9a978d" text-anchor="middle" letter-spacing="1">KNOTEN</text>
    <rect x="47" y="74" width="26" height="11" fill="#050607" stroke="#4a4d50" stroke-width="0.8"/>
    <text x="60" y="79.5" font-size="8.5" fill="#e8e6df" text-anchor="middle" dominant-baseline="central">${wert}</text>
    ${zeiger(46, 3, gradFahrt(wert))}
    <circle cx="60" cy="60" r="5" fill="#0f1113" stroke="#c9c6bc" stroke-width="2"/>`);
}

export function svgHoehe(wert) {
  let skala = "";
  for (let i = 0; i < 50; i++) {
    const gross = i % 5 === 0;
    skala += strich(i * 7.2, gross ? 44 : 47, 51, gross ? 1.8 : 1);
    if (gross) skala += zahl(i * 7.2, 37, i / 5, 9.5);
  }
  return svgRahmen(`${GEHAEUSE}${skala}
    <text x="60" y="38" font-size="6.5" fill="#9a978d" text-anchor="middle" letter-spacing="1">FUSS</text>
    <rect x="29" y="54" width="27" height="12" fill="#050607" stroke="#4a4d50" stroke-width="0.8"/>
    <text x="42.5" y="60.5" font-size="8.5" fill="#e8e6df" text-anchor="middle" dominant-baseline="central">${wert}</text>
    ${zeiger(30, 4.5, gradHoehe1000(wert))}
    ${zeiger(46, 2.6, gradHoehe100(wert))}${NABE}`);
}

export function svgKurs(wert) {
  const BUCHSTABEN = { 0: "N", 90: "E", 180: "S", 270: "W" };
  let rose = "";
  for (let g = 0; g < 360; g += 10) {
    const gross = g % 30 === 0;
    rose += strich(g, gross ? 45 : 48, 52, gross ? 1.6 : 1);
    if (gross) {
      const beschriftung = BUCHSTABEN[g] ?? String(g / 10);
      rose += `<g transform="rotate(${g} 60 60)"><text x="60" y="21" font-size="8.5" fill="#dcd9cf" text-anchor="middle" dominant-baseline="central">${beschriftung}</text></g>`;
    }
  }
  const flugzeug = `<path fill="#e8e6df" d="M60 24 C62 28 63.5 32 63.5 40 L63.5 48 L94 62 L94 69 L63.5 60
    L63.5 74 L77 81 L77 86 L62 82.5 L62 87 L58 87 L58 82.5 L43 86 L43 81 L56.5 74 L56.5 60
    L26 69 L26 62 L56.5 48 L56.5 40 C56.5 32 58 28 60 24 Z"/>`;
  let winkelmarken = "";
  for (const g of [45, 135, 225, 315]) winkelmarken += strich(g, 46, 53, 2.2, "#e8a13f");
  return svgRahmen(`${GEHAEUSE}
    <g transform="rotate(${S(-wert)} 60 60)">${rose}</g>
    ${winkelmarken}
    <polygon points="60,7 56.5,13 63.5,13" fill="#e8a13f"/>
    ${flugzeug}
    <rect x="45" y="88" width="30" height="12" fill="#050607" stroke="#4a4d50" stroke-width="0.8"/>
    <text x="60" y="94.5" font-size="8.5" fill="#e8e6df" text-anchor="middle" dominant-baseline="central">${String(wert).padStart(3, "0")}°</text>`);
}

export function svgVario(wert) {
  let skala = "";
  for (let w = -2000; w <= 2000; w += 250) {
    const gross = w % 500 === 0;
    const grad = gradVario(w) - 90; // Skala liegt um die Neun-Uhr-Lage
    skala += strich(grad, gross ? 44 : 47, 51, gross ? 1.8 : 1);
    if (gross) skala += zahl(grad, 37, Math.abs(w) / 100, 8.5);
  }
  return svgRahmen(`${GEHAEUSE}${skala}
    <text x="72" y="34" font-size="7" fill="#9a978d" text-anchor="middle" letter-spacing="1">STEIGEN</text>
    <text x="72" y="88" font-size="7" fill="#9a978d" text-anchor="middle" letter-spacing="1">SINKEN</text>
    <text x="74" y="60" font-size="6" fill="#9a978d" text-anchor="middle">FT/MIN ×100</text>
    <g transform="rotate(${S(gradVario(wert))} 60 60)">
      <polygon points="${60 - 46},60 62,${60 - 3} 66,60 62,${60 + 3}" fill="#e8e6df"/>
    </g>${NABE}`);
}

export function svgHorizont(wert) {
  const { roll, nick } = wert;
  const versatz = nick * 1.5;
  // Nickleiter wie auf dem Vorbildfoto: kräftige weiße Balken, bei 10 Grad
  // geteilt mit Lücke in der Mitte, bei 20 Grad durchgehend lang, bei 5 kurz.
  const balken = (y, art) => {
    if (art === "geteilt") {
      return `<line x1="34" y1="${S(y)}" x2="52" y2="${S(y)}" stroke="#f2f0e9" stroke-width="2"/>
        <line x1="68" y1="${S(y)}" x2="86" y2="${S(y)}" stroke="#f2f0e9" stroke-width="2"/>`;
    }
    const halb = art === "lang" ? 28 : 10;
    return `<line x1="${60 - halb}" y1="${S(y)}" x2="${60 + halb}" y2="${S(y)}" stroke="#f2f0e9" stroke-width="2"/>`;
  };
  let leiter = "";
  for (const richtung of [-1, 1]) {
    leiter += balken(60 + richtung * 7.5, "kurz");
    leiter += balken(60 + richtung * 15, "geteilt");
    leiter += balken(60 + richtung * 30, "lang");
  }
  return svgRahmen(`
    <defs><clipPath id="hzr"><rect x="9" y="13" width="102" height="94" rx="11"/></clipPath></defs>
    <rect x="5" y="9" width="110" height="102" rx="14" fill="#2a2c2e"/>
    <rect x="8" y="12" width="104" height="96" rx="12" fill="#0f1113"/>
    <g clip-path="url(#hzr)">
      <g transform="rotate(${S(-roll)} 60 60) translate(0 ${S(versatz)})">
        <rect x="-40" y="-100" width="200" height="160" fill="#2f7ec7"/>
        <rect x="-40" y="60" width="200" height="160" fill="#8a5a2b"/>
        <line x1="-40" y1="60" x2="160" y2="60" stroke="#f2f0e9" stroke-width="2.2"/>
        ${leiter}
      </g>
      <g transform="rotate(${S(-roll)} 60 60)">
        <polygon points="60,15 56,22 64,22" fill="#f2f0e9"/>
      </g>
    </g>
    <path d="M34 60 L52 60 L52 67" fill="none" stroke="#f2f0e9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M86 60 L68 60 L68 67" fill="none" stroke="#f2f0e9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M34 60 L52 60 L52 67" fill="none" stroke="#1a1b1c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M86 60 L68 60 L68 67" fill="none" stroke="#1a1b1c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="60" cy="60" r="3.6" fill="#f2f0e9"/><circle cx="60" cy="60" r="2" fill="#1a1b1c"/>
    <rect x="8" y="12" width="104" height="96" rx="12" fill="none" stroke="#6a6d70" stroke-width="1.6"/>`);
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
  const links = ["fahrt", "horizont", "hoehe"].map((id) => `<span class="instrument">${svgInstrument(id, id === "horizont" ? werte.horizont : werte[id])}</span>`).join("");
  const rechts = ["kurs", "vario"].map((id) => `<span class="instrument">${svgInstrument(id, werte[id])}</span>`).join("");
  return `<div class="instrumententafel"><div class="tafelgruppe">${links}</div><div class="tafelsteg"></div><div class="tafelgruppe">${rechts}</div></div>`;
}
