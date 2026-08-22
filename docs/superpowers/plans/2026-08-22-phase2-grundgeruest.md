# Phase-II-App Grundgerüst: Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das komplette Grundgerüst der Phase-II-App: Profilwahl, Übersicht im abgenommenen Design, Profilmenü, Controls-Anlernen, Missionsseiten mit Auswertung und Vergleich, gemeinsame Datenhaltung über Supabase, Auslieferung über GitHub Pages. Die sechs Übungsinhalte selbst sind NICHT Teil dieses Plans.

**Architecture:** Reine Web-App ohne Rahmenwerk, ES-Module, eine HTML-Seite je Bildschirm (index = Profilwahl, uebersicht, mission). Reine Logik (Auswertung, Steuerkurven, Speicher) liegt in eigenen Modulen und wird mit node --test geprüft. Daten laufen über einen Speicher mit örtlicher Kopie (localStorage) und Supabase-REST als gemeinsamem Bestand.

**Tech Stack:** HTML/CSS/JavaScript (ES-Module), Gamepad-API, Supabase (REST über fetch, kein SDK), GitHub Pages, node --test für Logikprüfungen, lokaler Prüfserver `python3 -m http.server`.

## Global Constraints

- Bezugsdokument: `docs/superpowers/specs/2026-08-22-phase2-app-design.md` (abgenommen).
- Sprache in Oberfläche, Bezeichnern, Kommentaren und Commits: Deutsch. Keine Gedankenstriche als Satztrenner, keine Emojis, keine Anglizismen, wo ein deutsches Wort existiert.
- Kein Rahmenwerk, keine Pakete, keine fremden CDN-Adressen zur Laufzeit. Schrift Black Ops One liegt örtlich unter `schrift/`.
- Zielbrowser Chrome. Auf anderen Browsern erscheint ein Hinweis.
- Bilder ausschließlich aus `bilder/` (Quellbestand liegt unter `entwurf/bilder/`).
- Genau zwei Profile: `willi`, `luigi`.
- Skript- und Stileinbindungen tragen Versionsmarken (`?v=N`), die bei jeder Änderung an der eingebundenen Datei hochgezählt werden.
- Ein Lauf-Datensatz hat überall die Form `{profil, bereich, zeitpunkt, kennzahl, daten}` mit `zeitpunkt` als ISO-Zeichenkette, `kennzahl` als Zahl, `daten` als Objekt.

## Dateistruktur

```
App/
  index.html            Profilwahl (zwei hängende Bänder)
  uebersicht.html       Übungsbereich (sechs Schilder, Anhänger, Profilmenü)
  mission.html          Missionsseite (?bereich=1..6), Auswertung, Platzhalter-Lauf
  stil.css              Gemeinsamer Stil (Tarn, Schrift, Schilder, Anhänger)
  js/
    konfig.js           Supabase-Zugang und App-Version
    missionen.js        Namen und Kennzahl-Beschriftung der sechs Bereiche
    auswertung.js       Reine Rechenlogik (Bestwert, Durchschnitt, Vergleich)
    kurve.js            Reine Steuerlogik (Totzone, Expo, Achsen-Fang)
    speicher.js         Örtliche Kopie + Supabase-REST + Warteschlange
    controls.js         Gamepad-Anbindung, Anlernen, Tastatur-Ersatz
    profilmenue.js      Anhänger-Knopf, Menü, Zurücksetzen, Controls-Dialog
    start.js            Ablauf der Profilwahl
    uebersicht.js       Ablauf der Übersicht
    mission.js          Ablauf der Missionsseite samt Platzhalter-Lauf
  tests/
    auswertung.test.js
    kurve.test.js
    speicher.test.js
  bilder/               Kopien aus entwurf/bilder + tarn.svg
  schrift/              black-ops-one.woff2
```

---

### Task 1: Grundgerüst, Tarn-Hintergrund und Schrift

**Files:**
- Create: `stil.css`, `bilder/tarn.svg`, `schrift/black-ops-one.woff2`, `index.html` (vorläufig), `js/konfig.js`
- Copy: `entwurf/bilder/*` nach `bilder/`

**Interfaces:**
- Produces: CSS-Klassen `she-titel`, `she-untertitel`; CSS-Variablen `--hell`, `--gedeckt`, `--tafel-dunkel`; `KONFIG` aus `js/konfig.js` mit `{supabaseUrl, supabaseKey, version}`.

- [ ] **Step 1: Ordner anlegen und Bilder übernehmen**

```bash
cd "/Users/o_o/Desktop/Claude/Phase II/App"
mkdir -p js tests bilder schrift
cp entwurf/bilder/schild-0*.png entwurf/bilder/anhaenger.png entwurf/bilder/anhaenger-roh.png entwurf/bilder/schwinge.png entwurf/bilder/eurofighter.svg bilder/
```

- [ ] **Step 2: Schrift örtlich holen**

```bash
cd "/Users/o_o/Desktop/Claude/Phase II/App"
curl -sA "Mozilla/5.0 (Macintosh) Chrome/126" "https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap" | grep -oE 'https://[^)]+\.woff2' | head -1 | xargs -I{} curl -s {} -o schrift/black-ops-one.woff2
ls -la schrift/
```
Erwartet: `black-ops-one.woff2` mit mehr als 10 kB.

- [ ] **Step 3: Tarn-Hintergrund als SVG-Datei schreiben**

`bilder/tarn.svg` (Weichzeichnung liegt im SVG selbst, der dunkle Schleier kommt per CSS):

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" preserveAspectRatio="xMidYMid slice">
  <rect width="600" height="480" fill="#232a19"/>
  <filter id="w" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3"/></filter>
  <g filter="url(#w)">
    <polygon fill="#161c11" points="0,0 90,0 130,120 60,210 0,140"/>
    <polygon fill="#2c3520" points="90,0 210,0 180,150 130,120"/>
    <polygon fill="#242013" points="210,0 320,0 290,110 180,150"/>
    <polygon fill="#161c11" points="320,0 430,0 470,170 370,210 290,110"/>
    <polygon fill="#2c3520" points="430,0 560,0 600,100 600,220 470,170"/>
    <polygon fill="#242013" points="0,140 60,210 40,480 0,480"/>
    <polygon fill="#2c3520" points="60,210 130,120 180,150 220,320 140,480 40,480"/>
    <polygon fill="#161c11" points="180,150 290,110 370,210 330,480 220,320"/>
    <polygon fill="#242013" points="370,210 470,170 500,370 460,480 330,480"/>
    <polygon fill="#161c11" points="470,170 600,220 600,480 460,480 500,370"/>
  </g>
</svg>
```

- [ ] **Step 4: Gemeinsamen Stil schreiben**

`stil.css`:

```css
@font-face {
  font-family: "Black Ops One";
  src: url("schrift/black-ops-one.woff2") format("woff2");
  font-display: swap;
}

:root {
  --hell: #dde1d5;
  --gedeckt: #a8b49a;
  --tafel-dunkel: #31373b;
  --tafel-neben: #5c646a;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  min-height: 100vh;
  font-family: "Black Ops One", system-ui, sans-serif;
  color: var(--hell);
  background: #232a19 url("bilder/tarn.svg") center / cover no-repeat fixed;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: rgba(8, 10, 6, 0.5);
  pointer-events: none;
  z-index: 0;
}

main { position: relative; z-index: 1; }

.she-titel {
  text-align: center;
  font-size: clamp(30px, 5vw, 52px);
  letter-spacing: 0.22em;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}

.she-untertitel {
  text-align: center;
  font-size: clamp(11px, 1.5vw, 17px);
  letter-spacing: 0.75em;
  color: var(--gedeckt);
  margin-top: 8px;
  padding-left: 0.75em; /* gleicht die Sperrung optisch aus */
}
```

- [ ] **Step 5: Vorläufige Startseite und Konfiguration schreiben**

`js/konfig.js`:

```js
// Zugangsdaten werden in Task 9 nach dem Anlegen des Supabase-Projekts eingetragen.
export const KONFIG = {
  supabaseUrl: "",
  supabaseKey: "",
  version: 1,
};
```

`index.html` (wird in Task 5 zur echten Profilwahl ausgebaut):

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Phase II · Fliegerische Eignung</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="stil.css?v=1">
</head>
<body>
<main style="padding-top:18vh;">
  <h1 class="she-titel">PHASE II</h1>
  <p class="she-untertitel">FLIEGERISCHE EIGNUNG</p>
</main>
</body>
</html>
```

- [ ] **Step 6: Sichtprüfung in Chrome**

```bash
cd "/Users/o_o/Desktop/Claude/Phase II/App" && (lsof -ti:8482 | xargs kill -9 2>/dev/null); nohup python3 -m http.server 8482 >/dev/null 2>&1 & sleep 1; curl -s -o /dev/null -w "%{http_code}" http://localhost:8482/index.html
```
Erwartet: `200`. Dann `http://localhost:8482/index.html` in Chrome öffnen (Browserwerkzeug) und Bildschirmfoto prüfen: Tarn sichtbar mit weichen Kanten und dunklem Schleier, Titel mittig in Black Ops One.

