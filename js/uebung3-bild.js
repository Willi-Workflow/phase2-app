// Zwei zusätzliche Anzeigen für Mission 3 (ICT-Nachbau), gezeichnet im
// selben Gehäusestil wie js/instrumente.js: dunkle Gehäuseplatte mit
// Schrauben, schwarzes Zifferblatt, helle Skala. Die Uhr zeigt die
// verbleibende Flugzeit mit einem roten Zeiger, eine volle Umdrehung je
// 60 Sekunden; die Fehlersäule zeigt den gemittelten Momentanfehler als
// schwarzen Punkt auf einer schmalen senkrechten Skala von 0 bis 100.
// Beide bewusst gezeichnet statt fotografiert, wie im Original (Abbildung
// 3-9 der Dissertation). Die Zeichenhelfer aus instrumente.js sind dort
// nicht exportiert, deshalb stehen sie hier in eigener Fassung, mit den
// gleichen Farbwerten und demselben Aufbau. Anders als die fünf Instrumente
// aus instrumente.js tragen Uhr und Fehlersäule kein Kamerafoto, darum
// bekommt ihr Gehäuse nicht die Klasse "svg-gehaeuse": das Stylesheet würde
// die Platte sonst im Cockpit-Lauf ausblenden (stil.css, Regel für
// ".panelflaeche .instrument svg .svg-gehaeuse"), ohne dass ein Foto
// nachrückt. Reine Funktionen ohne DOM, mit node --test prüfbar.

const S = (n) => n.toFixed(2);
const HELL = "#e8e6dd";
const ROT = "#c33a2a";

// Gemeinsame Verläufe und Filter im Aufbau von instrumente.js, mit eigenem
// Namensraum ("u3-"), damit beide Module nebeneinander im selben Dokument
// stehen können, ohne dass sich Kennungen überschneiden.
const DEFS = `<defs>
  <linearGradient id="u3-platte" x1="0.18" y1="0" x2="0.82" y2="1">
    <stop offset="0%" stop-color="#313336"/><stop offset="48%" stop-color="#25272a"/><stop offset="100%" stop-color="#1a1c1e"/>
  </linearGradient>
  <clipPath id="u3-fase-hell"><polygon points="0,0 120,0 0,120"/></clipPath>
  <clipPath id="u3-fase-dunkel"><polygon points="120,0 120,120 0,120"/></clipPath>
  <radialGradient id="u3-schraube" cx="35%" cy="30%" r="85%">
    <stop offset="0%" stop-color="#93969a"/><stop offset="55%" stop-color="#54575b"/><stop offset="100%" stop-color="#26282a"/>
  </radialGradient>
  <radialGradient id="u3-senkung" cx="50%" cy="50%" r="50%">
    <stop offset="52%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
  </radialGradient>
  <radialGradient id="u3-bezel-aussen" cx="40%" cy="32%" r="78%">
    <stop offset="0%" stop-color="#95989c"/><stop offset="45%" stop-color="#404346"/><stop offset="100%" stop-color="#0e0f10"/>
  </radialGradient>
  <radialGradient id="u3-bezel-innen" cx="46%" cy="38%" r="72%">
    <stop offset="0%" stop-color="#5a5d61"/><stop offset="55%" stop-color="#28292b"/><stop offset="100%" stop-color="#0a0b0c"/>
  </radialGradient>
  <radialGradient id="u3-schatten" cx="50%" cy="46%" r="58%">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/><stop offset="70%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,0.62)"/>
  </radialGradient>
  <filter id="u3-weich" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="1.6"/>
  </filter>
</defs>`;

