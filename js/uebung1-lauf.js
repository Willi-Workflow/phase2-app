// Ablauf Mission 1 (Flugzeugverfolgung) im Vollbild: PMT-Nachbau in echter
// 3D-Szene. Die Logik rechnet in uebung1.js, hier laufen Achsenabfrage,
// three.js-Zeichnung, Buchstabenausgabe und Tafeln.
import {
  TESTDAUERN, erzeugeLaufzustand, takt, ergebnisWerte,
  BUCHSTABEN_ABSTAND_MS, erzeugeBuchstabenreihe, erzeugeSlaZaehler,
} from "./uebung1.js";
import * as THREE from "./fremd/three.module.js";

export function erzeugeUebung1({ speicher, controls }) {
  const hinweis = "Nachbau der Flugzeugverfolgung der Eignungsfeststellung: Steuere mit Stick "
    + "und Pedalen, bis der Zielkreis auf dem vorausfliegenden Flugzeug liegt, und halte ihn "
    + "eine Sekunde dort. Nach jedem Treffer springt der Kreis an eine neue Stelle. Wahlweise "
    + "läuft die Buchstabenaufgabe: Bei der Folge S-L-A die Schusstaste drücken.";

  let einstellung = { dauer: 5, sla: false };

  async function ladeEinstellung() {
    const gespeichert = await speicher.ladeEinstellung("uebung1-einstellung", {});
    einstellung = { ...einstellung, ...gespeichert };
  }

  function zeichneFeld(feld) {
    feld.innerHTML = `
      <div class="wahlzeile"><span class="wahltitel">TESTDAUER</span>
        <select class="wahlliste" data-name="dauer">${TESTDAUERN.map((w) =>
          `<option value="${w}" ${w === einstellung.dauer ? "selected" : ""}>${w} min</option>`).join("")}</select></div>
      <div class="wahlzeile"><span class="wahltitel">BUCHSTABEN</span>
        <button type="button" class="wahlknopf ${einstellung.sla ? "an" : ""}" data-element="sla"
          aria-pressed="${einstellung.sla}">SLA-AUFGABE</button></div>
      <p class="wahlhinweis" id="u1-schusshinweis" hidden></p>`;

    const schusshinweis = feld.querySelector("#u1-schusshinweis");
    const zeigeSchussstand = () => {
      if (!einstellung.sla) { schusshinweis.hidden = true; return; }
      const s = controls.schusstasteVon();
      schusshinweis.hidden = false;
      schusshinweis.textContent = s
        ? `Schusstaste: Knopf ${s.knopf}. Ersatz ist die Leertaste.`
        : "Keine Schusstaste zugewiesen, es zählt die Leertaste.";
    };

    feld.onclick = (e) => {
      const knopf = e.target.closest(".wahlknopf");
      if (!knopf) return;
      einstellung.sla = !einstellung.sla;
      knopf.classList.toggle("an", einstellung.sla);
      knopf.setAttribute("aria-pressed", String(einstellung.sla));
      speicher.setzeEinstellung("uebung1-einstellung", einstellung);
      // Beim ersten Einschalten mit Gerät die Schusstaste gleich anlernen.
      if (einstellung.sla && !controls.schusstasteVon() && controls.geraete().length) {
        schusshinweis.hidden = false;
        schusshinweis.textContent = "Schusstaste am Joystick drücken…";
        controls.starteSchussFang(() => zeigeSchussstand());
        return;
      }
      controls.brichSchussFangAb();
      zeigeSchussstand();
    };
    feld.onchange = (e) => {
      const liste = e.target.closest(".wahlliste");
      if (!liste) return;
      einstellung[liste.dataset.name] = Number(liste.value);
      speicher.setzeEinstellung("uebung1-einstellung", einstellung);
    };
    zeigeSchussstand();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    const { dauer, sla } = einstellung;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung1";
    schleier.innerHTML = `
      <canvas class="himmelbild"></canvas>
      <svg class="zielkreis" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke-width="4"/>
        <line x1="50" y1="8" x2="50" y2="92" stroke-width="4"/>
        <line x1="8" y1="50" x2="92" y2="50" stroke-width="4"/>
      </svg>
      <div class="testkopf"></div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const kopf = schleier.querySelector(".testkopf");
    const kreisBild = schleier.querySelector(".zielkreis");
    const leinwand = schleier.querySelector(".himmelbild");

    // 3D-Szene: Kamera in fester Höhe, Bodenebene mit Stadtbild, Dunst zum
    // Horizont. Das Zielflugzeug hängt an der Kamera und wird je Takt aus dem
    // Sichtfeldanteil der Logik gestellt; der Himmel ist der Seitengrund
    // hinter der durchsichtigen Leinwand.
    const BODENHOEHE = 420;
    const FLUGDISTANZ = 260;
    let drei = null;
    try {
      const renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      const szene = new THREE.Scene();
      szene.fog = new THREE.Fog(0xcfd9e2, 1200, 6500);
      const kamera = new THREE.PerspectiveCamera(62, 16 / 9, 1, 9000);
      szene.add(kamera);
      szene.add(new THREE.HemisphereLight(0xffffff, 0x565f4c, 1.05));

      const bodenStoff = new THREE.MeshLambertMaterial({ color: 0x66735f });
      const boden = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), bodenStoff);
      boden.rotation.x = -Math.PI / 2;
      boden.position.y = -BODENHOEHE;
      szene.add(boden);
      // Pfad am Modul verankert, damit auch die Probeseite unter entwurf/
      // dieselbe Datei findet (der Lader löst sonst an der Seitenadresse auf).
      new THREE.TextureLoader().load(new URL("../bilder/stadt.jpg", import.meta.url).href, (t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(48, 48);
        bodenStoff.map = t;
        bodenStoff.color.set(0xffffff);
        bodenStoff.needsUpdate = true;
      }, undefined, () => {}); // ohne Bild bleibt die Grundfarbe stehen

      // Rotes Kunstflugzeug aus Grundkörpern: Rumpf, zwei Tragflächen, Leitwerk.
      const rot = new THREE.MeshLambertMaterial({ color: 0xc23a30 });
      const flugzeug = new THREE.Group();
      const rumpf = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 16, 8), rot);
      rumpf.rotation.x = Math.PI / 2;
      const flaecheOben = new THREE.Mesh(new THREE.BoxGeometry(22, 0.7, 4), rot);
      flaecheOben.position.set(0, 2.6, 1);
      const flaecheUnten = new THREE.Mesh(new THREE.BoxGeometry(20, 0.7, 4), rot);
      flaecheUnten.position.set(0, -1.4, 1);
      const leitwerk = new THREE.Mesh(new THREE.BoxGeometry(7, 0.6, 2.6), rot);
      leitwerk.position.set(0, 0.6, 7.4);
      const seitenflosse = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 2.6), rot);
      seitenflosse.position.set(0, 2.2, 7.4);
      flugzeug.add(rumpf, flaecheOben, flaecheUnten, leitwerk, seitenflosse);
      kamera.add(flugzeug);
      drei = { renderer, szene, kamera, flugzeug };
    } catch {
      drei = null; // ohne WebGL läuft der Test nicht, der Start wird abgebrochen
    }
    if (!drei) {
      schleier.remove();
      tuer.oeffne().then(() => beiEnde(null));
      return;
    }

    const zustand = erzeugeLaufzustand();
    const reihe = sla ? erzeugeBuchstabenreihe(dauer) : [];
    const zaehler = sla ? erzeugeSlaZaehler(reihe) : null;
    let gesprochen = 0;
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
      speechSynthesis?.cancel?.();
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      drei.renderer.dispose();
      schleier.remove();
    };
    const beiVollbildwechsel = () => { if (!document.fullscreenElement) verlasse?.(); };
    const beiSichtwechsel = () => { if (document.hidden) verlasse?.(); };
    let verlasse = () => zeigeErgebnis(false);
    document.addEventListener("fullscreenchange", beiVollbildwechsel);
    document.addEventListener("visibilitychange", beiSichtwechsel);
    registriereAbbruch(() => verlasse?.());

    const passeGroesseAn = () => {
      const b = schleier.clientWidth;
      const h = schleier.clientHeight;
      drei.renderer.setSize(b, h, false);
      drei.kamera.aspect = b / h;
      drei.kamera.updateProjectionMatrix();
    };
    passeGroesseAn();
    addEventListener("resize", passeGroesseAn);

    const sprichBuchstaben = () => {
      while (sla && gesprochen < reihe.length && zustand.testMs >= gesprochen * BUCHSTABEN_ABSTAND_MS) {
        const eintrag = reihe[gesprochen];
        zaehler.sprich(gesprochen, zustand.testMs);
        const laut = new SpeechSynthesisUtterance(eintrag.b);
        laut.lang = "de-DE";
        laut.rate = 1.15;
        speechSynthesis.speak(laut);
        gesprochen += 1;
      }
    };

    const zeichne = () => {
      const { kamera, flugzeug, renderer, szene } = drei;
      // nick kippt nur den Horizontblick; die Bildposition des Ziels kommt allein aus zustand.ziel.x/y.
      kamera.rotation.set(zustand.nick, 0, -zustand.roll);
      // Sichtfeldanteil in Kameraraum: Höhe aus dem senkrechten Blickwinkel
      // bei der Flugdistanz, Breite daraus mal dem echten Bildverhältnis.
      // So landet das Flugzeug bei jedem Seitenverhältnis genau dort, wo
      // der SVG-Kreis den Bildanteil zeigt, ohne fest verdrahtetes 16:9.
      const halbeHoehe = Math.tan((kamera.fov * Math.PI) / 360) * FLUGDISTANZ;
      const halbeBreite = halbeHoehe * kamera.aspect;
      flugzeug.position.set(
        (zustand.ziel.x - 0.5) * 2 * halbeBreite,
        -(zustand.ziel.y - 0.5) * 2 * halbeHoehe,
        -FLUGDISTANZ,
      );
      flugzeug.rotation.z = -zustand.drift.zx.wert * 6; // eigene Kurve neigt die Flächen
      renderer.render(szene, kamera);

      kreisBild.style.left = `${zustand.kreis.x * 100}%`;
      kreisBild.style.top = `${zustand.kreis.y * 100}%`;
      kreisBild.classList.toggle("deckung", zustand.halteMs > 0);

      const rest = Math.max(0, testende - performance.now());
      kopf.textContent = `VERFOLGUNG${sla ? " + SLA" : ""} · REST ${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
    };

    const schleife = (jetzt) => {
      if (beendet || ergebnisOffen || !laeuft) return;
      const dtMs = Math.min(50, jetzt - vorher || 16);
      vorher = jetzt;
      const eingaben = {
        stickX: controls.wert("stickX"),
        stickY: controls.wert("stickY"),
        ruder: controls.wert("ruder"),
      };
      const ereignisse = takt(zustand, eingaben, dtMs);
      for (const e of ereignisse) {
        if (e.treffer) {
          kreisBild.classList.add("smtblitz");
          spaeter(() => kreisBild.classList.remove("smtblitz"), 220);
        }
      }
      if (sla && controls.schussGedrueckt()) zaehler.druck(zustand.testMs);
      sprichBuchstaben();
      zeichne();
      if (performance.now() >= testende) { zeigeErgebnis(true); return; }
      requestAnimationFrame(schleife);
    };

    const zeigeErgebnis = async (gewertet) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      for (const t of zeitgeber) clearTimeout(t);
      speechSynthesis?.cancel?.();
      removeEventListener("resize", passeGroesseAn);
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";

      await tuer.schliesse();
      tuer.verwische(true);

      const werte = ergebnisWerte(zustand);
      const slaWerte = zaehler?.auswertung();
      const zeilen = [
        `<span>Treffer: ${werte.treffer}</span>`,
        `<span>Zeit bis zum ersten Treffer: ${werte.ersterTrefferS == null ? "–" : `${werte.ersterTrefferS} s`}</span>`,
        `<span>Mittlere Zeit je Treffer: ${werte.mittelS == null ? "–" : `${werte.mittelS} s`}</span>`,
        slaWerte ? `<span>SLA: ${slaWerte.erkannt} erkannt · ${slaWerte.verpasst} verpasst · ${slaWerte.fehlalarm} Fehlalarm</span>` : "",
      ].join("");
      const abbruchzeile = gewertet ? "" : `<span class="abgebrochen">ABGEBROCHEN · DER LAUF ZÄHLT NICHT ZUR STATISTIK</span>`;
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${gewertet ? "TEST BEENDET" : "TEST ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${werte.deckungsquote} %</div>
        <div class="ergebniszeilen">${zeilen}</div>
        <button class="punkt" id="u1-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss">
          <span>${dauer} min Testdauer${sla ? " · SLA-Aufgabe" : ""}</span>
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
          kennzahl: werte.deckungsquote,
          daten: {
            art: "verfolgung",
            dauerMin: dauer,
            sla,
            treffer: werte.treffer,
            deckungsquote: werte.deckungsquote,
            ersterTrefferS: werte.ersterTrefferS,
            mittelS: werte.mittelS,
            ...(slaWerte ?? {}),
          },
        } : null);
        await tuer.oeffne();
      };
      verlasse = schliesse;
      tafel.querySelector("#u1-fertig").addEventListener("click", schliesse);
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
