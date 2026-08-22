// wertung: erst wenn Willi eine Übung als fertig einstuft, wird sie auf true
// gestellt. Bis dahin ist die Mission im Probebetrieb und Läufe werden nicht
// gespeichert.
// schwierigkeiten: die wählbaren Stufen der Übung; jeder Lauf speichert seine
// Stufe in daten.schwierigkeit, die Statistik rechnet je Stufe getrennt. Die
// fertigen Übungen können die Liste je Bereich verfeinern.
const STUFEN = ["Leicht", "Mittel", "Schwer"];

export const MISSIONEN = [
  { nr: 1, name: "Flugzeugverfolgung", kennzahlName: "Treffer %", wertung: false, schwierigkeiten: STUFEN },
  { nr: 2, name: "Multitasking Controls", kennzahlName: "Punkte", wertung: false, schwierigkeiten: STUFEN },
  { nr: 3, name: "60s Instrumentenflug", kennzahlName: "Punkte", wertung: false, schwierigkeiten: STUFEN },
  { nr: 4, name: "Instrumente merken", kennzahlName: "Richtige", wertung: false, schwierigkeiten: STUFEN },
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Richtige", wertung: false, schwierigkeiten: STUFEN },
  { nr: 6, name: "Psychologisches Gespräch", kennzahlName: "Punkte", wertung: false, schwierigkeiten: STUFEN },
];
