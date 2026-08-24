// Ablauf Mission 2 (Multitasking Controls) im Vollbild: SMT-Nachbau mit
// Rahmen, Fadenkreuz, Ruderstrich und Geschwindigkeitsanzeige. Die Logik
// rechnet in uebung2.js, hier laufen Achsenabfrage, Zeichnung und Tafeln.
import {
  TESTDAUERN, ELEMENTE, erzeugeLaufzustand, takt, punkte, pruefeAuswahl, deckungsquote,
} from "./uebung2.js";
import { xImBild, yImBild, TACHO, gradFuerKnoten, buehneSvg } from "./uebung2-bild.js";

const NAMEN = { stick: "STICK", ruder: "RUDER", schub: "SCHUB" };

export function erzeugeUebung2({ speicher, controls }) {
  const hinweis = "Nachbau des Multitasking-Tests der Eignungsfeststellung: Bringe das rote "
    + "Fadenkreuz mit dem Stick in den Zielkreis, den roten Strich mit dem Ruder auf die "
    + "Mittellinie und die Nadel mit dem Schub auf 95 Knoten. Eine Sekunde Deckung gibt "
    + "einen Treffer. Wähle unten, welche Controls geprüft werden.";

  let einstellung = { dauer: 5, stick: true, ruder: true, schub: true };

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung2-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  const auswahlAusEinstellung = () => ELEMENTE.filter((e) => einstellung[e]);

  function zeichneFeld(feld) {
    const knoepfe = ELEMENTE.map((e) => `
      <button type="button" class="wahlknopf ${einstellung[e] ? "an" : ""}" data-element="${e}"
        aria-pressed="${einstellung[e]}">${NAMEN[e]}</button>`).join("");
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">CONTROLS</span>
        <span class="wahlknoepfe">${knoepfe}</span></div>
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="dauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.dauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>
      <p class="wahlhinweis" id="u2-wahlhinweis" hidden>Mindestens ein Steuerelement wählen.</p>`;

    const zeigeSperre = () => {
      const gueltig = pruefeAuswahl(auswahlAusEinstellung());
      document.getElementById("start").disabled = !gueltig;
      feld.querySelector("#u2-wahlhinweis").hidden = gueltig;
    };
    feld.onclick = (e) => {
      const knopf = e.target.closest(".wahlknopf");
      if (!knopf) return;
      const element = knopf.dataset.element;
      einstellung[element] = !einstellung[element];
      knopf.classList.toggle("an", einstellung[element]);
      knopf.setAttribute("aria-pressed", String(einstellung[element]));
      speicher.setzeEinstellung("uebung2-einstellung", einstellung);
      zeigeSperre();
    };
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung2-einstellung", einstellung);
    };
    zeigeSperre();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const auswahl = auswahlAusEinstellung();
    const { dauer } = einstellung;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung2";
    schleier.innerHTML = `<div class="smtbuehne">${buehneSvg(auswahl)}</div><div class="testkopf"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const kopf = schleier.querySelector(".testkopf");
    const svg = schleier.querySelector("svg");
    const fadenkreuz = svg.querySelector("#fadenkreuz");
    const ruderstrich = svg.querySelector("#ruderstrich");
    const nadel = svg.querySelector("#nadel");
    const zielkreis = svg.querySelector("#zielkreis");
    const mittellinie = svg.querySelector("#mittellinie");
    const tachobogen = svg.querySelector("#tachobogen");

    const zustand = erzeugeLaufzustand(auswahl);
    let beendet = false;
    let ergebnisOffen = false;
    let testende = Infinity;
    let laeuft = false;
    let vorher = 0;
    const zeitgeber = new Set();
    const spaeter = (fn, ms) => { const t = setTimeout(() => { zeitgeber.delete(t); fn(); }, ms); zeitgeber.add(t); return t; };

    const raeumeAuf = () => {
      beendet = true;
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      schleier.remove();
    };
    const beiVollbildwechsel = () => { if (!document.fullscreenElement) verlasse?.(); };
    const beiSichtwechsel = () => { if (document.hidden) verlasse?.(); };
    let verlasse = () => zeigeErgebnis(false);
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const blitz = (knoten) => {
      if (!knoten) return;
      knoten.classList.add("smtblitz");
      spaeter(() => knoten.classList.remove("smtblitz"), 220);
    };

    const zeichne = () => {
      if (fadenkreuz) fadenkreuz.setAttribute("transform",
        `translate(${xImBild(zustand.fadenkreuz.x).toFixed(1)} ${yImBild(zustand.fadenkreuz.y).toFixed(1)})`);
      if (ruderstrich) ruderstrich.setAttribute("transform",
        `translate(${xImBild(zustand.strich.x).toFixed(1)} 0)`);
      if (nadel) nadel.setAttribute("transform", `rotate(${gradFuerKnoten(zustand.nadel).toFixed(2)} ${TACHO.cx} ${TACHO.cy})`);
      const rest = Math.max(0, testende - performance.now());
      kopf.textContent = `${auswahl.map((e) => NAMEN[e]).join(" + ")} · REST ${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
    };

    const schleife = (jetzt) => {
      if (beendet || ergebnisOffen || !laeuft) return;
      const dtMs = Math.min(50, jetzt - vorher || 16);
      vorher = jetzt;
      const eingaben = {
        stickX: controls.wert("stickX"),
        stickY: controls.wert("stickY"),
        ruder: controls.wert("ruder"),
        schub: controls.wert("schub"),
      };
      const ereignisse = takt(zustand, eingaben, dtMs);
      for (const e of ereignisse) {
        if (e.element === "stick") blitz(zielkreis);
        else if (e.element === "ruder") blitz(mittellinie);
        else blitz(tachobogen);
      }
      zeichne();
      if (performance.now() >= testende) { zeigeErgebnis(true); return; }
      requestAnimationFrame(schleife);
    };

    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const wert = punkte(zustand, dauer);
      const quote = deckungsquote(zustand);
      const zeilen = auswahl.map((e) =>
        `<span>${NAMEN[e]}: ${zustand.treffer[e]} Treffer</span>`).join("");
      const kombizeile = auswahl.length > 1 ? `<span>Kombitreffer: ${zustand.kombitreffer}</span>` : "";
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${quote} %</div>
        <div class="ergebniszeilen">${zeilen}${kombizeile}</div>
        <button class="punkt" id="u2-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>${dauer} min Testdauer · ${auswahl.map((e) => NAMEN[e]).join(" + ")}</span>
          ${abbruchzeile}
        </div>`;
      document.body.append(tafel);
      requestAnimationFrame(() => tafel.classList.add("da"));

      let geschlossen = false;
      const schliesse = async () => {
        if (geschlossen) return;
        geschlossen = true;
        tafel.classList.remove("da");
        setTimeout(() => tafel.remove(), 260);
        tuer.verwische(false);
        raeumeAuf();
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        await beiEnde(gewertet ? {
          kennzahl: wert,
          daten: {
            art: "multitasking",
            dauerMin: dauer,
            auswahl,
            trefferStick: zustand.treffer.stick,
            trefferRuder: zustand.treffer.ruder,
            trefferSchub: zustand.treffer.schub,
            kombitreffer: zustand.kombitreffer,
            punkte: wert,
            deckungsquote: quote,
          },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u2-fertig").addEventListener("click", schliesse);
    };

    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      testende = performance.now() + dauer * 60_000;
      laeuft = true;
      vorher = performance.now();
      zeichne();
      requestAnimationFrame(schleife);
    })();
  }

  return { hinweis, ladeEinstellung, zeichneFeld, starte };
}
