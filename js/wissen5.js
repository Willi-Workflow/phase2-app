// Kartensatz des Wissensbereichs von Mission 5. Nur Daten: je Größe eine
// Karteikarte mit Formel, Merksatz und durchgerechnetem Beispiel, gezeichnet
// wird in uebung5-lauf.js. Weitere Karten einfach ans Ende anfügen.
export const KARTEN5 = [
  {
    titel: "Geschwindigkeit",
    zeilen: [
      "v = Weg / Zeit mal 60",
      "Ein Knoten ist eine NM je Stunde.",
    ],
    beispiel: [
      "360 NM in 90 Minuten geflogen:",
      "v = 360 / 90 mal 60 = 240 kt",
    ],
  },
  {
    titel: "Weg",
    zeilen: [
      "s = Geschwindigkeit mal Zeit / 60",
      "Zeit in Minuten, darum durch 60.",
    ],
    beispiel: [
      "240 kt für 45 Minuten:",
      "s = 240 mal 45 / 60 = 180 NM",
    ],
  },
  {
    titel: "Zeit, die 60er-Regel",
    zeilen: [
      "t = Weg / Geschwindigkeit mal 60",
      "Weg durch Tempo gibt Stunden, mal 60 Minuten.",
    ],
    beispiel: [
      "100 kt, Ziel in 500 NM:",
      "t = 500 / 100 mal 60 = 300 Minuten",
    ],
  },
  {
    titel: "Sink- und Steigrate",
    zeilen: [
      "Rate = Höhenänderung / Zeit in Minuten",
      "Fuß je Minute steigen oder sinken.",
    ],
    beispiel: [
      "6000 ft in 3 Minuten abbauen:",
      "Rate = 6000 / 3 = 2000 ft/min",
    ],
  },
];
