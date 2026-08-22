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

test("doppelter speichereLauf offline erzeugt nur einen Warteschlangen-Eintrag und einen POST", async () => {
  let kaputt = true;
  const posts = [];
  const fetchFn = async (adresse, optionen = {}) => {
    if (kaputt) throw new Error("kein Netz");
    if ((optionen.method ?? "GET") === "POST") posts.push(adresse);
    return { ok: true, json: async () => [] };
  };
  const s = erzeugeSpeicher({ konfig, fetchFn, lager: attrappenLager() });
  await s.speichereLauf(lauf);
  await s.speichereLauf(lauf);
  kaputt = false;
  await s.synce();
  assert.equal(posts.length, 1);
});

test("URL ohne Schlüssel zählt als ohne-zugang und ruft fetch nie", async () => {
  const s = erzeugeSpeicher({
    konfig: { supabaseUrl: "https://beispiel.supabase.co", supabaseKey: "", version: 1 },
    fetchFn: async () => { throw new Error("darf nicht gerufen werden"); },
    lager: attrappenLager(),
  });
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

test("volles Speicherkontingent verliert keinen Lauf: Sendung geht trotzdem raus", async () => {
  const posts = [];
  const kaputtesLager = (() => {
    const m = new Map();
    return {
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => { if (k === "p2-laeufe") throw new Error("QuotaExceededError"); m.set(k, String(v)); },
    };
  })();
  const fetchFn = async (adresse, optionen = {}) => {
    if ((optionen.method ?? "GET") === "POST") posts.push(adresse);
    return { ok: true, json: async () => [] };
  };
  const s = erzeugeSpeicher({ konfig, fetchFn, lager: kaputtesLager });
  await s.speichereLauf(lauf);
  assert.equal(posts.length, 1);
});

test("waehrend synce eingereihte Laeufe gehen nicht verloren", async () => {
  const lauf3 = { ...lauf, zeitpunkt: "2026-08-23T10:00:00Z" };
  let s;
  let erster = true;
  const fetchFn = async (adresse, optionen = {}) => {
    if ((optionen.method ?? "GET") !== "POST") return { ok: true, json: async () => [] };
    const inhalt = JSON.parse(optionen.body);
    if (inhalt.zeitpunkt === lauf3.zeitpunkt) throw new Error("kein Netz");
    if (erster) {
      erster = false;
      await s.speichereLauf(lauf3);
    }
    return { ok: true, json: async () => [] };
  };
  const lager = attrappenLager();
  s = erzeugeSpeicher({ konfig, fetchFn: async () => { throw new Error("kein Netz"); }, lager });
  await s.speichereLauf(lauf);
  s = erzeugeSpeicher({ konfig, fetchFn, lager });
  await s.synce();
  const schlange = JSON.parse(lager.getItem("p2-warteschlange"));
  assert.equal(schlange.length, 1);
  assert.equal(schlange[0].zeitpunkt, lauf3.zeitpunkt);
});

test("dauerhafte Ablehnung landet nicht in der Warteschlange und gilt als verbunden", async () => {
  const fetchFn = async () => ({ ok: false, status: 409, json: async () => [] });
  const lager = attrappenLager();
  const s = erzeugeSpeicher({ konfig, fetchFn, lager });
  await assert.rejects(s.speichereLauf(lauf), (f) => f.dauerhaft === true);
  assert.equal(s.zustand(), "verbunden");
  assert.equal(JSON.parse(lager.getItem("p2-warteschlange") ?? "[]").length, 0);
});

test("scheitert das Einreihen nach Netzfehler, wird der Fehler durchgereicht", async () => {
  const m = new Map();
  const lager = {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => { if (k === "p2-warteschlange") throw new Error("QuotaExceededError"); m.set(k, String(v)); },
  };
  const s = erzeugeSpeicher({ konfig, fetchFn: async () => { throw new Error("kein Netz"); }, lager });
  await assert.rejects(s.speichereLauf(lauf));
});

test("auf anderem Geraet geloeschte Laeufe erstehen nicht wieder auf", async () => {
  const lager = attrappenLager();
  lager.setItem("p2-laeufe", JSON.stringify([lauf]));
  const fetchFn = async () => ({ ok: true, json: async () => [] });
  const s = erzeugeSpeicher({ konfig, fetchFn, lager });
  assert.equal((await s.ladeLaeufe(1)).length, 0);
  assert.equal(JSON.parse(lager.getItem("p2-laeufe")).filter((l) => l.bereich === 1).length, 0);
});

test("entnommene Methoden funktionieren ohne this-Bindung", async () => {
  const s = erzeugeSpeicher({ konfig: { supabaseUrl: "", supabaseKey: "", version: 1 }, fetchFn: async () => ({ ok: true, json: async () => [] }), lager: attrappenLager() });
  const { setzeProfil, profil, setzeEinstellung, ladeEinstellung } = s;
  setzeProfil("willi");
  assert.equal(profil(), "willi");
  await setzeEinstellung("totzone", 0.1);
  assert.equal(await ladeEinstellung("totzone", 0.06), 0.1);
});

test("Lauf-POST traegt on_conflict und ignore-duplicates, doppelte Online-Sendung wird dadurch unschaedlich", async () => {
  const rufe = [];
  const fetchFn = async (adresse, optionen = {}) => {
    if ((optionen.method ?? "GET") === "POST") rufe.push({ adresse, headers: optionen.headers });
    return { ok: true, json: async () => [] };
  };
  const s = erzeugeSpeicher({ konfig, fetchFn, lager: attrappenLager() });
  await s.speichereLauf(lauf);
  await s.speichereLauf(lauf);
  assert.equal(rufe.length, 2);
  for (const r of rufe) {
    assert.ok(r.adresse.includes("on_conflict=profil,bereich,zeitpunkt"));
    assert.equal(r.headers.Prefer, "resolution=ignore-duplicates");
  }
});

test("synce traegt dauerhaft abgelehnte Laeufe aus der Warteschlange aus und wiederholt sie nicht", async () => {
  let versuche = 0;
  const fetchFn = async (adresse, optionen = {}) => {
    if ((optionen.method ?? "GET") === "POST") { versuche += 1; return { ok: false, status: 400, json: async () => [] }; }
    return { ok: true, json: async () => [] };
  };
  const lager = attrappenLager();
  const offlineS = erzeugeSpeicher({ konfig, fetchFn: async () => { throw new Error("kein Netz"); }, lager });
  await offlineS.speichereLauf(lauf);
  const s = erzeugeSpeicher({ konfig, fetchFn, lager });
  await s.synce();
  await s.synce();
  assert.equal(versuche, 1);
  assert.equal(JSON.parse(lager.getItem("p2-warteschlange") ?? "[]").length, 0);
});

test("synce laesst Laeufe bei Netzfehler in der Warteschlange liegen", async () => {
  const lager = attrappenLager();
  const offlineS = erzeugeSpeicher({ konfig, fetchFn: async () => { throw new Error("kein Netz"); }, lager });
  await offlineS.speichereLauf(lauf);
  const s = erzeugeSpeicher({ konfig, fetchFn: async () => { throw new Error("immer noch kein Netz"); }, lager });
  await s.synce();
  const schlange = JSON.parse(lager.getItem("p2-warteschlange"));
  assert.equal(schlange.length, 1);
  assert.equal(s.zustand(), "getrennt");
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

test("synce prueft bei leerer Warteschlange die Verbindung", async () => {
  const rufe = [];
  const fetchFn = async (adresse, optionen = {}) => {
    rufe.push({ adresse, methode: optionen.method ?? "GET" });
    return { ok: true, json: async () => [] };
  };
  const s = erzeugeSpeicher({ konfig, fetchFn, lager: attrappenLager() });
  assert.equal(s.zustand(), "getrennt");
  await s.synce();
  assert.equal(s.zustand(), "verbunden");
  assert.equal(rufe.length, 1);
  assert.equal(rufe[0].methode, "GET");
});

test("loescheLaeufe reicht Netzfehler durch und laesst die oertliche Kopie stehen", async () => {
  const lager = attrappenLager();
  lager.setItem("p2-laeufe", JSON.stringify([lauf]));
  const s = erzeugeSpeicher({ konfig, fetchFn: async () => { throw new Error("kein Netz"); }, lager });
  await assert.rejects(s.loescheLaeufe("willi", null));
  assert.equal(JSON.parse(lager.getItem("p2-laeufe")).length, 1);
});

test("loescheLaeufe ohne Zugang leert nur oertlich und wirft nicht", async () => {
  const lager = attrappenLager();
  lager.setItem("p2-laeufe", JSON.stringify([lauf]));
  const s = erzeugeSpeicher({ konfig: { supabaseUrl: "", supabaseKey: "", version: 1 }, fetchFn: async () => { throw new Error("darf nicht gerufen werden"); }, lager });
  await s.loescheLaeufe("willi", null);
  assert.equal(JSON.parse(lager.getItem("p2-laeufe")).length, 0);
});

test("ladeEinstellung holt den Fernbestand und legt ihn oertlich ab", async () => {
  const fetchFn = async (adresse, optionen = {}) => ({
    ok: true,
    json: async () => adresse.includes("/einstellungen") ? [{ wert: 0.12 }] : [],
  });
  const lager = attrappenLager();
  const s = erzeugeSpeicher({ konfig, fetchFn, lager });
  s.setzeProfil("willi");
  assert.equal(await s.ladeEinstellung("totzone", 0.06), 0.12);
  const kaputt = erzeugeSpeicher({ konfig, fetchFn: async () => { throw new Error("kein Netz"); }, lager });
  kaputt.setzeProfil("willi");
  assert.equal(await kaputt.ladeEinstellung("totzone", 0.06), 0.12);
});
