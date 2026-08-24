// Gamepad-Anbindung: Anlernen über alle Geräte, Kurven, Tastatur-Ersatz.
import { mitKurve, groessterAusschlag } from "./kurve.js";
import { geraeteListe } from "./geraetestand.js";

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
  let knopfPadAlt = false;
  let knopfRaumAlt = false;
  let fang = null;           // {rolle, basen, beiTreffer}
  let schusstaste = null;    // {geraet, knopf}
  let schussRaumAlt = false;
  let schussPadAlt = false;
  let fangKnopf = false;
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
      schusstaste = await speicher.ladeEinstellung("schusstaste", null);
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

    // Flanken je Quelle getrennt: Ein dauerhaft gedrückt gemeldeter
    // Geräteknopf (etwa ein Schalter oder ein klemmender Knopf) darf frische
    // Tastendrücke der anderen Quelle nicht verdecken.
    knopfGedrueckt() {
      const padJetzt = pads().some((p) => p.buttons.some((k) => k.pressed));
      const raumJetzt = tasten.has("Space");
      const flanke = (padJetzt && !knopfPadAlt) || (raumJetzt && !knopfRaumAlt);
      knopfPadAlt = padJetzt;
      knopfRaumAlt = raumJetzt;
      return flanke;
    },

    schusstasteVon() { return schusstaste; },

    // Flanke der Schusstaste: der zugewiesene Geräteknopf, Ersatz Leertaste,
    // beide Quellen mit eigener Flanke.
    schussGedrueckt() {
      const raumJetzt = tasten.has("Space");
      let padJetzt = false;
      if (schusstaste) {
        const pad = pads().find((p) => p.id === schusstaste.geraet);
        padJetzt = Boolean(pad?.buttons[schusstaste.knopf]?.pressed);
      }
      const flanke = (raumJetzt && !schussRaumAlt) || (padJetzt && !schussPadAlt);
      schussRaumAlt = raumJetzt;
      schussPadAlt = padJetzt;
      return flanke;
    },

    // Anlernen wie beim Achsen-Fang: der nächste neu gedrückte Knopf eines
    // Geräts wird die Schusstaste und landet in den Einstellungen.
    starteSchussFang(beiTreffer) {
      const basis = pads().map((p) => ({ geraet: p.id, knoepfe: p.buttons.map((k) => k.pressed) }));
      fangKnopf = true;
      const pruefe = () => {
        if (!fangKnopf) return;
        for (const p of pads()) {
          const alt = basis.find((b) => b.geraet === p.id);
          for (let k = 0; k < p.buttons.length; k++) {
            if (p.buttons[k].pressed && !alt?.knoepfe[k]) {
              schusstaste = { geraet: p.id, knopf: k };
              speicher.setzeEinstellung("schusstaste", schusstaste);
              fangKnopf = false;
              beiTreffer(schusstaste);
              return;
            }
          }
        }
        requestAnimationFrame(pruefe);
      };
      requestAnimationFrame(pruefe);
    },

    brichSchussFangAb() { fangKnopf = false; },

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
        <div class="geraeteliste" id="geraeteliste"></div>
        <p class="zustand">Gerät anschließen und eine Taste daran drücken, dann erscheint es hier.</p>
        ${rollenZeilen}
        <div class="rollenzeile">
          <span class="rollentitel">Schusstaste</span>
          <span class="rollenstand" id="stand-schuss"></span>
          <button class="punkt klein" data-tat="schuss">Zuweisen</button>
        </div>
        <label class="zustand">Totzone <input type="range" id="totzone" min="0" max="0.2" step="0.01"></label>
        <label class="zustand">Expo <input type="range" id="expo" min="0" max="1" step="0.05"></label>
        <button class="punkt" data-tat="schliessen">Fertig</button>
      `;
      const schliesse = () => { this.brichFangAb(); this.brichSchussFangAb(); schleier.remove(); dialog.remove(); halteAn = true; };
      schleier.addEventListener("click", schliesse);

      const zeigeStand = () => {
        for (const [rolle] of ROLLEN) {
          const z = this.zuordnungVon(rolle);
          dialog.querySelector(`#stand-${rolle}`).textContent =
            z ? `${z.geraet.slice(0, 18)}… Achse ${z.achse}${z.invert ? " umgekehrt" : ""}` : "nicht zugewiesen";
        }
        const s = this.schusstasteVon();
        dialog.querySelector("#stand-schuss").textContent =
          s ? `${s.geraet.slice(0, 18)}… Knopf ${s.knopf}` : "nicht zugewiesen · Leertaste";
      };

      dialog.addEventListener("click", (e) => {
        const tat = e.target.dataset?.tat;
        if (tat === "schliessen") schliesse();
        if (tat === "umkehren") this.kehreUm(e.target.dataset.rolle).then(zeigeStand);
        if (tat === "zuweisen") {
          this.brichFangAb();
          this.brichSchussFangAb();
          for (const k of dialog.querySelectorAll('[data-tat="zuweisen"]')) k.textContent = "Zuweisen";
          const schussKnopf = dialog.querySelector('[data-tat="schuss"]');
          if (schussKnopf) schussKnopf.textContent = "Zuweisen";
          e.target.textContent = "Bewegen…";
          this.starteFang(e.target.dataset.rolle, () => { e.target.textContent = "Zuweisen"; zeigeStand(); });
        }
        if (tat === "schuss") {
          this.brichSchussFangAb();
          this.brichFangAb();
          for (const k of dialog.querySelectorAll('[data-tat="zuweisen"]')) k.textContent = "Zuweisen";
          e.target.textContent = "Drücken…";
          this.starteSchussFang(() => { e.target.textContent = "Zuweisen"; zeigeStand(); });
        }
      });

      dialog.querySelector("#totzone").value = this.regler().totzone;
      dialog.querySelector("#expo").value = this.regler().expo;
      dialog.querySelector("#totzone").addEventListener("input", (e) => this.setzeReglerFluechtig("totzone", Number(e.target.value)));
      dialog.querySelector("#totzone").addEventListener("change", (e) => this.setzeRegler("totzone", Number(e.target.value)));
      dialog.querySelector("#expo").addEventListener("input", (e) => this.setzeReglerFluechtig("expo", Number(e.target.value)));
      dialog.querySelector("#expo").addEventListener("change", (e) => this.setzeRegler("expo", Number(e.target.value)));

      let halteAn = false;
      // Die Zeilen werden nur bei geändertem Gerätebestand oder geänderter
      // Zuordnung neu gebaut; je Bild frischen sich nur die Achswerte auf.
      let geraeteMerkmal = "";
      const geraeteFeld = dialog.querySelector("#geraeteliste");
      const sicher = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      const takt = () => {
        if (halteAn) return;
        const liste = geraeteListe(ROLLEN, zuordnung, this.geraete());
        const merkmal = JSON.stringify(liste);
        if (merkmal !== geraeteMerkmal) {
          geraeteMerkmal = merkmal;
          geraeteFeld.innerHTML = liste.map((g) => `
            <div class="geraetezeile">
              <span class="rollenlampe ${g.zustand}"></span>
              <div>
                <div class="geraetename">${sicher(g.name)}</div>
                <div class="geraeteinfo">${g.zustand === "fehlt" ? "nicht verbunden" : sicher(g.umfang)}${g.rollen.length ? ` · ${g.rollen.join(", ")}` : ""}</div>
                <div class="geraeteachsen" data-kennung="${sicher(g.kennung)}"></div>
              </div>
            </div>`).join("") || `<p class="zustand">Kein Gerät erkannt.</p>`;
        }
        for (const feld of geraeteFeld.querySelectorAll(".geraeteachsen")) {
          const pad = pads().find((p) => p.id === feld.dataset.kennung);
          feld.textContent = pad ? pad.axes.map((a) => a.toFixed(2)).join("  ") : "";
        }
        requestAnimationFrame(takt);
      };

      document.body.append(schleier, dialog);
      zeigeStand();
      requestAnimationFrame(takt);
    },
  };
}
