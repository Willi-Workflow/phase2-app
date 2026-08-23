import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { bestwert, durchschnitt, vergleich } from "./auswertung.js";
import { erzeugeControls } from "./controls.js";
import { rollenStand } from "./geraetestand.js";
import { PROFILFARBEN, reihe, skala, punkte, pfad, laufnummern } from "./diagramm.js";
import { erzeugeUebung4 } from "./uebung4-lauf.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });
const nr = Number(new URLSearchParams(location.search).get("bereich"));
const mission = MISSIONEN.find((m) => m.nr === nr);

let laufAktiv = false;
const controls = erzeugeControls(speicher);
const uebung4 = mission?.nr === 4 ? erzeugeUebung4({ speicher }) : null;

let alleLaeufe = [];

function zeichneStatistik() {
  const laeufe = alleLaeufe;
  zeichneDiagramm(laeufe);
  const eigene = laeufe.filter((l) => l.profil === speicher.profil());
  document.getElementById("bestwert").textContent = bestwert(eigene) ?? "–";
  document.getElementById("durchschnitt").textContent = durchschnitt(eigene) ?? "–";

  // Balken zeigen den Bestwert: bei fester Skala gegen deren Obergrenze,
  // sonst gegen den besseren der beiden Bestwerte.
  const v = vergleich(laeufe);
  const maximum = mission.maximal ?? Math.max(v.willi.bestwert ?? 0, v.luigi.bestwert ?? 0, 1);
  document.getElementById("vergleich").innerHTML = ["willi", "luigi"].map((profil) => `
    <div style="display:flex;justify-content:space-between;"><span>${profil.toUpperCase()}</span>
      <span>Ø ${v[profil].durchschnitt ?? "–"} · Best ${v[profil].bestwert ?? "–"} · ${v[profil].anzahl} Läufe</span></div>
    <div class="balken ${profil}"><span style="width:${((v[profil].bestwert ?? 0) / maximum) * 100}%"></span></div>
  `).join("");
}

async function zeichneAuswertung() {
  alleLaeufe = await speicher.ladeLaeufe(mission.nr);
  zeichneStatistik();
}

// Verlauf beider Profile über der Laufnummer; das eigene Profil liegt oben und
// trägt den Endwert, Identität sichern Legende, Endbeschriftung und Werkzeugtipp
// gemeinsam, nie die Farbe allein. Gerechnet wird in Bildpunkten: ab elf Läufen
// behält das Diagramm den Punktabstand und rollt nach rechts, die Y-Achse steht.
const TAFELGRUND = "#0d1109";
// Gezeichnet wird in Einheiten eines festen Rasters (Grundbreite 310, Höhe 172),
// die Größe regelt CSS rein prozentual. Beim Rollen wächst nur die Einheitenzahl
// in der Breite, der Maßstab bleibt gleich, darum braucht es keine Pixelmessung.
const DIAGRAMM = { hoehe: 172, oben: 10, zeichenhoehe: 144, rand: 7, grundbreite: 310, sichtbareLaeufe: 10 };

