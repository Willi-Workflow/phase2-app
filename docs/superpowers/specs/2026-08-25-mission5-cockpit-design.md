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
- Panelwerte (`panelwerte(aufgabe, rnd)` in der Logik, Willis Vorgabe vom
  25.08.2026): Das Panel widerspricht der Aufgabe nie. Bei einer
  Instrumentenaufgabe zeigt das betroffene Instrument den Aufgabenwert
  (Variometer mit Vorzeichen) und der Rest passt zur Lage: Reiseflug und
  bevorstehender Abbau fliegen waagerecht (Variometer 0, Horizont
  gerade); beim laufenden Sinken ist die Nase leicht gesenkt und der
  Höhenmesser zeigt mehr Höhe, als abgebaut wird (Variometer-Paare darum
  auf 9400 ft Abbau begrenzt). Reine Textaufgaben sprechen von "Ein
  Luftfahrzeug", das eigene Panel ist nicht gemeint und würfelt frei.

## Tests

Gegen `js/uebung5.js`, ohne DOM: Verteilungsregel (rund ein Drittel, nie
beim Prinzip Geschwindigkeit), Rasterbindung (Fahrt im Anzeigebereich,
Variometer bis 2000), Fragetext der Instrumentenaufgaben enthält den
abzulesenden Zahlenwert nicht, gleicher Zufall ergibt gleichen Lauf.