- [ ] **Step 7: Commit**

```bash
git add stil.css bilder schrift index.html js/konfig.js
git commit -m "Grundgerüst: Tarn-Hintergrund, örtliche Schrift, Grundstil"
```

---

### Task 2: Auswertungslogik

**Files:**
- Create: `js/auswertung.js`, `tests/auswertung.test.js`

**Interfaces:**
- Consumes: nichts.
- Produces: `sortiertNeueste(laeufe) -> Lauf[]` (absteigend nach `zeitpunkt`), `bestwert(laeufe) -> number|null`, `durchschnitt(laeufe) -> number|null` (auf 1 Nachkommastelle gerundet), `vergleich(laeufe) -> {willi: Seite, luigi: Seite}` mit `Seite = {anzahl, bestwert, durchschnitt}`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`tests/auswertung.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { sortiertNeueste, bestwert, durchschnitt, vergleich } from "../js/auswertung.js";

const laeufe = [
  { profil: "willi", bereich: 1, zeitpunkt: "2026-08-20T10:00:00Z", kennzahl: 70, daten: {} },
  { profil: "willi", bereich: 1, zeitpunkt: "2026-08-22T10:00:00Z", kennzahl: 84, daten: {} },
  { profil: "luigi", bereich: 1, zeitpunkt: "2026-08-21T10:00:00Z", kennzahl: 74, daten: {} },
  { profil: "willi", bereich: 1, zeitpunkt: "2026-08-21T10:00:00Z", kennzahl: 86, daten: {} },
];

test("sortiertNeueste ordnet absteigend nach Zeitpunkt", () => {
  const s = sortiertNeueste(laeufe);
  assert.equal(s[0].kennzahl, 84);
  assert.equal(s.at(-1).kennzahl, 70);
  assert.equal(laeufe[0].kennzahl, 70); // Eingabe bleibt unangetastet
});

test("bestwert liefert das Maximum, null bei leer", () => {
  assert.equal(bestwert(laeufe), 86);
  assert.equal(bestwert([]), null);
});

test("durchschnitt rundet auf eine Nachkommastelle, null bei leer", () => {
  assert.equal(durchschnitt(laeufe), 78.5); // (70+84+74+86)/4
  assert.equal(durchschnitt([]), null);
});

test("vergleich trennt nach Profil", () => {
  const v = vergleich(laeufe);
  assert.equal(v.willi.anzahl, 3);
  assert.equal(v.willi.bestwert, 86);
  assert.equal(v.willi.durchschnitt, 80);
  assert.equal(v.luigi.anzahl, 1);
  assert.equal(v.luigi.durchschnitt, 74);
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `cd "/Users/o_o/Desktop/Claude/Phase II/App" && node --test tests/auswertung.test.js`
Erwartet: FAIL (Modul nicht vorhanden).

- [ ] **Step 3: Umsetzung schreiben**

`js/auswertung.js`:

```js
// Reine Rechenlogik für die Auswertung. Keine Abhängigkeiten, kein Browser nötig.

export function sortiertNeueste(laeufe) {
  return [...laeufe].sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt));
}

export function bestwert(laeufe) {
  if (laeufe.length === 0) return null;
  return Math.max(...laeufe.map((l) => l.kennzahl));
}

export function durchschnitt(laeufe) {
  if (laeufe.length === 0) return null;
  const summe = laeufe.reduce((s, l) => s + l.kennzahl, 0);
  return Math.round((summe / laeufe.length) * 10) / 10;
}

export function vergleich(laeufe) {
  const seite = (profil) => {
    const eigene = laeufe.filter((l) => l.profil === profil);
    return { anzahl: eigene.length, bestwert: bestwert(eigene), durchschnitt: durchschnitt(eigene) };
  };
  return { willi: seite("willi"), luigi: seite("luigi") };
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/auswertung.test.js`
Erwartet: PASS, 4 Tests.

- [ ] **Step 5: Commit**

```bash
git add js/auswertung.js tests/auswertung.test.js
git commit -m "Auswertungslogik: Sortierung, Bestwert, Durchschnitt, Vergleich"
```

---

### Task 3: Steuerkurvenlogik

**Files:**
- Create: `js/kurve.js`, `tests/kurve.test.js`

**Interfaces:**
- Consumes: nichts.
- Produces: `mitKurve(wert, totzone, expo) -> number` (Totzone abziehen, auf vollen Bereich strecken, Expo-Mischung), `groessterAusschlag(basen, jetzt, schwelle) -> {geraet, achse, delta} | null`. Dabei sind `basen` und `jetzt` Felder der Form `[{geraet: "Kennung", achsen: [Zahlen]}]`.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`tests/kurve.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mitKurve, groessterAusschlag } from "../js/kurve.js";

test("mitKurve: innerhalb der Totzone ist der Wert 0", () => {
  assert.equal(mitKurve(0.05, 0.06, 0), 0);
  assert.equal(mitKurve(-0.05, 0.06, 0), 0);
});

test("mitKurve: Vollausschlag bleibt Vollausschlag", () => {
  assert.equal(mitKurve(1, 0.06, 0), 1);
  assert.equal(mitKurve(-1, 0.06, 0.5), -1);
});

test("mitKurve: Expo staucht die Mitte", () => {
  const ohne = mitKurve(0.5, 0, 0);
  const mit = mitKurve(0.5, 0, 1);
  assert.equal(ohne, 0.5);
  assert.ok(mit < ohne && mit > 0); // reine Kubikkurve: 0.125
});

test("groessterAusschlag findet die bewegte Achse über alle Geräte", () => {
  const basen = [
    { geraet: "Stick", achsen: [0, 0, 0] },
    { geraet: "Schub", achsen: [-1] },
  ];
  const jetzt = [
    { geraet: "Stick", achsen: [0.1, 0, 0] },
    { geraet: "Schub", achsen: [-0.2] },
  ];
  const t = groessterAusschlag(basen, jetzt, 0.55);
  assert.deepEqual(t, { geraet: "Schub", achse: 0, delta: 0.8 });
});

test("groessterAusschlag liefert null unterhalb der Schwelle", () => {
  const basen = [{ geraet: "Stick", achsen: [0] }];
  const jetzt = [{ geraet: "Stick", achsen: [0.3] }];
  assert.equal(groessterAusschlag(basen, jetzt, 0.55), null);
});