// Schraube mit Senkungsschatten, radialem Glanz und Kreuzschlitz, wie in
// instrumente.js; der Winkel dreht den Schlitz je Schraube unterschiedlich.
function schraube(x, y, winkel, r = 5) {
  const arm = r * 0.62;
  return `<circle cx="${x}" cy="${y}" r="${S(r + 1.9)}" fill="url(#u3-senkung)"/>
    <circle cx="${x}" cy="${y}" r="${S(r)}" fill="url(#u3-schraube)" stroke="#17181a" stroke-width="0.8"/>
    <g transform="rotate(${winkel} ${x} ${y})">
      <line x1="${S(x - arm)}" y1="${y}" x2="${S(x + arm)}" y2="${y}" stroke="#131417" stroke-width="1.3"/>
      <line x1="${x}" y1="${S(y - arm)}" x2="${x}" y2="${S(y + arm)}" stroke="#131417" stroke-width="1" opacity="0.75"/>
    </g>`;
}

function svgRahmen(inhalt, breite = 120, hoehe = 120) {
  return `<svg viewBox="0 0 ${breite} ${hoehe}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, Helvetica, sans-serif">${DEFS}${inhalt}</svg>`;
}

// ---------- Uhr ----------
// Zeigerwinkel in Grad, 0 an der 12-Uhr-Stellung, im Uhrzeigersinn: bei
// restS 60 (volle Zeit übrig) steht der Zeiger auf 0, bei restS 0 (Zeit
// abgelaufen) hat er die volle Umdrehung von 360 Grad hinter sich.
export function uhrwinkel(restS) {
  return (1 - restS / 60) * 360;
}

// Punkt auf dem 120er-Raster der Uhr, Mittelpunkt 60,60; 0 Grad zeigt nach
// oben, positiv im Uhrzeigersinn, wie in instrumente.js.
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

function zeiger(laenge, breite, grad, farbe = HELL) {
  return `<g transform="rotate(${S(grad)} 60 60)">
    <polygon points="60,${60 - laenge} ${60 - breite},${60 - laenge + 12} ${60 - breite},67 ${60 + breite},67 ${60 + breite},${60 - laenge + 12}" fill="${farbe}"/>
  </g>`;
}

const NABE = `<circle cx="60" cy="60" r="5.6" fill="#1d1f21" stroke="#43464a" stroke-width="1"/>`;

const PLATTE = `<rect x="1.5" y="1.5" width="117" height="117" rx="9" fill="url(#u3-platte)"/>
  <rect x="2.4" y="2.4" width="115.2" height="115.2" rx="8.2" fill="none" stroke="#6f7276" stroke-width="0.9" opacity="0.5" clip-path="url(#u3-fase-hell)"/>
  <rect x="2.4" y="2.4" width="115.2" height="115.2" rx="8.2" fill="none" stroke="#000000" stroke-width="0.9" opacity="0.55" clip-path="url(#u3-fase-dunkel)"/>
  <rect x="1.5" y="1.5" width="117" height="117" rx="9" fill="none" stroke="#0f1011" stroke-width="1"/>
  ${schraube(11.5, 11.5, 28)}${schraube(108.5, 11.5, -37)}${schraube(11.5, 108.5, 64)}${schraube(108.5, 108.5, 8)}`;

const GEHAEUSE_UHR = `${PLATTE}
  <circle cx="60" cy="60" r="54.5" fill="url(#u3-bezel-aussen)"/>
  <circle cx="60" cy="60" r="50.6" fill="url(#u3-bezel-innen)"/>
  ${bogen(-56, 56, 52.6, "rgba(255,255,255,0.4)", 1.7)}
  ${bogen(120, 240, 52.6, "rgba(0,0,0,0.5)", 1.9)}
  <circle cx="60" cy="60" r="49" fill="#0b0c0d"/>`;

const SCHLIFF_UHR = `<circle cx="60" cy="60" r="49" fill="url(#u3-schatten)"/>
  <ellipse cx="44" cy="32" rx="28" ry="12" fill="rgba(255,255,255,0.05)" transform="rotate(-25 44 32)" filter="url(#u3-weich)"/>`;

