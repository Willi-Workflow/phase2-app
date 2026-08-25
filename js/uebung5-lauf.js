// Ablauf Mission 5 (Test Flugphysik) im Vollbild: Aufgaben am Stück in
// Sechserblöcken, bis die eingestellte Testdauer um ist, mit Ablaufbalken,
// je Aufgabe als Auswahlfrage oder Zahleneingabe, sofortige Auflösung,
// danach die Ergebnistafel. Der Wissensbereich steht als Karteikartenstapel
// fest auf der Missionsseite, nicht im Lauf. Die Bühne ist dieselbe
// Cockpitbühne wie Mission 4: Fragetext, Ablaufbalken und Antworten liegen
// im Scheibenfeld über dem Panel, das je Aufgabe frische Instrumentenwerte
// zeigt, denn ein Teil der Aufgaben verlangt das Ablesen am Instrument.
import {
  TESTDAUERN, AUFGABENZEIT, erzeugeLauf, antwortenFuer, pruefeEingabe,
  punkteFuerAntwort, kennzahl,
} from "./uebung5.js";
import { zufallswerte, tafelHtml } from "./instrumente.js";
import { KARTEN5 } from "./wissen5.js";

// Rückmeldung: nach richtigen Antworten geht es zügig weiter, nach falschen
// bleibt Zeit, den wahren Wert zu lesen. Ein Klick überspringt die Wartezeit.
const RUECKMELDEDAUER_RICHTIG = 700;
const RUECKMELDEDAUER_FALSCH = 1800;

