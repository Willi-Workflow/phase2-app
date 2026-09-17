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
  punkteFuerAntwort, kennzahl, panelwerte, verdeckteInstrumente,
  waehlePrinzipien, erzeugeAufgabe, loesungsweg, TIPPS5,
  STUFEN5, STUFENNAMEN, STUFE_STANDARD, DREISATZ_PRINZIPIEN, dreisatzSchritte,
} from "./uebung5.js";
import { tafelHtml } from "./instrumente.js";
import { KARTEN5 } from "./wissen5.js";

// Rückmeldung: nach richtigen Antworten geht es zügig weiter, nach falschen
// bleibt Zeit, den wahren Wert zu lesen. Ein Klick überspringt die Wartezeit.
const RUECKMELDEDAUER_RICHTIG = 700;
const RUECKMELDEDAUER_FALSCH = 1800;

export function erzeugeUebung5({ speicher }) {
  // Je Bereich eine eigene Schwierigkeitsstufe (Willis Auftrag vom
  // 17.09.2026): stufe gilt im gewerteten Test, schnellstufe im
  // Schnellrechnen, dreisatzstufe in der Dreisatz-Übung. Alle drei hängen wie
  // die Testdauer am Profil.
  let einstellung = {
    dauer: 5,
    stufe: STUFE_STANDARD,
    schnellstufe: STUFE_STANDARD,
    dreisatzstufe: STUFE_STANDARD,
  };
  let uebungsStart = null; // "schnell" oder "dreisatz", sonst gewerteter Lauf
  const hinweis = "Rechenaufgaben zu Weg, Zeit, Geschwindigkeit und Sink- oder Steigrate am Stück, "
    + "bis die eingestellte Testdauer um ist, je Aufgabe 20 Sekunden, im Cockpit. Manche Aufgaben "
    + "nennen keinen Wert, sondern verweisen aufs Ablesen am Instrumentenpanel: Steht im Text nur "
    + "eine Zielhöhe, gehört die Ausgangshöhe vom Höhenmesser abgelesen und zuerst abgezogen. "
    + "Geantwortet wird per Auswahl oder Zahleneingabe. Die Wertung in Prozent belohnt richtige und "
    + "schnelle Antworten, die Formeln stehen auf den Karteikarten darunter. Zum Üben gibt es zwei "
    + "Wege: Schnellrechnen fragt Aufgaben ab, die eine Formel oder ein Stundenbruch in einem Schritt "
    + "löst, Dreisatz fragt die beiden Schritte einzeln ab. Beide zählen nie zur Statistik.";

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung5-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
    // Beide Übungen bekommen wie die Blitzübung von Mission 4 einen
    // abgesetzten Block: reine Übung, kein Teil des Tests. Die Stufe steht
    // dreimal, jeweils im eigenen Block, damit klar ist, worauf sie wirkt.
    const stufenliste = (name, aktiv) => `<select class="wahlliste" data-name="${name}">${STUFEN5.map((w) =>
      `<option value="${w}" ${w === aktiv ? "selected" : ""}>${w} ${STUFENNAMEN[w]}</option>`).join("")}</select>`;
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="dauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.dauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>
      <div class="wahlzeile"><span class="wahltitel">STUFE</span>${stufenliste("stufe", einstellung.stufe)}</div>
      <div class="wahlabschnitt">SCHNELLRECHNEN</div>
      <div class="wahlzeile"><span class="wahltitel">STUFE</span>${stufenliste("schnellstufe", einstellung.schnellstufe)}</div>
      <div class="wahlzeile"><span class="wahltitel">START</span>
        <button type="button" class="wahlknopf" data-element="schnell">NUR ÜBEN</button></div>
      <div class="wahlabschnitt">DREISATZ</div>
      <div class="wahlzeile"><span class="wahltitel">STUFE</span>${stufenliste("dreisatzstufe", einstellung.dreisatzstufe)}</div>
      <div class="wahlzeile"><span class="wahltitel">START</span>
        <button type="button" class="wahlknopf" data-element="dreisatz">NUR ÜBEN</button></div>`;
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung5-einstellung", einstellung);
    };
    feld.onclick = (e) => {
      const knopf = e.target.closest(".wahlknopf");
      if (!knopf) return;
      const art = knopf.dataset.element;
      if (art !== "schnell" && art !== "dreisatz") return;
      // Übung über den normalen Startweg, damit Tür, Vollbild und Abbruch
      // wie bei jedem Lauf funktionieren (Muster aus Mission 1 und 4).
      knopf.blur();
      uebungsStart = art;
      document.getElementById("start")?.click();
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

  // Schnellrechnen-Übung (Willis Auftrag vom 07.09.2026): Textaufgaben ohne
  // Zeitdruck, endlos bis Esc; nach jeder Antwort steht der schnellste im
  // Kopf rechenbare Weg mit den Zahlen der Aufgabe im Bild, dazu der
  // Merktipp des Aufgabentyps. Nur Textaufgaben (das Ablesen am Panel ist
  // Sache des Tests), zählt nie zur Statistik (beiEnde(null)).
  // Seit 17.09.2026 zieht sie bei Weg, Zeit und Geschwindigkeit nur aus dem
  // Formel-Bestand: Aufgaben, deren Zeit ein glatter Stundenbruch ist, sodass
  // eine Formel oder der Stundenbruch sie in einem Schritt löst (Willis
  // Auftrag: "die erste Uebung soll Aufgaben abfragen, die sich mit den
  // Formeln gut loesen lassen"). Die Ratenaufgaben kennen keinen
  // Stundenbruch, sie stehen ohnehin schon in Minuten; sie bleiben trotzdem
  // dabei, weil der Nullen-Trick sie ebenfalls in einem Schritt löst. Der
  // Dreisatz Schritt für Schritt steht in der zweiten Übung.
  function starteSchnellrechnen({ tuer, beiEnde, registriereAbbruch }) {
    const stufe = einstellung.schnellstufe;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier buchstaben";
    schleier.innerHTML = `<div class="testkopf">SCHNELLRECHNEN · STUFE ${stufe} ${STUFENNAMEN[stufe]} · ESC BEENDET</div>
      <div class="schnellmitte"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    const mitte = schleier.querySelector(".schnellmitte");
    let beendet = false;
    let ergebnisOffen = false;
    let vorrat = [];
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
    let verlasse = () => zeigeErgebnis();
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const stelle = () => {
      if (beendet || ergebnisOffen) return;
      // Jedes Prinzip kommt reihum vor, wie im Test, aber nur als Text.
      if (vorrat.length === 0) vorrat = waehlePrinzipien(4);
      const aufgabe = erzeugeAufgabe(vorrat.shift(), Math.random, false, { stufe, methode: "formel" });
      mitte.innerHTML = `
        <div class="frage">${aufgabe.frage}</div>
        <form class="eingabezeile" id="u5s-form">
          <input class="zahlenfeld" id="u5s-eingabe" inputmode="decimal" autocomplete="off" placeholder="Antwort">
          <span class="einheit">${aufgabe.einheit}</span>
        </form>
        <div class="rueckmeldung"></div>
        <div class="loesungsweg" hidden></div>`;
      const eingabe = mitte.querySelector("#u5s-eingabe");
      eingabe.focus();
      let entschieden = false;
      mitte.querySelector("#u5s-form").addEventListener("submit", (e) => {
        e.preventDefault();
        if (beendet || ergebnisOffen) return;
        if (entschieden) { stelle(); return; } // zweites Enter geht weiter
        entschieden = true;
        gestellt += 1;
        const getroffen = pruefeEingabe(eingabe.value, aufgabe.antwort);
        if (getroffen) richtig += 1;
        // readonly statt disabled: der Fokus bleibt, Enter führt weiter.
        eingabe.readOnly = true;
        eingabe.classList.add(getroffen ? "richtig" : "falsch");
        const rueck = mitte.querySelector(".rueckmeldung");
        rueck.textContent = getroffen ? "RICHTIG" : `FALSCH · richtig: ${aufgabe.antwort} ${aufgabe.einheit}`;
        rueck.classList.add(getroffen ? "gut" : "schlecht");
        const weg = mitte.querySelector(".loesungsweg");
        weg.innerHTML = `<div class="wegkopf">SCHNELLSTER WEG</div>`
          + loesungsweg(aufgabe).map((z) => `<div class="wegzeile">${z}</div>`).join("")
          + `<div class="wegtipp">TIPP · ${TIPPS5[aufgabe.tipp ?? aufgabe.prinzip]}</div>`
          + `<div class="wegweiter">WEITER MIT ENTER</div>`;
        weg.hidden = false;
        // Auf niedrigen Fenstern rollt die Mitte (Deckel in stil.css). Dann
        // ans Ende springen, sonst stünde der eben erschienene Weg unter dem
        // Rand. Passt alles ins Bild, tut die Zeile nichts.
        mitte.scrollTop = mitte.scrollHeight;
      });
    };

    const zeigeErgebnis = async () => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      await tuer.schliesse();
      tuer.verwische(true);
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">ÜBUNG BEENDET</div>
        <div class="ergebnisgross">${richtig} / ${gestellt}</div>
        <div class="ergebniszeilen"><span>Richtig: ${richtig}</span><span>Beantwortet: ${gestellt}</span></div>
        <button class="punkt" id="u5s-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss"><span>Schnellrechnen · Stufe ${stufe} ${STUFENNAMEN[stufe]} · Die Übung zählt nicht zur Statistik</span></div>`;
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
        await beiEnde(null); // die Übung zählt nie
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u5s-fertig").addEventListener("click", schliesse);
    };

    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      stelle();
    })();
  }

  // Dreisatz-Übung (Willis Auftrag vom 17.09.2026), gebaut nach dem Muster
  // des Schnellrechnens: Vollbild, Hangartür, Esc beendet, Enter bestätigt,
  // Ergebnistafel am Ende, zählt nie zur Statistik. Der Unterschied ist die
  // Absicht: Sie fragt die zwei Schritte des Dreisatzes einzeln ab, nicht nur
  // das Endergebnis. Erst auf eine Minute herunterrechnen, dann auf die
  // gesuchte Menge hoch. Wer Schritt 1 falsch hat, bekommt den richtigen
  // Zwischenwert gezeigt und liest ihn im Fragetext von Schritt 2 noch
  // einmal, damit sich der Fehler nicht weiterschleppt.
  function starteDreisatz({ tuer, beiEnde, registriereAbbruch }) {
    const stufe = einstellung.dreisatzstufe;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier buchstaben";
    schleier.innerHTML = `<div class="testkopf">DREISATZ · STUFE ${stufe} ${STUFENNAMEN[stufe]} · ESC BEENDET</div>
      <div class="schnellmitte"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    const mitte = schleier.querySelector(".schnellmitte");
    let beendet = false;
    let ergebnisOffen = false;
    let vorrat = [];
    // Zwei Zähler, weil Esc zwischen den Schritten liegen kann: gestellt zählt
    // die beantworteten ersten Schritte, gestelltZwei die zweiten. Ohne die
    // Trennung behauptete die Tafel, ein zweiter Schritt sei gestellt worden,
    // den der Abbruch gar nicht mehr gezeigt hat.
    let gestellt = 0;
    let gestelltZwei = 0;
    let richtigEins = 0;
    let richtigZwei = 0;

    const raeumeAuf = () => {
      beendet = true;
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      schleier.remove();
    };
    const beiVollbildwechsel = () => { if (!document.fullscreenElement) verlasse?.(); };
    const beiSichtwechsel = () => { if (document.hidden) verlasse?.(); };
    let verlasse = () => zeigeErgebnis();
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    // Nur Weg, Zeit und Geschwindigkeit: Bei den Raten wäre der erste Schritt
    // schon die Antwort, da gäbe es nichts in zwei Schritten zu fragen.
    const ziehe = () => {
      if (vorrat.length === 0) vorrat = waehlePrinzipien(3, Math.random, DREISATZ_PRINZIPIEN);
      const aufgabe = erzeugeAufgabe(vorrat.shift(), Math.random, false, { stufe, methode: "dreisatz" });
      return { aufgabe, schritte: dreisatzSchritte(aufgabe) };
    };

    const stelle = () => {
      if (beendet || ergebnisOffen) return;
      // Der Dreisatz-Bestand liefert immer einen glatten Zwischenwert. Sollte
      // doch einmal keiner dabei sein, wird neu gezogen statt eine unlösbare
      // Aufgabe zu stellen.
      let gezogen = ziehe();
      for (let versuch = 0; !gezogen.schritte && versuch < 10; versuch++) gezogen = ziehe();
      const { aufgabe, schritte } = gezogen;
      if (!schritte) return;
      const zahl = (n) => String(n).replace(".", ",");
      mitte.innerHTML = `
        <div class="frage">${aufgabe.frage}</div>
        <div class="schrittblock">
          <div class="schrittkopf">SCHRITT 1 · HERUNTER AUF EINE MINUTE</div>
          <div class="schrittfrage">${schritte.schritt1.frage}</div>
          <form class="eingabezeile" id="u5d-form1">
            <input class="zahlenfeld" id="u5d-eingabe1" inputmode="decimal" autocomplete="off" placeholder="Antwort">
            <span class="einheit">${schritte.schritt1.einheit}</span>
          </form>
          <div class="rueckmeldung"></div>
        </div>
        <div class="schrittblock" id="u5d-block2" hidden>
          <div class="schrittkopf">SCHRITT 2 · HOCH AUF DIE GESUCHTE MENGE</div>
          <div class="schrittfrage">${schritte.schritt2.frage}</div>
          <form class="eingabezeile" id="u5d-form2">
            <input class="zahlenfeld" id="u5d-eingabe2" inputmode="decimal" autocomplete="off" placeholder="Antwort">
            <span class="einheit">${schritte.schritt2.einheit}</span>
          </form>
          <div class="rueckmeldung"></div>
        </div>
        <div class="loesungsweg" hidden></div>`;
      const eingabeEins = mitte.querySelector("#u5d-eingabe1");
      const eingabeZwei = mitte.querySelector("#u5d-eingabe2");
      const block2 = mitte.querySelector("#u5d-block2");
      const [rueckEins, rueckZwei] = mitte.querySelectorAll(".schrittblock .rueckmeldung");
      eingabeEins.focus();
      let eins = false;
      let zwei = false;

      mitte.querySelector("#u5d-form1").addEventListener("submit", (e) => {
        e.preventDefault();
        if (beendet || ergebnisOffen) return;
        // Wer nach der Antwort ins erste Feld zurückspringt, wird von Enter
        // wieder nach vorn gebracht: erst zu Schritt 2, danach zur nächsten
        // Aufgabe.
        if (eins) {
          if (zwei) stelle();
          else eingabeZwei.focus();
          return;
        }
        eins = true;
        gestellt += 1;
        const getroffen = pruefeEingabe(eingabeEins.value, schritte.schritt1.antwort);
        if (getroffen) richtigEins += 1;
        // readonly statt disabled: der Fokus bleibt, Enter führt weiter.
        eingabeEins.readOnly = true;
        eingabeEins.classList.add(getroffen ? "richtig" : "falsch");
        rueckEins.textContent = getroffen
          ? "RICHTIG"
          : `FALSCH · richtig: ${zahl(schritte.schritt1.antwort)} ${schritte.schritt1.einheit}`;
        rueckEins.classList.add(getroffen ? "gut" : "schlecht");
        block2.hidden = false;
        eingabeZwei.focus();
      });

      mitte.querySelector("#u5d-form2").addEventListener("submit", (e) => {
        e.preventDefault();
        if (beendet || ergebnisOffen) return;
        if (zwei) { stelle(); return; } // zweites Enter geht weiter
        zwei = true;
        gestelltZwei += 1;
        const getroffen = pruefeEingabe(eingabeZwei.value, schritte.schritt2.antwort);
        if (getroffen) richtigZwei += 1;
        eingabeZwei.readOnly = true;
        eingabeZwei.classList.add(getroffen ? "richtig" : "falsch");
        rueckZwei.textContent = getroffen
          ? "RICHTIG"
          : `FALSCH · richtig: ${zahl(schritte.schritt2.antwort)} ${schritte.schritt2.einheit}`;
        rueckZwei.classList.add(getroffen ? "gut" : "schlecht");
        // Danach der vollständige Weg wie beim Schnellrechnen, aber mit dem
        // eigenen Dreisatz-Tipp: Der Tipp des Prinzips rät zum Stundenbruch,
        // den es in dieser Übung nie gibt (Prüferbefund vom 17.09.2026).
        const weg = mitte.querySelector(".loesungsweg");
        weg.innerHTML = `<div class="wegkopf">SCHNELLSTER WEG</div>`
          + loesungsweg(aufgabe).map((z) => `<div class="wegzeile">${z}</div>`).join("")
          + `<div class="wegtipp">TIPP · ${TIPPS5.dreisatz}</div>`
          + `<div class="wegweiter">WEITER MIT ENTER</div>`;
        weg.hidden = false;
        // Wie beim Schnellrechnen: rollt die Mitte, ans Ende springen.
        mitte.scrollTop = mitte.scrollHeight;
      });
    };

    const zeigeErgebnis = async () => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      await tuer.schliesse();
      tuer.verwische(true);
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      // Die Tafel nennt beide Schritte getrennt: Wer den Zwischenwert
      // sicher hat und trotzdem am Endwert scheitert, sieht das hier sofort.
      tafel.innerHTML = `
        <div class="frage">ÜBUNG BEENDET</div>
        <div class="ergebnisgross">${richtigZwei} / ${gestelltZwei}</div>
        <div class="ergebniszeilen">
          <span>Schritt 1, eine Minute: ${richtigEins} von ${gestellt}</span>
          <span>Schritt 2, gesuchte Menge: ${richtigZwei} von ${gestelltZwei}</span>
        </div>
        <button class="punkt" id="u5d-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss"><span>Dreisatz · Stufe ${stufe} ${STUFENNAMEN[stufe]} · Die Übung zählt nicht zur Statistik</span></div>`;
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
        await beiEnde(null); // die Übung zählt nie
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u5d-fertig").addEventListener("click", schliesse);
    };

    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      stelle();
    })();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    // Den Übungsmerker immer verbrauchen: bleibt er versehentlich scharf,
    // darf er keinen späteren Testlauf umleiten (Muster aus Mission 3).
    const nurUebung = uebungsStart;
    uebungsStart = null;
    if (nurUebung === "schnell") {
      starteSchnellrechnen({ tuer, beiEnde, registriereAbbruch });
      return;
    }
    if (nurUebung === "dreisatz") {
      starteDreisatz({ tuer, beiEnde, registriereAbbruch });
      return;
    }
    const { dauer, stufe } = einstellung;
    let vorrat = [];
    const naechsteAufgabe = () => {
      // Nachschub in Sechserblöcken: jedes Prinzip kommt mindestens einmal
      // vor, und die Drittel-Regel geht auf (zwei von sechs Aufgaben lesen
      // vom Instrument ab, zufällig über den Block verteilt). Viererblöcke
      // ergäben starr jede vierte Aufgabe, ein Viertel statt ein Drittel.
      // Der Bestand bleibt hier gemischt: Formel- und Dreisatzaufgaben
      // kommen beide vor, dazu die Zielhöhenaufgabe.
      if (vorrat.length === 0) vorrat = erzeugeLauf(6, Math.random, { stufe });
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
      // ergebnisOffen deckt das Fenster ab, in dem die Ergebnistafel-Tür noch
      // zufährt: Klicks gehen durch die Tür, dürfen aber keine neue Aufgabe
      // mehr stellen (Q3).
      if (beendet || ergebnisOffen) return;
      if (performance.now() >= testende) { zeigeErgebnis(true); return; }
      nummer += 1;
      const aufgabe = naechsteAufgabe();
      zeigeKopf();
      // Frische Instrumentenwerte je Aufgabe: panelwerte liefert das ganze
      // Panel widerspruchsfrei zur Aufgabe (Ablesewert am betroffenen
      // Instrument, der Rest passt zur Fluglage). Das Panel bleibt während
      // der ganzen Aufgabe stehen, unverwischt, damit sich der Wert ablesen
      // lässt.
      const werte = panelwerte(aufgabe);
      panel.innerHTML = tafelHtml(werte);
      // Verräterische Zeiger unscharf statt falsch (etwa der Fahrtmesser,
      // wenn die Geschwindigkeit die Antwort ist).
      for (const id of verdeckteInstrumente(aufgabe)) {
        panel.querySelector(`.instrument[data-id="${id}"]`)?.classList.add("verdeckt");
      }
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
        if (entschieden || beendet || ergebnisOffen) return;
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
        // Ohne Punktzahl in der Rückmeldung (Willis Vorgabe); gezählt wird
        // sie für die Kennzahl weiterhin.
        rueck.textContent = getroffen
          ? "RICHTIG"
          : `${abgelaufen ? "ZEIT ABGELAUFEN" : "FALSCH"} · richtig: ${aufgabe.antwort} ${aufgabe.einheit}`;
        rueck.classList.add(getroffen ? "gut" : "schlecht");
        let weitergegangen = false;
        const weiter = () => {
          if (weitergegangen || beendet || ergebnisOffen) return;
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
        <div class="ergebnisgross">${wert} %</div>
        <div class="ergebniszeilen">
          <span class="trefferzeile">${richtig} von ${gestellt} Aufgaben richtig (${quote} %)</span>
        </div>
        <button class="punkt" id="u5-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>Stufe ${stufe} ${STUFENNAMEN[stufe]} · ${dauer} min Testdauer · ${AUFGABENZEIT} s je Aufgabe · ${gestellt} ${gestellt === 1 ? "Aufgabe" : "Aufgaben"}</span>
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
        // Die Stufe wandert mit in die Daten, die Kennzahl bleibt unberührt
        // (Willis Wahl vom 17.09.2026: "Stufe ja, Wertung spaeter"). Ohne
        // diesen Vermerk ließe sich später nicht mehr nachsehen, welche
        // Prozentzahl auf welcher Stufe zustande kam, und damit auch nichts
        // eichen.
        await beiEnde(gewertet ? {
          kennzahl: wert,
          daten: { art: "flugphysik", dauerMin: dauer, stufe, gestellt, richtig, quote, punkte: wert },
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
