import { KONFIG } from "./konfig.js";
import { ANHEFT, pendelGroessen, pendelSchritt, istRuhig } from "./pendel.js";
import { PRUEFUNGSDATUM, ANREISEDATUM, ZAEHLBEGINN, heuteAlsIso, tageBis, monatsraster } from "./zeitplan.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { oeffneProfilmenue } from "./profilmenue.js";
import { erzeugeControls } from "./controls.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });
const controls = erzeugeControls(speicher);
controls.lade();

if (!speicher.profil()) location.replace("index.html");

document.getElementById("profilname").textContent = (speicher.profil() ?? "").toUpperCase();

const raster = document.getElementById("raster");
for (const mission of MISSIONEN) {
  const knopf = document.createElement("button");
  knopf.className = "schild";
  knopf.style.backgroundImage = `url(bilder/schild-0${mission.nr}.png)`;
  knopf.innerHTML = `<span class="nummer">MISSION 0${mission.nr}</span><span class="name">${mission.name.toUpperCase()}</span>`;
  knopf.addEventListener("click", () => location.href = `mission.html?bereich=${mission.nr}`);
  raster.append(knopf);
}

document.getElementById("anhaenger").addEventListener("click", () =>
  oeffneProfilmenue(speicher, { oeffneControls: () => controls.oeffneDialog() }));

// Frisch vom Bund gezogen: der Anhänger übernimmt den Schwung aus dem Flug
// und pendelt nach derselben Pendelgleichung aus wie auf der Startseite.
const schwungRoh = sessionStorage.getItem("p2-anheft-schwung");
if (schwungRoh) {
  sessionStorage.removeItem("p2-anheft-schwung");
  try {
    let zustand = JSON.parse(schwungRoh);
    const anhaenger = document.getElementById("anhaenger");
    const groessen = { ...pendelGroessen(anhaenger.offsetHeight), daempfung: ANHEFT.daempfung };
    anhaenger.style.transformOrigin = "47.1% 9.2%";
    anhaenger.style.transition = "none";
    let tVorher = performance.now();
    const schritt = (jetzt) => {
      const dt = Math.min(0.032, (jetzt - tVorher) / 1000) || 0.016;
      tVorher = jetzt;
      zustand = pendelSchritt(zustand, groessen, dt);
      anhaenger.style.transform = `rotate(${(-zustand.theta * 180) / Math.PI}deg)`;
      if (!istRuhig(zustand)) requestAnimationFrame(schritt);
      else { anhaenger.style.transform = ""; anhaenger.style.transformOrigin = ""; anhaenger.style.transition = ""; }
    };
    requestAnimationFrame(schritt);
  } catch { /* ohne Schwung geht es schlicht weiter */ }
}

// Countdown zur Prüfung: aus dem aktuellen Datum gerechnet und bei jedem
// Sichtbarwerden der Seite neu aufgebaut, damit er auch über Nacht stimmt.
function zeichneZeitplan() {
  const feld = document.getElementById("zeitplan");
  const heute = heuteAlsIso();
  const rest = tageBis(PRUEFUNGSDATUM, heute);
  const [pj, pm, pt] = PRUEFUNGSDATUM.split("-");
  let restzeile;
  if (rest > 1) restzeile = `Noch <b>${rest} Tage</b> bis zur Prüfung`;
  else if (rest === 1) restzeile = "Morgen ist <b>Prüfung</b>";
  else if (rest === 0) restzeile = "<b>Heute ist Prüfung.</b> Hals- und Beinbruch!";
  else restzeile = `Die Prüfung war am ${Number(pt)}.${Number(pm)}.${pj}`;

  let rumpf = "";
  if (rest >= 0) {
    rumpf = monatsraster(ZAEHLBEGINN, PRUEFUNGSDATUM).map((monat) => {
      const kopf = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
        .map((w) => `<span class="wochenkopf">${w}</span>`).join("");
      const zellen = monat.wochen.flat().map((tag) => {
        if (!tag) return "<span></span>";
        const klassen = ["tagkachel"];
        if (tag.wochenende) klassen.push("wochenende");
        if (tag.iso < heute) klassen.push("vergangen");
        if (tag.iso === heute) klassen.push("heute");
        if (tag.iso === PRUEFUNGSDATUM) klassen.push("pruefung");
        if (tag.iso === ANREISEDATUM) klassen.push("anreise");
        const ziel = tag.iso === PRUEFUNGSDATUM ? '<span class="ziel">PRÜFUNG</span>' : "";
        const notiz = tag.iso === ANREISEDATUM ? '<span class="notiz">Anreisetag</span>' : "";
        return `<span class="${klassen.join(" ")}"><span class="nr">${tag.tag}</span>${ziel}${notiz}</span>`;
      }).join("");
      return `<div class="monat"><div class="monatsname">${monat.name}</div>
        <div class="wochenraster">${kopf}${zellen}</div></div>`;
    }).join("");
  }

  feld.innerHTML = `
    <span class="klebeband olinks"></span><span class="klebeband orechts"></span>
    <span class="klebeband ulinks"></span><span class="klebeband urechts"></span>
    <div class="kopfzeile">
      <span class="rest">${restzeile}</span>
    </div>
    ${rumpf}`;
}
zeichneZeitplan();
document.addEventListener("visibilitychange", () => { if (!document.hidden) zeichneZeitplan(); });

speicher.synce(); // liegengebliebene Läufe bestmöglich nachmelden
