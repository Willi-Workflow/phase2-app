// wertung: true heißt scharf, Läufe werden gespeichert. Der Probebetrieb
// (wertung: false) ist seit 01.09.2026 auf Willis Auftrag beendet.
// maximal: feste Obergrenze der Kennzahl; Balken und Skala nutzen sie als
// Skalenende, ohne maximal richtet sich die Skala nach den Läufen.
export const MISSIONEN = [
  { nr: 1, name: "Flugzeugverfolgung", kennzahlName: "Wertung %", wertung: true, maximal: 100 },
  { nr: 2, name: "Multitasking Controls", kennzahlName: "Wertung %", wertung: true, maximal: 100 },
  { nr: 3, name: "60s Instrumentenflug", kennzahlName: "Wertung %", wertung: true, maximal: 100 },
  { nr: 4, name: "Instrumente merken", kennzahlName: "Wertung %", wertung: true, maximal: 100 },
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Wertung %", wertung: true, maximal: 100 },
  // auswertung: false blendet Historie, Bestwert und Vergleich der
  // Missionsseite aus; beim Gespräch zählt Üben, nicht die Kurve.
  { nr: 6, name: "Psychologisches Gespräch", kennzahlName: "Treffer %", wertung: true, maximal: 100, auswertung: false },
];