test("groessterAusschlag übersteht neu dazugekommene Geräte", () => {
  const basen = [{ geraet: "Stick", achsen: [0] }];
  const jetzt = [
    { geraet: "Stick", achsen: [0] },
    { geraet: "Pedale", achsen: [0.9] },
  ];
  const t = groessterAusschlag(basen, jetzt, 0.55);
  assert.deepEqual(t, { geraet: "Pedale", achse: 0, delta: 0.9 });
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `node --test tests/kurve.test.js`
Erwartet: FAIL (Modul nicht vorhanden).

- [ ] **Step 3: Umsetzung schreiben**

`js/kurve.js`:

```js
// Reine Steuerlogik: Totzone, Expo und das Anlernen der Achsen.

export function mitKurve(wert, totzone, expo) {
  const betrag = Math.abs(wert);
  if (betrag < totzone) return 0;
  const gestreckt = ((betrag - totzone) / (1 - totzone)) * Math.sign(wert);
  return (1 - expo) * gestreckt + expo * gestreckt ** 3;
}

export function groessterAusschlag(basen, jetzt, schwelle) {
  const ruhe = new Map(basen.map((g) => [g.geraet, g.achsen]));
  let treffer = null;
  for (const geraet of jetzt) {
    const basis = ruhe.get(geraet.geraet) ?? [];
    geraet.achsen.forEach((wert, achse) => {
      const delta = Math.abs(wert - (basis[achse] ?? 0));
      if (delta > schwelle && (!treffer || delta > treffer.delta)) {
        treffer = { geraet: geraet.geraet, achse, delta: Math.round(delta * 100) / 100 };
      }
    });
  }
  return treffer;
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/kurve.test.js`
Erwartet: PASS, 6 Tests.

- [ ] **Step 5: Commit**

```bash
git add js/kurve.js tests/kurve.test.js
git commit -m "Steuerkurvenlogik: Totzone, Expo und Achsen-Fang über alle Geräte"
```

---

### Task 4: Speicher mit örtlicher Kopie, Warteschlange und Supabase-REST

**Files:**
- Create: `js/speicher.js`, `tests/speicher.test.js`

**Interfaces:**
- Consumes: `KONFIG` aus `js/konfig.js` (wird von den Seiten hereingereicht, nicht importiert, damit Tests eine Attrappe nutzen können).
- Produces: `erzeugeSpeicher({konfig, fetchFn, lager}) -> speicher` mit:
  - `speicher.profil()` / `speicher.setzeProfil("willi"|"luigi"|null)`
  - `speicher.ladeLaeufe(bereich) -> Promise<Lauf[]>` (gemeinsamer Bestand, bei Netzfehler die örtliche Kopie)
  - `speicher.speichereLauf(lauf) -> Promise<void>` (immer örtlich, Versand sofort oder über Warteschlange)
  - `speicher.synce() -> Promise<void>` (Warteschlange nachmelden)
  - `speicher.zustand() -> "verbunden" | "getrennt" | "ohne-zugang"` (Stand nach dem letzten Versuch)
  - `speicher.loescheLaeufe(profil, bereichOderNull) -> Promise<void>`
  - `speicher.ladeEinstellung(schluessel, vorgabe)` / `speicher.setzeEinstellung(schluessel, wert)` (je Profil, örtlich, bestmöglich nach Supabase gespiegelt)
- `lager` ist ein Objekt mit `getItem`/`setItem` (localStorage oder Attrappe).

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`tests/speicher.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { erzeugeSpeicher } from "../js/speicher.js";

function attrappenLager() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}

const konfig = { supabaseUrl: "https://beispiel.supabase.co", supabaseKey: "schluessel", version: 1 };

const lauf = { profil: "willi", bereich: 1, zeitpunkt: "2026-08-22T10:00:00Z", kennzahl: 84, daten: {} };

test("Profilwahl wird im Lager gehalten", () => {
  const s = erzeugeSpeicher({ konfig, fetchFn: async () => ({ ok: true, json: async () => [] }), lager: attrappenLager() });
  assert.equal(s.profil(), null);
  s.setzeProfil("willi");
  assert.equal(s.profil(), "willi");
});

test("speichereLauf sendet an Supabase und hält die örtliche Kopie", async () => {
  const rufe = [];
  const fetchFn = async (adresse, optionen = {}) => {
    rufe.push({ adresse, methode: optionen.method ?? "GET" });
    return { ok: true, json: async () => [] };
  };
  const s = erzeugeSpeicher({ konfig, fetchFn, lager: attrappenLager() });
  await s.speichereLauf(lauf);
  assert.equal(rufe.length, 1);
  assert.ok(rufe[0].adresse.startsWith("https://beispiel.supabase.co/rest/v1/laeufe"));
  assert.equal(rufe[0].methode, "POST");
  assert.equal(s.zustand(), "verbunden");
  const oertlich = await s.ladeLaeufe(1).catch(() => null);
  assert.ok(oertlich); // liefert auch bei leerer Antwort ein Feld
});

test("bei Netzfehler landet der Lauf in der Warteschlange und synce meldet nach", async () => {
  let kaputt = true;
  const posts = [];
  const fetchFn = async (adresse, optionen = {}) => {
    if (kaputt) throw new Error("kein Netz");
    if ((optionen.method ?? "GET") === "POST") posts.push(adresse);
    return { ok: true, json: async () => [] };
  };
  const lager = attrappenLager();
  const s = erzeugeSpeicher({ konfig, fetchFn, lager });
  await s.speichereLauf(lauf);
  assert.equal(s.zustand(), "getrennt");
  const laeufe = await s.ladeLaeufe(1);
  assert.equal(laeufe.length, 1); // örtliche Kopie greift
  kaputt = false;
  await s.synce();
  assert.equal(posts.length, 1);
  assert.equal(s.zustand(), "verbunden");
});

test("ohne Zugangsdaten bleibt alles örtlich und der Zustand ist ohne-zugang", async () => {
  const s = erzeugeSpeicher({ konfig: { supabaseUrl: "", supabaseKey: "", version: 1 }, fetchFn: async () => { throw new Error("darf nicht gerufen werden"); }, lager: attrappenLager() });
  await s.speichereLauf(lauf);
  assert.equal(s.zustand(), "ohne-zugang");
  assert.equal((await s.ladeLaeufe(1)).length, 1);
});

test("ladeLaeufe vereinigt gemeinsamen Bestand und Warteschlange ohne Doppelte", async () => {
  const fern = [{ ...lauf, kennzahl: 70, zeitpunkt: "2026-08-20T10:00:00Z" }];
  let kaputt = true;
  const fetchFn = async (adresse, optionen = {}) => {
    if ((optionen.method ?? "GET") === "GET") return { ok: true, json: async () => fern };
    if (kaputt) throw new Error("kein Netz");
    return { ok: true, json: async () => [] };
  };
  const s = erzeugeSpeicher({ konfig, fetchFn, lager: attrappenLager() });
  await s.speichereLauf(lauf); // POST scheitert, bleibt in Warteschlange
  const laeufe = await s.ladeLaeufe(1);
  assert.equal(laeufe.length, 2);
});

test("loescheLaeufe ruft DELETE und leert die örtliche Kopie des Profils", async () => {
  const rufe = [];
  const fetchFn = async (adresse, optionen = {}) => {
    rufe.push({ adresse, methode: optionen.method ?? "GET" });
    return { ok: true, json: async () => [] };
  };
  const s = erzeugeSpeicher({ konfig, fetchFn, lager: attrappenLager() });
  await s.speichereLauf(lauf);
  await s.loescheLaeufe("willi", null);
  assert.ok(rufe.some((r) => r.methode === "DELETE" && r.adresse.includes("profil=eq.willi")));
  assert.equal((await s.ladeLaeufe(1)).filter((l) => l.profil === "willi").length, 0);
});

test("Einstellungen werden je Profil gehalten", async () => {
  const s = erzeugeSpeicher({ konfig: { supabaseUrl: "", supabaseKey: "", version: 1 }, fetchFn: async () => ({ ok: true, json: async () => [] }), lager: attrappenLager() });
  s.setzeProfil("willi");
  assert.equal(await s.ladeEinstellung("totzone", 0.06), 0.06);
  await s.setzeEinstellung("totzone", 0.1);
  assert.equal(await s.ladeEinstellung("totzone", 0.06), 0.1);
  s.setzeProfil("luigi");
  assert.equal(await s.ladeEinstellung("totzone", 0.06), 0.06);
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `node --test tests/speicher.test.js`
Erwartet: FAIL (Modul nicht vorhanden).

- [ ] **Step 3: Umsetzung schreiben**

`js/speicher.js`:

```js
// Datenhaltung: örtliche Kopie im Lager, gemeinsamer Bestand über Supabase-REST.
// Alles läuft über erzeugeSpeicher, damit Tests fetch und Lager ersetzen können.

const LAGER_LAEUFE = "p2-laeufe";
const LAGER_WARTESCHLANGE = "p2-warteschlange";
const LAGER_PROFIL = "p2-profil";
const LAGER_EINSTELLUNGEN = "p2-einstellungen";

export function erzeugeSpeicher({ konfig, fetchFn = fetch, lager = localStorage }) {
  let zustand = konfig.supabaseUrl ? "getrennt" : "ohne-zugang";

  const liesJson = (schluessel, vorgabe) => {
    const roh = lager.getItem(schluessel);
    if (roh === null) return vorgabe;
    try { return JSON.parse(roh); } catch { return vorgabe; }
  };
  const schreibJson = (schluessel, wert) => lager.setItem(schluessel, JSON.stringify(wert));

  const kopf = {
    apikey: konfig.supabaseKey,
    Authorization: `Bearer ${konfig.supabaseKey}`,
    "Content-Type": "application/json",
  };
  const tabelle = (name) => `${konfig.supabaseUrl}/rest/v1/${name}`;

  async function rufe(adresse, optionen = {}) {
    if (!konfig.supabaseUrl) { zustand = "ohne-zugang"; throw new Error("ohne-zugang"); }
    try {
      const antwort = await fetchFn(adresse, { ...optionen, headers: { ...kopf, ...(optionen.headers ?? {}) } });
      if (!antwort.ok) throw new Error(`Supabase antwortet ${antwort.status}`);
      zustand = "verbunden";
      return antwort;
    } catch (fehler) {
      if (zustand !== "ohne-zugang") zustand = "getrennt";
      throw fehler;
    }
  }

  const schluesselVon = (l) => `${l.profil}|${l.bereich}|${l.zeitpunkt}`;

  function merkeOertlich(lauf) {
    const alle = liesJson(LAGER_LAEUFE, []);
    if (!alle.some((v) => schluesselVon(v) === schluesselVon(lauf))) alle.push(lauf);
    schreibJson(LAGER_LAEUFE, alle);
  }

  return {
    profil() { const wert = lager.getItem(LAGER_PROFIL); return wert ? wert : null; },
    setzeProfil(name) { lager.setItem(LAGER_PROFIL, name ?? ""); },

    zustand() { return zustand; },

    async speichereLauf(lauf) {
      merkeOertlich(lauf);
      try {
        await rufe(tabelle("laeufe"), { method: "POST", body: JSON.stringify(lauf) });
      } catch {
        const schlange = liesJson(LAGER_WARTESCHLANGE, []);
        schlange.push(lauf);
        schreibJson(LAGER_WARTESCHLANGE, schlange);
      }
    },

    async synce() {
      const schlange = liesJson(LAGER_WARTESCHLANGE, []);
      const rest = [];
      for (const lauf of schlange) {
        try { await rufe(tabelle("laeufe"), { method: "POST", body: JSON.stringify(lauf) }); }
        catch { rest.push(lauf); }
      }
      schreibJson(LAGER_WARTESCHLANGE, rest);
    },

    async ladeLaeufe(bereich) {
      let fern = null;
      try {
        const antwort = await rufe(`${tabelle("laeufe")}?bereich=eq.${bereich}&select=profil,bereich,zeitpunkt,kennzahl,daten`);
        fern = await antwort.json();
      } catch { /* örtliche Kopie greift */ }
      const oertlich = liesJson(LAGER_LAEUFE, []).filter((l) => l.bereich === bereich);
      const schlange = liesJson(LAGER_WARTESCHLANGE, []).filter((l) => l.bereich === bereich);
      const gesehen = new Set();
      const alle = [];
      for (const l of [...(fern ?? []), ...oertlich, ...schlange]) {
        const s = schluesselVon(l);
        if (!gesehen.has(s)) { gesehen.add(s); alle.push(l); }
      }
      if (fern) schreibJson(LAGER_LAEUFE, [...liesJson(LAGER_LAEUFE, []).filter((l) => l.bereich !== bereich), ...alle]);
      return alle;
    },

    async loescheLaeufe(profil, bereichOderNull) {
      const filter = bereichOderNull === null
        ? `?profil=eq.${profil}`
        : `?profil=eq.${profil}&bereich=eq.${bereichOderNull}`;
      try { await rufe(`${tabelle("laeufe")}${filter}`, { method: "DELETE" }); } catch { /* örtlich trotzdem leeren */ }
      const behalten = (l) => !(l.profil === profil && (bereichOderNull === null || l.bereich === bereichOderNull));
      schreibJson(LAGER_LAEUFE, liesJson(LAGER_LAEUFE, []).filter(behalten));
      schreibJson(LAGER_WARTESCHLANGE, liesJson(LAGER_WARTESCHLANGE, []).filter(behalten));
    },

    async ladeEinstellung(schluessel, vorgabe) {
      const alle = liesJson(LAGER_EINSTELLUNGEN, {});
      const je = alle[this.profil()] ?? {};
      return schluessel in je ? je[schluessel] : vorgabe;
    },

    async setzeEinstellung(schluessel, wert) {
      const alle = liesJson(LAGER_EINSTELLUNGEN, {});
      const profil = this.profil();
      alle[profil] = { ...(alle[profil] ?? {}), [schluessel]: wert };
      schreibJson(LAGER_EINSTELLUNGEN, alle);
      try {
        await rufe(`${tabelle("einstellungen")}?on_conflict=profil,schluessel`, {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify({ profil, schluessel, wert }),
        });
      } catch { /* bestmöglich, örtlich reicht */ }
    },
  };
}
```

Hinweis für den Umsetzer: `setzeProfil(null)` löscht die Wahl, eine leere Zeichenkette im Lager zählt als keine Wahl.

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test tests/speicher.test.js`
Erwartet: PASS, 7 Tests.

- [ ] **Step 5: Alle Tests gemeinsam laufen lassen**

Run: `node --test tests/`
Erwartet: PASS, 17 Tests.

- [ ] **Step 6: Commit**

```bash
git add js/speicher.js tests/speicher.test.js
git commit -m "Speicher: örtliche Kopie, Warteschlange und Supabase-Anbindung"
```

---

### Task 5: Startbildschirm mit zwei hängenden Bändern

**Files:**
- Modify: `index.html` (vollständig ersetzen), `stil.css` (Ergänzung am Ende)
- Create: `js/start.js`

**Interfaces:**
- Consumes: `erzeugeSpeicher` aus `js/speicher.js`, `KONFIG` aus `js/konfig.js`, Bilder `bilder/anhaenger.png`, `bilder/eurofighter.svg`, `bilder/schwinge.png`.
- Produces: Profilwahl im Lager (`p2-profil`), Weiterleitung nach `uebersicht.html`.

- [ ] **Step 1: Stil für die Bänder ergänzen**

Am Ende von `stil.css` anfügen:

```css
/* Profilwahl: zwei hängende Bänder */
.bandreihe {
  display: flex;
  justify-content: center;
  gap: clamp(60px, 12vw, 160px);
  margin-top: 6vh;
}

.band {
  position: relative;
  width: clamp(120px, 16vw, 190px);
  border: 0;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.55));
  transition: transform 0.35s ease;
}

.band:hover { transform: translateY(10px); }
.band.gezogen { transform: translateY(48vh); transition: transform 0.6s ease-in; }

.band img.stoff { display: block; width: 100%; height: auto; }

.band .aufdruck {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 28%;
  text-align: center;
  color: #f7f0e7;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

.band .aufdruck img.flieger { width: 46%; height: auto; display: block; margin: 0 auto; filter: brightness(1.35) drop-shadow(0 1px 1px rgba(0,0,0,.45)); }
.band .aufdruck .name { font-size: clamp(17px, 2vw, 24px); letter-spacing: 0.18em; margin-top: 10%; }
.band .aufdruck img.schwinge { width: 86%; height: auto; display: block; margin: 2% auto 0; mix-blend-mode: screen; }
```

- [ ] **Step 2: index.html vollständig ersetzen**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Phase II · Fliegerische Eignung</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="stil.css?v=2">
</head>
<body>
<main style="padding-top:10vh;">
  <h1 class="she-titel">PHASE II</h1>
  <p class="she-untertitel">FLIEGERISCHE EIGNUNG</p>

  <div class="bandreihe">
    <button class="band" data-profil="luigi" aria-label="Profil Luigi wählen">
      <img class="stoff" src="bilder/anhaenger.png" alt="">
      <span class="aufdruck">
        <img class="flieger" src="bilder/eurofighter.svg" alt="">
        <span class="name">LUIGI</span>
        <img class="schwinge" src="bilder/schwinge.png" alt="">
      </span>
    </button>
    <button class="band" data-profil="willi" aria-label="Profil Willi wählen">
      <img class="stoff" src="bilder/anhaenger.png" alt="">
      <span class="aufdruck">
        <img class="flieger" src="bilder/eurofighter.svg" alt="">
        <span class="name">WILLI</span>
        <img class="schwinge" src="bilder/schwinge.png" alt="">
      </span>
    </button>
  </div>

  <p id="browserhinweis" class="she-untertitel" style="letter-spacing:.1em;padding-left:0;margin-top:8vh;display:none;">
    Bitte in Google Chrome öffnen. Andere Browser erkennen die Flug-Controls nicht.
  </p>
</main>
<script type="module" src="js/start.js?v=1"></script>
</body>
</html>
```

- [ ] **Step 3: Ablauf schreiben**

`js/start.js`:

```js
import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });

