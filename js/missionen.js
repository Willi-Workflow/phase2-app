// wertung: erst wenn Willi eine Übung als fertig einstuft, wird sie auf true
// gestellt. Bis dahin ist die Mission im Probebetrieb und Läufe werden nicht
// gespeichert.
// maximal: feste Obergrenze der Kennzahl; Diagramm und Balken nutzen sie als
// Skalenende, ohne maximal richtet sich die Skala nach den Läufen.
export const MISSIONEN = [
  { nr: 1, name: "Flugzeugverfolgung", kennzahlName: "Deckung %", wertung: false, maximal: 100 },
  { nr: 2, name: "Multitasking Controls", kennzahlName: "Punkte", wertung: false },
  { nr: 3, name: "60s Instrumentenflug", kennzahlName: "Genauigkeit %", wertung: false, maximal: 100 },
  { nr: 4, name: "Instrumente merken", kennzahlName: "Punkte", wertung: false, maximal: 100 },
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Punkte", wertung: false, maximal: 100 },
  { nr: 6, name: "Psychologisches Gespräch", kennzahlName: "Punkte", wertung: false },
];
