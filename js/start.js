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

    // Band vom Bund lösen und als schwebendes Element festhalten
    const lage = knopf.getBoundingClientRect();
    const breite = knopf.offsetWidth;
    const start = { left: lage.left + (lage.width - breite) / 2, top: lage.top };
    const winkel = knopf.dataset.profil === "willi" ? 16 : -16;
    knopf.style.left = `${start.left}px`;
    knopf.style.top = `${start.top}px`;
    knopf.style.width = `${breite}px`;
    knopf.classList.add("anheften");

    // Ziel: Lage und Größe des Profilanhängers der Übersicht
    const zielBreite = innerWidth <= 1500 ? 54 : Math.min(78, Math.max(56, innerWidth * 0.055));
    const rechts = Math.min(60, Math.max(16, innerWidth * 0.04));
    const ziel = { left: innerWidth - rechts - zielBreite, top: 0 };

    const flug = knopf.animate([
      { left: `${start.left}px`, top: `${start.top}px`, width: `${breite}px`, transform: `rotate(${winkel}deg)` },
      { left: `${ziel.left}px`, top: `${ziel.top}px`, width: `${zielBreite}px`, transform: "rotate(0deg)" },
    ], { duration: 750, easing: "cubic-bezier(0.35, 0.05, 0.25, 1)", fill: "forwards" });

    flug.finished.then(() => {
      const pendeln = knopf.animate([
        { transform: "rotate(0deg)" },
        { transform: "rotate(6deg)" },
        { transform: "rotate(-5deg)" },
        { transform: "rotate(3deg)" },
        { transform: "rotate(-1.5deg)" },
        { transform: "rotate(0deg)" },
      ], { duration: 650, easing: "ease-in-out" });
      return pendeln.finished;
    }).then(() => location.href = "uebersicht.html");
  });
}