export function erzeugeUebung5({ speicher }) {
  let einstellung = { dauer: 5 };
  const hinweis = "Rechenaufgaben zu Weg, Zeit, Geschwindigkeit und Sink- oder Steigrate am Stück, "
    + "bis die eingestellte Testdauer um ist, je Aufgabe 20 Sekunden, im Cockpit. Manche Aufgaben "
    + "nennen keinen Wert, sondern verweisen aufs Ablesen am Instrumentenpanel. Geantwortet wird "
    + "per Auswahl oder Zahleneingabe. Punkte gibt es für richtige und schnelle Antworten, die "
    + "Formeln stehen auf den Karteikarten darunter.";

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung5-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="dauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.dauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>`;
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung5-einstellung", einstellung);
    };
  }

  // Wissensbereich fest unter Mission und Auswertung: je Größe eine
  // Karteikarte mit Formel, Merksatz und Beispielrechnung, blätterbar über
  // die Tintenpfeile auf der Karte oder Klick auf die Karte. Keine globalen
  // Tastenkürzel.
  function zeichneUnten(feld) {
    let index = 0;
    feld.innerHTML = `
      <section class="wissensbereich">
        <div class="kartenstapel">
          <div class="karteikarte dahinter zwei"></div>
          <div class="karteikarte dahinter eins"></div>
          <div class="karteikarte oben"></div>
        </div>
      </section>`;
    const karte = feld.querySelector(".karteikarte.oben");
    const zeichne = () => {
      const k = KARTEN5[index];
      karte.innerHTML = `<div class="kartenkopf">${k.titel}</div>`
        + k.zeilen.map((z) => `<div class="kartenzeile">${z}</div>`).join("")
        + `<div class="kartenzeile beispielkopf">Beispiel:</div>`
        + k.beispiel.map((z) => `<div class="kartenzeile">${z}</div>`).join("")
        + `<div class="kartenfuss">
            <button class="kartenpfeil" data-schritt="-1" aria-label="Vorherige Karte">←</button>
            <span class="kartenzaehler">${index + 1}/${KARTEN5.length}</span>
            <button class="kartenpfeil" data-schritt="1" aria-label="Nächste Karte">→</button>
          </div>`;
    };
    const blaettere = (schritt) => {
      index = (index + schritt + KARTEN5.length) % KARTEN5.length;
      karte.classList.remove("blaettert");
      void karte.offsetWidth; // Neustart der Blätterbewegung
      karte.classList.add("blaettert");
      zeichne();
    };
    // Ein Hörer für alles: Pfeile blättern gezielt, jeder andere Klick auf die
    // Karte blättert vorwärts. Die Pfeile werden je Blättern neu gezeichnet,
    // darum läuft alles über Delegation statt Einzelbindung.
    karte.addEventListener("click", (e) => {
      const pfeil = e.target.closest(".kartenpfeil");
      blaettere(pfeil ? Number(pfeil.dataset.schritt) : 1);
    });
    zeichne();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const { dauer } = einstellung;
    let vorrat = [];
    const naechsteAufgabe = () => {
      // Nachschub in Sechserblöcken: jedes Prinzip kommt mindestens einmal
      // vor, und die Drittel-Regel geht auf (zwei von sechs Aufgaben lesen
      // vom Instrument ab, zufällig über den Block verteilt). Viererblöcke
      // ergäben starr jede vierte Aufgabe, ein Viertel statt ein Drittel.
      if (vorrat.length === 0) vorrat = erzeugeLauf(6);
      return vorrat.shift();
    };
    const limitMs = AUFGABENZEIT * 1000;
    // Der Aufrufer hat die Hangartür bereits geschlossen: der Testbildschirm
    // baut sich verdeckt auf, die Tür öffnet in die laufende Mission.
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung5";
    schleier.innerHTML = `
      <div class="cockpitbuehne">
        <div class="panelflaeche"></div>
      </div>
      <div class="scheibenfeld">
        <div class="testmitte"></div>
      </div>
      <div class="testkopf"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const panel = schleier.querySelector(".panelflaeche");
    const mitte = schleier.querySelector(".testmitte");
    const kopf = schleier.querySelector(".testkopf");
    let testende = Infinity;
    let restuhr = null;
    let nummer = 0;
    let beendet = false;
    let gestellt = 0;
    let richtig = 0;
    let punkteSumme = 0;
    const zeitgeber = new Set();
    const spaeter = (fn, ms) => { const t = setTimeout(() => { zeitgeber.delete(t); fn(); }, ms); zeitgeber.add(t); return t; };

    const zeigeKopf = () => {
      const rest = Math.max(0, testende - performance.now());
      kopf.textContent = `AUFGABE ${nummer} · REST ${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
    };

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

    const stelle = () => {
      if (beendet) return;
      if (performance.now() >= testende) { zeigeErgebnis(true); return; }
      nummer += 1;
      const aufgabe = naechsteAufgabe();
      zeigeKopf();
      // Frische Instrumentenwerte je Aufgabe; bei einer Instrumentenaufgabe
      // überschreibt der Aufgabenwert das betroffene Instrument, die übrigen
      // zeigen weiter ihren Zufallswert. Das Panel bleibt während der ganzen
      // Aufgabe stehen, unverwischt, damit sich der Wert ablesen lässt.
      const werte = zufallswerte();
      if (aufgabe.instrument) werte[aufgabe.instrument.id] = aufgabe.instrument.wert;
      panel.innerHTML = tafelHtml(werte);
      const antwortfeld = aufgabe.form === "auswahl"
        ? `<div class="antworten">${antwortenFuer(aufgabe).map((w, i) =>
            `<button class="antwortknopf" data-nr="${i}" data-wert="${w}">${w} ${aufgabe.einheit}</button>`).join("")}</div>`
        : `<form class="eingabezeile" id="u5-form">
            <input class="zahlenfeld" id="u5-eingabe" inputmode="decimal" autocomplete="off" placeholder="Antwort">
            <span class="einheit">${aufgabe.einheit}</span>
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
          stelle();
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
      clearInterval(restuhr);
      for (const t of zeitgeber) clearTimeout(t);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const wert = kennzahl(punkteSumme, gestellt);
      const quote = gestellt ? Math.round((richtig / gestellt) * 100) : 0;
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${quote} %</div>
        <div class="ergebniszeilen">
          <span class="trefferzeile">${richtig} von ${gestellt} Aufgaben richtig</span>
        </div>
        <button class="punkt" id="u5-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>${dauer} min Testdauer · ${AUFGABENZEIT} s je Aufgabe · ${gestellt} ${gestellt === 1 ? "Aufgabe" : "Aufgaben"}</span>
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
          daten: { art: "flugphysik", dauerMin: dauer, gestellt, richtig, quote, punkte: wert },
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
      testende = performance.now() + dauer * 60_000;
      restuhr = setInterval(zeigeKopf, 250);
      stelle();
    })();
  }

  return { hinweis, ladeEinstellung, zeichneFeld, zeichneUnten, starte };
}
