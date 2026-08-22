import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { sortiertNeueste, bestwert, durchschnitt, vergleich } from "./auswertung.js";
import { erzeugeControls } from "./controls.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });
if (!speicher.profil()) location.replace("index.html");

const nr = Number(new URLSearchParams(location.search).get("bereich"));
const mission = MISSIONEN.find((m) => m.nr === nr);
if (!mission) location.replace("uebersicht.html");

const controls = erzeugeControls(speicher);
controls.lade();

document.getElementById("missionstitel").textContent = mission.name.toUpperCase();
document.getElementById("missionsnummer").textContent = `MISSION 0${mission.nr}`;

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
  const geraete = controls.geraete();
  document.getElementById("geraetestand").textContent = geraete.length
    ? geraete.map((g) => g.kennung.slice(0, 22)).join(" · ")
    : "Kein Gerät erkannt. Anschließen und eine Taste am Gerät drücken. Tastatur geht auch.";
}

// Platzhalter-Lauf: wird je Bereich durch die echte Übung ersetzt.
function starteLauf() {
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

document.getElementById("start").addEventListener("click", starteLauf);
addEventListener("keydown", (e) => { if (e.key === "Escape" && document.querySelector(".laufschleier")) location.reload(); });

zeichneAuswertung();
zeichneGeraete();
setInterval(zeichneGeraete, 2000);
speicher.synce();
