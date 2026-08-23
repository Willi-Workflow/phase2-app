// Ablauf Mission 5 (Test Flugphysik) im Vollbild: zehn erzeugte Aufgaben mit
// Ablaufbalken, je Aufgabe als Auswahlfrage oder Zahleneingabe, sofortige
// Auflösung, danach die Ergebnistafel. Der Wissensbereich liegt als
// Karteikartenstapel über der Missionsseite, nicht im Lauf.
import {
  AUFGABENZAHL, AUFGABENZEIT, erzeugeLauf, antwortenFuer, pruefeEingabe,
  punkteFuerAntwort, kennzahl,
} from "./uebung5.js";
import { KARTEN5 } from "./wissen5.js";

// Rückmeldung: nach richtigen Antworten geht es zügig weiter, nach falschen
// bleibt Zeit, den wahren Wert zu lesen. Ein Klick überspringt die Wartezeit.
const RUECKMELDEDAUER_RICHTIG = 700;
const RUECKMELDEDAUER_FALSCH = 1800;

export function erzeugeUebung5() {
  const hinweis = "Zehn gerechnete Aufgaben zu Weg, Zeit, Geschwindigkeit und Sink- oder "
    + "Steigrate, je Aufgabe 30 Sekunden. Geantwortet wird per Auswahl oder Zahleneingabe. "
    + "Punkte gibt es für richtige und schnelle Antworten, die Formeln stehen unter WISSEN.";

  function zeichneFeld(feld) {
    feld.innerHTML = `<button class="punkt wissensknopf" id="u5-wissen">WISSEN · KARTEIKARTEN</button>`;
    feld.querySelector("#u5-wissen").addEventListener("click", zeigeWissen);
  }

  // Karteikartenstapel über der Missionsseite: blättern per Knopf, Klick auf
  // die Karte oder Pfeiltasten, Esc oder SCHLIESSEN führt zurück.
  function zeigeWissen() {
    if (document.querySelector(".wissensschicht")) return;
    let index = 0;
    const schicht = document.createElement("div");
    schicht.className = "wissensschicht";
    schicht.innerHTML = `
      <div class="kartenstapel">
        <div class="karteikarte dahinter zwei"></div>
        <div class="karteikarte dahinter eins"></div>
        <div class="karteikarte oben"></div>
      </div>
      <div class="kartenleiste">
        <button class="punkt" id="k-zurueck">◄</button>
        <span class="kartenzaehler" id="k-zaehler"></span>
        <button class="punkt" id="k-weiter">►</button>
        <button class="punkt" id="k-schliessen">SCHLIESSEN</button>
      </div>`;
    document.body.append(schicht);
    const karte = schicht.querySelector(".karteikarte.oben");
    const zaehler = schicht.querySelector("#k-zaehler");

    const zeichne = () => {
      const k = KARTEN5[index];
      karte.innerHTML = `<div class="kartenkopf">${k.titel}</div>`
        + k.zeilen.map((z) => `<div class="kartenzeile">${z}</div>`).join("");
      zaehler.textContent = `${index + 1}/${KARTEN5.length}`;
    };
    const blaettere = (schritt) => {
      index = (index + schritt + KARTEN5.length) % KARTEN5.length;
      karte.classList.remove("blaettert");
      void karte.offsetWidth; // Neustart der Blätterbewegung
      karte.classList.add("blaettert");
      zeichne();
    };
    const schliesse = () => {
      removeEventListener("keydown", beiTaste, true);
      schicht.remove();
    };
    const beiTaste = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); schliesse(); }
      if (e.key === "ArrowRight") blaettere(1);
      if (e.key === "ArrowLeft") blaettere(-1);
    };
    addEventListener("keydown", beiTaste, true);
    karte.addEventListener("click", () => blaettere(1));
    schicht.querySelector("#k-weiter").addEventListener("click", () => blaettere(1));
    schicht.querySelector("#k-zurueck").addEventListener("click", () => blaettere(-1));
    schicht.querySelector("#k-schliessen").addEventListener("click", schliesse);
    schicht.addEventListener("click", (e) => { if (e.target === schicht) schliesse(); });
    zeichne();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const aufgaben = erzeugeLauf(AUFGABENZAHL);
    const limitMs = AUFGABENZEIT * 1000;
    // Der Aufrufer hat die Hangartür bereits geschlossen: der Testbildschirm
    // baut sich verdeckt auf, die Tür öffnet in die laufende Mission.
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung5";
    schleier.innerHTML = `<div class="testkopf"></div><div class="testmitte"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const mitte = schleier.querySelector(".testmitte");
    const kopf = schleier.querySelector(".testkopf");
    let beendet = false;
    let gestellt = 0;
    let richtig = 0;
    let punkteSumme = 0;
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
    // Während des Laufs führt Verlassen (Esc, Vollbild, Tabwechsel) zur
    // Ergebnistafel ohne Wertung; auf der Tafel schließt Esc wie der Knopf.
    let verlasse = () => zeigeErgebnis(false);
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const stelle = (index) => {
      if (beendet) return;
      if (index >= aufgaben.length) { zeigeErgebnis(true); return; }
      const aufgabe = aufgaben[index];
      kopf.textContent = `AUFGABE ${index + 1} / ${aufgaben.length}`;
      const antwortfeld = aufgabe.form === "auswahl"
        ? `<div class="antworten">${antwortenFuer(aufgabe).map((w, i) =>
            `<button class="antwortknopf" data-nr="${i}" data-wert="${w}">${w} ${aufgabe.einheit}</button>`).join("")}</div>`
        : `<form class="eingabezeile" id="u5-form">
            <input class="zahlenfeld" id="u5-eingabe" inputmode="decimal" autocomplete="off" placeholder="Antwort">
            <span class="einheit">${aufgabe.einheit}</span>
            <button class="punkt" type="submit">ABGEBEN</button>
          </form>`;
      mitte.innerHTML = `
        <div class="frage">${aufgabe.frage}</div>
        ${antwortfeld}
        <div class="zeitbalken"><span style="animation-duration:${AUFGABENZEIT}s"></span></div>
        <div class="rueckmeldung"></div>`;

      const start = performance.now();
      let entschieden = false;
      spaeter(() => entscheide({ abgelaufen: true }), limitMs);

      const entscheide = ({ getroffen = false, abgelaufen = false, gewaehlt = null }) => {
        if (entschieden || beendet) return;
        entschieden = true;
        gestellt += 1;
        const rest = abgelaufen ? 0 : Math.max(0, limitMs - (performance.now() - start));
        const punkte = punkteFuerAntwort(getroffen, rest, limitMs);
        if (getroffen) { richtig += 1; punkteSumme += punkte; }
        mitte.querySelectorAll(".antwortknopf").forEach((knopf) => {
          knopf.disabled = true;
          if (Number(knopf.dataset.wert) === aufgabe.antwort) knopf.classList.add("richtig");
          else if (knopf.dataset.nr === gewaehlt) knopf.classList.add("falsch");
        });
        const eingabe = mitte.querySelector("#u5-eingabe");
        if (eingabe) { eingabe.disabled = true; eingabe.classList.add(getroffen ? "richtig" : "falsch"); }
        mitte.querySelector(".zeitbalken span").style.animationPlayState = "paused";
        const rueck = mitte.querySelector(".rueckmeldung");
        rueck.textContent = getroffen
          ? `RICHTIG · ${Math.round(punkte)} PUNKTE`
          : `${abgelaufen ? "ZEIT ABGELAUFEN" : "FALSCH"} · richtig: ${aufgabe.antwort} ${aufgabe.einheit}`;
        rueck.classList.add(getroffen ? "gut" : "schlecht");
        let weitergegangen = false;
        const weiter = () => {
          if (weitergegangen || beendet) return;
          weitergegangen = true;
          schleier.removeEventListener("click", weiter);
          stelle(index + 1);
        };
        spaeter(weiter, getroffen ? RUECKMELDEDAUER_RICHTIG : RUECKMELDEDAUER_FALSCH);
        schleier.addEventListener("click", weiter);
      };

      if (aufgabe.form === "auswahl") {
        mitte.querySelector(".antworten").addEventListener("click", (e) => {
          const knopf = e.target.closest(".antwortknopf");
          if (!knopf) return;
          e.stopPropagation();
          entscheide({ getroffen: Number(knopf.dataset.wert) === aufgabe.antwort, gewaehlt: knopf.dataset.nr });
        });
      } else {
        const form = mitte.querySelector("#u5-form");
        const eingabe = mitte.querySelector("#u5-eingabe");
        eingabe.focus();
        form.addEventListener("click", (e) => e.stopPropagation());
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          entscheide({ getroffen: pruefeEingabe(eingabe.value, aufgabe.antwort) });
        });
      }
    };

    // Ergebnistafel für beide Wege: vollendeter Lauf (gewertet) und Abbruch
    // (ohne Wertung). Die Tür fährt zu, wird verwischt, die Tafel legt sich
    // davor; der Rücksprung räumt die Tafel weg und öffnet die Tür wieder.
    let ergebnisOffen = false;
    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const wert = kennzahl(punkteSumme, aufgaben.length);
      const quote = gestellt ? Math.round((richtig / gestellt) * 100) : 0;
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${wert} PUNKTE</div>
        <div class="ergebniszeilen">
          <span class="trefferzeile">${richtig} von ${gestellt} Aufgaben richtig · ${quote} %</span>
        </div>
        <button class="punkt" id="u5-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>${aufgaben.length} Aufgaben · ${AUFGABENZEIT} s je Aufgabe</span>
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
          daten: { art: "flugphysik", gestellt, richtig, quote, punkte: wert },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u5-fertig").addEventListener("click", schliesse);
    };

    // Die Tür öffnet in die fertig aufgebaute Mission, erst dann läuft die Zeit.
    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      stelle(0);
    })();
  }

  return { hinweis, zeichneFeld, starte };
}