// Schwarzes Rundinstrument nach Abbildung 3-9: Ziffern 1 bis 12 im
// Uhrzeigersinn ab oben, roter Zeiger, Aufschrift Zeit.
export function svgUhr(restS) {
  let ziffernblatt = "";
  for (let i = 0; i < 60; i++) {
    const grad = i * 6;
    const gross = i % 5 === 0;
    ziffernblatt += strich(grad, gross ? 40 : 43, 46.5, gross ? 1.8 : 1);
    if (gross) {
      const stunde = i / 5;
      ziffernblatt += zahl(grad, 33, stunde === 0 ? 12 : stunde, 9.5);
    }
  }
  return svgRahmen(`${GEHAEUSE_UHR}${ziffernblatt}
    <text x="60" y="78" font-size="8" fill="${HELL}" text-anchor="middle" letter-spacing="1">ZEIT</text>
    ${zeiger(32, 3, uhrwinkel(restS), ROT)}${NABE}${SCHLIFF_UHR}`);
}

// ---------- Fehlersäule ----------
// Maße der schmalen Säule: eigenes, hochkant stehendes Raster, die Skala
// läuft senkrecht in der schwarzen Zifferblattfläche der Platte.
const SAEULE = { breite: 50, hoehe: 130, railX: 21, railBreite: 8, railOben: 28, railUnten: 106 };

function saeulenY(anteil) {
  return SAEULE.railUnten - anteil * (SAEULE.railUnten - SAEULE.railOben);
}

// Anteil 0 bis 1 aus dem Prozentwert, linear, außerhalb gedeckelt: 0 unten,
// 100 oben.
export function saeulenanteil(prozent) {
  return Math.min(1, Math.max(0, prozent / 100));
}

// Schmale senkrechte Skala 0 bis 100 mit schwarzem Punkt nach Abbildung
// 3-9, Aufschrift Fehlersäule.
export function svgSaeule(prozent) {
  const punktY = saeulenY(saeulenanteil(prozent));
  const gehaeuse = `<rect x="2" y="2" width="46" height="124" rx="6" fill="url(#u3-platte)"/>
    <rect x="2" y="2" width="46" height="124" rx="6" fill="none" stroke="#0f1011" stroke-width="1"/>
    ${schraube(10, 8, 24, 3)}${schraube(40, 8, -18, 3)}${schraube(10, 120, 52, 3)}${schraube(40, 120, -6, 3)}
    <rect x="9" y="22" width="32" height="90" rx="4" fill="#0b0c0d"/>`;
  // Der Schacht reicht etwas über die 0- und 100-Marke hinaus, damit der
  // Punkt auch an den Enden ganz auf der hellen Skala liegt statt zur
  // Hälfte auf dem schwarzen Zifferblatt.
  const schachtPolster = 5;
  const rail = `<rect x="${SAEULE.railX}" y="${S(SAEULE.railOben - schachtPolster)}" width="${SAEULE.railBreite}" height="${S(SAEULE.railUnten - SAEULE.railOben + 2 * schachtPolster)}" rx="4" fill="${HELL}"/>`;
  let marken = "";
  for (const pct of [0, 25, 50, 75, 100]) {
    const y = saeulenY(pct / 100);
    marken += `<line x1="18" y1="${S(y)}" x2="32" y2="${S(y)}" stroke="#26282a" stroke-width="1"/>`;
  }
  let beschriftung = "";
  for (const pct of [0, 50, 100]) {
    const y = saeulenY(pct / 100);
    beschriftung += `<text x="36" y="${S(y + 1.6)}" font-size="4.5" fill="${HELL}" text-anchor="start">${pct}</text>`;
  }
  const punkt = `<circle cx="25" cy="${S(punktY)}" r="4" fill="#0b0c0d" stroke="${HELL}" stroke-width="1.2"/>`;
  const titel = `<text x="25" y="17" font-size="4.2" fill="${HELL}" text-anchor="middle" letter-spacing="0.2">FEHLERSÄULE</text>`;
  return svgRahmen(`${gehaeuse}${rail}${marken}${beschriftung}${punkt}${titel}`, SAEULE.breite, SAEULE.hoehe);
}
