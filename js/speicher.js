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
  // Kontingentfehler und andere Schreibfehler dürfen nie einen Lauf verlieren:
  // schreibJsonStill wirft nie, sie meldet den Erfolg nur über den Rückgabewert.
  const schreibJsonStill = (schluessel, wert) => {
    try { lager.setItem(schluessel, JSON.stringify(wert)); return true; }
    catch { return false; }
  };

  const kopf = {
    apikey: konfig.supabaseKey,
    Authorization: `Bearer ${konfig.supabaseKey}`,
    "Content-Type": "application/json",
  };
  const tabelle = (name) => `${konfig.supabaseUrl}/rest/v1/${name}`;

  async function rufe(adresse, optionen = {}) {
    if (!zugang) { zustand = "ohne-zugang"; throw new Error("ohne-zugang"); }
    let antwort;
    try {
      antwort = await fetchFn(adresse, { ...optionen, headers: { ...kopf, ...(optionen.headers ?? {}) } });
    } catch (netzfehler) {
      zustand = "getrennt";
      netzfehler.dauerhaft = false;
      throw netzfehler;
    }
    if (!antwort.ok) {
      // 400 bis 499 außer 408 (Timeout) und 429 (zu viele Anfragen) sind dauerhafte
      // Ablehnungen: die Verbindung steht, nur die Anfrage selbst ist ungültig.
      const dauerhaft = antwort.status >= 400 && antwort.status <= 499 && antwort.status !== 408 && antwort.status !== 429;
      zustand = dauerhaft ? "verbunden" : "getrennt";
      const fehler = new Error(`Supabase antwortet ${antwort.status}`);
      fehler.dauerhaft = dauerhaft;
      throw fehler;
    }
    zustand = "verbunden";
    return antwort;
  }

  const schluesselVon = (l) => `${l.profil}|${l.bereich}|${l.zeitpunkt}`;

  function aktuellesProfil() {
    const wert = lager.getItem(LAGER_PROFIL);
    return wert ? wert : null;
  }

  function merkeOertlich(lauf) {
    const alle = liesJson(LAGER_LAEUFE, []);
    if (!alle.some((v) => schluesselVon(v) === schluesselVon(lauf))) alle.push(lauf);
    return schreibJsonStill(LAGER_LAEUFE, alle);
  }

  // Einzige Stelle für den Lauf-POST. on_conflict plus ignore-duplicates setzen voraus,
  // dass die Tabelle laeufe einen Eindeutigkeitsschlüssel auf (profil, bereich, zeitpunkt)
  // hat; damit ist eine doppelt gesendete Anfrage in der Datenbank unschädlich.
  async function sendeLauf(lauf) {
    return rufe(`${tabelle("laeufe")}?on_conflict=profil,bereich,zeitpunkt`, {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify(lauf),
    });
  }

  function reiheEin(lauf) {
    const schluessel = schluesselVon(lauf);
    const schlange = liesJson(LAGER_WARTESCHLANGE, []);
    if (!schlange.some((l) => schluesselVon(l) === schluessel)) schlange.push(lauf);
    return schreibJsonStill(LAGER_WARTESCHLANGE, schlange);
  }

  function entferneAusSchlange(schluessel) {
    const schlange = liesJson(LAGER_WARTESCHLANGE, []);
    schreibJsonStill(LAGER_WARTESCHLANGE, schlange.filter((l) => schluesselVon(l) !== schluessel));
  }

  return {
    profil: aktuellesProfil,
    setzeProfil(name) { lager.setItem(LAGER_PROFIL, name ?? ""); },

    zustand() { return zustand; },

    async speichereLauf(lauf) {
      const oertlichOk = merkeOertlich(lauf);
      try {
        await sendeLauf(lauf);
      } catch (fehler) {
        if (fehler.dauerhaft) {
          // Dauerhafte Ablehnung: Fehler dem Aufrufer mitteilen, damit dieser
          // den Nutzer verständigen kann. Der Lauf wird nicht in die Warteschlange eingereiht.
          throw fehler;
        }
        const schlangeOk = reiheEin(lauf);
        // Bei fehlgeschlagenem Einreihen ist der Lauf verloren, daher immer werfen.
        if (!schlangeOk) throw fehler;
      }
    },

    async synce() {
      // Momentaufnahme nur zum Iterieren. Ausgetragen wird je Eintrag über
      // entferneAusSchlange, das die Schlange bei jedem Aufruf frisch liest,
      // damit während des Sendens neu eingereihte Läufe nie überschrieben werden.
      const momentaufnahme = liesJson(LAGER_WARTESCHLANGE, []);
      if (momentaufnahme.length === 0) {
        // Ohne Warteschlange findet sonst nie ein Netzruf statt, darum bliebe der
        // Zustand bei einer funktionierenden Verbindung dauerhaft auf "getrennt"
        // stehen. Eine leichte Prüfanfrage genügt, Fehler schluckt rufe() bereits.
        if (zugang) {
          try { await rufe(`${tabelle("laeufe")}?select=id&limit=1`); }
          catch { /* Zustand wurde von rufe schon gesetzt */ }
        }
        return;
      }
      for (const lauf of momentaufnahme) {
        const schluessel = schluesselVon(lauf);
        try {
          await sendeLauf(lauf);
          entferneAusSchlange(schluessel);
        } catch (fehler) {
          if (fehler.dauerhaft) entferneAusSchlange(schluessel);
          // Netzfehler: bleibt liegen, wird beim nächsten synce() erneut versucht.
        }
      }
    },

    async ladeLaeufe(bereich) {
      const alleOertlich = liesJson(LAGER_LAEUFE, []); // ein Lesevorgang, mehrfach verwendet
      let fern = null;
      try {
        const antwort = await rufe(`${tabelle("laeufe")}?bereich=eq.${bereich}&select=profil,bereich,zeitpunkt,kennzahl,daten`);
        fern = await antwort.json();
      } catch { /* örtliche Kopie greift */ }
      const schlange = liesJson(LAGER_WARTESCHLANGE, []).filter((l) => l.bereich === bereich);
      // Bei erfolgreichem Fernabruf zählt der gemeinsame Bestand: die alte örtliche
      // Kopie des Bereichs wird NICHT beigemischt, sonst erstehen anderswo gelöschte
      // Läufe wieder auf. Nur wenn der Fernabruf scheitert, greift die örtliche Kopie.
      const quelle = fern ? [...fern, ...schlange] : [...alleOertlich.filter((l) => l.bereich === bereich), ...schlange];
      const gesehen = new Set();
      const alle = [];
      for (const l of quelle) {
        const s = schluesselVon(l);
        if (!gesehen.has(s)) { gesehen.add(s); alle.push(l); }
      }
      if (fern) schreibJsonStill(LAGER_LAEUFE, [...alleOertlich.filter((l) => l.bereich !== bereich), ...alle]);
      return alle;
    },

    async loescheLaeufe(profil, bereichOderNull) {
      const filter = bereichOderNull === null
        ? `?profil=eq.${profil}`
        : `?profil=eq.${profil}&bereich=eq.${bereichOderNull}`;
      // Mit Zugang zählt nur ein tatsächlich erfolgreiches Fernlöschen als Erfolg:
      // scheitert es, wird der Fehler durchgereicht und örtlich NICHTS geleert,
      // sonst meldet die App ein Zurücksetzen, das gar nicht stattgefunden hat.
      // Nur ohne Zugang (kein gemeinsamer Bestand vorhanden) bleibt es beim
      // stillen örtlichen Leeren.
      if (zugang) {
        await rufe(`${tabelle("laeufe")}${filter}`, { method: "DELETE" });
      }
      const behalten = (l) => !(l.profil === profil && (bereichOderNull === null || l.bereich === bereichOderNull));
      schreibJsonStill(LAGER_LAEUFE, liesJson(LAGER_LAEUFE, []).filter(behalten));
      schreibJsonStill(LAGER_WARTESCHLANGE, liesJson(LAGER_WARTESCHLANGE, []).filter(behalten));
    },

    async ladeEinstellung(schluessel, vorgabe) {
      const profil = aktuellesProfil();
      if (zugang) {
        try {
          const antwort = await rufe(`${tabelle("einstellungen")}?profil=eq.${profil}&schluessel=eq.${schluessel}&select=wert`);
          const treffer = await antwort.json();
          if (treffer.length > 0) {
            const wert = treffer[0].wert;
            const alle = liesJson(LAGER_EINSTELLUNGEN, {});
            alle[profil] = { ...(alle[profil] ?? {}), [schluessel]: wert };
            schreibJsonStill(LAGER_EINSTELLUNGEN, alle);
            return wert;
          }
        } catch { /* leere Antwort oder Fehler: örtlich mit Vorgabe weitermachen */ }
      }
      const alle = liesJson(LAGER_EINSTELLUNGEN, {});
      const je = alle[profil] ?? {};
      return schluessel in je ? je[schluessel] : vorgabe;
    },

    async setzeEinstellung(schluessel, wert) {
      const alle = liesJson(LAGER_EINSTELLUNGEN, {});
      const profil = aktuellesProfil();
      alle[profil] = { ...(alle[profil] ?? {}), [schluessel]: wert };
      schreibJsonStill(LAGER_EINSTELLUNGEN, alle);
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
