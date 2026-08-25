# Mission 5 Umbau: Cockpit und Instrumentenaufgaben

Stand 25.08.2026, mit Willi abgestimmt. Quelle ist der Calculation-Test des
Originals (Dissertation 3.3.4.2, INFAT-CALC): Rechenaufgaben im
fliegerischen Kontext, die Werte der Fluginstrumente fließen teilweise in
die Berechnung ein. Die App deckt das inhaltlich ab, sieht aber bewusst
nicht 1:1 wie das Dokument aus (Willis Vorgabe).

## Umgebung

- Mission 5 spielt auf der Cockpitbühne von Mission 4: `cockpitbuehne` mit
  `bilder/cockpit.jpg` in fester Bildgröße bodenverankert, unten die
  `panelflaeche` mit den fünf Instrumenten aus `js/instrumente.js` in den
  Fotogehäusen (150 px, `tafelHtml`).
- Der Aufgabentext erscheint oben im Cockpitfenster (dunkler
  Scheibenbereich), darunter je nach Form das Eingabefeld (Enter bestätigt)
  oder die vier Antwortknöpfe, dazu der Ablaufbalken. Die Rechner-Optik
  (`bilder/rechner.jpg`) wird nicht mehr verwendet; die Datei bleibt im
  Bestand.
- Punkteregel (7 Grund plus 3 Zeitbonus), 20 s je Aufgabe, Formenmix
  Auswahl/Eingabe, Testdauern 5/10/30 min, Kennzahl und Wissensbereich
  (Karteikarten) bleiben unverändert.

## Instrumentenaufgaben (etwa ein Drittel)

- Je Lauf werden rund ein Drittel der Aufgaben (kaufmännisch gerundet)
  als Instrumentenaufgaben erzeugt, zufällig über den Lauf verteilt.
- Bei einer Instrumentenaufgabe nennt der Text einen Gegebenwert nicht,
  sondern verweist aufs Ablesen ("bei deiner aktuellen Geschwindigkeit",
  "deine aktuelle Höhe", "mit deinem aktuellen Sinken"). Das Aufgabenobjekt
  trägt dafür `instrument: { id, wert }`, sonst `instrument: null`.
- Zuordnung nach Prinzip:
  - `zeit` und `weg`: Geschwindigkeit ablesen, der Fahrtmesser zeigt v.
    Erlaubt sind nur v aus dem Anzeigeraster (60 bis 320 kt, Zehnerschritt),
    also v aus {60, 80, 90, 100, 120, 150, 180, 200, 240, 300}.
  - `rate`: entweder Höhenmesser ablesen (h im Raster 1000 bis 9900 ft,
    Hunderterschritt; Frage: Höhe in t Minuten vollständig abbauen,
    Sinkrate berechnen) oder Variometer ablesen (r bis höchstens 2000
    ft/min, Anzeige negativ beim Sinken; Frage: wie lange bis h ft
    abgebaut sind, Zeit berechnen).
  - `geschwindigkeit`: nie als Instrumentenaufgabe, der gesuchte Wert
    stünde sonst ablesbar am Instrument.
- Panelwerte (`panelwerte(aufgabe, rnd)` in der Logik, Willis Vorgaben vom
  25.08.2026): Das Panel spiegelt die Aufgabenwerte immer, auch wenn sie
  im Text stehen, und zwar wörtlich: Steht "200 kt" in der Aufgabe, zeigt
  der Fahrtmesser 200 kt; steht "4000 ft", zeigt der Höhenmesser 4000 ft.
  Damit das aufgeht, bleiben alle Aufgabenwerte im Anzeigebereich
  (Geschwindigkeiten 60 bis 300 kt aus dem Zehnerraster, Höhenwerte 1000
  bis 8900 ft). Die Lage passt dazu: waagerecht mit Variometer 0 (es
  verriete sonst die gesuchte Rate); nur beim laufenden Sinken
  (Variometer-Ablesung) ist die Nase leicht gesenkt und der Höhenmesser
  zeigt mehr Höhe, als abgebaut wird. Die Rückmeldung nach einer Antwort
  zeigt keine Punktzahl (Willis Vorgabe), gezählt wird sie weiter.
  Instrumente, die die gesuchte Antwort verrieten, zeigen keinen falschen
  Wert, sondern werden im Lauf unscharf verdeckt (Willis Festlegung vom
  25.08.2026, `verdeckteInstrumente`): der Fahrtmesser bei der
  Geschwindigkeitsfrage (die darum wieder vom eigenen Flug spricht, "Du
  legst ... zurück"), das Variometer, wenn die Rate die Antwort ist. Beim
  Ablesen der Rate (Antwort in Minuten) bleibt das Variometer sichtbar.

## Tests

Gegen `js/uebung5.js`, ohne DOM: Verteilungsregel (rund ein Drittel, nie
beim Prinzip Geschwindigkeit), Rasterbindung (Fahrt im Anzeigebereich,
Variometer bis 2000), Fragetext der Instrumentenaufgaben enthält den
abzulesenden Zahlenwert nicht, gleicher Zufall ergibt gleichen Lauf.