// Wer schon gewählt hat, geht direkt in den Übungsbereich.
if (speicher.profil()) {
  location.replace("uebersicht.html");
}

// Chrome-Hinweis: alles außer echtem Chrome bekommt die Warnung.
const istChrome = /Chrome\//.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent);
if (!istChrome) document.getElementById("browserhinweis").style.display = "block";

for (const knopf of document.querySelectorAll(".band")) {
  knopf.addEventListener("click", () => {
    speicher.setzeProfil(knopf.dataset.profil);
    knopf.classList.add("gezogen");
    setTimeout(() => location.href = "uebersicht.html", 550);
  });
}
```

- [ ] **Step 4: Sichtprüfung in Chrome**

Server aus Task 1 nutzt Port 8482. `http://localhost:8482/index.html` öffnen (vorher in den Entwicklerwerkzeugen `localStorage.clear()`), Bildschirmfoto: zwei Bänder mit LUIGI und WILLI, Aufdruck mittig auf dem Stoff. Klick auf WILLI: Band gleitet nach unten, danach lädt `uebersicht.html` (404 ist an dieser Stelle in Ordnung, die Seite entsteht in Task 6). Neu laden von `index.html`: leitet sofort nach `uebersicht.html` weiter.

- [ ] **Step 5: Commit**

```bash
git add index.html stil.css js/start.js
git commit -m "Startbildschirm: Profilwahl über zwei hängende Bänder"
```

---

### Task 6: Übersicht mit sechs Schildern und Profilmenü

**Files:**
- Create: `uebersicht.html`, `js/uebersicht.js`, `js/missionen.js`, `js/profilmenue.js`
- Modify: `stil.css` (Ergänzung am Ende)

