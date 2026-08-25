// Ablauf Mission 3 (60s Instrumentenflug) im Vollbild: Nachbau des ICT aus
// dem ICA 90 II. Je Durchgang laufen 60 Sekunden, in denen Kurs, Höhe und
// Fahrt gleichmäßig zum Zielwert geführt werden sollen; Durchgänge folgen
// am Stück mit kurzer Zwischenanzeige der Punkte, bis die Testdauer um
// ist. Die Logik rechnet in uebung3.js, Uhr und Fehlersäule zeichnet
// uebung3-bild.js, Kurs, Fahrt und Höhe kommen aus instrumente.js. Die
// Bühne ist dieselbe Cockpitbühne wie Mission 4/5, aber ohne die
// panelflaeche-Instrumente: im Panelbereich liegt stattdessen die eigene
// ICT-Tafel.
import {
  TESTDAUERN, STUFEN, FLUGZEIT_S, EINRICHTZEIT_S, RECHENTAKT_S,
  erzeugeVorgaben, erzeugeFlugzustand, takt, sollwert, winkelabstand,
  momentanfehler, durchgangspunkte, kennzahl3,
  erzeugeRechenaufgabe, antworten5, pedalwahl,
} from "./uebung3.js";
import { svgUhr, svgSaeule } from "./uebung3-bild.js";
import { svgKurs, svgFahrt, svgHoehe } from "./instrumente.js";

const ZWISCHENANZEIGE_MS = 2500;
const AUFGABENECHO_MS = 600;

// Ansage der Rechenaufgaben (Stufe 4): ElevenLabs-Aufnahmen aus der
// Bundeswehr-Lern-App, Kopie unter klaenge/zahlen (siehe dort HERKUNFT.md).
// Zahl, Rechenzeichen, Zahl spielen nacheinander über das ended-Ereignis;
// alle Klänge werden beim Anlegen des Sprechers vorgeladen, damit im Lauf
// nichts nachlädt. Fehlt ein Klang, liest ersatzweise die
// Browser-Sprachausgabe die betroffene Stelle.
const OPERATOREN = [
  { zeichen: "+", datei: "op_plus", wort: "plus" },
  { zeichen: "-", datei: "op_minus", wort: "minus" },
  { zeichen: "*", datei: "op_mal", wort: "mal" },
];
const OP_DATEI = Object.fromEntries(OPERATOREN.map((o) => [o.zeichen, o.datei]));
const WORT_VON_DATEI = Object.fromEntries(OPERATOREN.map((o) => [o.datei, o.wort]));
const klangVon = (name) => new URL(`../klaenge/zahlen/${name}.mp3`, import.meta.url).href;

function erzeugeAufgabenSprecher() {
  const vorrat = new Map();
  for (let n = 0; n <= 99; n++) {
    const klang = new Audio(klangVon(`n${n}`));
    klang.preload = "auto";
    vorrat.set(`n${n}`, klang);
  }
  for (const { datei } of OPERATOREN) {
    const klang = new Audio(klangVon(datei));
    klang.preload = "auto";
    vorrat.set(datei, klang);
  }
  return {
    sprich(aufgabe) {
      const folge = [`n${aufgabe.a}`, OP_DATEI[aufgabe.op], `n${aufgabe.b}`];
      const spieleAb = (i) => {
        if (i >= folge.length) return;
        const name = folge[i];
        const klang = vorrat.get(name);
        if (!klang) { spieleAb(i + 1); return; }
        klang.currentTime = 0;
        klang.onended = () => spieleAb(i + 1);
        klang.play().catch(() => {
          const wort = name.startsWith("n") ? name.slice(1) : WORT_VON_DATEI[name];
          const laut = new SpeechSynthesisUtterance(wort);
          laut.lang = "de-DE";
          speechSynthesis.speak(laut);
          spieleAb(i + 1);
        });
      };
      spieleAb(0);
    },
    stopp() {
      for (const klang of vorrat.values()) { klang.pause(); klang.onended = null; }
      speechSynthesis?.cancel?.();
    },
  };
}

