// Gamepad-Anbindung: Anlernen über alle Geräte, Kurven, Tastatur-Ersatz.
import { mitKurve, groessterAusschlag, mitEmpfindlichkeit, empfindlichkeitFuer, mitRuhelage, glaette } from "./kurve.js";
import { geraeteListe, kurzname } from "./geraetestand.js";

const ROLLEN = [
  ["stickX", "Stick quer"],
  ["stickY", "Stick längs"],
  ["schub", "Schubregler"],
  ["ruder", "Seitenruder"],
];

// Ratenachsen: selbstzentrierend, sie bekommen Ruhelage und Empfindlichkeit.
// Der Schub ist eine Stellungsachse: seine Ruhelage ist keine Mitte, und ein
// Faktor über 1 würde Fahrten jenseits des Bandes kommandieren.
const RATENROLLEN = new Set(["stickX", "stickY", "ruder"]);

// Vorgaben der Empfindlichkeitskurve (Willis Rückmeldung vom 28.08.2026,
// Steuerung insgesamt zu empfindlich; im Referenzvideo fliegt der Bewerber
// überwiegend mit feinen, kleinen Ausschlägen an Stick, Schub und Ruder).
// Totzone: die tote Mitte, in der der Stick noch keinen Steuereingang erzeugt.
// Sie fängt das Mittenspiel des Sticks ab, damit ein ruhig gehaltener Stick
// wirklich nichts bewegt; von 6 auf 10 Prozent angehoben.
// Expo: staucht die Mittellage, kleine Ausschläge wirken sanft, der volle
// Ausschlag bleibt voll. Beide Werte sind im Controls-Dialog live verstellbar
// und werden je Profil gespeichert.
const TOTZONE_VORGABE = 0.10;
const EXPO_VORGABE = 0.4;
// Empfindlichkeit: Faktor hinter der Kurve (Willis Auftrag vom 29.08.2026).
// Entweder gilt ein allgemeiner Wert für alle Geräte, oder der Haken
// "je Gerät" schaltet um, dann zählt nur noch der je Gerät gespeicherte
// Faktor und der allgemeine Regler ist stillgelegt.
const EMPFINDLICHKEIT_VORGABE = 1;
// Glättung: Zeitkonstante in ms, mit der der Kurvenwert dem Stick folgt.
// 0 heißt aus (der Wert gilt sofort). Nur Ratenachsen, der Schub bleibt
// unverzögert. Vorgabe 0, damit sich ohne Verstellen nichts ändert.
const GLAETTUNG_VORGABE = 0;