**Interfaces:**
- Consumes: Speicher, `bilder/schild-01.png` bis `schild-06.png`, `bilder/anhaenger.png`, `bilder/eurofighter.svg`, `bilder/schwinge.png`.
- Produces: `MISSIONEN` aus `js/missionen.js`: Feld mit `{nr, name, kennzahlName}`. `oeffneProfilmenue(speicher)` aus `js/profilmenue.js` (hängt das Menü an `document.body`). Navigation zu `mission.html?bereich=N`.

- [ ] **Step 1: Missionsliste schreiben**

`js/missionen.js`:

```js
export const MISSIONEN = [
  { nr: 1, name: "Flugzeugverfolgung", kennzahlName: "Treffer %" },
  { nr: 2, name: "Multitasking Controls", kennzahlName: "Punkte" },
  { nr: 3, name: "60s Instrumentenflug", kennzahlName: "Punkte" },
  { nr: 4, name: "Instrumente merken", kennzahlName: "Richtige" },
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Richtige" },
  { nr: 6, name: "Psychologisches Gespräch", kennzahlName: "Punkte" },
];
```

- [ ] **Step 2: Stil für Übersicht, Schilder und Menü ergänzen**

Am Ende von `stil.css` anfügen:

```css
/* Übersicht: sechs Schilder */
.schildraster {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(14px, 2vw, 26px);
  max-width: 1200px;
  margin: 4vh auto 0;
  padding: 0 clamp(16px, 3vw, 40px) 40px;
}

.schild {
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  background: center / 100% 100% no-repeat;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8% 12%;
  font-family: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.schild:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(0, 0, 0, 0.7); }
.schild .nummer { font-size: clamp(9px, 1vw, 13px); letter-spacing: 0.3em; color: var(--tafel-neben); }
.schild .name { font-size: clamp(13px, 1.5vw, 21px); letter-spacing: 0.06em; color: var(--tafel-dunkel); margin-top: 5px; }

/* Profilanhänger rechts oben */
.profilanhaenger {
  position: fixed;
  top: 0;
  right: clamp(16px, 4vw, 60px);
  width: clamp(56px, 5.5vw, 78px);
  border: 0;
  background: transparent;
  cursor: pointer;
  z-index: 5;
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.55));
  transform-origin: top center;
  transition: transform 0.3s ease;
}
.profilanhaenger:hover { transform: rotate(2deg); }
.profilanhaenger img.stoff { display: block; width: 100%; height: auto; }
.profilanhaenger .aufdruck { position: absolute; left: 4%; right: 4%; top: 30%; text-align: center; color: #f7f0e7; }
.profilanhaenger .aufdruck img.flieger { width: 46%; display: block; margin: 0 auto; filter: brightness(1.35); }
.profilanhaenger .aufdruck .name { font-size: clamp(10px, 1vw, 13px); letter-spacing: 0.15em; display: block; margin-top: 12%; }
.profilanhaenger .aufdruck img.schwinge { width: 84%; display: block; margin: 4% auto 0; mix-blend-mode: screen; }

/* Profilmenü */
.menueschleier { position: fixed; inset: 0; background: rgba(5, 7, 4, 0.75); z-index: 9; }
.profilmenue {
  position: fixed;
  top: 0;
  right: clamp(8px, 3vw, 48px);
  width: min(360px, 92vw);
  background: #12170e;
  border: 1px solid #39422c;
  border-top: 0;
  border-radius: 0 0 10px 10px;
  padding: 18px;
  z-index: 10;
  color: var(--hell);
}
.profilmenue h2 { font-size: 15px; letter-spacing: 0.2em; color: var(--gedeckt); margin-bottom: 12px; }
.profilmenue .punkt {
  display: block;
  width: 100%;
  text-align: left;
  background: #1a2113;
  color: var(--hell);
  border: 1px solid #2c3520;
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: 8px;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.08em;
  cursor: pointer;
}
.profilmenue .punkt:hover { background: #232c18; }
.profilmenue .zustand { margin-top: 12px; font-size: 11px; letter-spacing: 0.1em; color: var(--gedeckt); }
```

- [ ] **Step 3: uebersicht.html schreiben**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Phase II · Übungsbereich</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="stil.css?v=3">
</head>
<body>
<main style="padding-top:7vh;">
  <h1 class="she-titel">PHASE II</h1>
  <p class="she-untertitel">FLIEGERISCHE EIGNUNG</p>
  <div class="schildraster" id="raster"></div>
</main>
<button class="profilanhaenger" id="anhaenger" aria-label="Profil und Einstellungen">
  <img class="stoff" src="bilder/anhaenger.png" alt="">
  <span class="aufdruck">
    <img class="flieger" src="bilder/eurofighter.svg" alt="">
    <span class="name" id="profilname"></span>
    <img class="schwinge" src="bilder/schwinge.png" alt="">
  </span>
</button>
<script type="module" src="js/uebersicht.js?v=1"></script>
</body>
</html>
```

- [ ] **Step 4: Ablauf der Übersicht schreiben**

`js/uebersicht.js`:

```js
import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { oeffneProfilmenue } from "./profilmenue.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });

if (!speicher.profil()) location.replace("index.html");

document.getElementById("profilname").textContent = (speicher.profil() ?? "").toUpperCase();

const raster = document.getElementById("raster");
for (const mission of MISSIONEN) {
  const knopf = document.createElement("button");
  knopf.className = "schild";
  knopf.style.backgroundImage = `url(bilder/schild-0${mission.nr}.png)`;
  knopf.innerHTML = `<span class="nummer">MISSION 0${mission.nr}</span><span class="name">${mission.name.toUpperCase()}</span>`;
  knopf.addEventListener("click", () => location.href = `mission.html?bereich=${mission.nr}`);
  raster.append(knopf);
}

document.getElementById("anhaenger").addEventListener("click", () => oeffneProfilmenue(speicher));

speicher.synce(); // liegengebliebene Läufe bestmöglich nachmelden
```

- [ ] **Step 5: Profilmenü schreiben**

`js/profilmenue.js` (Controls-Dialog kommt in Task 7 dazu, hier zunächst der Menürahmen):

```js
// Profilmenü hinter dem Anhänger: wechseln, Controls, zurücksetzen, Zustand.

const ZUSTANDSTEXT = {
  verbunden: "Datendienst: verbunden",
  getrennt: "Datendienst: getrennt, Läufe werden nachgemeldet",
  "ohne-zugang": "Datendienst: noch nicht eingerichtet, Läufe bleiben örtlich",
};

export function oeffneProfilmenue(speicher, { oeffneControls } = {}) {
  const schleier = document.createElement("div");
  schleier.className = "menueschleier";
  const menue = document.createElement("div");
  menue.className = "profilmenue";
  menue.innerHTML = `
    <h2>PILOT: ${(speicher.profil() ?? "").toUpperCase()}</h2>
    <button class="punkt" data-tat="wechseln">Profil wechseln</button>
    <button class="punkt" data-tat="controls">Controls einrichten</button>
    <button class="punkt" data-tat="zuruecksetzen">Ergebnisse zurücksetzen</button>
    <p class="zustand">${ZUSTANDSTEXT[speicher.zustand()]}</p>
  `;

  const schliesse = () => { schleier.remove(); menue.remove(); };
  schleier.addEventListener("click", schliesse);

  menue.addEventListener("click", async (ereignis) => {
    const tat = ereignis.target.dataset?.tat;
    if (tat === "wechseln") {
      speicher.setzeProfil(null);
      location.href = "index.html";
    }
    if (tat === "controls") {
      schliesse();
      if (oeffneControls) oeffneControls();
      else alert("Die Controls-Einrichtung folgt im nächsten Bauabschnitt.");
    }
    if (tat === "zuruecksetzen") {
      const profil = speicher.profil();
      const sicher = confirm(`Wirklich alle Ergebnisse von ${profil.toUpperCase()} löschen? Das lässt sich nicht rückgängig machen.`);
      if (sicher) {
        await speicher.loescheLaeufe(profil, null);
        alert("Ergebnisse gelöscht.");
        schliesse();
      }
    }
  });

  document.body.append(schleier, menue);
}
```

- [ ] **Step 6: Sichtprüfung in Chrome**

`http://localhost:8482/uebersicht.html` öffnen. Bildschirmfoto gegen den abgenommenen Stand halten (`hub-entwurf-final-v3` aus der Entwurfsphase): Titel mittig, sechs Schilder mit individuellem Rost in zwei Dreierreihen, Anhänger hängt rechts oben an der Oberkante. Menü öffnen: vier Einträge sichtbar, Zustand zeigt "noch nicht eingerichtet". "Profil wechseln" führt zur Profilwahl zurück. Klick auf ein Schild führt zu `mission.html?bereich=N` (404 an dieser Stelle in Ordnung).

- [ ] **Step 7: Commit**

```bash
git add uebersicht.html js/uebersicht.js js/missionen.js js/profilmenue.js stil.css
git commit -m "Übersicht: sechs Missionsschilder, Profilanhänger und Profilmenü"
```

