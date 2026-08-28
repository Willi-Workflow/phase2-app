# Mission 6: Flugzeugmuster, Materialsammlung

Stand 26.08.2026, mit Willi abgestimmt. Sammlung der Muster, die in
Mission 6 vorkommen sollen. Keine Hubschrauber (Willis Vorgabe). Der
Zweck der Mission ist noch offen, die Liste steht aber fest.

## Bundeswehr, aktuell im Dienst

- Eurofighter Typhoon, Hauptkampfflugzeug der Luftwaffe, rund 138 Stück
- Panavia Tornado IDS und ECR, rund 93 Stück, Ausmusterung bis 2030
- Airbus A400M Atlas, Transport und Tanken, 52 Stück
- Lockheed C-130J und KC-130J Super Hercules, je drei, binational mit Frankreich
- Airbus A330 MRTT, Tanker im multinationalen Verband
- Airbus A350 und A319 der Flugbereitschaft
- Boeing P-8A Poseidon, Seefernaufklärer der Marine, seit November 2025 in Deutschland
- Dornier Do 228, Marine, Ölüberwachung
- Grob G120TP, Schulflugzeug
- Heron TP und Heron 1, unbemannte Aufklärung

## Im Zulauf

- Lockheed Martin F-35A Lightning II, 35 Stück, Auslieferung ab 2027 nach Büchel

## Kürzlich außer Dienst

- Lockheed P-3C Orion, Marine, Flugbetrieb Ende 2025 beendet
- Transall C-160, Transporter, 2021 ausgemustert
- Learjet 35A, Zieldarstellung, 2020 ausgemustert
- McDonnell Douglas F-4F Phantom II, 2013 ausgemustert
- Dassault Alpha Jet, 2012 ausgemustert

## Kampfflugzeuge international, aktuell

- Lockheed Martin F-16 Fighting Falcon
- Boeing F-15E Strike Eagle
- Boeing F/A-18E Super Hornet
- Lockheed Martin F-22 Raptor
- Lockheed Martin F-35 Lightning II
- Dassault Rafale
- Saab JAS 39 Gripen
- Fairchild A-10 Thunderbolt II
- Dassault Mirage 2000
- Suchoi Su-27 und Su-35
- Suchoi Su-57
- MiG-29
- MiG-31
- Chengdu J-20

## Klassiker mit Bundeswehr-Vergangenheit

- Lockheed F-104G Starfighter, das prägendste Muster der frühen Luftwaffe
- Fiat G.91, der "Gina" genannte Erdkämpfer
- McDonnell Douglas F-4F Phantom II (siehe oben)

## Internationale Klassiker

- Grumman F-14 Tomcat
- Hawker Siddeley Harrier und AV-8B Harrier II
- Lockheed F-117 Nighthawk
- Lockheed SR-71 Blackbird
- North American F-86 Sabre
- MiG-15
- MiG-21 Fishbed
- MiG-25 Foxbat
- Douglas A-4 Skyhawk
- Northrop F-5 Tiger II
- Dassault Mirage III
- Saab 35 Draken
- Saab 37 Viggen

## Gestrichen am 26.08.2026 (Willis Entscheidung)

Aus der Liste entfernt, samt Bildern: alle Propeller-Legenden (Spitfire,
P-51 Mustang, Bf 109, Fw 190, Me 262) sowie English Electric Lightning,
Su-25, F-111, Nord Noratlas, Canadair Sabre Mk.6 und F-84F Thunderstreak.

## Umsetzung, Stand 26.08.2026

Beide Punkte sind entschieden und gebaut:

- Zweck: Mission 6 bleibt "Psychologisches Gespräch" und enthält die
  Wissensabfrage (Bereich Flugzeugmuster, weitere Bereiche vorgesehen)
  samt Lexikon. Quiz: Foto sehen, Muster per Texteingabe benennen,
  großzügige Prüfung (Spitznamen, Schreibweise egal), Ergebnis in Prozent.
  Daten in `js/muster6.js`, Logik in `js/uebung6.js`, Ablauf in
  `js/uebung6-lauf.js`.
- Bildmaterial: je Muster vier Ansichten (A350: drei) von Wikimedia
  Commons unter `bilder/muster/<id>/`, Quellen und Lizenzen in
  `bilder/muster/QUELLEN.md`, Bilderzahl je Muster erzeugt
  `zaehle-ansichten.py` nach `js/muster6-ansichten.js`.

## Erweiterung vom 28.08.2026: sieben Wissensbereiche

Auf Willis Auftrag kamen sechs Bereiche zu den Flugzeugmustern dazu,
Daten in `js/wissen6.js`: Standorte und Verbände, Eigener Ausbildungsweg,
Dienstgrade (Inhalte und Abzeichen aus der Bundeswehr-Lern-App, PNGs
unter `bilder/abzeichen/`), Aufbau der Bundeswehr, Aktuelle Themen,
Beschaffungen und Bestände sowie Persönliches. Die Fakten der
recherchierten Bereiche tragen den Stand August 2026 (Rechercheprotokolle
mit Quellen je Aussage liegen der Sitzung bei; als unsicher markierte
Punkte wurden nicht übernommen). Seit dem 28.08.2026 läuft die
Wissensabfrage als Karteikarten (Willis Vorgabe): vorn Frage oder Bild,
Karte umdrehen, hinten die Antwort, dann Selbsteinschätzung GEWUSST oder
MUSS ICH ÜBEN; nur Persönliches bleibt in Textform mit Hinweisen. Die
Kennzahl ist der selbst eingeschätzte Übungsstand in Prozent. Das Lexikon zeigt
je Bereich einen aufklappbaren Abschnitt, die Flugzeugmuster starten
offen. Da sich aktuelle Zahlen ändern, sollten Themen und Beschaffungen
vor der Prüfung im September 2026 noch einmal gegengelesen werden.

## Quellen für den aktuellen Stand

- Ausrüstung der Luftwaffe 2026: suv.report/ausruestung-der-luftwaffe-2026-bestaende-luecken-beschaffungen
- Bundeswehr zur P-8A Poseidon: bundeswehr.de/de/meldungen/p-8a-poseidon-ankunft-verteidigungsminister-6038882
- Marine zur P-3C: hartpunkt.de/marine-will-zwei-p-3c-orion-bis-ende-2025-betreiben
- Bundeswehr zur F-35: bundeswehr.de/de/organisation/luftwaffe/sondervermoegen-luftwaffe/kampfjets-f-35-luftwaffe
