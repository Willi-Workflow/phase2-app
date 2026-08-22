import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { sortiertNeueste, bestwert, durchschnitt, vergleich } from "./auswertung.js";
import { erzeugeControls } from "./controls.js";
import { rollenStand } from "./geraetestand.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });
const nr = Number(new URLSearchParams(location.search).get("bereich"));
const mission = MISSIONEN.find((m) => m.nr === nr);

let laufAktiv = false;
const controls = erzeugeControls(speicher);

async function zeichneAuswertung() {
  const laeufe = await speicher.ladeLaeufe(mission.nr);
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
function starteLauf() {
  if (laufAktiv) return;
  laufAktiv = true;

  const schleier = document.createElement("div");
  schleier.className = "laufschleier";
  schleier.innerHTML = `
    <div class="gross" id="zaehler">0</div>
    <div class="hinweis">PROBELAUF · 10 SEKUNDEN<br>Klicken oder Feuerknopf drücken, jeder Treffer zählt.</div>
    <div class="hinweis" id="restzeit">10,0 s</div>`;
  document.body.append(schleier);
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

  let punkte = 0;
  const ende = performance.now() + 10_000;
  schleier.addEventListener("pointerdown", () => { punkte += 1; });

  const takt = async () => {
    if (controls.knopfGedrueckt()) punkte += 1;
    document.getElementById("zaehler").textContent = punkte;
    const rest = Math.max(0, ende - performance.now());
    document.getElementById("restzeit").textContent = `${(rest / 1000).toFixed(1)} s`;
    if (rest > 0) { requestAnimationFrame(takt); return; }
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    schleier.remove();
    laufAktiv = false;
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

  document.getElementById("start").addEventListener("click", starteLauf);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && document.querySelector(".laufschleier")) location.reload(); });

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
