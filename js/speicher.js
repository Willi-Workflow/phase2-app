// Datenhaltung: örtliche Kopie im Lager, gemeinsamer Bestand über Supabase-REST.
// Alles läuft über erzeugeSpeicher, damit Tests fetch und Lager ersetzen können.

const LAGER_LAEUFE = "p2-laeufe";
const LAGER_WARTESCHLANGE = "p2-warteschlange";
const LAGER_PROFIL = "p2-profil";
const LAGER_EINSTELLUNGEN = "p2-einstellungen";

export function erzeugeSpeicher({ konfig, fetchFn = fetch, lager = localStorage }) {
  const zugang = Boolean(konfig.supabaseUrl && konfig.supabaseKey);
  let zustand = zugang ? "getrennt" : "ohne-zugang";

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
    if (!zugang) { zustand = "ohne-zugang"; throw new Error("ohne-zugang"); }
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
        if (!schlange.some((l) => schluesselVon(l) === schluesselVon(lauf))) {
          schlange.push(lauf);
        }
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
