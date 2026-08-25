import { KONFIG } from "./konfig.js";
import { ANHEFT, pendelGroessen, pendelSchritt, glatt } from "./pendel.js";
import { erzeugeSpeicher } from "./speicher.js";
import { VORSPANN_MERKER, sollVorspannLaufen } from "./vorspann.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });

// Wer schon gewählt hat, geht in den Übungsbereich; davor läuft
// gegebenenfalls der Vorspann (Hangaraufnahme).
const weiter = speicher.profil() ? () => location.replace("uebersicht.html") : null;

const vorspann = document.getElementById("vorspann");
const navTyp = performance.getEntriesByType("navigation")[0]?.type ?? "navigate";
let vorspannGesehen = false;
try { vorspannGesehen = sessionStorage.getItem(VORSPANN_MERKER) === "1"; } catch {}

if (vorspann && sollVorspannLaufen({ gesehen: vorspannGesehen, navTyp })) {
  try { sessionStorage.setItem(VORSPANN_MERKER, "1"); } catch {}
  const video = vorspann.querySelector("video");
  let beendet = false;
  const schliessen = () => {
    if (beendet) return;
    beendet = true;
    // Mit gewähltem Profil lädt die Übersicht unter dem stehenden
    // Schlussbild, so blitzt die Profilwahl nicht kurz auf.
    if (weiter) { weiter(); return; }
    vorspann.classList.add("aus");
    setTimeout(() => vorspann.remove(), 700);
  };
  vorspann.addEventListener("click", schliessen);
  video.addEventListener("ended", schliessen);
  video.addEventListener("error", schliessen);
  const abspielen = video.play();
  if (abspielen?.catch) abspielen.catch(schliessen);
  // Sicherung: stockt das Video, geht es trotzdem weiter.
  setTimeout(schliessen, 9000);
} else {
  vorspann?.remove();
  if (weiter) weiter();
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

    // Band vom Bund lösen: der Aufhängepunkt fliegt die Bahn, das Band hängt
    // als simuliertes Pendel daran (Werte aus dem Stellpult, siehe js/pendel.js).
    const lage = knopf.getBoundingClientRect();
    const breite = knopf.offsetWidth;
    const hoehe = knopf.offsetHeight;
    const start = { x: lage.left + (lage.width - breite) / 2, y: lage.top };

    // Es fliegt ein Klon ohne Übergangsregeln; das Original wird unsichtbar.
    // So gibt es keinen Sprung beim Loslösen und kein Verschleifen der Einzelbilder.
    const klon = knopf.cloneNode(true);
    Object.assign(klon.style, {
      position: "fixed", left: "0px", top: "0px", width: `${breite}px`,
      margin: "0", zIndex: 50, transformOrigin: "47.1% 9.2%", transition: "none",
    });
    klon.style.transform = `translate(${start.x}px, ${start.y}px) rotate(${knopf.dataset.profil === "willi" ? 16 : -16}deg)`;
    document.body.append(klon);
    knopf.style.visibility = "hidden";

    const zielBreite = innerWidth <= 1500 ? 54 : Math.min(78, Math.max(56, innerWidth * 0.055));
    const rechts = Math.min(60, Math.max(16, innerWidth * 0.04));
    const ziel = { x: innerWidth - rechts - zielBreite, y: 0 };
    const kontrolle = { x: (start.x + ziel.x) / 2, y: Math.min(start.y, ziel.y) - ANHEFT.bogen };

    const { g, L } = pendelGroessen(hoehe);
    const cssStart = knopf.dataset.profil === "willi" ? 16 : -16;
    let zustand = { theta: (-cssStart * Math.PI) / 180, thetaP: 0 };
    const T = ANHEFT.flugdauer / 1000;
    const t0 = performance.now();
    let tVorher = t0;

    const schritt = (jetzt) => {
      const dt = Math.min(0.032, (jetzt - tVorher) / 1000) || 0.016;
      tVorher = jetzt;
      const s = Math.min(1, (jetzt - t0) / ANHEFT.flugdauer);
      const { e, e1, e2 } = glatt(s);

      const bx = (1 - e) ** 2 * start.x + 2 * (1 - e) * e * kontrolle.x + e * e * ziel.x;
      const by = (1 - e) ** 2 * start.y + 2 * (1 - e) * e * kontrolle.y + e * e * ziel.y;
      const d1x = 2 * (1 - e) * (kontrolle.x - start.x) + 2 * e * (ziel.x - kontrolle.x);
      const d1y = 2 * (1 - e) * (kontrolle.y - start.y) + 2 * e * (ziel.y - kontrolle.y);
      const d2x = 2 * (start.x - 2 * kontrolle.x + ziel.x);
      const d2y = 2 * (start.y - 2 * kontrolle.y + ziel.y);
      const ax = (d2x * e1 * e1 + d1x * e2) / (T * T);
      const ay = (d2y * e1 * e1 + d1y * e2) / (T * T);

      zustand = pendelSchritt(zustand, { g, L, daempfung: ANHEFT.daempfung, ax, ay }, dt);

      klon.style.width = `${breite + (zielBreite - breite) * e}px`;
      klon.style.transform = `translate(${bx}px, ${by}px) rotate(${(-zustand.theta * 180) / Math.PI}deg)`;

      if (s < 1) {
        requestAnimationFrame(schritt);
      } else {
        // Andocken: Schwungzustand an die Übersicht übergeben, die pendelt aus.
        sessionStorage.setItem("p2-anheft-schwung", JSON.stringify(zustand));
        location.href = "uebersicht.html";
      }
    };
    requestAnimationFrame(schritt);

    // Sicherung: zeichnet der Browser gerade nicht (verdecktes Fenster),
    // geht es nach der Flugzeit trotzdem in die Übersicht.
    setTimeout(() => {
      // Läuft die Seite hier noch, hat der Zeichner gestockt: dann ohne Flug weiter.
      sessionStorage.setItem("p2-anheft-schwung", JSON.stringify(zustand));
      location.href = "uebersicht.html";
    }, ANHEFT.flugdauer + 700);
  });
}