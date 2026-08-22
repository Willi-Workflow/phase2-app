import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { oeffneProfilmenue } from "./profilmenue.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });

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

document.getElementById("anhaenger").addEventListener("click", () => oeffneProfilmenue(speicher));

speicher.synce(); // liegengebliebene Läufe bestmöglich nachmelden
