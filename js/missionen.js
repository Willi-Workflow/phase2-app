// wertung: erst wenn Willi eine Übung als fertig einstuft, wird sie auf true
// gestellt. Bis dahin ist die Mission im Probebetrieb und Läufe werden nicht
// gespeichert.
// schwierigkeiten: die wählbaren Aufgabenvariationen der Übung. anteil ist der
// höchstens erreichbare Anteil der Skala: die Kennzahl eines Laufs ist die
// Rohleistung mal anteil, ein voller Lauf auf Leicht endet also bei 60 Prozent.
// Alle Läufe zählen in eine gemeinsame Statistik; jeder Lauf merkt sich seine
// Stufe in daten.schwierigkeit. Die fertigen Übungen können die Liste je
// Bereich verfeinern.
const STUFEN = [
  { name: "Leicht", anteil: 0.6 },
  { name: "Mittel", anteil: 0.8 },
  { name: "Schwer", anteil: 1.0 },
];

export const MISSIONEN = [
  { nr: 1, name: "Flugzeugverfolgung", kennzahlName: "Treffer %", wertung: false, schwierigkeiten: STUFEN },
  { nr: 2, name: "Multitasking Controls", kennzahlName: "Punkte", wertung: false, schwierigkeiten: STUFEN },
  { nr: 3, name: "60s Instrumentenflug", kennzahlName: "Punkte", wertung: false, schwierigkeiten: STUFEN },
  { nr: 4, name: "Instrumente merken", kennzahlName: "Richtige", wertung: false, schwierigkeiten: STUFEN },
  { nr: 5, name: "Test Flugphysik", kennzahlName: "Richtige", wertung: false, schwierigkeiten: STUFEN },
  { nr: 6, name: "Psychologisches Gespräch", kennzahlName: "Punkte", wertung: false, schwierigkeiten: STUFEN },
];
