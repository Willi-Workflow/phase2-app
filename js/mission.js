import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { bestwert, durchschnitt, vergleich, sortiertNeueste } from "./auswertung.js";
import { erzeugeControls } from "./controls.js";
import { rollenStand } from "./geraetestand.js";
import { PROFILFARBEN } from "./diagramm.js";
import { erzeugeUebung1 } from "./uebung1-lauf.js";
import { erzeugeUebung2 } from "./uebung2-lauf.js";
import { erzeugeUebung3 } from "./uebung3-lauf.js";
import { erzeugeUebung4 } from "./uebung4-lauf.js";
import { erzeugeUebung5 } from "./uebung5-lauf.js";
import { erzeugeUebung6 } from "./uebung6-lauf.js";
import { erzeugeHangartuer } from "./hangartuer.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });
const nr = Number(new URLSearchParams(location.search).get("bereich"));
const mission = MISSIONEN.find((m) => m.nr === nr);

let laufAktiv = false;
const controls = erzeugeControls(speicher);
// Bereiche mit echter Übung; alle übrigen laufen über den Probelauf.
const UEBUNGEN = { 1: erzeugeUebung1, 2: erzeugeUebung2, 3: erzeugeUebung3, 4: erzeugeUebung4, 5: erzeugeUebung5, 6: erzeugeUebung6 };
const uebung = mission && UEBUNGEN[mission.nr] ? UEBUNGEN[mission.nr]({ speicher, controls }) : null;

let alleLaeufe = [];

function zeichneStatistik() {
  const laeufe = alleLaeufe;
  zeichneHistorie(laeufe);
  const eigene = laeufe.filter((l) => l.profil === speicher.profil());
  // Bei fester 100er-Skala lesen sich die Werte als Prozent, sonst nackte Zahl.
  const einheit = mission.maximal === 100 ? " %" : "";
  const mitEinheit = (wert) => wert == null ? "–" : `${wert}${einheit}`;
  document.getElementById("bestwert").textContent = mitEinheit(bestwert(eigene));
  document.getElementById("durchschnitt").textContent = mitEinheit(durchschnitt(eigene));

  // Balken zeigen den Bestwert: bei fester Skala gegen deren Obergrenze,
  // sonst gegen den besseren der beiden Bestwerte.
  const v = vergleich(laeufe);
  const maximum = mission.maximal ?? Math.max(v.willi.bestwert ?? 0, v.luigi.bestwert ?? 0, 1);
  document.getElementById("vergleich").innerHTML = ["willi", "luigi"].map((profil) => `
    <div style="display:flex;justify-content:space-between;"><span>${profil.toUpperCase()}</span>
      <span>Ø ${mitEinheit(v[profil].durchschnitt)} · Best ${mitEinheit(v[profil].bestwert)} · ${v[profil].anzahl} Läufe</span></div>
    <div class="balken ${profil}"><span style="width:${((v[profil].bestwert ?? 0) / maximum) * 100}%"></span></div>
  `).join("");
}

async function zeichneAuswertung() {
  if (mission.auswertung === false) return;
  alleLaeufe = await speicher.ladeLaeufe(mission.nr);
  zeichneStatistik();
}

