// wertung: erst wenn Willi eine Übung als fertig einstuft, wird sie auf true
// gestellt. Bis dahin ist die Mission im Probebetrieb und Läufe werden nicht
// gespeichert.
export const MISSIONEN = [
  { nr: 1, name: "Flugzeugverfolgung", kennzahlName: "Treffer %", wertung: false },
  { nr: 2, name: "Multitasking Controls", kennzahlName: "Punkte", wertung: false },
  { nr: 3, name: "60s Instrumentenflug", kennzahlName: "Punkte", wertung: false },
  { nr: 4, name: "Instrumente merken", kennzahlName: "Richtige", wertung: false },
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Richtige", wertung: false },
  { nr: 6, name: "Psychologisches Gespräch", kennzahlName: "Punkte", wertung: false },
];
