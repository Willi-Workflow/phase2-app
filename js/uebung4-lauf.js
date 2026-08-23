// Ablauf Mission 4 (Instrumente merken) im Vollbild: Merkphase ohne Countdown,
// Fragen mit Ablaufbalken und kurzer Rückmeldung, Runden bis zum Ende der
// Testdauer, danach die Ergebnistafel. Oben läuft dezent die Test-Restzeit.
import { INSTRUMENTE, zufallswerte, formatiere, tafelHtml } from "./instrumente.js";
import {
  ANZEIGEZEITEN, FRAGENANZAHLEN, TESTDAUERN, ANTWORTZEIT,
  schwierigkeitsfaktor, kennzahlAus, waehleInstrumente, antwortmoeglichkeiten, istGleich,
} from "./uebung4.js";

// Rückmeldung: nach richtigen Antworten geht es zügig weiter, nach falschen
// bleibt Zeit, den wahren Wert zu lesen. Ein Klick überspringt die Wartezeit.
const RUECKMELDEDAUER_RICHTIG = 700;
const RUECKMELDEDAUER_FALSCH = 1800;

export function erzeugeUebung4({ speicher }) {
  let einstellung = { zeit: 5, fragen: 3, dauer: 5 };

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung4-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneEinstellungen(feld) {
    const zeile = (titel, name, werte, aktiv, einheit) => `
      <div class="wahlzeile"><span class="wahltitel">${titel}</span>
        <select class="wahlliste" data-name="${name}">${werte.map((w) =>
          `<option value="${w}" ${w === aktiv ? "selected" : ""}>${w}${einheit}</option>`).join("")}</select></div>`;
    feld.innerHTML =
      zeile("ANZEIGEZEIT", "zeit", ANZEIGEZEITEN, einstellung.zeit, " s")
      + zeile("FRAGEN JE RUNDE", "fragen", FRAGENANZAHLEN, einstellung.fragen, "")
      + zeile("TESTDAUER", "dauer", TESTDAUERN, einstellung.dauer, " min");
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung4-einstellung", einstellung);
    };
  }

  function starte({ beiEnde, registriereAbbruch }) {
    const { zeit, fragen, dauer } = einstellung;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung4";
    schleier.innerHTML = `<div class="testkopf"></div><div class="testmitte"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const mitte = schleier.querySelector(".testmitte");
    const restfeld = schleier.querySelector(".testkopf");
    const testende = performance.now() + dauer * 60_000;
    let beendet = false;
    let gestellt = 0;
    let richtig = 0;
    const zeitgeber = new Set();
    const spaeter = (fn, ms) => { const t = setTimeout(() => { zeitgeber.delete(t); fn(); }, ms); zeitgeber.add(t); return t; };

    const restuhr = setInterval(() => {
      const rest = Math.max(0, testende - performance.now());
      restfeld.textContent = `${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
    }, 250);

    const raeumeAuf = () => {
      beendet = true;
      clearInterval(restuhr);
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      schleier.remove();
    };
    const beiVollbildwechsel = () => { if (!document.fullscreenElement) verlasse?.(); };
    const beiSichtwechsel = () => { if (document.hidden) verlasse?.(); };
    // Vor dem Ergebnis heißt Verlassen Abbruch ohne Wertung, danach nur noch Schließen.
    let verlasse = async () => {
      raeumeAuf();
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      beiEnde(null);
    };
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const runde = () => {
      if (beendet) return;
      const werte = zufallswerte();
      mitte.innerHTML = tafelHtml(werte);
      spaeter(() => frageFolge(werte, waehleInstrumente(fragen), 0), zeit * 1000);
    };

    const frageFolge = (werte, ids, index) => {
      if (beendet) return;
      if (index >= ids.length) {
        if (performance.now() < testende) runde();
        else zeigeErgebnis();
        return;
      }
      const id = ids[index];
      const wert = id === "horizont" ? werte.horizont : werte[id];
      const optionen = antwortmoeglichkeiten(id, wert);
      const beschreibung = INSTRUMENTE.find((i) => i.id === id);
      // Auch der Horizont wird über die Winkel beantwortet, zweizeilig:
      // Querlage oben, Nicklage darunter.
      const knoepfe = optionen.map((o, i) =>
        `<button class="antwortknopf" data-nr="${i}">${formatiere(id, o).replace(", ", "<br>")}</button>`).join("");
      mitte.innerHTML = `
        <div class="frage">${beschreibung.frage}</div>
        <div class="antworten">${knoepfe}</div>
        <div class="zeitbalken"><span style="animation-duration:${ANTWORTZEIT}s"></span></div>
        <div class="rueckmeldung"></div>`;

      let entschieden = false;
      spaeter(() => entscheide(null), ANTWORTZEIT * 1000);

      const entscheide = (nr) => {
        if (entschieden || beendet) return;
        entschieden = true;
        gestellt += 1;
        const getroffen = nr !== null && istGleich(id, optionen[nr], wert);
        if (getroffen) richtig += 1;
        mitte.querySelectorAll(".antwortknopf").forEach((knopf, i) => {
          knopf.disabled = true;
          if (istGleich(id, optionen[i], wert)) knopf.classList.add("richtig");
          else if (i === nr) knopf.classList.add("falsch");
        });
        mitte.querySelector(".zeitbalken span").style.animationPlayState = "paused";
        const rueck = mitte.querySelector(".rueckmeldung");
        rueck.textContent = getroffen ? "RICHTIG"
          : `${nr === null ? "ZEIT ABGELAUFEN" : "FALSCH"} · richtig: ${formatiere(id, wert)}`;
        rueck.classList.add(getroffen ? "gut" : "schlecht");
        let weitergegangen = false;
        const weiter = () => {
          if (weitergegangen || beendet) return;
          weitergegangen = true;
          schleier.removeEventListener("click", weiter);
          frageFolge(werte, ids, index + 1);
        };
        spaeter(weiter, getroffen ? RUECKMELDEDAUER_RICHTIG : RUECKMELDEDAUER_FALSCH);
        schleier.addEventListener("click", weiter);
      };
      mitte.querySelector(".antworten").addEventListener("click", (e) => {
        const knopf = e.target.closest(".antwortknopf");
        if (knopf) { e.stopPropagation(); entscheide(Number(knopf.dataset.nr)); }
      });
    };

    const zeigeErgebnis = () => {
      if (beendet) return;
      const faktor = schwierigkeitsfaktor(zeit, fragen);
      const quote = gestellt ? Math.round((richtig / gestellt) * 100) : 0;
      const wert = kennzahlAus(richtig, gestellt, faktor);
      const schliesse = async () => {
        raeumeAuf();
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        beiEnde({
          kennzahl: wert,
          daten: {
            art: "instrumente-merken",
            anzeigezeit: zeit,
            fragenJeRunde: fragen,
            dauerMin: dauer,
            gestellt,
            richtig,
            quote,
            faktor: Number(faktor.toFixed(3)),
          },
        });
      };
      verlasse = schliesse;
      clearInterval(restuhr);
      restfeld.textContent = "";
      mitte.innerHTML = `
        <div class="frage">TEST BEENDET</div>
        <div class="ergebnisgross">${wert} PUNKTE</div>
        <div class="ergebniszeilen">
          <span>${richtig} von ${gestellt} richtig · ${quote} % Trefferquote</span>
          <span>Einstellung: ${zeit} s Anzeige · ${fragen} ${fragen === 1 ? "Frage" : "Fragen"} je Runde · ${dauer} min · Faktor ${faktor.toFixed(2)}</span>
        </div>
        <button class="punkt" id="u4-fertig">FERTIG</button>`;
      mitte.querySelector("#u4-fertig").addEventListener("click", schliesse);
    };

    runde();
  }

  return { ladeEinstellung, zeichneEinstellungen, starte };
}
