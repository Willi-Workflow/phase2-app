import { KONFIG } from "./konfig.js";
import { ANHEFT, pendelGroessen, pendelSchritt, istRuhig } from "./pendel.js";
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

speicher.synce(); // liegengebliebene Läufe bestmöglich nachmelden