// Historie je Profil (Willis Auftrag vom 01.09.2026, ersetzt das
// Verlaufsdiagramm): zwei Spalten, das eigene Profil links, je Lauf Datum,
// Uhrzeit und Kennzahl, der neueste oben. Der beste Lauf eines Profils
// trägt die Markierung BEST; bei Gleichstand tragen sie alle betroffenen
// Läufe, denn sie sind gleich gut.
function zeichneHistorie(laeufe) {
  const eigenes = speicher.profil();
  const anderes = eigenes === "luigi" ? "willi" : "luigi";
  const einheit = mission.maximal === 100 ? " %" : "";
  const spalte = (profil) => {
    const eigene = sortiertNeueste(laeufe.filter((l) => l.profil === profil));
    const best = bestwert(eigene);
    const zwei = (n) => String(n).padStart(2, "0");
    const zeilen = eigene.map((l) => {
      const d = new Date(l.zeitpunkt);
      const datum = `${zwei(d.getDate())}.${zwei(d.getMonth() + 1)}. ${zwei(d.getHours())}:${zwei(d.getMinutes())}`;
      const istBest = l.kennzahl === best;
      return `<div class="historienzeile${istBest ? " best" : ""}">
        <span>${datum}</span><b>${l.kennzahl}${einheit}${istBest ? `<i>BEST</i>` : ""}</b></div>`;
    }).join("");
    return `<div class="historienspalte">
      <div class="historienkopf"><i style="background:${PROFILFARBEN[profil]}"></i>${profil.toUpperCase()}</div>
      <div class="historienliste">${zeilen || `<p class="historienleer">Noch keine Läufe.</p>`}</div>
    </div>`;
  };
  document.getElementById("historie").innerHTML = spalte(eigenes) + spalte(anderes);
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
  if (uebung) {
    laufAktiv = true;
    // Die Hangartür fährt über der Missionsseite zu, dahinter baut sich der
    // Test auf, dann öffnet die Übung die Tür selbst.
    const tuer = erzeugeHangartuer();
    tuer.schliesse().then(() => uebung.starte({
      tuer,
      registriereAbbruch: (fn) => { brichLaufAb = fn; },
      beiEnde: async (ergebnis) => {
        // Abbruch sofort entschärfen, den Lauf aber erst nach Sichern und
        // Neuzeichnen freigeben: sonst startet ein schneller START-Klick einen
        // zweiten Lauf, während dieser hier noch speichert und die Auswertung
        // neu zeichnet (Q8).
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
        await zeichneAuswertung();
        laufAktiv = false;
      },
    }));
    return;
  }
  laufAktiv = true;

  // Auch der Probelauf läuft hinter dem Hangartür-Übergang: Tür zu, Aufbau
  // verdeckt, Tür auf, erst dann läuft die Zeit.
  const tuer = erzeugeHangartuer();

  const schleier = document.createElement("div");
  schleier.className = "laufschleier";
  schleier.innerHTML = `
    <div class="gross" id="zaehler">0</div>
    <div class="hinweis">PROBELAUF · 10 SEKUNDEN<br>Klicken oder Feuerknopf drücken, jeder Treffer zählt.<br>Esc bricht ab, ohne zu werten.</div>
    <div class="hinweis" id="restzeit">10,0 s</div>`;

  let punkte = 0;
  let beendet = false;
  let ende = Infinity;
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
    await tuer.oeffne(); // räumt die Tür auch bei Abbruch während der Fahrt weg
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
    await tuer.schliesse();
    raeumeAuf();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    if (mission.wertung) { // im Probebetrieb zählt der Lauf nicht
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
      await zeichneAuswertung();
    }
    await tuer.oeffne();
  };

  tuer.schliesse().then(() => {
    // Wurde während der zufahrenden Tür abgebrochen, darf der Schleier nicht mehr
    // angehängt und kein Vollbild angefordert werden: raeumeAuf hat den Schleier
    // schon entfernt, ein nachträgliches Anhängen bliebe für immer stehen (Q1).
    if (beendet) return;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    tuer.oeffne().then(() => {
      if (beendet) return;
      ende = performance.now() + 10_000;
      requestAnimationFrame(takt);
    });
  });
}

function initialisiereSeite() {
  // Erst nach dem Laden der Zuordnung zeigt die Rollenanzeige den echten Stand,
  // vorher stünde kurz überall Tastatur.
  controls.lade().then(zeichneGeraete);

  document.getElementById("missionstitel").textContent = mission.name.toUpperCase();
  if (mission.auswertung === false) {
    document.getElementById("auswertungsfeld").hidden = true;
    document.getElementById("missionsraster").classList.add("eine-spalte");
  }
  document.getElementById("missionsnummer").textContent = `MISSION 0${mission.nr}`;
  document.getElementById("probehinweis").hidden = Boolean(mission.wertung);

  const startknopf = document.getElementById("start");
  startknopf.addEventListener("click", starteLauf);
  if (uebung) {
    document.getElementById("uebungshinweis").textContent = uebung.hinweis;
    // START bleibt gesperrt, bis die gespeicherten Einstellungen geladen sind,
    // sonst liefe ein früher Klick mit den Vorgabewerten statt der eigenen (Q9).
    if (uebung.ladeEinstellung) startknopf.disabled = true;
    Promise.resolve(uebung.ladeEinstellung?.()).then(() => {
      uebung.zeichneFeld?.(document.getElementById("uebungsfeld"));
      startknopf.disabled = false;
    });
    uebung.zeichneUnten?.(document.getElementById("uebungsunten"));
  }
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
