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

for (const knopf of document.querySelectorAll(".band")) {
  knopf.addEventListener("click", () => {
    speicher.setzeProfil(knopf.dataset.profil);
    knopf.classList.add("gezogen");
    setTimeout(() => location.href = "uebersicht.html", 550);
  });
}
