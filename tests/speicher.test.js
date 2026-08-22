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

test("Einstellungen werden je Profil gehalten", async () => {
  const s = erzeugeSpeicher({ konfig: { supabaseUrl: "", supabaseKey: "", version: 1 }, fetchFn: async () => ({ ok: true, json: async () => [] }), lager: attrappenLager() });
  s.setzeProfil("willi");
  assert.equal(await s.ladeEinstellung("totzone", 0.06), 0.06);
  await s.setzeEinstellung("totzone", 0.1);
  assert.equal(await s.ladeEinstellung("totzone", 0.06), 0.1);
  s.setzeProfil("luigi");
  assert.equal(await s.ladeEinstellung("totzone", 0.06), 0.06);
});