---

### Task 7: Controls-Anbindung mit Anlernen über mehrere Geräte

**Files:**
- Create: `js/controls.js`
- Modify: `js/profilmenue.js` (Controls-Dialog anschließen), `js/uebersicht.js` (Controls hereinreichen), `stil.css` (Dialogstil), `uebersicht.html` (Versionsmarken)

**Interfaces:**
- Consumes: `mitKurve`, `groessterAusschlag` aus `js/kurve.js`; Speicher-Einstellungen (`zuordnung`, `totzone`, `expo`, `empfindlichkeit`).
- Produces: `erzeugeControls(speicher) -> controls` mit:
  - `controls.lade() -> Promise<void>` (Zuordnung und Regler aus den Einstellungen)
  - `controls.wert(rolle) -> number|null` (Rollen: `"stickX" | "stickY" | "schub" | "ruder"`; null, wenn nicht zugewiesen oder Gerät fehlt)
  - `controls.knopfGedrueckt() -> boolean` (Flanke über alle Knöpfe aller Geräte)
  - `controls.geraete() -> [{kennung, achsen, knoepfe}]`
  - `controls.starteFang(rolle, beiTreffer)` / `controls.brichFangAb()`
  - `controls.oeffneDialog()` (Einrichtungsdialog mit Geräteliste, Zuweisen, Umkehren, Rohachsen, Reglern)
- Tastatur-Ersatz: Pfeile = Stick, A/D = Ruder, W/S = Schub (integrierend), Leertaste = Knopf.

- [ ] **Step 1: controls.js schreiben**

```js
// Gamepad-Anbindung: Anlernen über alle Geräte, Kurven, Tastatur-Ersatz.
import { mitKurve, groessterAusschlag } from "./kurve.js";

const ROLLEN = [
  ["stickX", "Stick quer"],
  ["stickY", "Stick längs"],
  ["schub", "Schubregler"],
  ["ruder", "Seitenruder"],
];

export function erzeugeControls(speicher) {
  let zuordnung = {};        // rolle -> {geraet, achse, invert}
  let totzone = 0.06;
  let expo = 0;
  let knopfAlt = false;
  let fang = null;           // {rolle, basen, beiTreffer}
  const tasten = new Set();
  let schubTastatur = 0.45;

  addEventListener("keydown", (e) => tasten.add(e.code));
  addEventListener("keyup", (e) => tasten.delete(e.code));

  const pads = () => [...(navigator.getGamepads?.() ?? [])].filter(Boolean);
  const alsFeld = () => pads().map((p) => ({ geraet: p.id, achsen: [...p.axes] }));

  function tastaturWert(rolle) {
    const paare = {
      stickX: ["ArrowLeft", "ArrowRight"],
      stickY: ["ArrowUp", "ArrowDown"],
      ruder: ["KeyA", "KeyD"],
    };
    if (rolle === "schub") {
      if (tasten.has("KeyW")) schubTastatur = Math.min(1, schubTastatur + 0.02);
      if (tasten.has("KeyS")) schubTastatur = Math.max(0, schubTastatur - 0.02);
      return schubTastatur * 2 - 1;
    }
    const [minus, plus] = paare[rolle];
    return (tasten.has(plus) ? 1 : 0) - (tasten.has(minus) ? 1 : 0);
  }

  return {
    ROLLEN,

    async lade() {
      zuordnung = await speicher.ladeEinstellung("zuordnung", {});
      totzone = await speicher.ladeEinstellung("totzone", 0.06);
      expo = await speicher.ladeEinstellung("expo", 0);
    },

    geraete() {
      return pads().map((p) => ({ kennung: p.id, achsen: p.axes.length, knoepfe: p.buttons.length }));
    },

    wert(rolle) {
      const z = zuordnung[rolle];
      if (z) {
        const pad = pads().find((p) => p.id === z.geraet);
        if (pad && z.achse < pad.axes.length) {
          const roh = pad.axes[z.achse] * (z.invert ? -1 : 1);
          return mitKurve(roh, totzone, expo);
        }
      }
      return tastaturWert(rolle);
    },

    knopfGedrueckt() {
      const jetzt = pads().some((p) => p.buttons.some((k) => k.pressed)) || tasten.has("Space");
      const flanke = jetzt && !knopfAlt;
      knopfAlt = jetzt;
      return flanke;
    },

    starteFang(rolle, beiTreffer) {
      fang = { rolle, basen: alsFeld(), beiTreffer };
      const pruefe = () => {
        if (!fang) return;
        const treffer = groessterAusschlag(fang.basen, alsFeld(), 0.55);
        if (treffer) {
          zuordnung[fang.rolle] = { geraet: treffer.geraet, achse: treffer.achse, invert: false };
          speicher.setzeEinstellung("zuordnung", zuordnung);
          const rolle = fang.rolle;
          fang = null;
          beiTreffer(rolle, treffer);
        } else {
          requestAnimationFrame(pruefe);
        }
      };
      requestAnimationFrame(pruefe);
    },

    brichFangAb() { fang = null; },

    zuordnungVon(rolle) { return zuordnung[rolle] ?? null; },

    async kehreUm(rolle) {
      if (!zuordnung[rolle]) return;
      zuordnung[rolle].invert = !zuordnung[rolle].invert;
      await speicher.setzeEinstellung("zuordnung", zuordnung);
    },

    async setzeRegler(name, wert) {
      if (name === "totzone") totzone = wert;
      if (name === "expo") expo = wert;
      await speicher.setzeEinstellung(name, wert);
    },

    regler() { return { totzone, expo }; },

    oeffneDialog() {
      const schleier = document.createElement("div");
      schleier.className = "menueschleier";
      const dialog = document.createElement("div");
      dialog.className = "profilmenue controlsdialog";
      const rollenZeilen = ROLLEN.map(([rolle, titel]) => `
        <div class="rollenzeile" data-rolle="${rolle}">
          <span class="rollentitel">${titel}</span>
          <span class="rollenstand" id="stand-${rolle}"></span>
          <button class="punkt klein" data-tat="zuweisen" data-rolle="${rolle}">Zuweisen</button>
          <button class="punkt klein" data-tat="umkehren" data-rolle="${rolle}">Umkehren</button>
        </div>`).join("");
      dialog.innerHTML = `
        <h2>CONTROLS · ${(speicher.profil() ?? "").toUpperCase()}</h2>
        <p class="zustand" id="geraeteliste"></p>
        <p class="zustand">Gerät anschließen und eine Taste daran drücken, dann erscheint es hier.</p>
        ${rollenZeilen}
        <label class="zustand">Totzone <input type="range" id="totzone" min="0" max="0.2" step="0.01"></label>
        <label class="zustand">Expo <input type="range" id="expo" min="0" max="1" step="0.05"></label>
        <p class="zustand" id="rohachsen"></p>
        <button class="punkt" data-tat="schliessen">Fertig</button>
      `;
      const schliesse = () => { this.brichFangAb(); schleier.remove(); dialog.remove(); halteAn = true; };
      schleier.addEventListener("click", schliesse);

      const zeigeStand = () => {
        for (const [rolle] of ROLLEN) {
          const z = this.zuordnungVon(rolle);
          dialog.querySelector(`#stand-${rolle}`).textContent =
            z ? `${z.geraet.slice(0, 18)}… Achse ${z.achse}${z.invert ? " umgekehrt" : ""}` : "nicht zugewiesen";
        }
      };

      dialog.addEventListener("click", (e) => {
        const tat = e.target.dataset?.tat;
        if (tat === "schliessen") schliesse();
        if (tat === "umkehren") this.kehreUm(e.target.dataset.rolle).then(zeigeStand);
        if (tat === "zuweisen") {
          e.target.textContent = "Bewegen…";
          this.starteFang(e.target.dataset.rolle, () => { e.target.textContent = "Zuweisen"; zeigeStand(); });
        }
      });

      dialog.querySelector("#totzone").value = this.regler().totzone;
      dialog.querySelector("#expo").value = this.regler().expo;
      dialog.querySelector("#totzone").addEventListener("input", (e) => this.setzeRegler("totzone", Number(e.target.value)));
      dialog.querySelector("#expo").addEventListener("input", (e) => this.setzeRegler("expo", Number(e.target.value)));

      let halteAn = false;
      const takt = () => {
        if (halteAn) return;
        dialog.querySelector("#geraeteliste").textContent = this.geraete()
          .map((g) => `${g.kennung.slice(0, 26)} (${g.achsen} Achsen, ${g.knoepfe} Knöpfe)`)
          .join(" · ") || "Kein Gerät erkannt.";
        dialog.querySelector("#rohachsen").textContent = pads()
          .map((p) => p.axes.map((a) => a.toFixed(2)).join(" "))
          .join(" | ");
        requestAnimationFrame(takt);
      };

      document.body.append(schleier, dialog);
      zeigeStand();
      requestAnimationFrame(takt);
    },
  };
}
```

- [ ] **Step 2: Dialogstil ergänzen**

Am Ende von `stil.css`:

```css
.controlsdialog { max-height: 86vh; overflow-y: auto; }
.rollenzeile { display: grid; grid-template-columns: 1fr auto auto; gap: 6px; align-items: center; margin-top: 8px; font-size: 12px; }
.rollenzeile .rollentitel { letter-spacing: 0.08em; }
.rollenzeile .rollenstand { grid-column: 1 / -1; font-size: 10px; color: var(--gedeckt); }
.punkt.klein { width: auto; margin-top: 0; padding: 6px 10px; font-size: 11px; }
.controlsdialog input[type="range"] { width: 100%; }
```

- [ ] **Step 3: Anschließen an Übersicht und Menü**

In `js/uebersicht.js` ergänzen (Import oben, Verdrahtung unten):

```js
import { erzeugeControls } from "./controls.js";