function zeichneDiagramm(laeufe) {
  const behaelter = document.getElementById("diagramm");
  const eigenes = speicher.profil();
  const anderes = eigenes === "willi" ? "luigi" : "willi";
  const reihen = [
    { profil: anderes, werte: reihe(laeufe, anderes) },
    { profil: eigenes, werte: reihe(laeufe, eigenes) },
  ];
  const maxAnzahl = Math.max(...reihen.map((r) => r.werte.length));
  behaelter.hidden = false;

  // Das Raster steht auch ohne Läufe: mindestens zehn Plätze, der erste Lauf
  // sitzt links auf Platz 1.
  const plaetze = Math.max(maxAnzahl, DIAGRAMM.sichtbareLaeufe);
  const rollen = document.getElementById("diagrammrollen");
  const rollbar = plaetze > DIAGRAMM.sichtbareLaeufe;
  const schrittBreite = (DIAGRAMM.grundbreite - 2 * DIAGRAMM.rand) / (DIAGRAMM.sichtbareLaeufe - 1);
  const gesamtBreite = rollbar
    ? (plaetze - 1) * schrittBreite + 2 * DIAGRAMM.rand
    : DIAGRAMM.grundbreite;
  const feld = { x: DIAGRAMM.rand, y: DIAGRAMM.oben, breite: gesamtBreite - 2 * DIAGRAMM.rand, hoehe: DIAGRAMM.zeichenhoehe };
  const xVon = (index) => feld.x + (index / (plaetze - 1)) * feld.breite;
  const yVon = (w, maxWert) => feld.y + feld.hoehe - (w / maxWert) * feld.hoehe;

  const y = skala(reihen.flatMap((r) => r.werte), mission.maximal === 100);
  document.getElementById("achsensvg").innerHTML = y.schritte.map((w) =>
    `<text class="achse" x="28" y="${(yVon(w, y.max) + 3).toFixed(1)}" text-anchor="end">${w}</text>`).join("");

  const gitter = y.schritte.map((w) =>
    `<line class="gitter" x1="0" y1="${yVon(w, y.max).toFixed(1)}" x2="${gesamtBreite.toFixed(1)}" y2="${yVon(w, y.max).toFixed(1)}"></line>`).join("");

  const nummern = rollbar ? Array.from({ length: plaetze }, (_, i) => i + 1) : laufnummern(plaetze);
  const unten = nummern.map((n) =>
    `<text class="achse" x="${xVon(n - 1).toFixed(1)}" y="${feld.y + feld.hoehe + 15}" text-anchor="middle">${n}</text>`).join("");

  const linien = reihen.filter((r) => r.werte.length).map((r) => {
    const p = punkte(r.werte, feld, plaetze, y.max);
    const kreise = p.map((pt) =>
      `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4" fill="${PROFILFARBEN[r.profil]}" stroke="${TAFELGRUND}" stroke-width="2"></circle>`).join("");
    const spitze = p[p.length - 1];
    const endwert = r.profil === eigenes
      ? `<text class="endwert" x="${Math.max(spitze.x, 12).toFixed(1)}" y="${Math.max(spitze.y - 9, 9).toFixed(1)}" text-anchor="middle">${r.werte[r.werte.length - 1]}</text>`
      : "";
    return `<path d="${pfad(p)}" fill="none" stroke="${PROFILFARBEN[r.profil]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>${kreise}${endwert}`;
  }).join("");

  document.getElementById("diagrammlegende").innerHTML = [eigenes, anderes].map((profil) =>
    `<span class="schluessel"><i style="background:${PROFILFARBEN[profil]}"></i>${profil.toUpperCase()}</span>`).join("");

  const flaeche = document.getElementById("diagrammflaeche");
  flaeche.style.width = `${(gesamtBreite / DIAGRAMM.grundbreite) * 100}%`;
  flaeche.innerHTML = `
    <svg viewBox="0 0 ${gesamtBreite.toFixed(1)} ${DIAGRAMM.hoehe}" role="img" aria-label="Verlauf der Läufe beider Profile">
      ${gitter}${unten}${linien}
      <line class="fadenkreuz" y1="${feld.y}" y2="${feld.y + feld.hoehe}" style="display:none"></line>
    </svg>
    <div class="werkzeugtipp" hidden></div>`;
  rollen.scrollLeft = rollen.scrollWidth;

  if (maxAnzahl > 0) verdrahteWerkzeugtipp(flaeche, reihen, maxAnzahl, plaetze, xVon, gesamtBreite);
}

