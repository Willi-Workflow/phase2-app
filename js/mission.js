import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { sortiertNeueste, bestwert, durchschnitt, vergleich } from "./auswertung.js";
import { erzeugeControls } from "./controls.js";
import { rollenStand } from "./geraetestand.js";
import { PROFILFARBEN, reihe, skala, punkte, pfad, laufnummern } from "./diagramm.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });
const nr = Number(new URLSearchParams(location.search).get("bereich"));
const mission = MISSIONEN.find((m) => m.nr === nr);

let laufAktiv = false;
const controls = erzeugeControls(speicher);

async function zeichneAuswertung() {
  const laeufe = await speicher.ladeLaeufe(mission.nr);
  zeichneDiagramm(laeufe);
  const eigene = laeufe.filter((l) => l.profil === speicher.profil());
  const liste = document.getElementById("laufliste");
  liste.innerHTML = sortiertNeueste(eigene).slice(0, 6)
    .map((l) => `<li><span>${l.zeitpunkt.slice(0, 10)}</span><b>${l.kennzahl} ${mission.kennzahlName}</b></li>`)
    .join("") || "<li><span>Noch kein Lauf</span></li>";
  document.getElementById("bestwert").textContent = bestwert(eigene) ?? "–";
  document.getElementById("durchschnitt").textContent = durchschnitt(eigene) ?? "–";

  const v = vergleich(laeufe);
  const maximum = Math.max(v.willi.durchschnitt ?? 0, v.luigi.durchschnitt ?? 0, 1);
  document.getElementById("vergleich").innerHTML = ["willi", "luigi"].map((profil) => `
    <div style="display:flex;justify-content:space-between;"><span>${profil.toUpperCase()}</span>
      <span>Ø ${v[profil].durchschnitt ?? "–"} · Best ${v[profil].bestwert ?? "–"} · ${v[profil].anzahl} Läufe</span></div>
    <div class="balken ${profil}"><span style="width:${((v[profil].durchschnitt ?? 0) / maximum) * 100}%"></span></div>
  `).join("");
}

// Verlauf beider Profile über der Laufnummer; das eigene Profil liegt oben und
// trägt den Endwert, Identität sichern Legende, Endbeschriftung und Werkzeugtipp
// gemeinsam, nie die Farbe allein.
const TAFELGRUND = "#0d1109";

function zeichneDiagramm(laeufe) {
  const behaelter = document.getElementById("diagramm");
  const eigenes = speicher.profil();
  const anderes = eigenes === "willi" ? "luigi" : "willi";
  const reihen = [
    { profil: anderes, werte: reihe(laeufe, anderes) },
    { profil: eigenes, werte: reihe(laeufe, eigenes) },
  ];
  const maxAnzahl = Math.max(...reihen.map((r) => r.werte.length));
  if (maxAnzahl === 0) { behaelter.hidden = true; return; }
  behaelter.hidden = false;

  const y = skala(reihen.flatMap((r) => r.werte), mission.kennzahlName.includes("%"));
  const feld = { x: 34, y: 10, breite: 296, hoehe: 144 };
  const xVon = (index) => feld.x + (maxAnzahl > 1 ? (index / (maxAnzahl - 1)) * feld.breite : feld.breite / 2);

  const gitter = y.schritte.map((w) => {
    const yy = feld.y + feld.hoehe - (w / y.max) * feld.hoehe;
    return `<line class="gitter" x1="${feld.x}" y1="${yy}" x2="${feld.x + feld.breite}" y2="${yy}"></line>
      <text class="achse" x="${feld.x - 6}" y="${yy + 3}" text-anchor="end">${w}</text>`;
  }).join("");

  const unten = laufnummern(maxAnzahl).map((n) =>
    `<text class="achse" x="${xVon(n - 1)}" y="${feld.y + feld.hoehe + 15}" text-anchor="middle">${n}</text>`).join("");

  const linien = reihen.filter((r) => r.werte.length).map((r) => {
    const p = punkte(r.werte, feld, maxAnzahl, y.max);
    const kreise = p.map((pt) =>
      `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4" fill="${PROFILFARBEN[r.profil]}" stroke="${TAFELGRUND}" stroke-width="2"></circle>`).join("");
    const spitze = p[p.length - 1];
    const endwert = r.profil === eigenes
      ? `<text class="endwert" x="${spitze.x.toFixed(1)}" y="${(spitze.y - 9).toFixed(1)}" text-anchor="middle">${r.werte[r.werte.length - 1]}</text>`
      : "";
    return `<path d="${pfad(p)}" fill="none" stroke="${PROFILFARBEN[r.profil]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>${kreise}${endwert}`;
  }).join("");

  document.getElementById("diagrammlegende").innerHTML = [eigenes, anderes].map((profil) =>
    `<span class="schluessel"><i style="background:${PROFILFARBEN[profil]}"></i>${profil.toUpperCase()}</span>`).join("");

  const flaeche = document.getElementById("diagrammflaeche");
  flaeche.innerHTML = `
    <svg viewBox="0 0 340 172" role="img" aria-label="Verlauf der Läufe beider Profile">
      ${gitter}${unten}${linien}
      <line class="fadenkreuz" y1="${feld.y}" y2="${feld.y + feld.hoehe}" style="display:none"></line>
    </svg>
    <div class="werkzeugtipp" hidden></div>`;

  verdrahteWerkzeugtipp(flaeche, reihen, maxAnzahl, xVon);
}

function verdrahteWerkzeugtipp(flaeche, reihen, maxAnzahl, xVon) {
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
    const links = (xImBild / 340) * flaeche.clientWidth;
    tipp.style.left = `${Math.min(Math.max(links, 44), flaeche.clientWidth - 44)}px`;
  };
  const verberge = () => { kreuz.style.display = "none"; tipp.hidden = true; };

  svg.addEventListener("pointermove", (e) => {
    const stelle = ((e.offsetX / flaeche.clientWidth) * 340 - 34) / 296;
    index = Math.min(Math.max(Math.round(stelle * (maxAnzahl - 1)), 0), maxAnzahl - 1);
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
