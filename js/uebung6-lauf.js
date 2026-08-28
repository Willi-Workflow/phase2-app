// Ablauf Mission 6 (Wissensabfrage) im Vollbild, als Karteikartenabfrage
// (Willis Vorgabe vom 28.08.2026): vorn die Frage, bei Bildfragen das Foto
// oder Abzeichen, ein Klick dreht die Karte um, hinten steht die Antwort,
// danach die Selbsteinschätzung GEWUSST oder MUSS ICH ÜBEN. Nur der
// Bereich Persönliches bleibt in Textform: Gesprächsfrage, Hinweise
// aufdecken, selbst einschätzen. Ohne Zeitdruck, die Kennzahl ist der
// selbst eingeschätzte Übungsstand in Prozent. Der Wissensbereich darunter
// ist ein Lexikon: je Bereich ein aufklappbarer Abschnitt.
import { GRUPPEN, MUSTER, anzeigenamen, bildpfad } from "./muster6.js";
import { WISSEN6, WISSEN6_REIHE } from "./wissen6.js";
import { BEREICHE, FRAGENZAHLEN, erzeugeFragen, karteVon, kennzahl } from "./uebung6.js";
import { ANSICHTEN } from "./muster6-ansichten.js";

export function erzeugeUebung6({ speicher }) {
  let einstellung = { bereich: "flugzeugmuster", fragen: 20 };
  const hinweis = "Wissensabfrage fürs psychologische Gespräch als Karteikarten: Bereich wählen, "
    + "je Karte die Frage (oder das Bild) ansehen, im Kopf antworten, Karte anklicken zum Umdrehen "
    + "und selbst einschätzen: gewusst oder üben. Nur Persönliches läuft als Gesprächsfragen in "
    + "Textform mit Hinweisen. Das Lexikon darunter enthält das Wissen aller Bereiche zum Nachlesen.";

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

  // Kapitelinhalt Flugzeugmuster: Bildkarten nach Gruppen.
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

  // Kapitelinhalt der Wissensbereiche: Buchsatz mit Teilüberschriften und
  // Absätzen in Fließtext statt Kartenkästen (Willis Vorgabe vom 28.08.2026).
  function wissensLexikon(bereich) {
    return `<div class="wissenstext">${bereich.wissen.map((w) => w.zwischen
      ? `<h3 class="zwischentitel">${w.zwischen}</h3>`
      : `
      <h4 class="abschnittstitel">${w.titel}</h4>
      ${w.absaetze.map((a) => `<p class="absatz">${a}</p>`).join("")}`).join("")}</div>`;
  }

  // Nachschlagteil je Bereich: alle abgefragten Fragen mit ihrer Antwort
  // (Willis Vorgabe vom 28.08.2026), die persönlichen Fragen bleiben
  // draußen. Die Kartensicht liefert Frage, Bild und Antwort einheitlich.
  function fragenNachschlag(bereich) {
    const eintraege = bereich.fragen.filter((f) => f.form !== "reflexion").map((f) => {
      const karte = karteVon(f);
      const bild = karte.bild ? `<img class="fragenbild" src="${karte.bild}" alt="" loading="lazy">` : "";
      const auch = karte.auch.length ? ` <span class="lexikonnamen">(auch: ${karte.auch.join(", ")})</span>` : "";
      return `<div class="fragenzeile">${bild}<div>
          <div class="fragetext">${karte.frage}</div>
          <div class="antworttext">${karte.antwort}${auch}</div>
        </div></div>`;
    });
    return eintraege.length
      ? `<h4 class="abschnittstitel">Abgefragt</h4><div class="fragenliste">${eintraege.join("")}</div>`
      : "";
  }

  // Lexikon fest unter Mission und Auswertung, gestaltet als Buch (Willis
  // Vorgabe vom 28.08.2026, Texturen aus Higgsfield): zu sehen ist erst der
  // Einband, ein Klick schlägt das Inhaltsverzeichnis auf, von dort geht es
  // in die Kapitel; unten auf jeder Seite wird geblättert. Die Kapitelinhalte
  // bleiben: Flugzeugmuster als Bildkarten, die übrigen Bereiche als
  // Wissenskarten mit Nachschlagteil.
  function zeichneUnten(feld) {
    const kapitel = [
      { id: "flugzeugmuster", name: "Flugzeugmuster", inhalt: musterLexikon() },
      ...WISSEN6_REIHE.map((id) => {
        const bereich = WISSEN6[id];
        if (!bereich.wissen.length && !bereich.fragen.length) return null;
        return {
          id,
          name: bereich.name,
          inhalt: wissensLexikon(bereich) + (id === "persoenlich" ? "" : fragenNachschlag(bereich)),
        };
      }).filter(Boolean),
    ];
    const blaettern = (ziel, text) => `<span class="blaettern" data-ziel="${ziel}">${text}</span>`;
    const seiten = kapitel.map((k, i) => {
      const vor = i > 0
        ? blaettern(kapitel[i - 1].id, `◂ Kapitel ${i}`)
        : blaettern("inhalt", "◂ Inhalt");
      const zurueck = i < kapitel.length - 1
        ? blaettern(kapitel[i + 1].id, `Kapitel ${i + 2} ▸`)
        : blaettern("deckel", "Zuklappen ▸");
      return `
        <div class="buchseite" data-blatt="${k.id}" hidden>
          <div class="kapitelkopf">
            <span class="kapitelnummer">Kapitel ${i + 1}</span>
            <span class="kapiteltitel">${k.name.toUpperCase()}</span>
          </div>
          <div class="seiteninhalt">${k.inhalt}</div>
          <div class="seitenfuss">${vor}${blaettern("inhalt", "Inhalt")}${zurueck}</div>
        </div>`;
    }).join("");
    feld.innerHTML = `
      <section class="wissensbereich lexikonbereich">
        <div class="lexikonbuch">
          <div class="buchdeckel" data-ziel="inhalt" role="button" tabindex="0">
            <span class="deckeluntertitel">PHASE II · PSYCHOLOGISCHES GESPRÄCH</span>
            <span class="deckeltitel">LEXIKON</span>
            <span class="deckelhinweis">Zum Aufschlagen anklicken</span>
          </div>
          <div class="buchschleier" hidden>
          <div class="buchseite inhaltsseite" data-blatt="inhalt" hidden>
            <div class="kapitelkopf">
              <span class="kapitelnummer">Inhalt</span>
              <span class="kapiteltitel">WISSENSBEREICHE</span>
            </div>
            <div class="seiteninhalt"><ol class="inhaltsliste">${kapitel.map((k, i) => `
              <li><span class="inhaltseintrag" data-ziel="${k.id}">
                <span class="inhaltstitel">${k.name}</span>
                <span class="punktlinie"></span>
                <span class="inhaltsnummer">${i + 1}</span>
              </span></li>`).join("")}
            </ol></div>
            <div class="seitenfuss">${blaettern("deckel", "◂ Zuklappen")}<span></span>${blaettern(kapitel[0].id, "Kapitel 1 ▸")}</div>
          </div>
          ${seiten}
          </div>
        </div>
      </section>`;
    // Aufgeschlagen liegt das Buch als Fenster über der Seite, dahinter
    // verschwimmt die Missionsseite. Alles mit data-ziel blättert (Deckel,
    // Inhaltseinträge, Blätterzeilen), das Ziel deckel klappt zu, ebenso
    // Esc und ein Klick neben das Buch. Klick aufs Musterbild wechselt die
    // Ansicht, alles über Delegation.
    const schleier = feld.querySelector(".buchschleier");
    const schlage = (ziel) => {
      if (ziel === "deckel") { schleier.hidden = true; return; }
      schleier.hidden = false;
      schleier.querySelectorAll("[data-blatt]").forEach((b) => { b.hidden = b.dataset.blatt !== ziel; });
    };
    feld.addEventListener("click", (e) => {
      const zielTraeger = e.target.closest("[data-ziel]");
      if (zielTraeger) { schlage(zielTraeger.dataset.ziel); return; }
      if (e.target === schleier) { schlage("deckel"); return; }
      const knopf = e.target.closest(".lexikonbild[data-id]");
      if (!knopf) return;
      const anzahl = Number(knopf.dataset.anzahl);
      const naechste = (Number(knopf.dataset.ansicht) % anzahl) + 1;
      knopf.dataset.ansicht = naechste;
      knopf.querySelector("img").src = bildpfad(knopf.dataset.id, naechste);
      knopf.querySelector(".bildzaehler").textContent = `${naechste}/${anzahl}`;
    });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !schleier.hidden) schlage("deckel");
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
    const raeumeAuf = () => {
      beendet = true;
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

    // Selbsteinschätzung zählt wie eine Antwort, danach geht es ohne
    // Wartezeit zur nächsten Karte, das ist das Karteikartentempo.
    const bewerte = (getroffen) => {
      gestellt += 1;
      if (getroffen) richtig += 1;
      stelle();
    };

    // Karteikarte: vorn die Frage, bei Bildfragen das Foto oder Abzeichen,
    // ein Klick dreht die Karte um, hinten stehen Antwort, weitere zählende
    // Namen und bei Mustern der Steckbrief. Dann die Selbsteinschätzung.
    const kartenfrage = (frage) => {
      const karte = karteVon(frage);
      mitte.innerHTML = `
        <div class="kartenstapel abfragestapel">
          <div class="karteikarte dahinter zwei"></div>
          <div class="karteikarte dahinter eins"></div>
          <div class="karteikarte oben">
            <div class="kartenseite">
              ${karte.bild ? `<div class="kartenbild ${frage.form === "muster" ? "" : "hochkant"}"><img src="${karte.bild}" alt="Zur Frage gehörendes Bild"></div>` : ""}
              <div class="kartenzeile kartenfrage">${karte.frage}</div>
            </div>
            <div class="kartenfuss"><span class="kartenzaehler">Karte anklicken zum Umdrehen</span></div>
          </div>
        </div>
        <div class="antworten wissensantworten" hidden>
          <button class="antwortknopf" data-wert="ja">GEWUSST</button>
          <button class="antwortknopf" data-wert="nein">MUSS ICH ÜBEN</button>
        </div>
        <div class="rueckmeldung"></div>`;
      const oben = mitte.querySelector(".karteikarte.oben");
      const knoepfe = mitte.querySelector(".antworten");
      let umgedreht = false;
      oben.addEventListener("click", (e) => {
        e.stopPropagation();
        if (umgedreht || beendet) return;
        umgedreht = true;
        oben.classList.add("blaettert");
        const auch = karte.auch.length
          ? `<div class="kartenzeile kartenauch">auch richtig: ${karte.auch.join(", ")}</div>` : "";
        const zusatz = karte.zusatz
          ? `<div class="kartenzeile kartenzusatz">${karte.zusatz}</div>` : "";
        oben.innerHTML = `<div class="kartenseite">
            <div class="kartenkopf">${karte.antwort}</div>
            ${auch}${zusatz}
          </div>`;
        knoepfe.hidden = false;
      });
      knoepfe.addEventListener("click", (e) => {
        const knopf = e.target.closest(".antwortknopf");
        if (!knopf || beendet) return;
        e.stopPropagation();
        knoepfe.querySelectorAll(".antwortknopf").forEach((k) => { k.disabled = true; });
        bewerte(knopf.dataset.wert === "ja");
      });
    };

    // Reflexionsfrage (nur Persönliches, bleibt Textform): erst laut oder
    // im Kopf antworten, dann die Hinweise aufdecken und selbst einschätzen.
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
        block.querySelector(".antworten").addEventListener("click", (e) => {
          const knopf = e.target.closest(".antwortknopf");
          if (!knopf || beendet) return;
          block.querySelectorAll(".antwortknopf").forEach((k) => { k.disabled = true; });
          bewerte(knopf.dataset.wert === "ja");
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
      if (frage.form === "reflexion") reflexionsfrage(frage);
      else kartenfrage(frage);
    };

    // Ergebnistafel für beide Wege: vollendeter Lauf (gewertet) und Abbruch
    // (ohne Wertung). Die Tür fährt zu, wird verwischt, die Tafel legt sich
    // davor; der Rücksprung räumt die Tafel weg und öffnet die Tür wieder.
    let ergebnisOffen = false;
    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const quote = kennzahl(richtig, gestellt);
      const bereichsname = BEREICHE.find((b) => b.id === bereich)?.name ?? bereich;
      const trefferzeile = bereich === "persoenlich"
        ? `${richtig} von ${gestellt} Antworten saßen nach eigener Einschätzung`
        : `${richtig} von ${gestellt} Karten gewusst`;
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