function verdrahteWerkzeugtipp(flaeche, reihen, maxAnzahl, plaetze, xVon, gesamtBreite) {
  const svg = flaeche.querySelector("svg");
  const kreuz = svg.querySelector(".fadenkreuz");
  const tipp = flaeche.querySelector(".werkzeugtipp");
  let index = maxAnzahl - 1;

  const zeige = () => {
    const xImBild = xVon(index);
    kreuz.setAttribute("x1", xImBild);
    kreuz.setAttribute("x2", xImBild);
    kreuz.style.display = "";
    tipp.hidden = false;
    tipp.textContent = "";
    const titel = document.createElement("b");
    titel.textContent = `LAUF ${index + 1}`;
    tipp.append(titel);
    for (const r of [...reihen].reverse()) {
      if (index >= r.werte.length) continue;
      const zeile = document.createElement("span");
      const schluessel = document.createElement("i");
      schluessel.style.background = PROFILFARBEN[r.profil];
      const wert = document.createElement("b");
      wert.textContent = String(r.werte[index]);
      zeile.append(schluessel, wert, document.createTextNode(` ${r.profil.toUpperCase()}`));
      tipp.append(zeile);
    }
    const links = (xImBild / gesamtBreite) * flaeche.clientWidth;
    tipp.style.left = `${Math.min(Math.max(links, 44), flaeche.clientWidth - 44)}px`;
  };
  const verberge = () => { kreuz.style.display = "none"; tipp.hidden = true; };

  svg.addEventListener("pointermove", (e) => {
    const einheit = (e.offsetX / flaeche.clientWidth) * gesamtBreite;
    const stelle = (einheit - DIAGRAMM.rand) / (gesamtBreite - 2 * DIAGRAMM.rand);
    index = Math.min(Math.max(Math.round(stelle * (plaetze - 1)), 0), maxAnzahl - 1);
    zeige();
  });
  svg.addEventListener("pointerleave", verberge);
  flaeche.tabIndex = 0;
  flaeche.addEventListener("focus", zeige);
  flaeche.addEventListener("blur", verberge);
  flaeche.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    index = Math.min(Math.max(index + (e.key === "ArrowRight" ? 1 : -1), 0), maxAnzahl - 1);
    zeige();
  });
}

function zeichneGeraete() {
  const kennungen = controls.geraete().map((g) => g.kennung);
  const zuordnung = {};
  for (const [rolle] of controls.ROLLEN) {
    const z = controls.zuordnungVon(rolle);
    if (z) zuordnung[rolle] = z;
  }
  const sicher = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const zeilen = rollenStand(controls.ROLLEN, zuordnung, kennungen).map((s) =>
    `<span class="rollenlampe ${s.zustand}"></span><span>${s.titel}</span><span class="rollentext">${sicher(s.text)}</span>`);
  const hinweis = kennungen.length ? ""
    : `<p class="geraetehinweis">Kein Gerät erkannt. Anschließen und eine Taste am Gerät drücken.</p>`;
  document.getElementById("geraetestand").innerHTML = zeilen.join("") + hinweis;
}

// Platzhalter-Lauf: wird je Bereich durch die echte Übung ersetzt.
// Abgebrochene Läufe (Esc, Vollbild verlassen, Tab gewechselt) werden nie
// gespeichert und tauchen daher nicht in der Statistik auf.
let brichLaufAb = null;

