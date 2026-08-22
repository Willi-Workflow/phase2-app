import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });

// Wer schon gewählt hat, geht direkt in den Übungsbereich.
if (speicher.profil()) {
  location.replace("uebersicht.html");
}

// Chrome-Hinweis: alles außer echtem Chrome bekommt die Warnung.
const istChrome = /Chrome\//.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent);
if (!istChrome) document.getElementById("browserhinweis").style.display = "block";

let gewaehlt = false;

for (const knopf of document.querySelectorAll(".band")) {
  knopf.addEventListener("click", () => {
    if (gewaehlt) return;
    try {
      speicher.setzeProfil(knopf.dataset.profil);
    } catch {
      alert("Die Profilwahl konnte nicht gespeichert werden. Bitte den Browserspeicher freigeben und neu laden.");
      return;
    }
    gewaehlt = true;
    knopf.classList.add("gezogen");
    setTimeout(() => location.href = "uebersicht.html", 550);
  });
}
