// Ablauf Mission 1 (Flugzeugverfolgung) im Vollbild: PMT-Nachbau in echter
// 3D-Szene. Die Logik rechnet in uebung1.js, hier laufen Achsenabfrage,
// three.js-Zeichnung, Buchstabenausgabe und Tafeln.
import {
  TESTDAUERN, TEMPOS, erzeugeLaufzustand, takt, ergebnisWerte,
  erzeugeBuchstabenreihe, erzeugeSlaZaehler,
} from "./uebung1.js";
import * as THREE from "./fremd/three.module.js";
import { GLTFLoader } from "./fremd/GLTFLoader.js";

// Buchstabenklänge: ElevenLabs-Aufnahmen (Stimme Ralf DE Doku) unter
// klaenge/buchstaben, je Buchstabe eine Datei. Spielt ein Klang nicht,
// spricht ersatzweise der Browser.
const klangVon = (b) => new URL(`../klaenge/buchstaben/${b.toLowerCase()}.mp3`, import.meta.url).href;
function erzeugeSprecher() {
  const vorrat = new Map();
  return {
    sprich(b) {
      let klang = vorrat.get(b);
      if (!klang) { klang = new Audio(klangVon(b)); vorrat.set(b, klang); }
      klang.currentTime = 0;
      klang.play().catch(() => {
        const laut = new SpeechSynthesisUtterance(b);
        laut.lang = "de-DE";
        speechSynthesis.speak(laut);
      });
    },
    stopp() { for (const klang of vorrat.values()) klang.pause(); },
  };
}