export function erzeugeControls(speicher) {
  let zuordnung = {};        // rolle -> {geraet, achse, invert}
  let totzone = TOTZONE_VORGABE;
  let expo = EXPO_VORGABE;
  let empfindlichkeit = EMPFINDLICHKEIT_VORGABE;
  let empfindlichkeitJeGeraet = {};   // geraetekennung -> faktor
  let empfindlichkeitModus = "alle";  // "alle" | "geraet"
  let ruhelagen = {};                 // geraetekennung -> [achswerte in Ruhe]
  let glaettung = GLAETTUNG_VORGABE;  // ms
  const geglaettet = {};              // rolle -> {wert, zeitMs}, Zustand der Glättung
  let knopfPadAlt = false;
  let knopfRaumAlt = false;
  let fang = null;           // {rolle, basen, beiTreffer}
  let schusstaste = null;    // {geraet, knopf}
  let schussRaumAlt = false;
  let schussPadAlt = false;
  let schussPadFreiSeit = 0;  // seit wann der Geräteknopf sauber frei ist
  let fangKnopf = false;
  let schussFangGen = 0;     // entwertet ältere Fang-Schleifen (Q12)
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
      totzone = await speicher.ladeEinstellung("totzone", TOTZONE_VORGABE);
      expo = await speicher.ladeEinstellung("expo", EXPO_VORGABE);
      empfindlichkeit = await speicher.ladeEinstellung("empfindlichkeit", EMPFINDLICHKEIT_VORGABE);
      empfindlichkeitJeGeraet = await speicher.ladeEinstellung("empfindlichkeitJeGeraet", {});
      empfindlichkeitModus = await speicher.ladeEinstellung("empfindlichkeitModus", "alle");
      ruhelagen = await speicher.ladeEinstellung("ruhelagen", {});
      glaettung = await speicher.ladeEinstellung("glaettung", GLAETTUNG_VORGABE);
      schusstaste = await speicher.ladeEinstellung("schusstaste", null);
    },

    geraete() {
      return pads().map((p) => ({ kennung: p.id, achsen: p.axes.length, knoepfe: p.buttons.length }));
    },

    // Kette je Achse: Ruhelage (nur Ratenachsen) → Umkehrung → Totzone und
    // Expo → Empfindlichkeitsfaktor (nur Ratenachsen, seit 01.09.2026 ohne
    // Kappung: über 1 heißt mehr als Missionsrate) → Glättung (nur
    // Ratenachsen). Der Schub verlässt die Kette nach der Kurve und bleibt
    // so immer im Bereich ±1 und unverzögert.
    wert(rolle) {
      // Glättung als letzter Schritt, zeitbasiert je Rolle: Mehrfachabrufe
      // im selben Bild schaden nicht, weil dt dann nahe 0 ist.
      const geglaettetes = (wert) => {
        const jetztMs = performance.now();
        const alt = geglaettet[rolle];
        const neu = alt ? glaette(alt.wert, wert, jetztMs - alt.zeitMs, glaettung) : wert;
        geglaettet[rolle] = { wert: neu, zeitMs: jetztMs };
        return neu;
      };
      const z = zuordnung[rolle];
      if (z) {
        const pad = pads().find((p) => p.id === z.geraet);
        if (pad && z.achse < pad.axes.length) {
          const ruhe = RATENROLLEN.has(rolle) ? (ruhelagen[z.geraet]?.[z.achse] ?? 0) : 0;
          const roh = mitRuhelage(pad.axes[z.achse], ruhe) * (z.invert ? -1 : 1);
          const kurvenwert = mitKurve(roh, totzone, expo);
          if (!RATENROLLEN.has(rolle)) return kurvenwert;
          const faktor = empfindlichkeitFuer(empfindlichkeitModus, empfindlichkeit, empfindlichkeitJeGeraet, z.geraet);
          return geglaettetes(mitEmpfindlichkeit(kurvenwert, faktor));
        }
      }
      // Tastatur-Ersatz: im Modus "alle" wirkt der allgemeine Faktor mit,
      // im Gerätemodus bleibt die Tastatur neutral (sie ist kein Gerät).
      if (!RATENROLLEN.has(rolle)) return tastaturWert(rolle);
      const faktor = empfindlichkeitFuer(empfindlichkeitModus, empfindlichkeit, empfindlichkeitJeGeraet, undefined);
      return geglaettetes(mitEmpfindlichkeit(tastaturWert(rolle), faktor));
    },

    // Ruhelagen-Messung (Willis Auftrag vom 01.09.2026): Hände weg von den
    // Geräten, dann festhalten, wo jede Achse in Ruhe steht. Die Totzone
    // rechnet danach um diese echte Mitte statt um den rohen Nullpunkt.
    // Gemessen wird je verbundenem Gerät; nicht verbundene behalten ihre
    // gespeicherte Messung. Werte über 0,5 Betrag verwirft mitRuhelage als
    // Fehlmessung, sie werden aber mitgespeichert, damit die Messung eines
    // Hebels mit Endlagen-Ruhe nicht wandert.
    async messeRuhelagen() {
      const stand = alsFeld();
      for (const g of stand) {
        ruhelagen = { ...ruhelagen, [g.geraet]: g.achsen.map((a) => Math.round(a * 1000) / 1000) };
      }
      await speicher.setzeEinstellung("ruhelagen", ruhelagen);
      return stand.length;
    },

    ruhelagenVon() { return ruhelagen; },

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
    // beide Quellen mit eigener Flanke. Der Geräteknopf ist entprellt: Er
    // zählt nur, wenn er vorher mindestens 120 ms sauber frei war. Analoges
    // Flattern um die Schwelle erzeugt sonst Phantomdrücke, die Antwort-
    // fenster verbrauchen, und ein dauerhaft gemeldeter Schalter darf gar
    // nicht zählen.
    schussGedrueckt() {
      const jetztMs = performance.now();
      const raumJetzt = tasten.has("Space");
      const raumFlanke = raumJetzt && !schussRaumAlt;
      schussRaumAlt = raumJetzt;

      let padRoh = false;
      if (schusstaste) {
        const knopf = pads().find((p) => p.id === schusstaste.geraet)?.buttons[schusstaste.knopf];
        padRoh = Boolean(knopf && (knopf.pressed || knopf.value > 0.6));
      }
      let padFlanke = false;
      if (padRoh) {
        if (!schussPadAlt && schussPadFreiSeit && jetztMs - schussPadFreiSeit >= 120) padFlanke = true;
        schussPadAlt = true;
      } else {
        if (schussPadAlt || !schussPadFreiSeit) schussPadFreiSeit = jetztMs;
        schussPadAlt = false;
      }
      return raumFlanke || padFlanke;
    },

    // Anlernen wie beim Achsen-Fang: der nächste neu gedrückte Knopf eines
    // Geräts wird die Schusstaste und landet in den Einstellungen.
    starteSchussFang(beiTreffer) {
      // Eine zweite Fangschleife ohne vorherigen Abbruch liefe sonst neben der
      // ersten weiter und beide könnten denselben Knopfdruck melden. Die neue
      // Generation entwertet jede ältere Schleife (Q12).
      const meineGeneration = ++schussFangGen;
      const basis = pads().map((p) => ({ geraet: p.id, knoepfe: p.buttons.map((k) => k.pressed) }));
      fangKnopf = true;
      const pruefe = () => {
        if (!fangKnopf || meineGeneration !== schussFangGen) return;
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
      this.setzeReglerFluechtig(name, wert);
      await speicher.setzeEinstellung(name, wert);
    },

    setzeReglerFluechtig(name, wert) {
      if (name === "totzone") totzone = wert;
      if (name === "expo") expo = wert;
      if (name === "empfindlichkeit") empfindlichkeit = wert;
      if (name === "glaettung") glaettung = wert;
    },

    async setzeEmpfindlichkeitModus(modus) {
      empfindlichkeitModus = modus;
      await speicher.setzeEinstellung("empfindlichkeitModus", modus);
    },

    setzeGeraeteEmpfindlichkeitFluechtig(kennung, wert) {
      empfindlichkeitJeGeraet = { ...empfindlichkeitJeGeraet, [kennung]: wert };
    },

    async setzeGeraeteEmpfindlichkeit(kennung, wert) {
      empfindlichkeitJeGeraet = { ...empfindlichkeitJeGeraet, [kennung]: wert };
      await speicher.setzeEinstellung("empfindlichkeitJeGeraet", empfindlichkeitJeGeraet);
    },

    regler() { return { totzone, expo, empfindlichkeit, glaettung, empfindlichkeitModus, empfindlichkeitJeGeraet }; },

    // Dialog-Rückrufe erben das this von controls lexikalisch. oeffneDialog muss daher
    // immer als controls.oeffneDialog() gerufen werden, nicht entnommen.
    oeffneDialog() {
      const schleier = document.createElement("div");
      schleier.className = "menueschleier";
      const dialog = document.createElement("div");
      dialog.className = "profilmenue controlsdialog";
      // Symbolknöpfe (Willis Wunsch vom 29.08.2026): Joystick = Gerät
      // zuweisen, Gegenpfeile = Achse umkehren. Die Funktion steht beim
      // Daraufzeigen als eigener Tooltip (data-tipp) und im aria-label.
      const geraetSymbol = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6.5" r="2.7"/><path d="M12 9.2V15"/><rect x="5" y="15" width="14" height="5" rx="1.5"/></svg>`;
      const umkehrSymbol = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19V6M9 6L6 9M9 6l3 3"/><path d="M15 5v13M15 18l-3-3M15 18l3-3"/></svg>`;
      const rollenZeilen = ROLLEN.map(([rolle, titel]) => `
        <div class="rollenzeile" data-rolle="${rolle}">
          <span class="rollentitel">${titel}</span>
          <span class="rollenstand" id="stand-${rolle}"></span>
          <button class="punkt klein symbol" data-tat="zuweisen" data-rolle="${rolle}" data-tipp="Zuweisen: klicken, dann Achse bewegen" aria-label="${titel} zuweisen">${geraetSymbol}</button>
          <button class="punkt klein symbol" data-tat="umkehren" data-rolle="${rolle}" data-tipp="Achsrichtung umkehren" aria-label="${titel} umkehren">${umkehrSymbol}</button>
        </div>`).join("");
      dialog.innerHTML = `
        <h2>CONTROLS · ${(speicher.profil() ?? "").toUpperCase()}</h2>
        <h3 class="abschnitt erst">GERÄTE</h3>
        <div class="geraeteliste" id="geraeteliste"></div>
        <p class="zustand">Gerät anschließen und eine Taste daran drücken, dann erscheint es hier.</p>
        <h3 class="abschnitt">ZUORDNUNG</h3>
        ${rollenZeilen}
        <div class="rollenzeile">
          <span class="rollentitel">Schusstaste</span>
          <span class="rollenstand" id="stand-schuss"></span>
          <button class="punkt klein symbol" data-tat="schuss" data-tipp="Zuweisen: klicken, dann Knopf drücken" aria-label="Schusstaste zuweisen">${geraetSymbol}</button>
          <span class="knopfplatz"></span>
        </div>
        <h3 class="abschnitt">STEUERGEFÜHL</h3>
        <div class="reglerzeile"><span class="reglertitel">Totzone</span><span class="skala">0</span><input type="range" id="totzone" min="0" max="0.2" step="0.01"><span class="skala">0,2</span><span class="reglerwert" id="totzone-wert"></span></div>
        <div class="reglerzeile"><span class="reglertitel">Expo</span><span class="skala">0</span><input type="range" id="expo" min="0" max="1" step="0.05"><span class="skala">1</span><span class="reglerwert" id="expo-wert"></span></div>
        <div class="reglerzeile"><span class="reglertitel">Empfindlichkeit</span><span class="skala">0,5</span><input type="range" id="empfindlichkeit" min="0.5" max="5" step="0.05"><span class="skala">5</span><span class="reglerwert" id="empfindlichkeit-wert"></span></div>
        <div class="reglerzeile"><span class="reglertitel">Glättung</span><span class="skala">aus</span><input type="range" id="glaettung" min="0" max="250" step="10"><span class="skala">250</span><span class="reglerwert" id="glaettung-wert"></span></div>
        <label class="hakenzeile"><input type="checkbox" id="empf-je-geraet"> Empfindlichkeit je Gerät</label>
        <p class="reglerhinweis">Mit Haken bekommt jedes verbundene Gerät in der Geräteliste einen eigenen Regler, der allgemeine gilt dann nicht.</p>
        <div class="rollenzeile">
          <span class="rollentitel">Ruhelage</span>
          <span class="rollenstand" id="stand-ruhelage"></span>
          <button class="punkt klein" data-tat="ruhelage">MESSEN</button>
          <span class="knopfplatz"></span>
        </div>
        <p class="reglerhinweis">Hände weg von Stick, Ruder und Schub, dann messen: Die Totzone liegt danach um die echte Ruhelage jeder Achse statt um den Nullpunkt.</p>
        <button class="punkt" data-tat="schliessen">Fertig</button>
      `;
      const schliesse = () => { this.brichFangAb(); this.brichSchussFangAb(); schleier.remove(); dialog.remove(); halteAn = true; };
      schleier.addEventListener("click", schliesse);

      const zeigeStand = () => {
        for (const [rolle] of ROLLEN) {
          const z = this.zuordnungVon(rolle);
          dialog.querySelector(`#stand-${rolle}`).textContent =
            z ? `${kurzname(z.geraet)} · Achse ${z.achse}${z.invert ? " · umgekehrt" : ""}` : "nicht zugewiesen";
        }
        const s = this.schusstasteVon();
        dialog.querySelector("#stand-schuss").textContent =
          s ? `${kurzname(s.geraet)} · Knopf ${s.knopf}` : "nicht zugewiesen · Leertaste";
        const gemessen = Object.keys(this.ruhelagenVon()).length;
        dialog.querySelector("#stand-ruhelage").textContent =
          gemessen ? `${gemessen} ${gemessen === 1 ? "Gerät" : "Geräte"} gemessen` : "nicht gemessen";
      };

      dialog.addEventListener("click", (e) => {
        // closest statt e.target: Der Klick landet sonst auf dem SVG im Knopf.
        const knopf = e.target.closest?.("[data-tat]");
        if (!knopf) return;
        const tat = knopf.dataset.tat;
        // Beim Anlernen leuchtet der Knopf (Klasse fang) statt Textwechsel,
        // damit das Symbol stehen bleibt.
        const fangFrei = () => { for (const k of dialog.querySelectorAll(".punkt.fang")) k.classList.remove("fang"); };
        if (tat === "schliessen") schliesse();
        if (tat === "ruhelage") this.messeRuhelagen().then(zeigeStand);
        if (tat === "umkehren") this.kehreUm(knopf.dataset.rolle).then(zeigeStand);
        if (tat === "zuweisen") {
          this.brichFangAb();
          this.brichSchussFangAb();
          fangFrei();
          knopf.classList.add("fang");
          this.starteFang(knopf.dataset.rolle, () => { knopf.classList.remove("fang"); zeigeStand(); });
        }
        if (tat === "schuss") {
          this.brichSchussFangAb();
          this.brichFangAb();
          fangFrei();
          knopf.classList.add("fang");
          this.starteSchussFang(() => { knopf.classList.remove("fang"); zeigeStand(); });
        }
      });

      const alsZahl = (w) => w.toLocaleString("de-DE", { minimumFractionDigits: 2 });
      const zeigeRegler = () => {
        const stand = this.regler();
        dialog.querySelector("#totzone-wert").textContent = alsZahl(stand.totzone);
        dialog.querySelector("#expo-wert").textContent = alsZahl(stand.expo);
        dialog.querySelector("#empfindlichkeit-wert").textContent = alsZahl(stand.empfindlichkeit);
        dialog.querySelector("#glaettung-wert").textContent = stand.glaettung > 0 ? `${stand.glaettung} ms` : "aus";
      };
      // Der Modus schaltet die Klasse am Dialog: Sie blendet die Geräteregler
      // ein und legt den allgemeinen Empfindlichkeitsregler still.
      const zeigeModus = () => {
        const jeGeraet = this.regler().empfindlichkeitModus === "geraet";
        dialog.classList.toggle("je-geraet", jeGeraet);
        dialog.querySelector("#empf-je-geraet").checked = jeGeraet;
        dialog.querySelector("#empfindlichkeit").disabled = jeGeraet;
      };
      dialog.querySelector("#totzone").value = this.regler().totzone;
      dialog.querySelector("#expo").value = this.regler().expo;
      dialog.querySelector("#empfindlichkeit").value = this.regler().empfindlichkeit;
      dialog.querySelector("#glaettung").value = this.regler().glaettung;
      zeigeRegler();
      zeigeModus();
      dialog.querySelector("#totzone").addEventListener("input", (e) => { this.setzeReglerFluechtig("totzone", Number(e.target.value)); zeigeRegler(); });
      dialog.querySelector("#totzone").addEventListener("change", (e) => this.setzeRegler("totzone", Number(e.target.value)));
      dialog.querySelector("#expo").addEventListener("input", (e) => { this.setzeReglerFluechtig("expo", Number(e.target.value)); zeigeRegler(); });
      dialog.querySelector("#expo").addEventListener("change", (e) => this.setzeRegler("expo", Number(e.target.value)));
      dialog.querySelector("#empfindlichkeit").addEventListener("input", (e) => { this.setzeReglerFluechtig("empfindlichkeit", Number(e.target.value)); zeigeRegler(); });
      dialog.querySelector("#empfindlichkeit").addEventListener("change", (e) => this.setzeRegler("empfindlichkeit", Number(e.target.value)));
      dialog.querySelector("#glaettung").addEventListener("input", (e) => { this.setzeReglerFluechtig("glaettung", Number(e.target.value)); zeigeRegler(); });
      dialog.querySelector("#glaettung").addEventListener("change", (e) => this.setzeRegler("glaettung", Number(e.target.value)));
      dialog.querySelector("#empf-je-geraet").addEventListener("change", (e) => {
        this.setzeEmpfindlichkeitModus(e.target.checked ? "geraet" : "alle").then(zeigeModus);
      });

      let halteAn = false;
      // Die Zeilen werden nur bei geändertem Gerätebestand oder geänderter
      // Zuordnung neu gebaut; je Bild frischen sich nur die Achswerte auf.
      let geraeteMerkmal = "";
      const geraeteFeld = dialog.querySelector("#geraeteliste");
      const sicher = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      // Geräteregler über Weiterleitung am Feld: Die Zeilen werden bei
      // Gerätewechseln neu gebaut, die Horcher hier überleben das.
      geraeteFeld.addEventListener("input", (e) => {
        if (!e.target.classList?.contains("geraete-empf")) return;
        const wert = Number(e.target.value);
        this.setzeGeraeteEmpfindlichkeitFluechtig(e.target.dataset.kennung, wert);
        e.target.closest(".reglerzeile").querySelector(".reglerwert").textContent = alsZahl(wert);
      });
      geraeteFeld.addEventListener("change", (e) => {
        if (!e.target.classList?.contains("geraete-empf")) return;
        this.setzeGeraeteEmpfindlichkeit(e.target.dataset.kennung, Number(e.target.value));
      });
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
                ${g.zustand === "fehlt" ? "" : `<div class="reglerzeile geraeteempf"><span class="reglertitel">Empfindlichkeit</span><span class="skala">0,5</span><input type="range" class="geraete-empf" data-kennung="${sicher(g.kennung)}" min="0.5" max="5" step="0.05"><span class="skala">5</span><span class="reglerwert"></span></div>`}
              </div>
            </div>`).join("") || `<p class="zustand">Kein Gerät erkannt.</p>`;
          for (const regler of geraeteFeld.querySelectorAll(".geraete-empf")) {
            regler.value = this.regler().empfindlichkeitJeGeraet[regler.dataset.kennung] ?? 1;
            regler.closest(".reglerzeile").querySelector(".reglerwert").textContent = alsZahl(Number(regler.value));
          }
        }
        for (const feld of geraeteFeld.querySelectorAll(".geraeteachsen")) {
          const pad = pads().find((p) => p.id === feld.dataset.kennung);
          if (!pad) { feld.textContent = ""; continue; }
          // Wirksame Achswerte statt roher: Was hier steht, kommt nach
          // Ruhelage, Totzone, Expo und Empfindlichkeit wirklich bei den
          // Missionen an. Ein Stick in Ruhe zeigt so 0.00, die Totzone wird
          // sichtbar (Willis Rückmeldung vom 31.08.2026). Eine als Schub
          // zugeordnete Achse rechnet ohne Ruhelage und Faktor, wie in wert().
          // Gedrückte Knopfnummern weiter live, so fallen klemmende Knöpfe
          // sofort auf.
          const stand = this.regler();
          const faktor = empfindlichkeitFuer(stand.empfindlichkeitModus, stand.empfindlichkeit, stand.empfindlichkeitJeGeraet, pad.id);
          const ruhen = this.ruhelagenVon()[pad.id] ?? [];
          const gedrueckt = pad.buttons.map((k, i) => (k.pressed ? i : null)).filter((i) => i !== null);
          feld.textContent = "wirksam  " + pad.axes.map((a, i) => {
            const stellung = zuordnung.schub?.geraet === pad.id && zuordnung.schub?.achse === i;
            const k = mitKurve(mitRuhelage(a, stellung ? 0 : (ruhen[i] ?? 0)), stand.totzone, stand.expo);
            return (stellung ? k : mitEmpfindlichkeit(k, faktor)).toFixed(2);
          }).join("  ")
            + (gedrueckt.length ? ` · Knöpfe: ${gedrueckt.join(", ")}` : "");
        }
        requestAnimationFrame(takt);
      };

      document.body.append(schleier, dialog);
      zeigeStand();
      requestAnimationFrame(takt);
    },
  };
}