const controls = erzeugeControls(speicher);
controls.lade();

document.getElementById("anhaenger").addEventListener("click", () =>
  oeffneProfilmenue(speicher, { oeffneControls: () => controls.oeffneDialog() }));
```

Der bisherige Anhänger-Listener aus Task 6 wird durch diesen ersetzt (nur eine Registrierung). In `uebersicht.html` die Versionsmarke des Skripts hochzählen (`js/uebersicht.js?v=2`).

- [ ] **Step 4: Sichtprüfung mit Gerät**

`http://localhost:8482/uebersicht.html` in Chrome, Menü öffnen, "Controls einrichten": Geräteliste erscheint nach Tastendruck am Joystick, "Zuweisen" bei Stick quer klicken, Stick bewegen, Zuordnung erscheint mit Gerätenamen und Achsennummer. Rohachsen zappeln sichtbar. Ohne Gerät: "Kein Gerät erkannt." und die Übung bleibt über Tastatur nutzbar. Diese Prüfung braucht den echten Thrustmaster an Willis Rechner; falls gerade kein Gerät angeschlossen ist, die Prüfung als offenen Punkt an Willi zurückmelden.

- [ ] **Step 5: Alle Tests laufen lassen**

Run: `node --test tests/`
Erwartet: PASS (17 Tests, unverändert).

- [ ] **Step 6: Commit**

```bash
git add js/controls.js js/profilmenue.js js/uebersicht.js stil.css uebersicht.html
git commit -m "Controls: Anlernen über alle Geräte, Kurvenregler und Einrichtungsdialog"
```

---

### Task 8: Missionsseite mit Auswertung, Vergleich und Platzhalter-Lauf

**Files:**
- Create: `mission.html`, `js/mission.js`
- Modify: `stil.css` (Ergänzung am Ende)

**Interfaces:**
- Consumes: `MISSIONEN`, Speicher, Auswertung (`sortiertNeueste`, `bestwert`, `durchschnitt`, `vergleich`), Controls (`knopfGedrueckt` für den Platzhalter-Lauf).
- Produces: Seite `mission.html?bereich=N`. Der Platzhalter-Lauf schreibt echte Lauf-Datensätze und wird später je Bereich durch die echte Übung ersetzt (einzige Stelle: Funktion `starteLauf` in `js/mission.js`).

- [ ] **Step 1: Stil ergänzen**

Am Ende von `stil.css`:

```css
/* Missionsseite */
.missionsraster {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: clamp(16px, 2vw, 30px);
  max-width: 1100px;
  margin: 4vh auto 0;
  padding: 0 clamp(16px, 3vw, 40px) 40px;
}
.missionsfeld {
  border-radius: 10px;
  background: rgba(10, 13, 8, 0.72);
  border: 1px solid #39422c;
  padding: clamp(16px, 2vw, 28px);
}
.missionsfeld h2 { font-size: 13px; letter-spacing: 0.25em; color: var(--gedeckt); margin-bottom: 14px; }
.startknopf {
  display: block;
  margin: 30px auto;
  padding: 16px 44px;
  font-family: inherit;
  font-size: 20px;
  letter-spacing: 0.2em;
  color: var(--tafel-dunkel);
  background: url("bilder/schild-01.png") center / 100% 100% no-repeat;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.55);
}
.laufliste { list-style: none; font-size: 13px; }
.laufliste li { display: flex; justify-content: space-between; padding: 4px 0; color: var(--gedeckt); }
.laufliste li b { color: var(--hell); }
.kennzeile { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-top: 1px dashed #39422c; margin-top: 6px; }
.balkenpaar { margin-top: 8px; font-size: 12px; }
.balken { height: 7px; border-radius: 4px; background: #1a2113; margin: 4px 0 10px; overflow: hidden; }
.balken span { display: block; height: 100%; }
.balken.willi span { background: #9fb98a; }
.balken.luigi span { background: #c8a24a; }
.zurueck { position: fixed; top: 16px; left: clamp(16px, 3vw, 40px); z-index: 5; background: transparent; border: 0; color: var(--gedeckt); font-family: inherit; font-size: 13px; letter-spacing: 0.15em; cursor: pointer; }
.zurueck:hover { color: var(--hell); }

/* Platzhalter-Lauf im Vollbild */
.laufschleier { position: fixed; inset: 0; background: #0b0f08; z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.laufschleier .gross { font-size: 64px; }
.laufschleier .hinweis { color: var(--gedeckt); font-size: 14px; letter-spacing: 0.1em; text-align: center; }
```

- [ ] **Step 2: mission.html schreiben**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Phase II · Mission</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="stil.css?v=4">
</head>
<body>
<button class="zurueck" onclick="location.href='uebersicht.html'">◄ ÜBERSICHT</button>
<main style="padding-top:7vh;">
  <h1 class="she-titel" id="missionstitel"></h1>
  <p class="she-untertitel" id="missionsnummer"></p>
  <div class="missionsraster">
    <section class="missionsfeld">
      <h2>MISSION</h2>
      <p id="uebungshinweis" style="font-size:13px;color:var(--gedeckt);letter-spacing:.05em;">
        Die echte Übung entsteht in einem eigenen Bauabschnitt. Der Probelauf prüft Speicherung,
        Auswertung und Vergleich: 10 Sekunden, jeder Klick oder Knopfdruck zählt einen Punkt.
      </p>
      <button class="startknopf" id="start">START</button>
      <p class="zustand" id="geraetestand" style="font-size:11px;color:var(--gedeckt);text-align:center;"></p>
    </section>
    <section class="missionsfeld">
      <h2>AUSWERTUNG</h2>
      <ul class="laufliste" id="laufliste"></ul>
      <div class="kennzeile"><span>Bestwert</span><b id="bestwert">–</b></div>
      <div class="kennzeile"><span>Durchschnitt</span><b id="durchschnitt">–</b></div>
      <h2 style="margin-top:18px;">VERGLEICH</h2>
      <div class="balkenpaar" id="vergleich"></div>
    </section>
  </div>
</main>
<script type="module" src="js/mission.js?v=1"></script>
</body>
</html>
```

- [ ] **Step 3: mission.js schreiben**

```js
import { KONFIG } from "./konfig.js";
import { erzeugeSpeicher } from "./speicher.js";
import { MISSIONEN } from "./missionen.js";
import { sortiertNeueste, bestwert, durchschnitt, vergleich } from "./auswertung.js";
import { erzeugeControls } from "./controls.js";

const speicher = erzeugeSpeicher({ konfig: KONFIG });
if (!speicher.profil()) location.replace("index.html");

const nr = Number(new URLSearchParams(location.search).get("bereich"));
const mission = MISSIONEN.find((m) => m.nr === nr);
if (!mission) location.replace("uebersicht.html");

const controls = erzeugeControls(speicher);
controls.lade();

document.getElementById("missionstitel").textContent = mission.name.toUpperCase();
document.getElementById("missionsnummer").textContent = `MISSION 0${mission.nr}`;

async function zeichneAuswertung() {
  const laeufe = await speicher.ladeLaeufe(mission.nr);
  const eigene = laeufe.filter((l) => l.profil === speicher.profil());
  const liste = document.getElementById("laufliste");
  liste.innerHTML = sortiertNeueste(eigene).slice(0, 6)
    .map((l) => `<li><span>${l.zeitpunkt.slice(0, 10)}</span><b>${l.kennzahl} ${mission.kennzahlName}</b></li>`)
    .join("") || "<li><span>Noch kein Lauf</span></li>";
  document.getElementById("bestwert").textContent = bestwert(eigene) ?? "–";
  document.getElementById("durchschnitt").textContent = durchschnitt(eigene) ?? "–";

  const v = vergleich(laeufe);
  const maximum = Math.max(v.willi.durchschnitt ?? 0, v.luigi.durchschnitt ?? 0, 1);
  document.getElementById("vergleich").innerHTML = ["willi", "luigi"].map((profil) => `
    <div style="display:flex;justify-content:space-between;"><span>${profil.toUpperCase()}</span>
      <span>Ø ${v[profil].durchschnitt ?? "–"} · Best ${v[profil].bestwert ?? "–"} · ${v[profil].anzahl} Läufe</span></div>
    <div class="balken ${profil}"><span style="width:${((v[profil].durchschnitt ?? 0) / maximum) * 100}%"></span></div>
  `).join("");
}