export function erzeugeUebung3({ speicher, controls }) {
  let einstellung = { stufe: 1, testdauer: 5, fehlersaeule: true };
  const hinweis = "Nachbau des Instrumententests der Eignungsfeststellung (ICT): Führe Kurs, Höhe "
    + "und Fahrt in 60 Sekunden gleichmäßig vom Start- zum Zielwert, wie es das Schild über jedem "
    + "Instrument vorgibt. Stick quer steuert den Kurs, Stick längs die Höhe (Ziehen steigt), der "
    + "Schub die Fahrt. Durchgänge folgen am Stück, bis die Testdauer um ist. Ab Stufe 4 kommen "
    + "angesagte Rechenaufgaben dazu: mit den Pedalen den passenden der fünf Knöpfe wählen, die "
    + "Schusstaste bestätigt.";

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung3-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">STUFE</span>
        <select class="wahlliste" data-name="stufe">${STUFEN.map((w) =>
          `<option value="${w}" ${w === einstellung.stufe ? "selected" : ""}>${w}</option>`).join("")}</select></div>
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="testdauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.testdauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>
      <div class="wahlzeile"><span class="wahltitel">FEHLERSÄULE</span>
        <button type="button" class="wahlknopf ${einstellung.fehlersaeule ? "an" : ""}" data-element="fehlersaeule"
          aria-pressed="${einstellung.fehlersaeule}">${einstellung.fehlersaeule ? "EIN" : "AUS"}</button></div>`;
    feld.onclick = (e) => {
      const knopf = e.target.closest(".wahlknopf");
      if (!knopf) return;
      einstellung.fehlersaeule = !einstellung.fehlersaeule;
      knopf.classList.toggle("an", einstellung.fehlersaeule);
      knopf.setAttribute("aria-pressed", String(einstellung.fehlersaeule));
      knopf.textContent = einstellung.fehlersaeule ? "EIN" : "AUS";
      speicher.setzeEinstellung("uebung3-einstellung", einstellung);
    };
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung3-einstellung", einstellung);
    };
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const { stufe, testdauer, fehlersaeule } = einstellung;
    const stufe4 = stufe >= 4;
    // Der Aufrufer hat die Hangartür bereits geschlossen: der Testbildschirm
    // baut sich verdeckt auf, die Tür öffnet in die laufende Mission.
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung3";
    schleier.innerHTML = `
      <div class="cockpitbuehne"></div>
      <div class="ict-tafel"></div>
      ${stufe4 ? '<div class="ict-antworten"></div>' : ""}
      <div class="ict-zwischenanzeige"></div>
      <div class="testkopf"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const tafel = schleier.querySelector(".ict-tafel");
    const antwortenfeld = schleier.querySelector(".ict-antworten");
    const zwischenfeld = schleier.querySelector(".ict-zwischenanzeige");
    const kopf = schleier.querySelector(".testkopf");
    const sprecher = stufe4 ? erzeugeAufgabenSprecher() : null;

    let testende = Infinity;
    let restuhr = null;
    let durchgangsNummer = 0;
    let beendet = false;
    let ergebnisOffen = false;
    const punkteListe = [];
    const abwSumme = { kurs: 0, hoehe: 0, fahrt: 0 };
    const abwZaehler = { kurs: 0, hoehe: 0, fahrt: 0 };
    let rechnenRichtig = 0;
    let rechnenFalsch = 0;
    let rechnenVerpasst = 0;
    const zeitgeber = new Set();
    const spaeter = (fn, ms) => { const t = setTimeout(() => { zeitgeber.delete(t); fn(); }, ms); zeitgeber.add(t); return t; };

    const raeumeAuf = () => {
      beendet = true;
      clearInterval(restuhr);
      for (const t of zeitgeber) clearTimeout(t);
      sprecher?.stopp();
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

    const zeichneKopf = () => {
      const rest = Math.max(0, testende - performance.now());
      kopf.textContent = `DURCHGANG ${durchgangsNummer} · REST ${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
    };

    // Baut die Zellen der ICT-Tafel für einen frischen Durchgang: Uhr und
    // Kurs oben, Fahrt und Höhe unten, die Fehlersäule mittig dazwischen
    // (Abbildung 3-9). Ein Zielschild steht nur über Uhr und den laut
    // Stufe aktiven Instrumenten, die übrigen bleiben ohne Schild und
    // zeigen später ihren eingefrorenen Startwert.
    const schildKurs = (v) => `${v.kurs.aenderung > 0 ? "+" : ""}${v.kurs.aenderung} Grad`;
    const schildHoehe = (v) => `${v.hoehe.aenderung > 0 ? "+" : ""}${v.hoehe.aenderung} Fuß`;
    const schildFahrt = (v) => `${v.fahrt.start} bis ${v.fahrt.ziel} Knoten`;
    const baueTafel = (vorgaben) => {
      const aktiv = (id) => vorgaben.aktive.includes(id);
      const zelle = (id, klasse, schild) => `
        <div class="ict-zelle ${klasse}">
          <div class="ict-schild">${schild}</div>
          <div class="ict-instrument" data-id="${id}"></div>
        </div>`;
      tafel.innerHTML =
        zelle("zeit", "ict-zelle-zeit", `${FLUGZEIT_S} Sekunden`)
        + `<div class="ict-saeule-feld" data-id="saeule" ${fehlersaeule ? "" : "hidden"}></div>`
        + zelle("kurs", "ict-zelle-kurs", aktiv("kurs") ? schildKurs(vorgaben) : "")
        + zelle("fahrt", "ict-zelle-fahrt", aktiv("fahrt") ? schildFahrt(vorgaben) : "")
        + zelle("hoehe", "ict-zelle-hoehe", aktiv("hoehe") ? schildHoehe(vorgaben) : "");
      return {
        zeit: tafel.querySelector('[data-id="zeit"]'),
        kurs: tafel.querySelector('[data-id="kurs"]'),
        fahrt: tafel.querySelector('[data-id="fahrt"]'),
        hoehe: tafel.querySelector('[data-id="hoehe"]'),
        saeule: tafel.querySelector('[data-id="saeule"]'),
      };
    };

    // ---------- Stufe 4: Rechenaufgaben ----------
    // Alle RECHENTAKT_S Sekunden eine neue, nur angesagte Aufgabe; die
    // Pedale wählen über pedalwahl eine der fünf Zonen, die Schusstaste
    // bestätigt. Ohne Bestätigung bis zur nächsten Aufgabe zählt sie als
    // verpasst. Die Zeitpunkte liegen fest bei RECHENTAKT_S-Vielfachen
    // (12/24/36/48/60), FLUGZEIT_S ist durch RECHENTAKT_S teilbar, darum
    // trifft die letzte Aufgabe genau das Durchgangsende.
    let aktuelleAufgabe = null;
    let aktuelleAntworten = [];
    let aufgabeBeantwortet = false;
    let naechsteAufgabeS = RECHENTAKT_S;

    const zeichneAntworten = (gewaehlt = -1, echo = null) => {
      if (!antwortenfeld) return;
      if (!aktuelleAufgabe) { antwortenfeld.innerHTML = ""; return; }
      antwortenfeld.innerHTML = aktuelleAntworten.map((wert, i) => {
        const klassen = ["antwortknopf"];
        if (i === gewaehlt) klassen.push("gewaehlt");
        if (echo && echo.zone === i) klassen.push(echo.treffer ? "richtig" : "falsch");
        return `<button class="${klassen.join(" ")}" disabled>${wert}</button>`;
      }).join("");
    };

    const starteAufgabe = () => {
      aktuelleAufgabe = erzeugeRechenaufgabe(Math.random);
      aktuelleAntworten = antworten5(aktuelleAufgabe, Math.random);
      aufgabeBeantwortet = false;
      naechsteAufgabeS += RECHENTAKT_S;
      sprecher.sprich(aktuelleAufgabe);
      zeichneAntworten();
    };

    const bestaetigeAufgabe = (zone) => {
      aufgabeBeantwortet = true;
      const treffer = aktuelleAntworten[zone] === aktuelleAufgabe.antwort;
      if (treffer) rechnenRichtig += 1; else rechnenFalsch += 1;
      zeichneAntworten(-1, { zone, treffer });
      spaeter(() => zeichneAntworten(), AUFGABENECHO_MS);
    };

    const taktRechnen = (tS) => {
      if (aktuelleAufgabe === null) {
        if (tS >= naechsteAufgabeS) starteAufgabe();
        return;
      }
      if (tS >= naechsteAufgabeS) {
        if (!aufgabeBeantwortet) rechnenVerpasst += 1;
        if (tS < FLUGZEIT_S) starteAufgabe(); else aktuelleAufgabe = null;
        return;
      }
      if (aufgabeBeantwortet) return;
      const zone = pedalwahl(controls.wert("ruder"));
      zeichneAntworten(zone);
      if (controls.schussGedrueckt()) bestaetigeAufgabe(zone);
    };

    // ---------- Flugtakt ----------
    let vorgaben = null;
    let zustand = null;
    let knoten = null;
    let mfSumme = 0;
    let mfZaehler = 0;
    let durchgangStart = 0;
    let vorher = 0;

    const haeufeAbweichungen = (tS) => {
      if (vorgaben.aktive.includes("kurs")) {
        abwSumme.kurs += winkelabstand(zustand.kurs, sollwert(vorgaben, "kurs", tS));
        abwZaehler.kurs += 1;
      }
      if (vorgaben.aktive.includes("hoehe")) {
        abwSumme.hoehe += Math.abs(zustand.hoehe - sollwert(vorgaben, "hoehe", tS));
        abwZaehler.hoehe += 1;
      }
      if (vorgaben.aktive.includes("fahrt") && tS >= EINRICHTZEIT_S) {
        abwSumme.fahrt += Math.abs(zustand.fahrt - sollwert(vorgaben, "fahrt", tS));
        abwZaehler.fahrt += 1;
      }
    };

    // Nicht aktive Instrumente zeigen dauerhaft ihren Startwert, auch wenn
    // die Achse physisch weiterläuft (der Stick bewegt kurs/hoehe/fahrt
    // unabhängig von der Stufe, gewertet und angezeigt wird nur, was laut
    // Vorgabe aktiv ist).
    const zeichneInstrumente = (tS, mfProzent) => {
      knoten.zeit.innerHTML = svgUhr(Math.max(0, FLUGZEIT_S - tS));
      knoten.kurs.innerHTML = svgKurs(vorgaben.aktive.includes("kurs") ? zustand.kurs : vorgaben.kurs.start);
      knoten.hoehe.innerHTML = svgHoehe(vorgaben.aktive.includes("hoehe") ? zustand.hoehe : vorgaben.hoehe.start);
      knoten.fahrt.innerHTML = svgFahrt(vorgaben.aktive.includes("fahrt") ? zustand.fahrt : vorgaben.fahrt.start);
      if (fehlersaeule) knoten.saeule.innerHTML = svgSaeule(mfProzent);
    };

    const schleife = (jetzt) => {
      if (beendet || ergebnisOffen) return;
      const dtMs = jetzt - vorher || 16;
      vorher = jetzt;
      const tS = Math.min((jetzt - durchgangStart) / 1000, FLUGZEIT_S);
      const achsen = {
        stickX: controls.wert("stickX"),
        stickY: controls.wert("stickY"),
        schub: controls.wert("schub"),
      };
      takt(zustand, achsen, dtMs);
      const mf = momentanfehler(zustand, vorgaben, tS);
      mfSumme += mf;
      mfZaehler += 1;
      haeufeAbweichungen(tS);
      if (stufe4) taktRechnen(tS);
      zeichneInstrumente(tS, mf * 100);
      if (tS >= FLUGZEIT_S) { beendeDurchgang(); return; }
      requestAnimationFrame(schleife);
    };

    const startDurchgang = () => {
      if (beendet || ergebnisOffen) return;
      durchgangsNummer += 1;
      vorgaben = erzeugeVorgaben(stufe, Math.random);
      zustand = erzeugeFlugzustand(vorgaben);
      knoten = baueTafel(vorgaben);
      mfSumme = 0;
      mfZaehler = 0;
      aktuelleAufgabe = null;
      aufgabeBeantwortet = false;
      naechsteAufgabeS = RECHENTAKT_S;
      if (antwortenfeld) antwortenfeld.innerHTML = "";
      durchgangStart = performance.now();
      vorher = durchgangStart;
      requestAnimationFrame(schleife);
    };

    // Nach jedem Durchgang eine kurze Zwischenanzeige der Durchgangspunkte,
    // danach der nächste Durchgang oder, wenn die Testdauer um ist, die
    // Ergebnistafel.
    const beendeDurchgang = () => {
      const punkte = durchgangspunkte(mfSumme, mfZaehler);
      punkteListe.push(punkte);
      zwischenfeld.textContent = `DURCHGANG ${durchgangsNummer} · ${punkte} PUNKTE`;
      zwischenfeld.classList.add("da");
      spaeter(() => {
        zwischenfeld.classList.remove("da");
        if (beendet || ergebnisOffen) return;
        if (performance.now() >= testende) zeigeErgebnis(true);
        else startDurchgang();
      }, ZWISCHENANZEIGE_MS);
    };

    // Ergebnistafel für beide Wege: vollendeter Lauf (gewertet) und Abbruch
    // (ohne Wertung). Die Tür fährt zu, wird verwischt, die Tafel legt sich
    // davor; der Rücksprung räumt die Tafel weg und öffnet die Tür wieder.
    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      clearInterval(restuhr);
      for (const t of zeitgeber) clearTimeout(t);
      sprecher?.stopp();
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const wert = kennzahl3(punkteListe);
      const mittel = (id, einheit) => abwZaehler[id]
        ? `${(abwSumme[id] / abwZaehler[id]).toFixed(1)} ${einheit}`
        : "–";
      const rechenzeile = stufe4
        ? `<span>Rechenaufgaben: ${rechnenRichtig} richtig · ${rechnenFalsch} falsch · ${rechnenVerpasst} verpasst</span>`
        : "";
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafelErgebnis = document.createElement("div");
      tafelErgebnis.className = "ergebnisschicht";
      tafelErgebnis.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${wert} Punkte</div>
        <div class="ergebniszeilen">
          <span class="trefferzeile">${punkteListe.length} ${punkteListe.length === 1 ? "Durchgang" : "Durchgänge"}</span>
          <span>Mittlere Abweichung Kurs: ${mittel("kurs", "Grad")}</span>
          <span>Mittlere Abweichung Höhe: ${mittel("hoehe", "Fuß")}</span>
          <span>Mittlere Abweichung Fahrt: ${mittel("fahrt", "Knoten")}</span>
          ${rechenzeile}
        </div>
        <button class="punkt" id="u3-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>Stufe ${stufe} · ${testdauer} min Testdauer${fehlersaeule ? "" : " · Fehlersäule aus"}</span>
          ${abbruchzeile}
        </div>`;
      document.body.append(tafelErgebnis);
      requestAnimationFrame(() => tafelErgebnis.classList.add("da"));

      let geschlossen = false;
      const schliesse = async () => {
        if (geschlossen) return;
        geschlossen = true;
        tafelErgebnis.classList.remove("da");
        setTimeout(() => tafelErgebnis.remove(), 260);
        tuer.verwische(false);
        raeumeAuf();
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        await beiEnde(gewertet ? {
          kennzahl: wert,
          daten: {
            art: "instrumentenflug",
            stufe,
            testdauerMin: testdauer,
            fehlersaeule,
            durchgaenge: punkteListe.length,
            punkteListe,
            abweichungKurs: abwZaehler.kurs ? Number((abwSumme.kurs / abwZaehler.kurs).toFixed(2)) : null,
            abweichungHoehe: abwZaehler.hoehe ? Number((abwSumme.hoehe / abwZaehler.hoehe).toFixed(2)) : null,
            abweichungFahrt: abwZaehler.fahrt ? Number((abwSumme.fahrt / abwZaehler.fahrt).toFixed(2)) : null,
            ...(stufe4 ? { rechnenRichtig, rechnenFalsch, rechnenVerpasst } : {}),
          },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafelErgebnis.querySelector("#u3-fertig").addEventListener("click", schliesse);
    };

    // Die Tür öffnet in die fertig aufgebaute Mission, erst dann läuft die Zeit.
    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      testende = performance.now() + testdauer * 60_000;
      restuhr = setInterval(zeichneKopf, 250);
      startDurchgang();
    })();
  }

  return { hinweis, ladeEinstellung, zeichneFeld, starte };
}
