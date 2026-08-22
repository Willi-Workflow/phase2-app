// Reine Kalenderrechnung für den Countdown zur Prüfung.

export const PRUEFUNGSDATUM = "2026-09-14";
export const ANREISEDATUM = "2026-09-13";
export const ZAEHLBEGINN = "2026-08-22";

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function alsDatum(iso) {
  const [j, m, t] = iso.split("-").map(Number);
  return new Date(j, m - 1, t);
}

export function heuteAlsIso(jetzt = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${jetzt.getFullYear()}-${p(jetzt.getMonth() + 1)}-${p(jetzt.getDate())}`;
}

export function tageBis(zielIso, heuteIso) {
  return Math.round((alsDatum(zielIso) - alsDatum(heuteIso)) / 86_400_000);
}

export function tagesliste(vonIso, bisIso) {
  const liste = [];
  const ende = alsDatum(bisIso).getTime();
  for (let d = alsDatum(vonIso); d.getTime() <= ende; d.setDate(d.getDate() + 1)) {
    liste.push({
      iso: heuteAlsIso(d),
      wochentag: WOCHENTAGE[d.getDay()],
      tag: d.getDate(),
      monat: d.getMonth() + 1,
      wochenende: d.getDay() === 0 || d.getDay() === 6,
    });
  }
  return liste;
}


const MONATSNAMEN = ["Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"];

// Wochenraster je Monat: Zeilen zu 7 Tagen, montags beginnend, Lücken als null.
export function monatsraster(vonIso, bisIso) {
  const tage = tagesliste(vonIso, bisIso);
  const monate = [];
  for (const tag of tage) {
    let monat = monate.at(-1);
    if (!monat || monat.monat !== tag.monat) {
      monat = { monat: tag.monat, name: MONATSNAMEN[tag.monat - 1], wochen: [[]] };
      monate.push(monat);
      const spalte = (alsWochentagIndex(tag.wochentag));
      for (let i = 0; i < spalte; i++) monat.wochen[0].push(null);
    }
    let woche = monat.wochen.at(-1);
    if (woche.length === 7) { woche = []; monat.wochen.push(woche); }
    woche.push(tag);
  }
  for (const monat of monate) {
    const letzte = monat.wochen.at(-1);
    while (letzte.length < 7) letzte.push(null);
  }
  return monate;
}

function alsWochentagIndex(kuerzel) {
  return ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].indexOf(kuerzel);
}

export function monatsanfang(iso) {
  return iso.slice(0, 8) + "01";
}
