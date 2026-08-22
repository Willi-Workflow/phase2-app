// Profilmenü hinter dem Anhänger: wechseln, Controls, zurücksetzen, Zustand.

const ZUSTANDSTEXT = {
  verbunden: "Datendienst: verbunden",
  getrennt: "Datendienst: getrennt, Läufe werden nachgemeldet",
  "ohne-zugang": "Datendienst: noch nicht eingerichtet, Läufe bleiben örtlich",
};

export function oeffneProfilmenue(speicher, { oeffneControls } = {}) {
  const schleier = document.createElement("div");
  schleier.className = "menueschleier";
  const menue = document.createElement("div");
  menue.className = "profilmenue";
  menue.innerHTML = `
    <h2>PILOT: ${(speicher.profil() ?? "").toUpperCase()}</h2>
    <button class="punkt" data-tat="wechseln">Profil wechseln</button>
    <button class="punkt" data-tat="controls">Controls einrichten</button>
    <button class="punkt" data-tat="zuruecksetzen">Ergebnisse zurücksetzen</button>
    <p class="zustand">${ZUSTANDSTEXT[speicher.zustand()]}</p>
  `;

  const schliesse = () => { schleier.remove(); menue.remove(); };
  schleier.addEventListener("click", schliesse);

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
    }
    if (tat === "controls") {
      schliesse();
      if (oeffneControls) oeffneControls();
      else alert("Die Controls-Einrichtung folgt im nächsten Bauabschnitt.");
    }
    if (tat === "zuruecksetzen") {
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