function zeichneGeraete() {
  const geraete = controls.geraete();
  document.getElementById("geraetestand").textContent = geraete.length
    ? geraete.map((g) => g.kennung.slice(0, 22)).join(" · ")
    : "Kein Gerät erkannt. Anschließen und eine Taste am Gerät drücken. Tastatur geht auch.";
}

// Platzhalter-Lauf: wird je Bereich durch die echte Übung ersetzt.
function starteLauf() {
  const schleier = document.createElement("div");
  schleier.className = "laufschleier";
  schleier.innerHTML = `
    <div class="gross" id="zaehler">0</div>
    <div class="hinweis">PROBELAUF · 10 SEKUNDEN<br>Klicken oder Feuerknopf drücken, jeder Treffer zählt.</div>
    <div class="hinweis" id="restzeit">10,0 s</div>`;
  document.body.append(schleier);
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});

  let punkte = 0;
  const ende = performance.now() + 10_000;
  schleier.addEventListener("pointerdown", () => { punkte += 1; });

  const takt = async () => {
    if (controls.knopfGedrueckt()) punkte += 1;
    document.getElementById("zaehler").textContent = punkte;
    const rest = Math.max(0, ende - performance.now());
    document.getElementById("restzeit").textContent = `${(rest / 1000).toFixed(1)} s`;
    if (rest > 0) { requestAnimationFrame(takt); return; }
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    schleier.remove();
    await speicher.speichereLauf({
      profil: speicher.profil(),
      bereich: mission.nr,
      zeitpunkt: new Date().toISOString(),
      kennzahl: punkte,
      daten: { art: "probelauf" },
    });
    zeichneAuswertung();
  };
  requestAnimationFrame(takt);
}

document.getElementById("start").addEventListener("click", starteLauf);
addEventListener("keydown", (e) => { if (e.key === "Escape" && document.querySelector(".laufschleier")) location.reload(); });

zeichneAuswertung();
zeichneGeraete();
setInterval(zeichneGeraete, 2000);
speicher.synce();
```

- [ ] **Step 4: Sichtprüfung in Chrome**

`http://localhost:8482/mission.html?bereich=1` öffnen: Titel FLUGZEUGVERFOLGUNG, links Startknopf, rechts Auswertung mit "Noch kein Lauf". Probelauf starten, ein paarmal klicken, nach 10 Sekunden: Auswertung zeigt den Lauf, Bestwert und Durchschnitt stimmen, Vergleich zeigt den Lauf beim eigenen Profil. Zweiten Lauf machen: Liste wächst, Durchschnitt ändert sich. Escape während des Laufs bricht ab. Zurück-Knopf führt zur Übersicht.

- [ ] **Step 5: Alle Tests laufen lassen**

Run: `node --test tests/`
Erwartet: PASS.

- [ ] **Step 6: Commit**

```bash
git add mission.html js/mission.js stil.css
git commit -m "Missionsseite: Auswertung, Vergleich und Probelauf im Vollbild"
```

---

### Task 9: Auslieferung über GitHub Pages und Supabase-Anbindung

**Files:**
- Modify: `js/konfig.js` (Zugangsdaten), `README.md` (Create), `CLAUDE.md` (Create)

**Interfaces:**
- Consumes: alles Bisherige.
- Produces: öffentliche Adresse für beide Nutzer, gefüllte `KONFIG`, Projekt-Anleitung.

- [ ] **Step 1: README und CLAUDE.md schreiben**

`README.md`:

```markdown
# Phase-II-App

Vorbereitungs-App für die fliegerische Phase II. Zwei Profile (Willi, Luigi),
sechs Übungsbereiche, gemeinsame Ergebnisse über Supabase.

Nutzung: feste GitHub-Pages-Adresse in Chrome öffnen. Änderungen erreichen
beide Nutzer mit dem nächsten Push.

Entwicklung örtlich: `python3 -m http.server 8482` im Projektordner,
dann `http://localhost:8482/`. Prüfungen: `node --test tests/`.
```

`CLAUDE.md`:

```markdown
# Phase-II-App

- Entwurf: `docs/superpowers/specs/2026-08-22-phase2-app-design.md` ist die Referenz.
- Immer in Chrome prüfen, Safari kennt die Gamepad-Geräte nicht.
- Nach jeder Änderung an einer eingebundenen Datei die Versionsmarke (`?v=N`) hochzählen.
- Reine Logik gehört in eigene Module unter `js/` und bekommt Tests unter `tests/` (`node --test tests/`).
- Oberfläche, Bezeichner und Commits auf Deutsch, keine Gedankenstriche, keine Emojis.
- Bilder nur aus `bilder/`; der Quellbestand liegt unter `entwurf/bilder/`.
- Supabase-Zugang steht in `js/konfig.js`; ohne ihn läuft die App örtlich weiter (Zustand "ohne-zugang").
- Die sechs Übungen ersetzen den Probelauf einzeln; Einstieg ist `starteLauf` in `js/mission.js`.
```

- [ ] **Step 2: GitHub-Repository anlegen und Pages einschalten**

```bash
cd "/Users/o_o/Desktop/Claude/Phase II/App"
gh repo create phase2-app --private --source=. --push
gh api repos/{owner}/phase2-app/pages -X POST -f build_type=workflow 2>/dev/null || gh api repos/{owner}/phase2-app/pages -X POST -f "source[branch]=main" -f "source[path]=/"
gh api repos/{owner}/phase2-app/pages --jq .html_url
```
Erwartet: eine Adresse der Form `https://<name>.github.io/phase2-app/`. Hinweis: Bei privaten Repositories verlangt GitHub Pages einen bezahlten Plan; falls die Pages-Einrichtung deshalb scheitert, Willi fragen, ob das Repository öffentlich sein darf (die App enthält keine Geheimnisse außer dem öffentlichen Supabase-Schlüssel), und mit `gh repo edit --visibility public --accept-visibility-change-consequences` umstellen, dann Pages erneut einschalten.

- [ ] **Step 3: Supabase-Projekt anlegen (mit Willi zusammen)**

Willi legt unter supabase.com ein kostenloses Projekt an (oder gibt mir die Browserführung frei). Im SQL-Editor dieses Schema ausführen:

```sql
create table laeufe (
  id bigint generated always as identity primary key,
  profil text not null check (profil in ('willi','luigi')),
  bereich int not null check (bereich between 1 and 6),
  zeitpunkt timestamptz not null,
  kennzahl double precision not null,
  daten jsonb not null default '{}'::jsonb
);
alter table laeufe enable row level security;
create policy "lesen" on laeufe for select using (true);
create policy "schreiben" on laeufe for insert with check (true);
create policy "loeschen" on laeufe for delete using (true);

create table einstellungen (
  profil text not null,
  schluessel text not null,
  wert jsonb not null,
  primary key (profil, schluessel)
);
alter table einstellungen enable row level security;
create policy "lesen" on einstellungen for select using (true);
create policy "schreiben" on einstellungen for insert with check (true);
create policy "aendern" on einstellungen for update using (true);
```

Danach Projekt-Adresse und den öffentlichen Schlüssel (anon key) in `js/konfig.js` eintragen und die Versionsmarken der einbindenden Seiten hochzählen.

- [ ] **Step 4: Ende-zu-Ende-Prüfung**

Auf der GitHub-Pages-Adresse in Chrome: Profil wählen, Probelauf in Mission 1 machen. In einem zweiten Chrome-Fenster (Inkognito, damit eigenes Lager) das andere Profil wählen, ebenfalls einen Probelauf machen. Prüfen: Beide Fenster zeigen im Vergleich beide Profile mit Zahlen. Profilmenü zeigt "Datendienst: verbunden".

- [ ] **Step 5: Commit und Push**

```bash
git add README.md CLAUDE.md js/konfig.js index.html uebersicht.html mission.html
git commit -m "Auslieferung: GitHub Pages, Supabase-Zugang und Projektanleitung"
git push
```

---

## Offene Punkte nach diesem Plan

- Bereich 1 (Flugzeugverfolgung) als erste echte Übung entwerfen und den Probelauf dort ersetzen.
- Startbildschirm-Bänder gegebenenfalls in höherer Auflösung neu erzeugen, falls die vorhandene `anhaenger.png` groß dargestellt zu weich wirkt.
- Prüfung der Controls mit Willis echtem Gerätepark (Joystick, Schubhebel, Pedale).
