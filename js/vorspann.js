// Regel für den Startvorspann (Hangarflug zum Schlüsselring): Er läuft nur
// beim echten Neuöffnen der Seite. Nicht beim Neuladen (F5) und nicht beim
// Vor- und Zurückblättern, und je Sitzung nur einmal; der Merker liegt im
// sessionStorage und überlebt dort das Neuladen, nicht aber ein neues
// Fenster oder einen neuen Tab.
export const VORSPANN_MERKER = "p2-vorspann-gesehen";

export function sollVorspannLaufen({ gesehen, navTyp }) {
  return !gesehen && navTyp === "navigate";
}
