// Ablauf Mission 1 (Flugzeugverfolgung) im Vollbild: PMT-Nachbau in echter
// 3D-Szene. Die Logik rechnet in uebung1.js, hier laufen Achsenabfrage,
// three.js-Zeichnung, Buchstabenausgabe und Tafeln.
import {
  TESTDAUERN, erzeugeLaufzustand, takt, ergebnisWerte,
  BUCHSTABEN_ABSTAND_MS, erzeugeBuchstabenreihe, erzeugeSlaZaehler,
} from "./uebung1.js";

export function erzeugeUebung1({ speicher, controls }) {
  const hinweis = "Nachbau der Flugzeugverfolgung der Eignungsfeststellung: Steuere mit Stick "
    + "und Pedalen, bis der Zielkreis auf dem vorausfliegenden Flugzeug liegt, und halte ihn "
    + "eine Sekunde dort. Nach jedem Treffer springt der Kreis an eine neue Stelle. Wahlweise "
    + "läuft die Buchstabenaufgabe: Bei der Folge S-L-A die Schusstaste drücken.";

  let einstellung = { dauer: 5, sla: false };

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung1-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="dauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.dauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>
      <div class="wahlzeile"><span class="wahltitel">BUCHSTABEN</span>
        <button type="button" class="wahlknopf ${einstellung.sla ? "an" : ""}" data-element="sla"
          aria-pressed="${einstellung.sla}">SLA-AUFGABE</button></div>
      <p class="wahlhinweis" id="u1-schusshinweis" hidden></p>`;

    const schusshinweis = feld.querySelector("#u1-schusshinweis");
    const zeigeSchussstand = () => {
      if (!einstellung.sla) { schusshinweis.hidden = true; return; }
      const s = controls.schusstasteVon();
      schusshinweis.hidden = false;
      schusshinweis.textContent = s
        ? `Schusstaste: Knopf ${s.knopf}. Ersatz ist die Leertaste.`
        : "Keine Schusstaste zugewiesen, es zählt die Leertaste.";
    };

    feld.onclick = (e) => {
      const knopf = e.target.closest(".wahlknopf");
      if (!knopf) return;
      einstellung.sla = !einstellung.sla;
      knopf.classList.toggle("an", einstellung.sla);
      knopf.setAttribute("aria-pressed", String(einstellung.sla));
      speicher.setzeEinstellung("uebung1-einstellung", einstellung);
      // Beim ersten Einschalten mit Gerät die Schusstaste gleich anlernen.
      if (einstellung.sla && !controls.schusstasteVon() && controls.geraete().length) {
        schusshinweis.hidden = false;
        schusshinweis.textContent = "Schusstaste am Joystick drücken…";
        controls.starteSchussFang(() => zeigeSchussstand());
        return;
      }
      controls.brichSchussFangAb();
      zeigeSchussstand();
    };
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung1-einstellung", einstellung);
    };
    zeigeSchussstand();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    // Task 8 baut hier die 3D-Szene ein; bis dahin sofort zurück zur Mission.
    registriereAbbruch(() => {});
    tuer.oeffne().then(() => beiEnde(null));
  }

  return { hinweis, ladeEinstellung, zeichneFeld, starte };
}