function starteLauf() {
  if (laufAktiv) return;
  if (uebung4) {
    laufAktiv = true;
    uebung4.starte({
      registriereAbbruch: (fn) => { brichLaufAb = fn; },
      beiEnde: async (ergebnis) => {
        laufAktiv = false;
        brichLaufAb = null;
        if (ergebnis && mission.wertung) {
          try {
            await speicher.speichereLauf({
              profil: speicher.profil(),
              bereich: mission.nr,
              zeitpunkt: new Date().toISOString(),
              kennzahl: ergebnis.kennzahl,
              daten: ergebnis.daten,
            });
          } catch {
            alert("Der Lauf konnte nicht gesichert werden und geht verloren. Bitte Verbindung und Einrichtung prüfen.");
          }
        }
        location.href = "uebersicht.html";
      },
    });
    return;
  }
  laufAktiv = true;

  const schleier = document.createElement("div");
  schleier.className = "laufschleier";
  schleier.innerHTML = `
    <div class="gross" id="zaehler">0</div>
    <div class="hinweis">PROBELAUF · 10 SEKUNDEN<br>Klicken oder Feuerknopf drücken, jeder Treffer zählt.<br>Esc bricht ab, ohne zu werten.</div>
    <div class="hinweis" id="restzeit">10,0 s</div>`;
  document.body.append(schleier);
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

  let punkte = 0;
  let beendet = false;
  const ende = performance.now() + 10_000;
  schleier.addEventListener("pointerdown", () => { punkte += 1; });

  // Chrome verbraucht das erste Esc im Vollbild oft selbst für den Vollbild-
  // Ausstieg, ohne Tastenereignis an die Seite. Darum zählt das Verlassen des
  // Vollbilds ebenso als Abbruch wie Esc; das Wegwechseln vom Tab auch, sonst
  // liefe der Lauf unsichtbar weiter und speicherte am Ende einen Leerwert.
  const raeumeAuf = () => {
    beendet = true;
    brichLaufAb = null;
    document.removeEventListener("fullscreenchange", beiVollbildwechsel);
    document.removeEventListener("visibilitychange", beiSichtwechsel);
    schleier.remove();
    laufAktiv = false;
  };
  const beiVollbildwechsel = () => { if (!document.fullscreenElement) brichLaufAb?.(); };
  const beiSichtwechsel = () => { if (document.hidden) brichLaufAb?.(); };
  brichLaufAb = async () => {
    raeumeAuf();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
  };
  document.addEventListener("fullscreenchange", beiVollbildwechsel);
  document.addEventListener("visibilitychange", beiSichtwechsel);

  const takt = async () => {
    if (beendet) return;
    if (controls.knopfGedrueckt()) punkte += 1;
    document.getElementById("zaehler").textContent = punkte;
    const rest = Math.max(0, ende - performance.now());
    document.getElementById("restzeit").textContent = `${(rest / 1000).toFixed(1)} s`;
    if (rest > 0) { requestAnimationFrame(takt); return; }
    raeumeAuf();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    if (!mission.wertung) return; // Probebetrieb: Lauf zählt nicht
    try {
      await speicher.speichereLauf({
        profil: speicher.profil(),
        bereich: mission.nr,
        zeitpunkt: new Date().toISOString(),
        kennzahl: punkte,
        daten: { art: "probelauf" },
      });
    } catch {
      alert("Der Lauf konnte nicht gesichert werden und geht verloren. Bitte Verbindung und Einrichtung prüfen.");
    }
    zeichneAuswertung();
  };
  requestAnimationFrame(takt);
}

function initialisiereSeite() {
  // Erst nach dem Laden der Zuordnung zeigt die Rollenanzeige den echten Stand,
  // vorher stünde kurz überall Tastatur.
  controls.lade().then(zeichneGeraete);

  document.getElementById("missionstitel").textContent = mission.name.toUpperCase();
  document.getElementById("missionsnummer").textContent = `MISSION 0${mission.nr}`;
  document.getElementById("probehinweis").hidden = Boolean(mission.wertung);

  if (uebung4) {
    document.getElementById("uebungshinweis").textContent =
      "Die fünf Instrumente erscheinen mit zufälligen Werten für die eingestellte Zeit. "
      + "Danach fragt der Test einzelne Instrumente ab: vier Antworten, zehn Sekunden Zeit. "
      + "Runden folgen am Stück, bis die Testdauer um ist.";
    uebung4.ladeEinstellung().then(() =>
      uebung4.zeichneEinstellungen(document.getElementById("uebungsfeld")));
  }

  document.getElementById("start").addEventListener("click", starteLauf);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && brichLaufAb) brichLaufAb(); });


  zeichneAuswertung();
  zeichneGeraete();
  setInterval(zeichneGeraete, 2000);
  speicher.synce();
}

if (!speicher.profil()) {
  location.replace("index.html");
} else if (!mission) {
  location.replace("uebersicht.html");
} else {
  initialisiereSeite();
}
