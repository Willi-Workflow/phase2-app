// Kartensatz des Wissensbereichs von Mission 5. Nur Daten: Reihenfolge und
// Inhalte der Karteikarten, gezeichnet wird in uebung5-lauf.js. Weitere Karten
// einfach ans Ende anfügen.
export const KARTEN5 = [
  {
    titel: "Geschwindigkeit",
    zeilen: [
      "v = Weg / Zeit",
      "Knoten sind NM je Stunde:",
      "1 kt = 1 NM in 60 Minuten",
    ],
  },
  {
    titel: "Weg",
    zeilen: [
      "s = v mal t",
      "Zeit in Stunden einsetzen,",
      "oder mit Minuten: s = v mal t / 60",
    ],
  },
  {
    titel: "Zeit und die 60er-Regel",
    zeilen: [
      "t in Minuten = s / v mal 60",
      "Erst Weg durch Geschwindigkeit,",
      "dann mal 60. Nie andersherum.",
    ],
  },
  {
    titel: "Sink- und Steigrate",
    zeilen: [
      "Rate = Höhenänderung / Zeit",
      "Zeit in Minuten einsetzen,",
      "das Ergebnis ist ft je Minute.",
    ],
  },
  {
    titel: "Beispiel Flugzeit",
    zeilen: [
      "100 kt, Ziel in 500 NM. Flugzeit?",
      "t = s / v mal 60",
      "t = 500 / 100 mal 60",
      "t = 5 mal 60 = 300 Minuten",
      "Also 5 Stunden bis zum Ziel.",
    ],
  },
  {
    titel: "Beispiel Sinkrate",
    zeilen: [
      "6000 ft in 3 Minuten abbauen. Rate?",
      "Rate = h / t",
      "Rate = 6000 / 3",
      "Rate = 2000 ft/min sinken",
    ],
  },
];
