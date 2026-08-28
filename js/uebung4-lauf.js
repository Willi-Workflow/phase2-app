// Ablauf Mission 4 (Instrumente merken) im Vollbild: Merkphase ohne Countdown,
// Fragen mit Ablaufbalken und kurzer Rückmeldung, Runden bis zum Ende der
// Testdauer, danach die Ergebnistafel. Oben läuft dezent die Test-Restzeit.
import { INSTRUMENTE, zufallswerte, formatiere, tafelHtml, svgLage } from "./instrumente.js";
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
  const hinweis = "Die fünf Instrumente erscheinen mit zufälligen Werten für die eingestellte Zeit. "
    + "Danach fragt der Test einzelne Instrumente ab: vier Antworten, zehn Sekunden Zeit. "
    + "Runden folgen am Stück, bis die Testdauer um ist.";

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung4-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
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

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const { zeit, fragen, dauer } = einstellung;
    // Der Aufrufer hat die Hangartür bereits geschlossen: der Testbildschirm
    // baut sich verdeckt auf, die Tür öffnet in die laufende Mission.
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung4";
    schleier.innerHTML = `
      <div class="cockpitbuehne">
        <div class="panelflaeche"></div>
      </div>
      <div class="testkopf"></div>
      <div class="testmitte"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const buehne = schleier.querySelector(".cockpitbuehne");
    const panel = schleier.querySelector(".panelflaeche");
    const mitte = schleier.querySelector(".testmitte");
    const restfeld = schleier.querySelector(".testkopf");
    let testende = Infinity;
    let restuhr = null;
    let beendet = false;
    let gestellt = 0;
    let richtig = 0;
    const zeitgeber = new Set();
    const spaeter = (fn, ms) => { const t = setTimeout(() => { zeitgeber.delete(t); fn(); }, ms); zeitgeber.add(t); return t; };

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
    // Während des Laufs führt Verlassen (Esc, Vollbild, Tabwechsel) zur
    // Ergebnistafel ohne Wertung; auf der Tafel schließt Esc wie der Knopf.
    let verlasse = () => zeigeErgebnis(false);
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const runde = () => {
      // ergebnisOffen deckt das Fenster ab, in dem die Ergebnistafel-Tür noch
      // zufährt: durchgehende Klicks dürfen keine neue Runde oder Frage mehr
      // auslösen (Q3).
      if (beendet || ergebnisOffen) return;
      const werte = zufallswerte();
      panel.innerHTML = tafelHtml(werte);
      mitte.innerHTML = "";
      buehne.classList.remove("verwischt");
      spaeter(() => frageFolge(werte, waehleInstrumente(fragen), 0), zeit * 1000);
    };

    const frageFolge = (werte, ids, index) => {
      if (beendet || ergebnisOffen) return;
      if (index >= ids.length) {
        if (performance.now() < testende) runde();
        else zeigeErgebnis(true);
        return;
      }
      const id = ids[index];
      const wert = id === "horizont" ? werte.horizont : werte[id];
      const optionen = antwortmoeglichkeiten(id, wert);
      const beschreibung = INSTRUMENTE.find((i) => i.id === id);
      // Der Horizont wird über Lagebilder beantwortet, wie im Original
      // (Dissertation 3.3.4.1, Abbildung 3-10): Die Antwort zeigt das
      // Flugzeug von außen, nicht die Winkel in Zahlen. Die Wortfassung
      // bleibt als Beschriftung für Vorlesegeräte.
      const knoepfe = optionen.map((o, i) => (id === "horizont"
        ? `<button class="antwortknopf lagebild" data-nr="${i}" aria-label="${formatiere(id, o)}">${svgLage(o)}</button>`
        : `<button class="antwortknopf" data-nr="${i}">${formatiere(id, o)}</button>`)).join("");
      buehne.classList.add("verwischt");
      mitte.innerHTML = `
        <div class="frage">${beschreibung.frage}</div>
        <div class="antworten">${knoepfe}</div>
        <div class="zeitbalken"><span style="animation-duration:${ANTWORTZEIT}s"></span></div>
        <div class="rueckmeldung"></div>`;

      let entschieden = false;
      spaeter(() => entscheide(null), ANTWORTZEIT * 1000);

      const entscheide = (nr) => {
        if (entschieden || beendet || ergebnisOffen) return;
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
          if (weitergegangen || beendet || ergebnisOffen) return;
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

    // Ergebnistafel für beide Wege: vollendeter Lauf (gewertet) und Abbruch
    // (ohne Wertung). Die Tür fährt zu, wird verwischt, die Tafel legt sich
    // davor; der Rücksprung räumt die Tafel weg und öffnet die Tür wieder.
    let ergebnisOffen = false;
    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      clearInterval(restuhr);
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      restfeld.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const faktor = schwierigkeitsfaktor(zeit, fragen);
      const quote = gestellt ? Math.round((richtig / gestellt) * 100) : 0;
      const wert = kennzahlAus(richtig, gestellt, faktor);
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${wert} %</div>
        <div class="ergebniszeilen">
          <span class="trefferzeile">${richtig} von ${gestellt} Aufgaben richtig (${quote} %)</span>
        </div>
        <button class="punkt" id="u4-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>Einstellung: ${zeit} s Anzeige · ${fragen} ${fragen === 1 ? "Frage" : "Fragen"} je Runde · ${dauer} min · Faktor ${faktor.toFixed(2)}</span>
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
            art: "instrumente-merken",
            anzeigezeit: zeit,
            fragenJeRunde: fragen,
            dauerMin: dauer,
            gestellt,
            richtig,
            quote,
            faktor: Number(faktor.toFixed(3)),
          },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u4-fertig").addEventListener("click", schliesse);
    };

    // Die Tür öffnet in die fertig aufgebaute Mission, erst dann läuft die Zeit.
    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      testende = performance.now() + dauer * 60_000;
      restuhr = setInterval(() => {
        const rest = Math.max(0, testende - performance.now());
        restfeld.textContent = `${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
      }, 250);
      runde();
    })();
  }

  return { hinweis, ladeEinstellung, zeichneFeld, starte };
}
