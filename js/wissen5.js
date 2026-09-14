// Kartensatz des Wissensbereichs von Mission 5. Nur Daten: eine Fundament-
// Karte und je gesuchter Größe eine Karteikarte mit dem Weg in Worten und
// einem Schritt-für-Schritt-Beispiel (Willis Auftrag vom 14.09.2026:
// übersichtlicher, je Größe ein wirklich einfaches Beispiel). Gezeichnet
// wird in uebung5-lauf.js, weitere Karten einfach ans Ende anfügen.
export const KARTEN5 = [
  {
    titel: "Das Fundament: Knoten und die 60",
    zeilen: [
      "Ein Knoten heißt: eine NM je Stunde.",
      "240 kt sind also 240 NM in 60 Minuten.",
      "Merke: Knoten durch 60 = NM je Minute.",
    ],
    beispiel: [
      "Wie weit trägt dich 120 kt in einer Minute?",
      "120 / 60 = 2, also 2 NM je Minute.",
      "Diese eine Umrechnung steckt in jeder Aufgabe.",
      "Wer sie kann, braucht keine Formeln mehr.",
    ],
  },
  {
    titel: "Gesucht: Geschwindigkeit",
    zeilen: [
      "Gegeben sind Weg und Zeit.",
      "v = Weg / Zeit mal 60",
    ],
    beispiel: [
      "180 NM in 45 Minuten. Wie schnell warst du?",
      "Schritt 1: Weg durch Minuten: 180 / 45 = 4.",
      "Das sind 4 NM je Minute.",
      "Schritt 2: mal 60: 4 mal 60 = 240.",
      "Antwort: 240 kt.",
    ],
  },
  {
    titel: "Gesucht: Weg",
    zeilen: [
      "Gegeben sind Geschwindigkeit und Zeit.",
      "s = Knoten / 60 mal Minuten",
    ],
    beispiel: [
      "240 kt, 45 Minuten lang. Wie weit kommst du?",
      "Schritt 1: Knoten durch 60: 240 / 60 = 4.",
      "Du schaffst also 4 NM je Minute.",
      "Schritt 2: mal die Minuten: 4 mal 45 = 180.",
      "Antwort: 180 NM.",
    ],
  },
  {
    titel: "Gesucht: Zeit",
    zeilen: [
      "Gegeben sind Weg und Geschwindigkeit.",
      "Erst NM je Minute, dann den Weg dadurch teilen.",
    ],
    beispiel: [
      "300 NM bei 120 kt. Wie lange brauchst du?",
      "Schritt 1: Knoten durch 60: 120 / 60 = 2.",
      "Je Minute schaffst du 2 NM.",
      "Schritt 2: Weg teilen: 300 / 2 = 150.",
      "Antwort: 150 Minuten, also 2,5 Stunden.",
    ],
  },
  {
    titel: "Gesucht: Sink- oder Steigrate",
    zeilen: [
      "Gegeben sind Höhenänderung und Zeit.",
      "Rate = Höhenänderung / Minuten",
    ],
    beispiel: [
      "Von 8000 ft runter auf 2000 ft, in 3 Minuten.",
      "Schritt 1: Höhenänderung: 8000 minus 2000 = 6000 ft.",
      "Schritt 2: durch die Minuten: 6000 / 3 = 2000.",
      "Antwort: 2000 ft je Minute sinken.",
      "Steigen geht genauso, nur nach oben.",
    ],
  },
];
