// Profilmenü hinter dem Anhänger: wechseln, Controls, zurücksetzen, Zustand.

const ZUSTANDSTEXT = {
  verbunden: "Datendienst: verbunden",
  getrennt: "Datendienst: getrennt, Läufe werden nachgemeldet",
  "ohne-zugang": "Datendienst: noch nicht eingerichtet, Läufe bleiben örtlich",
};

export function oeffneProfilmenue(speicher, { oeffneControls } = {}) {
  if (document.querySelector(".profilmenue")) return;

  const schleier = document.createElement("div");
  schleier.className = "menueschleier";
  const menue = document.createElement("div");
  menue.className = "profilmenue";
  menue.innerHTML = `
    <h2>PILOT: ${(speicher.profil() ?? "").toUpperCase()}</h2>
    <button class="punkt" data-tat="wechseln">Profil wechseln</button>
    <button class="punkt" data-tat="controls">Controls</button>
    <button class="punkt" data-tat="zuruecksetzen">Ergebnisse zurücksetzen</button>
    <p class="zustand">${ZUSTANDSTEXT[speicher.zustand()]}</p>
  `;

  const beiTaste = (ereignis) => { if (ereignis.key === "Escape") schliesse(); };
  const schliesse = () => { schleier.remove(); menue.remove(); document.removeEventListener("keydown", beiTaste); };
  schleier.addEventListener("click", schliesse);
  document.addEventListener("keydown", beiTaste);

  menue.addEventListener("click", async (ereignis) => {
    const tat = ereignis.target.dataset?.tat;
    if (tat === "wechseln") {
      try {
        speicher.setzeProfil(null);
      } catch {
        alert("Der Profilwechsel konnte nicht gespeichert werden.");
        return;
      }
      location.href = "index.html";
    } else if (tat === "controls") {
      schliesse();
      if (oeffneControls) oeffneControls();
      else alert("Die Controls-Einrichtung folgt im nächsten Bauabschnitt.");
    } else if (tat === "zuruecksetzen") {
      const profil = speicher.profil();
      const sicher = confirm(`Wirklich alle Ergebnisse von ${profil.toUpperCase()} löschen? Das lässt sich nicht rückgängig machen.`);
      if (sicher) {
        try {
          await speicher.loescheLaeufe(profil, null);
          alert("Ergebnisse gelöscht.");
          schliesse();
        } catch {
          alert("Das Löschen ist fehlgeschlagen, bitte später erneut versuchen.");
        }
      }
    }
  });

  document.body.append(schleier, menue);
}
