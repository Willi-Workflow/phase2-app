// Ablauf Mission 6 (Wissensabfrage) im Vollbild. Vier Frageformen:
// Musterbild mit Texteingabe, Wissensfrage mit Texteingabe (wahlweise mit
// Bild, etwa Dienstgradabzeichen), Auswahlfrage mit vier Knöpfen und
// Reflexionsfrage fürs Gespräch mit Hinweisen und Selbsteinschätzung.
// Die Prüfung der Eingaben ist großzügig (Spitznamen zählen, Schreibweise
// egal, siehe muster6.js). Ohne Zeitdruck: Es geht ums Erkennen und ums
// Formulieren, nicht ums Tempo. Der Wissensbereich darunter ist ein
// Lexikon: je Bereich ein aufklappbarer Abschnitt, die Flugzeugmuster
// mit Bildkarten, die übrigen Bereiche mit Wissenskarten.
import { GRUPPEN, MUSTER, istRichtig, anzeigenamen, bildpfad } from "./muster6.js";
import { WISSEN6, WISSEN6_REIHE } from "./wissen6.js";
import { BEREICHE, FRAGENZAHLEN, erzeugeFragen, pruefeEingabe6, kennzahl } from "./uebung6.js";
import { ANSICHTEN } from "./muster6-ansichten.js";

// Nach richtigen Antworten geht es zügig weiter, nach falschen bleibt Zeit,
// die richtige Antwort zu lesen. Ein Klick überspringt die Wartezeit.
const RUECKMELDEDAUER_RICHTIG = 900;
const RUECKMELDEDAUER_FALSCH = 2600;

