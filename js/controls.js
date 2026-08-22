// Gamepad-Anbindung: Anlernen über alle Geräte, Kurven, Tastatur-Ersatz.
import { mitKurve, groessterAusschlag } from "./kurve.js";

const ROLLEN = [
  ["stickX", "Stick quer"],
  ["stickY", "Stick längs"],
  ["schub", "Schubregler"],
  ["ruder", "Seitenruder"],
];

export function erzeugeControls(speicher) {
  let zuordnung = {};        // rolle -> {geraet, achse, invert}
  let totzone = 0.06;
  let expo = 0;
  let knopfAlt = false;
  let fang = null;           // {rolle, basen, beiTreffer}
  const tasten = new Set();
  let schubTastatur = 0.45;

  addEventListener("keydown", (e) => tasten.add(e.code));
  addEventListener("keyup", (e) => tasten.delete(e.code));

  const pads = () => [...(navigator.getGamepads?.() ?? [])].filter(Boolean);
  const alsFeld = () => pads().map((p) => ({ geraet: p.id, achsen: [...p.axes] }));

  function tastaturWert(rolle) {
    const paare = {
      stickX: ["ArrowLeft", "ArrowRight"],
      stickY: ["ArrowUp", "ArrowDown"],
      ruder: ["KeyA", "KeyD"],
    };
    if (rolle === "schub") {
      if (tasten.has("KeyW")) schubTastatur = Math.min(1, schubTastatur + 0.02);
      if (tasten.has("KeyS")) schubTastatur = Math.max(0, schubTastatur - 0.02);
      return schubTastatur * 2 - 1;
    }
    const [minus, plus] = paare[rolle];
    return (tasten.has(plus) ? 1 : 0) - (tasten.has(minus) ? 1 : 0);
  }

  return {
    ROLLEN,

    async lade() {
      zuordnung = await speicher.ladeEinstellung("zuordnung", {});
      totzone = await speicher.ladeEinstellung("totzone", 0.06);
      expo = await speicher.ladeEinstellung("expo", 0);
    },

    geraete() {
      return pads().map((p) => ({ kennung: p.id, achsen: p.axes.length, knoepfe: p.buttons.length }));
    },

    wert(rolle) {
      const z = zuordnung[rolle];
      if (z) {
        const pad = pads().find((p) => p.id === z.geraet);
        if (pad && z.achse < pad.axes.length) {
          const roh = pad.axes[z.achse] * (z.invert ? -1 : 1);
          return mitKurve(roh, totzone, expo);
        }
      }
      return tastaturWert(rolle);
    },

    knopfGedrueckt() {
      const jetzt = pads().some((p) => p.buttons.some((k) => k.pressed)) || tasten.has("Space");
      const flanke = jetzt && !knopfAlt;
      knopfAlt = jetzt;
      return flanke;
    },

    starteFang(rolle, beiTreffer) {
      fang = { rolle, basen: alsFeld(), beiTreffer };
      const pruefe = () => {
        if (!fang) return;
        const treffer = groessterAusschlag(fang.basen, alsFeld(), 0.55);
        if (treffer) {
          zuordnung[fang.rolle] = { geraet: treffer.geraet, achse: treffer.achse, invert: false };
          speicher.setzeEinstellung("zuordnung", zuordnung);
          const rolle = fang.rolle;
          fang = null;
          beiTreffer(rolle, treffer);
        } else {
          requestAnimationFrame(pruefe);
        }
      };
      requestAnimationFrame(pruefe);
    },

    brichFangAb() { fang = null; },

    zuordnungVon(rolle) { return zuordnung[rolle] ?? null; },

    async kehreUm(rolle) {
      if (!zuordnung[rolle]) return;
      zuordnung[rolle].invert = !zuordnung[rolle].invert;
      await speicher.setzeEinstellung("zuordnung", zuordnung);
    },

    async setzeRegler(name, wert) {
      if (name === "totzone") totzone = wert;
      if (name === "expo") expo = wert;
      await speicher.setzeEinstellung(name, wert);
    },

    setzeReglerFluechtig(name, wert) {
      if (name === "totzone") totzone = wert;
      if (name === "expo") expo = wert;
    },

    regler() { return { totzone, expo }; },

    // Dialog-Rückrufe erben das this von controls lexikalisch. oeffneDialog muss daher
    // immer als controls.oeffneDialog() gerufen werden, nicht entnommen.
    oeffneDialog() {
      const schleier = document.createElement("div");
      schleier.className = "menueschleier";
      const dialog = document.createElement("div");
      dialog.className = "profilmenue controlsdialog";
      const rollenZeilen = ROLLEN.map(([rolle, titel]) => `
        <div class="rollenzeile" data-rolle="${rolle}">
          <span class="rollentitel">${titel}</span>
          <span class="rollenstand" id="stand-${rolle}"></span>
          <button class="punkt klein" data-tat="zuweisen" data-rolle="${rolle}">Zuweisen</button>
          <button class="punkt klein" data-tat="umkehren" data-rolle="${rolle}">Umkehren</button>
        </div>`).join("");
      dialog.innerHTML = `
        <h2>CONTROLS · ${(speicher.profil() ?? "").toUpperCase()}</h2>
        <p class="zustand" id="geraeteliste"></p>
        <p class="zustand">Gerät anschließen und eine Taste daran drücken, dann erscheint es hier.</p>
        ${rollenZeilen}
        <label class="zustand">Totzone <input type="range" id="totzone" min="0" max="0.2" step="0.01"></label>
        <label class="zustand">Expo <input type="range" id="expo" min="0" max="1" step="0.05"></label>
        <p class="zustand" id="rohachsen"></p>
        <button class="punkt" data-tat="schliessen">Fertig</button>
      `;
      const schliesse = () => { this.brichFangAb(); schleier.remove(); dialog.remove(); halteAn = true; };
      schleier.addEventListener("click", schliesse);

      const zeigeStand = () => {
        for (const [rolle] of ROLLEN) {
          const z = this.zuordnungVon(rolle);
          dialog.querySelector(`#stand-${rolle}`).textContent =
            z ? `${z.geraet.slice(0, 18)}… Achse ${z.achse}${z.invert ? " umgekehrt" : ""}` : "nicht zugewiesen";
        }
      };

      dialog.addEventListener("click", (e) => {
        const tat = e.target.dataset?.tat;
        if (tat === "schliessen") schliesse();
        if (tat === "umkehren") this.kehreUm(e.target.dataset.rolle).then(zeigeStand);
        if (tat === "zuweisen") {
          this.brichFangAb();
          for (const k of dialog.querySelectorAll('[data-tat="zuweisen"]')) k.textContent = "Zuweisen";
          e.target.textContent = "Bewegen…";
          this.starteFang(e.target.dataset.rolle, () => { e.target.textContent = "Zuweisen"; zeigeStand(); });
        }
      });

      dialog.querySelector("#totzone").value = this.regler().totzone;
      dialog.querySelector("#expo").value = this.regler().expo;
      dialog.querySelector("#totzone").addEventListener("input", (e) => this.setzeReglerFluechtig("totzone", Number(e.target.value)));
      dialog.querySelector("#totzone").addEventListener("change", (e) => this.setzeRegler("totzone", Number(e.target.value)));
      dialog.querySelector("#expo").addEventListener("input", (e) => this.setzeReglerFluechtig("expo", Number(e.target.value)));
      dialog.querySelector("#expo").addEventListener("change", (e) => this.setzeRegler("expo", Number(e.target.value)));

      let halteAn = false;
      const takt = () => {
        if (halteAn) return;
        dialog.querySelector("#geraeteliste").textContent = this.geraete()
          .map((g) => `${g.kennung.slice(0, 26)} (${g.achsen} Achsen, ${g.knoepfe} Knöpfe)`)
          .join(" · ") || "Kein Gerät erkannt.";
        dialog.querySelector("#rohachsen").textContent = pads()
          .map((p) => p.axes.map((a) => a.toFixed(2)).join(" "))
          .join(" | ");
        requestAnimationFrame(takt);
      };

      document.body.append(schleier, dialog);
      zeigeStand();
      requestAnimationFrame(takt);
    },
  };
}