export function erzeugeUebung1({ speicher, controls }) {
  const hinweis = "Nachbau der Flugzeugverfolgung der Eignungsfeststellung: Steuere mit Stick "
    + "und Pedalen, bis der Zielkreis auf dem vorausfliegenden Flugzeug liegt, und halte ihn "
    + "eine Sekunde dort. Der Kreis sitzt fest in der Bildmitte; nach jedem Treffer springt "
    + "das Flugzeug an eine neue Stelle. Wahlweise "
    + "läuft die Buchstabenaufgabe: Bei der Folge S-L-A die Schusstaste drücken.";

  let einstellung = { dauer: 5, sla: false, tempo: 2000 };
  let uebungsStart = false; // der Übungsknopf startet den nächsten Lauf als reine Buchstabenübung

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
          aria-pressed="${einstellung.sla}">SLA-AUFGABE</button>
        <button type="button" class="wahlknopf" data-element="ueben">NUR ÜBEN</button></div>
      <div class="wahlzeile"><span class="wahltitel">TEMPO</span>
        <select class="wahlliste" data-name="tempo">${TEMPOS.map((w) =>
          `<option value="${w}" ${w === einstellung.tempo ? "selected" : ""}>${(w / 1000).toLocaleString("de-DE", { minimumFractionDigits: 1 })} s</option>`).join("")}</select></div>
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
      if (knopf.dataset.element === "ueben") {
        // Reine Hörübung über den normalen Startweg, damit Tür, Vollbild
        // und Abbruch wie bei jedem Lauf funktionieren.
        uebungsStart = true;
        document.getElementById("start")?.click();
        return;
      }
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

  // Reine Hörübung: dieselbe Buchstabenaufgabe ohne Flug, zählt nie zur
  // Statistik. Tempo und Dauer kommen aus den Einstellungen.
  function starteBuchstabenUebung({ tuer, beiEnde, registriereAbbruch }) {
    const { dauer, tempo } = einstellung;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier buchstaben";
    schleier.innerHTML = `<div class="testkopf"></div>
      <div class="hinweis">Höre die Buchstaben.<br>Bei der Folge S-L-A die Schusstaste drücken.</div>`;
    document.body.append(schleier);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

    const kopf = schleier.querySelector(".testkopf");
    const reihe = erzeugeBuchstabenreihe(dauer, Math.random, tempo);
    const zaehler = erzeugeSlaZaehler(reihe);
    const sprecher = erzeugeSprecher();
    let gesprochen = 0;
    let testMs = 0;
    let beendet = false;
    let ergebnisOffen = false;
    let testende = Infinity;
    let laeuft = false;
    let vorher = 0;

    const raeumeAuf = () => {
      beendet = true;
      sprecher.stopp();
      speechSynthesis?.cancel?.();
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

    const schleife = (jetzt) => {
      if (beendet || ergebnisOffen || !laeuft) return;
      const dtMs = Math.min(100, jetzt - vorher || 16);
      vorher = jetzt;
      testMs += dtMs;
      while (gesprochen < reihe.length && testMs >= gesprochen * tempo) {
        zaehler.sprich(gesprochen, testMs);
        sprecher.sprich(reihe[gesprochen].b);
        gesprochen += 1;
      }
      if (controls.schussGedrueckt()) zaehler.druck(testMs);
      const rest = Math.max(0, testende - performance.now());
      kopf.textContent = `BUCHSTABEN · REST ${Math.floor(rest / 60_000)}:${String(Math.floor((rest % 60_000) / 1000)).padStart(2, "0")}`;
      if (performance.now() >= testende) { zeigeErgebnis(true); return; }
      requestAnimationFrame(schleife);
    };

    const zeigeErgebnis = async (fertig) => {
      if (beendet || ergebnisOffen) return;
      ergebnisOffen = true;
      sprecher.stopp();
      speechSynthesis?.cancel?.();
      document.removeEventListener("fullscreenchange", beiVollbildwechsel);
      document.removeEventListener("visibilitychange", beiSichtwechsel);
      kopf.textContent = "";
      await tuer.schliesse();
      tuer.verwische(true);
      const w = zaehler.auswertung();
      const tafel = document.createElement("div");
      tafel.className = "ergebnisschicht";
      tafel.innerHTML = `
        <div class="frage">${fertig ? "ÜBUNG BEENDET" : "ÜBUNG ABGEBROCHEN"}</div>
        <div class="ergebnisgross">${w.erkannt} / ${w.erkannt + w.verpasst}</div>
        <div class="ergebniszeilen">
          <span>Erkannt: ${w.erkannt}</span>
          <span>Verpasst: ${w.verpasst}</span>
          <span>Fehlalarm: ${w.fehlalarm}</span>
        </div>
        <button class="punkt" id="u1-uebung-fertig">ZURÜCK ZUR MISSION</button>
        <div class="ergebnisfuss"><span>${dauer} min · Tempo ${(tempo / 1000).toLocaleString("de-DE", { minimumFractionDigits: 1 })} s · Die Übung zählt nicht zur Statistik</span></div>`;
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
      tafel.querySelector("#u1-uebung-fertig").addEventListener("click", schliesse);
    };

    (async () => {
      await tuer.oeffne();
      if (beendet || ergebnisOffen) return;
      testende = performance.now() + dauer * 60_000;
      laeuft = true;
      vorher = performance.now();
      requestAnimationFrame(schleife);
    })();
  }

  function starte({ tuer, beiEnde, registriereAbbruch }) {
    // Ein im Feld gestarteter Schussfang darf nicht in den Testlauf weiterlaufen.
    controls.brichSchussFangAb();
    if (uebungsStart) {
      uebungsStart = false;
      starteBuchstabenUebung({ tuer, beiEnde, registriereAbbruch });
      return;
    }
    const { dauer, sla, tempo } = einstellung;
    const schleier = document.createElement("div");
    schleier.className = "laufschleier uebung1";
    schleier.innerHTML = `
      <canvas class="himmelbild"></canvas>
      <svg class="zielkreis" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke-width="2.5"/>
        <line x1="50" y1="8" x2="50" y2="92" stroke-width="2.5"/>
        <line x1="8" y1="50" x2="92" y2="50" stroke-width="2.5"/>
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
    // Nach Willis Sichtung des Videos: Das Flugzeug wirkt dort deutlich
    // kleiner, etwas unter der Kreisgröße (Spannweite rund 6 Prozent Breite).
    const FLUGDISTANZ = 175;
    let drei = null;
    try {
      const renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      const szene = new THREE.Scene();
      // Der frühe Nebelbeginn zieht den Dunstgürtel breit; die Dunstfarbe
      // entspricht dem Kuppelton auf Horizonthöhe.
      szene.fog = new THREE.Fog(0xc3d3e4, 600, 5200);

      // Himmelskuppel statt Seitengrund: Der Verlauf sitzt in der Welt und
      // wandert mit Nicken und Rollen mit, dadurch trifft der Bodendunst den
      // Himmel in jeder Fluglage im selben Ton und der Horizont bleibt ein
      // weicher Gürtel wie im Video, nie eine Linie.
      const himmelBild = document.createElement("canvas");
      himmelBild.width = 4;
      himmelBild.height = 512;
      const stift = himmelBild.getContext("2d");
      const verlauf = stift.createLinearGradient(0, 0, 0, 512);
      verlauf.addColorStop(0, "#3d6cb4");
      verlauf.addColorStop(0.4, "#93b2d8");
      verlauf.addColorStop(0.5, "#c3d3e4");
      verlauf.addColorStop(1, "#c3d3e4");
      stift.fillStyle = verlauf;
      stift.fillRect(0, 0, 4, 512);
      const himmelTextur = new THREE.CanvasTexture(himmelBild);
      // Ohne Farbraum-Kennzeichnung würde die Textur linear gedeutet und
      // träfe den Nebelton nicht mehr, dann stünde wieder eine Kante im Bild.
      himmelTextur.colorSpace = THREE.SRGBColorSpace;
      const kuppel = new THREE.Mesh(
        new THREE.SphereGeometry(7500, 24, 24),
        new THREE.MeshBasicMaterial({ map: himmelTextur, side: THREE.BackSide, fog: false }),
      );
      szene.add(kuppel);
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

      // Rotes Kunstflugzeug: Sofort steht das Grundkörper-Modell, danach
      // ersetzt es das texturierte 3D-Netz aus modelle/flugzeug.glb (Higgsfield,
      // Willis Wahl). Scheitert das Laden, bleibt das Grundkörper-Modell stehen.
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
      new GLTFLoader().load(new URL("../modelle/flugzeug.glb", import.meta.url).href, (gltf) => {
        // Nase des Netzes zeigt in Richtung -x; die Drehung bringt sie nach -z,
        // also von der Kamera weg. Danach auf Spannweite 22 bringen und mittig
        // setzen, damit die Kurvenneigung um die Flugzeugmitte dreht.
        const halter = new THREE.Object3D();
        halter.rotation.y = -Math.PI / 2;
        halter.add(gltf.scene);
        gltf.scene.traverse((k) => { if (k.isMesh && !k.material?.map) k.material = rot; });
        const kasten = new THREE.Box3().setFromObject(halter);
        const groesse = new THREE.Vector3();
        kasten.getSize(groesse);
        halter.scale.setScalar(22 / groesse.x);
        const mitte = new THREE.Vector3();
        new THREE.Box3().setFromObject(halter).getCenter(mitte);
        halter.position.sub(mitte);
        flugzeug.clear();
        flugzeug.add(halter);
      }, undefined, () => {}); // ohne Netz bleibt das Grundkörper-Modell
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
    const reihe = sla ? erzeugeBuchstabenreihe(dauer, Math.random, tempo) : [];
    const zaehler = sla ? erzeugeSlaZaehler(reihe) : null;
    const sprecher = sla ? erzeugeSprecher() : null;
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
      sprecher?.stopp();
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
      while (sla && gesprochen < reihe.length && zustand.testMs >= gesprochen * tempo) {
        zaehler.sprich(gesprochen, zustand.testMs);
        sprecher.sprich(reihe[gesprochen].b);
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

      // Der Kreis steht fest in der Bildmitte (stil.css), hier wechselt nur die Farbe.
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
      sprecher?.stopp();
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