export function erzeugeUebung6({ speicher }) {
  let einstellung = { bereich: "flugzeugmuster", fragen: 20 };
  const hinweis = "Wissensabfrage fürs psychologische Gespräch: Bereich wählen, dann kommen "
    + "Bild-, Eingabe- und Auswahlfragen ohne Zeitdruck; bei Persönliches sind es Gesprächsfragen "
    + "mit Hinweisen und Selbsteinschätzung. Eingaben werden großzügig geprüft, Spitznamen zählen, "
    + "Schreibweise ist egal. Das Lexikon darunter enthält das Wissen aller Bereiche zum Nachlesen.";

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung6-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">ABFRAGE</span>
        <select class="wahlliste" data-name="bereich">${BEREICHE.map((b) =>
          `<option value="${b.id}" ${b.id === einstellung.bereich ? "selected" : ""}>${b.name}</option>`).join("")}</select></div>
      <div class="wahlzeile"><span class="wahltitel">FRAGEN</span>
        <select class="wahlliste" data-name="fragen">${FRAGENZAHLEN.map((w) =>
          `<option value="${w}" ${w === einstellung.fragen ? "selected" : ""}>${w === 0 ? "alle" : w}</option>`).join("")}</select></div>`;
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = liste.dataset.name === "fragen" ? Number(liste.value) : liste.value;
      speicher.setzeEinstellung("uebung6-einstellung", einstellung);
    };
  }

  // Lexikon fest unter Mission und Auswertung: je Bereich ein aufklappbarer
  // Abschnitt. Die Flugzeugmuster starten offen (Bildkarten, Klick aufs Bild
  // blättert durch die Ansichten), die übrigen Bereiche als Wissenskarten.
  function musterLexikon() {
    return GRUPPEN.map((g) => {
      const eintraege = MUSTER.filter((m) => m.gruppe === g.id).map((m) => {
        const anzahl = ANSICHTEN[m.id] ?? 0;
        const bild = anzahl > 0
          ? `<button class="lexikonbild" type="button" data-id="${m.id}" data-ansicht="1" data-anzahl="${anzahl}" aria-label="Nächste Ansicht">
               <img src="${bildpfad(m.id, 1)}" alt="${m.name}" loading="lazy">
               <span class="bildzaehler">1/${anzahl}</span>
             </button>`
          : `<div class="lexikonbild leer">BILDER FOLGEN</div>`;
        const namen = anzeigenamen(m);
        const klammer = namen.length ? ` <span class="lexikonnamen">(${namen.join(", ")})</span>` : "";
        return `<article class="lexikonkarte">${bild}
            <div class="lexikonname">${m.name}${klammer}</div>
            <p class="lexikontext">${m.steckbrief}</p>
          </article>`;
      });
      return eintraege.length
        ? `<h3 class="lexikongruppe">${g.name.toUpperCase()}</h3><div class="lexikonraster">${eintraege.join("")}</div>`
        : "";
    }).join("");
  }

  function wissensLexikon(bereich) {
    return `<div class="wissensraster">${bereich.wissen.map((w) => `
      <article class="lexikonkarte wissenskarte">
        <div class="lexikonname">${w.titel}</div>
        ${w.zeilen.map((z) => `<p class="lexikontext">${z}</p>`).join("")}
      </article>`).join("")}</div>`;
  }

  function zeichneUnten(feld) {
    const abschnitte = [
      `<details class="lexikonklappe" open>
         <summary>FLUGZEUGMUSTER</summary>
         ${musterLexikon()}
       </details>`,
      ...WISSEN6_REIHE.map((id) => {
        const bereich = WISSEN6[id];
        if (!bereich.wissen.length && !bereich.fragen.length) return "";
        return `<details class="lexikonklappe">
            <summary>${bereich.name.toUpperCase()}</summary>
            ${wissensLexikon(bereich)}
          </details>`;
      }),
    ].join("");
    feld.innerHTML = `
      <section class="wissensbereich lexikonbereich">
        <div class="lexikonkopf">LEXIKON</div>
        ${abschnitte}
      </section>`;
    // Ein Hörer fürs ganze Lexikon: Klick aufs Musterbild blättert zur
    // nächsten Ansicht, die Karten sind viele, darum Delegation.
    feld.addEventListener("click", (e) => {
      const knopf = e.target.closest(".lexikonbild[data-id]");
      if (!knopf) return;
      const anzahl = Number(knopf.dataset.anzahl);
      const naechste = (Number(knopf.dataset.ansicht) % anzahl) + 1;
      knopf.dataset.ansicht = naechste;
      knopf.querySelector("img").src = bildpfad(knopf.dataset.id, naechste);
      knopf.querySelector(".bildzaehler").textContent = `${naechste}/${anzahl}`;
    });
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const { bereich, fragen: fragenzahl } = einstellung;
    const fragen = erzeugeFragen({ bereich, ansichten: ANSICHTEN, anzahl: fragenzahl });
    // Der Aufrufer hat die Hangartür bereits geschlossen: der Testbildschirm
    // baut sich verdeckt auf, die Tür öffnet in die laufende Abfrage.
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung6";
    schleier.innerHTML = `
      <div class="testmitte"></div>
      <div class="testkopf"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const mitte = schleier.querySelector(".testmitte");
    const kopf = schleier.querySelector(".testkopf");
    let beendet = false;
    let nummer = 0;
    let gestellt = 0;
    let richtig = 0;
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

    // Gemeinsamer Abschluss einer Frage: zählen, Rückmeldung zeigen, nach
    // der Wartezeit (oder auf Klick) weiter zur nächsten Frage.
    const schliesseFrage = ({ getroffen, meldung }) => {
      gestellt += 1;
      if (getroffen) richtig += 1;
      const rueck = mitte.querySelector(".rueckmeldung");
      rueck.textContent = meldung;
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

    const eingabefrage = (frage) => {
      const bild = frage.bild ?? null;
      const richtigText = frage.form === "muster" ? frage.muster.name : frage.loesungen[0];
      mitte.innerHTML = `
        ${frage.frage ? `<div class="frage">${frage.frage}</div>` : ""}
        ${bild ? `<div class="quizbild ${frage.form === "muster" ? "" : "hochkant"}"><img src="${bild}" alt="Zur Frage gehörendes Bild"></div>` : ""}
        <form class="eingabezeile" id="u6-form">
          <input class="zahlenfeld musterfeld" id="u6-eingabe" type="text" autocomplete="off"
            autocapitalize="off" spellcheck="false" placeholder="${frage.form === "muster" ? "Muster benennen" : "Antwort"}">
        </form>
        <div class="rueckmeldung"></div>`;
      const form = mitte.querySelector("#u6-form");
      const eingabe = mitte.querySelector("#u6-eingabe");
      eingabe.focus();
      let entschieden = false;
      form.addEventListener("click", (e) => e.stopPropagation());
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (entschieden || beendet || eingabe.value.trim() === "") return;
        entschieden = true;
        const getroffen = frage.form === "muster"
          ? istRichtig(eingabe.value, frage.muster)
          : pruefeEingabe6(eingabe.value, frage);
        eingabe.disabled = true;
        eingabe.classList.add(getroffen ? "richtig" : "falsch");
        schliesseFrage({
          getroffen,
          meldung: getroffen ? `RICHTIG · ${richtigText}` : `FALSCH · richtig: ${richtigText}`,
        });
      });
    };

    const auswahlfrage = (frage) => {
      mitte.innerHTML = `
        <div class="frage">${frage.frage}</div>
        <div class="antworten wissensantworten">${frage.antworten.map((a, i) =>
          `<button class="antwortknopf" data-nr="${i}">${a}</button>`).join("")}</div>
        <div class="rueckmeldung"></div>`;
      let entschieden = false;
      mitte.querySelector(".antworten").addEventListener("click", (e) => {
        const knopf = e.target.closest(".antwortknopf");
        if (!knopf || entschieden || beendet) return;
        e.stopPropagation();
        entschieden = true;
        const getroffen = knopf.textContent === frage.richtig;
        mitte.querySelectorAll(".antwortknopf").forEach((k) => {
          k.disabled = true;
          if (k.textContent === frage.richtig) k.classList.add("richtig");
          else if (k === knopf) k.classList.add("falsch");
        });
        schliesseFrage({ getroffen, meldung: getroffen ? "RICHTIG" : "FALSCH" });
      });
    };

    // Reflexionsfrage: erst laut oder im Kopf antworten, dann die Hinweise
    // aufdecken und selbst einschätzen. "Saß" zählt wie eine richtige
    // Antwort, so wird die Kennzahl zum Übungsstand.
    const reflexionsfrage = (frage) => {
      mitte.innerHTML = `
        <div class="frage">${frage.frage}</div>
        <div class="hinweisblock">
          <button class="antwortknopf" id="u6-aufdecken">HINWEISE AUFDECKEN</button>
        </div>
        <div class="rueckmeldung"></div>`;
      const block = mitte.querySelector(".hinweisblock");
      block.addEventListener("click", (e) => e.stopPropagation());
      block.querySelector("#u6-aufdecken").addEventListener("click", () => {
        if (beendet) return;
        block.innerHTML = `
          <ul class="hinweisliste">${frage.hinweise.map((h) => `<li>${h}</li>`).join("")}</ul>
          <div class="antworten wissensantworten">
            <button class="antwortknopf" data-wert="ja">SASS</button>
            <button class="antwortknopf" data-wert="nein">MUSS ICH ÜBEN</button>
          </div>`;
        let entschieden = false;
        block.querySelector(".antworten").addEventListener("click", (e) => {
          const knopf = e.target.closest(".antwortknopf");
          if (!knopf || entschieden || beendet) return;
          entschieden = true;
          const getroffen = knopf.dataset.wert === "ja";
          block.querySelectorAll(".antwortknopf").forEach((k) => { k.disabled = true; });
          knopf.classList.add(getroffen ? "richtig" : "falsch");
          schliesseFrage({ getroffen, meldung: getroffen ? "SASS" : "KOMMT AUF DIE ÜBUNGSLISTE" });
        });
      });
    };

    const stelle = () => {
      if (beendet) return;
      if (nummer >= fragen.length) { zeigeErgebnis(true); return; }
      const frage = fragen[nummer];
      nummer += 1;
      kopf.textContent = `FRAGE ${nummer}/${fragen.length}`;
      // Die nächste Aufnahme lädt schon im Hintergrund, damit der Wechsel
      // nicht am Netz hängt.
      if (fragen[nummer]?.bild) new Image().src = fragen[nummer].bild;
      if (frage.form === "auswahl") auswahlfrage(frage);
      else if (frage.form === "reflexion") reflexionsfrage(frage);
      else eingabefrage(frage);
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

      const quote = kennzahl(richtig, gestellt);
      const bereichsname = BEREICHE.find((b) => b.id === bereich)?.name ?? bereich;
      const trefferzeile = bereich === "persoenlich"
        ? `${richtig} von ${gestellt} Antworten saßen nach eigener Einschätzung`
        : `${richtig} von ${gestellt} Fragen richtig`;
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "ABFRAGE BEENDET" : "ABFRAGE ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${quote} %</div>
        <div class="ergebniszeilen">
          <span class="trefferzeile">${trefferzeile}</span>
        </div>
        <button class="punkt" id="u6-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>Bereich ${bereichsname} · ${fragen.length} ${fragen.length === 1 ? "Frage" : "Fragen"}</span>
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
          kennzahl: quote,
          daten: { art: "wissenstest", bereich, gestellt, richtig, quote },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u6-fertig").addEventListener("click", schliesse);
    };

    // Die Tür öffnet in die fertig aufgebaute Abfrage. Ohne Fragen gibt es
    // nichts zu tun, dann steht der Hinweis statt der ersten Frage.
    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      if (fragen.length === 0) {
        mitte.innerHTML = `<div class="frage">DIESER BEREICH IST NOCH LEER</div>
          <div class="rueckmeldung">Abfrage mit Esc verlassen.</div>`;
        return;
      }
      stelle();
    })();
  }

  return { hinweis, ladeEinstellung, zeichneFeld, zeichneUnten, starte };
}
