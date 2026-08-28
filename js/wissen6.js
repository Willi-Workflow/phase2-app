// Wissensbereiche der Mission 6 neben den Flugzeugmustern: je Bereich ein
// Name, Lexikonkarten (wissen) und ein Fragenkatalog (fragen). Drei
// Frageformen: "eingabe" (tolerante Texteingabe, wahlweise mit Bild),
// "auswahl" (vier Knöpfe, richtig plus drei falsche) und "reflexion"
// (Gesprächsfrage mit Hinweisen und Selbsteinschätzung). Die Fakten der
// recherchierten Bereiche tragen den Stand August 2026.
// Die Dienstgradinhalte stammen aus Willis Bundeswehr-Lern-App, die
// Abzeichen liegen unter bilder/abzeichen/.

export const WISSEN6 = {
  standorte: {
    name: "Standorte und Verbände",
    wissen: [
      {
        titel: "Eurofighter-Geschwader",
        zeilen: [
          "Vier Geschwader: TaktLwG 31 Boelcke in Nörvenich, TaktLwG 71 Richthofen in Wittmund, TaktLwG 73 Steinhoff in Laage, TaktLwG 74 in Neuburg an der Donau (ohne Traditionsnamen).",
          "Wittmund stellt die Alarmrotte Nord, Neuburg die Alarmrotte Süd: Eurofighter rund um die Uhr bereit, nach Alarmierung binnen 15 Minuten in der Luft.",
          "Laage bei Rostock bildet mit rund 35 Eurofightern alle Eurofighter-Piloten der Luftwaffe und die des österreichischen Bundesheeres aus.",
        ],
      },
      {
        titel: "Tornado-Geschwader",
        zeilen: [
          "TaktLwG 33 in Büchel (Eifel) stellt den deutschen Beitrag zur nuklearen Teilhabe der NATO; im Juni 2026 kehrten die Tornados nach vier Jahren Ausweichbetrieb in Nörvenich und Bahnsanierung für rund 260 Millionen Euro zurück.",
          "Büchel wird ab Ende 2027 Heimat der F-35A, der F-35-Campus soll ab November 2026 bezugsfertig sein.",
          "TaktLwG 51 Immelmann in Schleswig-Jagel: Tornado IDS und ECR, Heron 1 und Heron TP, Aufträge Luftaufklärung und Niederhaltung gegnerischer Flugabwehr; künftig Heimat des Eurofighter EK und der Pegasus-Signalaufklärer.",
        ],
      },
      {
        titel: "Transport und Flugbereitschaft",
        zeilen: [
          "LTG 62 in Wunstorf ist das einzige Lufttransportgeschwader und fliegt den A400M; am 17. April 2026 landete der 53. und letzte A400M.",
          "Flugbereitschaft BMVg: Hauptsitz Köln-Wahn, politischer Flugbetrieb ab Berlin, unter anderem drei A350-900, zwei A321neo LR für die medizinische Evakuierung und drei Global 6000.",
          "Mit Frankreich betreibt die Luftwaffe eine gemeinsame C-130J-Staffel im französischen Évreux.",
        ],
      },
      {
        titel: "Hubschrauber",
        zeilen: [
          "Das Hubschraubergeschwader 64 der Luftwaffe fliegt CH-53 und H145M, mit Laupheim und der Lufttransportgruppe in Holzdorf.",
          "Die bestellten CH-47F Chinook kommen ab Ende 2027: Hauptstandort wird Holzdorf, Laupheim erhält zwölf Maschinen und einen Anteil Spezialkräfte Luft.",
        ],
      },
      {
        titel: "Bodengebundene Luftverteidigung und Schutz",
        zeilen: [
          "Das Flugabwehrraketengeschwader 1 in Husum ist seit 2013 das einzige der Luftwaffe, Hauptwaffensystem Patriot.",
          "Arrow 3 gegen ballistische Raketen: erste Stellung in Holzdorf mit Anfangsbefähigung seit Dezember 2025, drei Stellungen geplant, Vollbefähigung 2030.",
          "Das Objektschutzregiment der Luftwaffe Friesland in Schortens kann im Einsatzgebiet ein komplettes Flugfeld aufbauen, betreiben und schützen.",
        ],
      },
      {
        titel: "Marineflieger in Nordholz",
        zeilen: [
          "MFG 3 Graf Zeppelin: Seefernaufklärung und U-Boot-Jagd, seit November 2025 mit der P-8A Poseidon als Ablösung der P-3C Orion.",
          "MFG 5: 18 NH90 Sea Lion für den Such- und Rettungsdienst über Nord- und Ostsee, dazu seit Dezember 2025 der erste Bordhubschrauber NH90 Sea Tiger.",
        ],
      },
      {
        titel: "Führung und Schulen",
        zeilen: [
          "Kommando Luftwaffe in Berlin-Gatow, darunter das Luftwaffentruppenkommando in Köln-Wahn für die fliegenden Verbände.",
          "Die Offizierschule der Luftwaffe ist seit Oktober 2025 in Roth bei Nürnberg, die Unteroffizierschule sitzt in Appen und Heide.",
          "Ausbildung in den USA: ENJJPT in Sheppard (Texas), fliegerische Grundschulung in Goodyear (Arizona), F-35-Ausbildung in Fort Smith (Arkansas).",
        ],
      },
    ],
    fragen: [
      { frage: "Wo ist das Taktische Luftwaffengeschwader 71 Richthofen stationiert?", form: "eingabe", loesungen: ["Wittmund", "Wittmundhafen"] },
      { frage: "Welches Geschwader bildet alle Eurofighter-Piloten der Luftwaffe aus?", form: "eingabe", loesungen: ["TaktLwG 73", "73", "Steinhoff", "Taktisches Luftwaffengeschwader 73", "Geschwader 73", "TaktLwG 73 Steinhoff"] },
      { frage: "Von welchem Standort aus fliegt das Lufttransportgeschwader 62 den A400M?", form: "eingabe", loesungen: ["Wunstorf"] },
      { frage: "Welcher Fliegerhorst wird die Heimat der deutschen F-35A?", form: "eingabe", loesungen: ["Büchel", "Buechel"] },
      { frage: "Wo sitzt das einzige Flugabwehrraketengeschwader der Luftwaffe?", form: "eingabe", loesungen: ["Husum"] },
      { frage: "An welchem Standort sind die Marinefliegergeschwader 3 und 5 beheimatet?", form: "eingabe", loesungen: ["Nordholz"] },
      { frage: "In welchem Ort steht die Offizierschule der Luftwaffe seit Oktober 2025?", form: "eingabe", loesungen: ["Roth"] },
      { frage: "Auf welcher Basis in Texas läuft die Jetausbildung ENJJPT?", form: "eingabe", loesungen: ["Sheppard", "Sheppard Air Force Base", "Sheppard AFB"] },
      {
        frage: "Welches Geschwader stellt die Alarmrotte Süd?", form: "auswahl",
        richtig: "TaktLwG 74 in Neuburg", falsch: ["TaktLwG 31 in Nörvenich", "TaktLwG 71 in Wittmund", "TaktLwG 73 in Laage"],
      },
      {
        frage: "Welches Geschwader stellt den deutschen Beitrag zur nuklearen Teilhabe?", form: "auswahl",
        richtig: "TaktLwG 33 in Büchel", falsch: ["TaktLwG 51 in Jagel", "TaktLwG 31 in Nörvenich", "TaktLwG 74 in Neuburg"],
      },
      {
        frage: "Wo fliegen die Drohnen Heron 1 und Heron TP?", form: "auswahl",
        richtig: "Beim TaktLwG 51 Immelmann in Schleswig-Jagel", falsch: ["Beim LTG 62 in Wunstorf", "Beim TaktLwG 73 in Laage", "Bei der Flugbereitschaft in Köln"],
      },
      {
        frage: "Welchen Traditionsnamen trägt das TaktLwG 31 in Nörvenich?", form: "auswahl",
        richtig: "Boelcke", falsch: ["Richthofen", "Immelmann", "Steinhoff"],
      },
      {
        frage: "Wo steht die erste deutsche Arrow-3-Stellung?", form: "auswahl",
        richtig: "Holzdorf", falsch: ["Husum", "Büchel", "Laage"],
      },
      {
        frage: "Wohin geht der Hauptanteil der bestellten CH-47F Chinook?", form: "auswahl",
        richtig: "Holzdorf", falsch: ["Laupheim", "Wunstorf", "Bückeburg"],
      },
      {
        frage: "Wo werden die deutschen F-35-Piloten in den USA ausgebildet?", form: "auswahl",
        richtig: "Fort Smith in Arkansas (Ebbing Air National Guard Base)", falsch: ["Sheppard in Texas", "Goodyear in Arizona", "Eglin in Florida"],
      },
      {
        frage: "Was kann das Objektschutzregiment der Luftwaffe Friesland im Einsatzgebiet leisten?", form: "auswahl",
        richtig: "Ein komplettes Flugfeld aufbauen, betreiben und schützen",
        falsch: ["Nur Feldlager bewachen", "Flugabwehrraketen führen", "Fallschirmjägerangriffe führen"],
      },
    ],
  },
  ausbildung: {
    name: "Eigener Ausbildungsweg",
    wissen: [
      {
        titel: "Auswahlverfahren",
        zeilen: [
          "Bewerbung über die Karriereberatung, dann die Offizier-Eignungsfeststellung am Assessmentcenter für Führungskräfte der Bundeswehr in Köln, zwei Tage plus Anreisetag.",
          "Phase II prüft die Wehrfliegerverwendungsfähigkeit am Zentrum für Luft- und Raumfahrtmedizin der Luftwaffe: fliegerärztliche Untersuchungen und fliegerpsychologische Tests zu Rechenfähigkeit, Merkfähigkeit, Koordination und Belastbarkeit.",
          "Phase III ist die simulatorgestützte Lern- und Arbeitsprobe (für Flächenflugzeuge das System FPS/F), bewertet von Fliegerpsychologen, Simulatorlehrern und einem Prüfstabsoffizier.",
        ],
      },
      {
        titel: "Drei Wege ins Cockpit",
        zeilen: [
          "Direkt ohne Studium in die fliegerische Ausbildung, über den dualen Studiengang Aeronautical Engineering, oder erst ein volles Studium und danach die Fliegerei.",
          "Ein Studium ist im fliegerischen Dienst keine Pflicht, auch mit mittlerer Reife ist der Weg zum Kampfpiloten möglich.",
          "Aeronautical Engineering läuft seit 2015 an der Universität der Bundeswehr München: rund zwei Jahre Theorie, dann die fliegerische Ausbildung, in etwa sieben Jahren zum einsatzbereiten Kampfpiloten mit Bachelor.",
        ],
      },
      {
        titel: "Offizierausbildung",
        zeilen: [
          "Die Offizierschule der Luftwaffe steht seit Oktober 2025 in Roth bei Nürnberg (vorher Fürstenfeldbruck), Offizieranwärter durchlaufen dort im Schnitt rund acht Monate.",
        ],
      },
      {
        titel: "Fliegerische Ausbildung in den USA",
        zeilen: [
          "Grundschulung: drei bis vier Monate bei der 3. Deutschen Luftwaffenausbildungsstaffel in Goodyear (Arizona) auf der kunstflugtauglichen Grob G 120TP.",
          "Jetausbildung beim Euro-NATO Joint Jet Pilot Training in Sheppard (Texas): 55 Wochen mit rund 200 Flugstunden auf T-6A Texan II und T-38C Talon, jährlich etwa 24 deutsche Flugschüler.",
          "Künftige Kampfpiloten hängen den rund zehnwöchigen Kurs Introduction to Fighter Fundamentals auf der T-38C an, insgesamt etwa 15 Monate Texas.",
          "Das ENJJPT besteht seit 1981, über 2600 deutsche Jetpiloten wurden dort ausgebildet.",
        ],
      },
      {
        titel: "Waffensystemausbildung",
        zeilen: [
          "Eurofighter: beim TaktLwG 73 Steinhoff in Laage, beginnend mit 285 Stunden Theorie; planmäßig ist schon der siebte Flug der erste Alleinflug im einsitzigen Eurofighter.",
          "F-35: ab Herbst 2026 auf der Ebbing Air National Guard Base in Fort Smith (Arkansas) mit acht dauerhaft dort stationierten deutschen Maschinen.",
        ],
      },
      {
        titel: "Dauer und Verpflichtung",
        zeilen: [
          "Vom Diensteintritt bis zum einsatzbereiten Kampfpiloten vergehen je nach Weg fünf bis zehn Jahre.",
          "Die Verpflichtungszeit für Jetpiloten beträgt mindestens 16 Jahre, verlängerbar bis 25 Jahre, festgesetzt stufenweise nach den bestandenen Ausbildungsabschnitten.",
        ],
      },
    ],
    fragen: [
      { frage: "In welcher Stadt sitzt das Assessmentcenter für Führungskräfte der Bundeswehr?", form: "eingabe", loesungen: ["Köln", "Koeln"] },
      { frage: "Auf welchem Muster läuft die fliegerische Grundschulung in Goodyear?", form: "eingabe", loesungen: ["G 120TP", "G120TP", "Grob G 120TP", "Grob 120", "Grob"] },
      { frage: "Wie viele Wochen dauert das Undergraduate Pilot Training beim ENJJPT?", form: "eingabe", loesungen: ["55"] },
      { frage: "Wo findet die Eurofighter-Waffensystemausbildung statt?", form: "eingabe", loesungen: ["Laage", "TaktLwG 73", "Rostock-Laage", "Rostock Laage"] },
      { frage: "Wie viele Jahre beträgt die Mindestverpflichtung für Jetpiloten?", form: "eingabe", loesungen: ["16", "sechzehn"] },
      { frage: "Seit welchem Jahr besteht das ENJJPT?", form: "eingabe", loesungen: ["1981"] },
      {
        frage: "Auf welchen beiden Mustern fliegt man beim ENJJPT?", form: "auswahl",
        richtig: "T-6A Texan II und T-38C Talon", falsch: ["T-6A Texan II und F-16", "G 120TP und T-38C Talon", "Alpha Jet und Hawk"],
      },
      {
        frage: "Was prüft Phase II der Eignungsfeststellung?", form: "auswahl",
        richtig: "Die Wehrfliegerverwendungsfähigkeit mit Flugmedizin und Fliegerpsychologie",
        falsch: ["Nur die sportliche Leistungsfähigkeit", "Die allgemeine Offiziereignung", "Das taktische Wissen über Luftkriegführung"],
      },
      {
        frage: "Was ist Phase III der Eignungsfeststellung?", form: "auswahl",
        richtig: "Eine simulatorgestützte fliegerpsychologische Lern- und Arbeitsprobe",
        falsch: ["Ein Prüfungsflug auf der G 120TP", "Ein mehrtägiger Sporttest", "Ein Auswahlseminar mit Gruppendiskussionen"],
      },
      {
        frage: "Wie lange dauert die Offizierausbildung an der Offizierschule vor einem Studium im Schnitt?", form: "auswahl",
        richtig: "Rund acht Monate", falsch: ["Rund drei Monate", "Rund anderthalb Jahre", "Rund drei Jahre"],
      },
      {
        frage: "Welcher Studiengang ist auf die Pilotenlaufbahn zugeschnitten?", form: "auswahl",
        richtig: "Aeronautical Engineering an der Universität der Bundeswehr München",
        falsch: ["Luft- und Raumfahrttechnik in Stuttgart", "Medizinische Informationstechnik", "Wehrtechnik in Hamburg"],
      },
      {
        frage: "Was folgt in Sheppard nach dem Erhalt der Schwingen für künftige Kampfpiloten?", form: "auswahl",
        richtig: "Der Kurs Introduction to Fighter Fundamentals auf der T-38C",
        falsch: ["Die direkte Verlegung nach Laage", "Ein Hubschrauberlehrgang", "Die F-35-Ausbildung in Eglin"],
      },
      {
        frage: "Wie viele deutsche Flugschüler beginnen jährlich am ENJJPT?", form: "auswahl",
        richtig: "Etwa 24", falsch: ["Etwa 8", "Etwa 60", "Etwa 120"],
      },
      {
        frage: "Wie lange dauert es vom Diensteintritt bis zum einsatzbereiten Kampfpiloten?", form: "auswahl",
        richtig: "Je nach Weg fünf bis zehn Jahre", falsch: ["Zwei bis drei Jahre", "Genau vier Jahre", "Mindestens zwölf Jahre"],
      },
    ],
  },
  dienstgrade: {
    name: "Dienstgrade",
    wissen: [
      {
        titel: "Die sieben Dienstgradgruppen",
        zeilen: [
          "Aufsteigend: Mannschaften, Unteroffiziere ohne Portepee, Unteroffiziere mit Portepee, Leutnante, Hauptleute, Stabsoffiziere, Generale.",
          "Das Portepee war die Trageschlaufe am Seitengewehr und ist heute ein Statusmerkmal: alle Feldwebel tragen es, Unteroffizier und Stabsunteroffizier nicht.",
        ],
      },
      {
        titel: "Mannschaften",
        zeilen: [
          "Aufsteigend: Soldat (mit Tätigkeitsbezeichnung, in der Luftwaffe Flieger), Gefreiter, Obergefreiter, Hauptgefreiter, Stabsgefreiter, Oberstabsgefreiter.",
          "Dazwischen neu eingeschoben: Korporal und Stabskorporal als Spitzendienstgrade der Mannschaften.",
        ],
      },
      {
        titel: "Unteroffiziere",
        zeilen: [
          "Ohne Portepee nur zwei: Unteroffizier und Stabsunteroffizier, erkennbar an der silbernen Tresse um die Schulterklappe.",
          "Mit Portepee die Feldwebelreihe: Feldwebel, Oberfeldwebel, Hauptfeldwebel, Stabsfeldwebel, Oberstabsfeldwebel.",
        ],
      },
      {
        titel: "Offiziere",
        zeilen: [
          "Aufsteigend: Leutnant, Oberleutnant, Hauptmann, Stabshauptmann, Major, Oberstleutnant, Oberst, Brigadegeneral, Generalmajor, Generalleutnant, General.",
          "Stabsoffiziere tragen das geflochtene silberne Schulterstück: ein Stern Major, zwei Oberstleutnant, drei Oberst.",
          "Die Generalsreihenfolge Brigadegeneral, Generalmajor, Generalleutnant, General ist NATO-üblich und folgt nicht der Logik der Truppendienstgrade.",
        ],
      },
      {
        titel: "Marine-Entsprechungen",
        zeilen: [
          "Leutnant zur See = Leutnant, Kapitänleutnant = Hauptmann, Korvettenkapitän = Major, Fregattenkapitän = Oberstleutnant, Kapitän zur See = Oberst.",
          "Admirale aufsteigend: Flottillenadmiral, Konteradmiral, Vizeadmiral, Admiral.",
        ],
      },
      {
        titel: "Anwärter und NATO-Codes",
        zeilen: [
          "Offizieranwärter durchlaufen Fahnenjunker, Fähnrich, Oberfähnrich; der Fähnrich steht auf Feldwebelebene.",
          "NATO-Rangcodes: OR für Mannschaften und Unteroffiziere, OF für Offiziere. Leutnant und Oberleutnant OF-1, Hauptmann OF-2, Major OF-3, Oberst OF-5, General OF-9.",
        ],
      },
    ],
    fragen: [
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-leutnant.png", loesungen: ["Leutnant"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-oberleutnant.png", loesungen: ["Oberleutnant"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-hauptmann.png", loesungen: ["Hauptmann"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-stabshauptmann.png", loesungen: ["Stabshauptmann"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-major.png", loesungen: ["Major"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-oberstleutnant.png", loesungen: ["Oberstleutnant"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-oberst.png", loesungen: ["Oberst"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-brigadegeneral.png", loesungen: ["Brigadegeneral"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-generalmajor.png", loesungen: ["Generalmajor"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-generalleutnant.png", loesungen: ["Generalleutnant"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-general.png", loesungen: ["General"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-feldwebel.png", loesungen: ["Feldwebel"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-oberfeldwebel.png", loesungen: ["Oberfeldwebel"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-hauptfeldwebel.png", loesungen: ["Hauptfeldwebel"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-unteroffizier.png", loesungen: ["Unteroffizier"] },
      { frage: "Welcher Dienstgrad ist das?", form: "eingabe", bild: "bilder/abzeichen/luftwaffe-oberstabsfeldwebel.png", loesungen: ["Oberstabsfeldwebel"] },
      { frage: "Welcher Dienstgrad folgt auf den Oberleutnant?", form: "eingabe", loesungen: ["Hauptmann"] },
      { frage: "Wie heißt der höchste Mannschaftsdienstgrad?", form: "eingabe", loesungen: ["Oberstabsgefreiter"] },
      { frage: "Wie heißt der höchste Unteroffizierdienstgrad?", form: "eingabe", loesungen: ["Oberstabsfeldwebel"] },
      { frage: "Wie lautet die Marine-Entsprechung des Hauptmanns?", form: "eingabe", loesungen: ["Kapitänleutnant", "Kapitaenleutnant"] },
      { frage: "Wie lautet die Marine-Entsprechung des Majors?", form: "eingabe", loesungen: ["Korvettenkapitän", "Korvettenkapitaen"] },
      { frage: "Wie lautet die Marine-Entsprechung des Oberstleutnants?", form: "eingabe", loesungen: ["Fregattenkapitän", "Fregattenkapitaen"] },
      {
        frage: "Wie viele Dienstgradgruppen kennt die Bundeswehr?", form: "auswahl",
        richtig: "Sieben", falsch: ["Fünf", "Sechs", "Acht"],
      },
      {
        frage: "Welche zwei Dienstgrade bilden die Unteroffiziere ohne Portepee?", form: "auswahl",
        richtig: "Unteroffizier und Stabsunteroffizier",
        falsch: ["Feldwebel und Oberfeldwebel", "Korporal und Stabskorporal", "Fahnenjunker und Fähnrich"],
      },
      {
        frage: "Welcher NATO-Rangcode gehört zum Hauptmann?", form: "auswahl",
        richtig: "OF-2", falsch: ["OF-1", "OF-3", "OR-7"],
      },
      {
        frage: "Auf welcher Ebene steht der Fähnrich?", form: "auswahl",
        richtig: "Auf der Ebene des Feldwebels", falsch: ["Auf der Ebene des Leutnants", "Auf der Ebene des Unteroffiziers", "Auf der Ebene des Hauptfeldwebels"],
      },
      {
        frage: "Wie lautet die aufsteigende Reihenfolge der Generale?", form: "auswahl",
        richtig: "Brigadegeneral, Generalmajor, Generalleutnant, General",
        falsch: [
          "Generalmajor, Brigadegeneral, Generalleutnant, General",
          "Brigadegeneral, Generalleutnant, Generalmajor, General",
          "Generalleutnant, Generalmajor, Brigadegeneral, General",
        ],
      },
      {
        frage: "Welchen Dienstgrad trägt der Generalinspekteur der Bundeswehr?", form: "auswahl",
        richtig: "General (bei einem Marineoffizier Admiral)", falsch: ["Generalleutnant", "Generalmajor", "Brigadegeneral"],
      },
    ],
  },
  aufbau: {
    name: "Aufbau der Bundeswehr",
    wissen: [
      {
        titel: "Vier Teilstreitkräfte",
        zeilen: [
          "Seit dem 1. Mai 2024: Heer, Luftwaffe, Marine und Cyber- und Informationsraum (CIR). Der CIR bestand seit 2017 als Organisationsbereich und wurde mit der Reform zur vierten Teilstreitkraft.",
          "Grundlage ist der Osnabrücker Erlass vom 30. April 2024 (löste den Dresdner Erlass ab); die Reform Bundeswehr der Zeitenwende zielt auf Kriegstüchtigkeit, weniger Schnittstellen und schnellere Entscheidungen.",
        ],
      },
      {
        titel: "Unterstützungsbereich",
        zeilen: [
          "Streitkräftebasis und Zentraler Sanitätsdienst wurden zum 1. Oktober 2025 aufgelöst und gingen im Unterstützungsbereich auf, mit rund 55.000 Angehörigen der zweitgrößte militärische Bereich.",
          "Geführt vom Unterstützungskommando der Bundeswehr in Bonn (seit Oktober 2024); den Sanitätsdienst führt das Kommando Gesundheitsversorgung in Koblenz.",
          "Gebündelt sind dort Logistik, ABC-Abwehr, Feldjäger, zivil-militärische Zusammenarbeit und die Gesundheitsversorgung.",
        ],
      },
      {
        titel: "Operatives Führungskommando",
        zeilen: [
          "Aufgestellt zum 1. Oktober 2024 aus Einsatzführungskommando (Schwielowsee) und Territorialem Führungskommando (Berlin), in Dienst gestellt am 1. April 2025.",
          "Es plant und führt alle Operationen aus einer Hand: Landes- und Bündnisverteidigung, Krisenmanagement, Evakuierungen, Amts- und Katastrophenhilfe. Befehlshaber ist Generalleutnant Alexander Sollfrank.",
        ],
      },
      {
        titel: "Spitzengliederung",
        zeilen: [
          "Bundesminister der Verteidigung: Boris Pistorius, im Amt seit Januar 2023.",
          "Generalinspekteur: General Carsten Breuer, seit März 2023 ranghöchster Soldat und militärischer Berater der Bundesregierung, Anfang 2026 für den Vorsitz des NATO-Militärausschusses nominiert.",
          "Inspekteur der Luftwaffe: Generalleutnant Holger Neumann, seit Mai 2025, Nachfolger von Ingo Gerhartz. Heer: Generalleutnant Christian Freuding. Marine: Vizeadmiral Jan Christian Kaack.",
        ],
      },
      {
        titel: "Personal",
        zeilen: [
          "Stand Sommer 2026 rund 186.700 aktive Soldatinnen und Soldaten und rund 81.000 zivile Beschäftigte, der höchste Stand seit 2013.",
          "Ziel bis Mitte der 2030er Jahre: rund 260.000 aktive Soldaten plus rund 200.000 Reservisten, zusammen etwa 460.000 Kräfte, abgeleitet aus den NATO-Fähigkeitszielen.",
        ],
      },
      {
        titel: "Neuer Wehrdienst",
        zeilen: [
          "Das Wehrdienst-Modernisierungsgesetz gilt seit dem 1. Januar 2026: grundsätzlich freiwillig, mindestens sechs Monate, ab zwölf Monaten als Soldat auf Zeit.",
          "Alle 18-Jährigen erhalten einen Fragebogen, für Männer ab Jahrgang 2008 ist das Ausfüllen Pflicht; ab dem 1. Juli 2027 beginnt für sie die verpflichtende Musterung.",
          "Verpflichtende Dienstelemente gäbe es nur durch einen eigenen Bundestagsbeschluss; eine Wehrpflicht für Frauen bräuchte eine Grundgesetzänderung.",
          "Die Heimatschutzdivision ist seit April 2025 die vierte Division des Heeres.",
        ],
      },
    ],
    fragen: [
      { frage: "Wie heißt der Bundesminister der Verteidigung?", form: "eingabe", loesungen: ["Pistorius", "Boris Pistorius"] },
      { frage: "Wer ist Generalinspekteur der Bundeswehr?", form: "eingabe", loesungen: ["Breuer", "Carsten Breuer", "General Breuer"] },
      { frage: "Wer ist Inspekteur der Luftwaffe?", form: "eingabe", loesungen: ["Neumann", "Holger Neumann"] },
      { frage: "Wie viele Teilstreitkräfte hat die Bundeswehr?", form: "eingabe", loesungen: ["4", "vier"] },
      { frage: "Wie heißt die vierte Teilstreitkraft?", form: "eingabe", loesungen: ["CIR", "Cyber- und Informationsraum", "Cyber und Informationsraum", "Cyberraum"] },
      { frage: "In welcher Stadt sitzt das Unterstützungskommando der Bundeswehr?", form: "eingabe", loesungen: ["Bonn"] },
      {
        frage: "Wie heißt der Erlass, der die Struktur von 2024 begründet?", form: "auswahl",
        richtig: "Osnabrücker Erlass", falsch: ["Dresdner Erlass", "Berliner Erlass", "Kölner Erlass"],
      },
      {
        frage: "Welches Kommando führt alle Operationen der Bundeswehr auf operativer Ebene?", form: "auswahl",
        richtig: "Das Operative Führungskommando der Bundeswehr",
        falsch: ["Das Einsatzführungskommando", "Das Territoriale Führungskommando", "Das Kommando Streitkräftebasis"],
      },
      {
        frage: "Was geschah mit Streitkräftebasis und Zentralem Sanitätsdienst?", form: "auswahl",
        richtig: "Zum 1. Oktober 2025 aufgelöst und im Unterstützungsbereich aufgegangen",
        falsch: ["Sie bestehen unverändert fort", "Sie wurden dem Heer unterstellt", "Sie wurden zu eigenen Teilstreitkräften"],
      },
      {
        frage: "Wie viele aktive Soldaten hatte die Bundeswehr im Sommer 2026 ungefähr?", form: "auswahl",
        richtig: "Rund 187.000", falsch: ["Rund 150.000", "Rund 210.000", "Rund 260.000"],
      },
      {
        frage: "Auf welchen aktiven Umfang soll die Truppe bis Mitte der 2030er wachsen?", form: "auswahl",
        richtig: "Rund 260.000 Soldaten plus rund 200.000 Reservisten",
        falsch: ["Rund 200.000 Soldaten ohne Reserve", "Rund 300.000 Soldaten plus 100.000 Reservisten", "Rund 500.000 aktive Soldaten"],
      },
      {
        frage: "Wie funktioniert der neue Wehrdienst seit Januar 2026?", form: "auswahl",
        richtig: "Grundsätzlich freiwillig, mit Pflichtfragebogen für Männer ab Jahrgang 2008",
        falsch: ["Allgemeine Wehrpflicht für alle ab 18", "Nur Berufssoldaten, keine Freiwilligen", "Pflichtdienst für Männer und Frauen"],
      },
      {
        frage: "Ab wann beginnt die verpflichtende Musterung für Männer?", form: "auswahl",
        richtig: "Ab dem 1. Juli 2027", falsch: ["Ab dem 1. Januar 2026", "Ab dem 1. Januar 2028", "Sie ist nicht vorgesehen"],
      },
      {
        frage: "Wer müsste über verpflichtende Wehrdienst-Elemente entscheiden?", form: "auswahl",
        richtig: "Der Bundestag per Gesetz", falsch: ["Der Verteidigungsminister allein", "Der Generalinspekteur", "Die NATO"],
      },
    ],
  },
  themen: {
    name: "Aktuelle Themen",
    wissen: [
      {
        titel: "Brigade Litauen",
        zeilen: [
          "Die Panzerbrigade 45 Litauen ist seit dem 1. April 2025 in Dienst, der erste dauerhaft im Ausland stationierte Großverband der Bundeswehr, Standorte Rūdninkai bei Vilnius und Rukla.",
          "Anfang 2026 standen rund 1.800 Brigadeangehörige vor Ort, unterstellt sind unter anderem Panzerbataillon 203, Panzergrenadierbataillon 122 und die multinationale NATO-Battlegroup.",
          "Bis 2027 soll die Brigade mit rund 5.000 Soldaten und zivilen Beschäftigten voll einsatzbereit sein.",
        ],
      },
      {
        titel: "NATO-Ziele und Geld",
        zeilen: [
          "Gipfel von Den Haag im Juni 2025: bis 2035 jährlich 5 Prozent des BIP, davon mindestens 3,5 Prozent für klassische Verteidigung und bis zu 1,5 Prozent für verteidigungsrelevante Ausgaben.",
          "Aus den neuen NATO-Fähigkeitszielen leitet Deutschland einen Bedarf von insgesamt rund 460.000 aktiven Soldaten und Reservisten ab.",
          "Der Verteidigungshaushalt 2026 umfasst 108,2 Milliarden Euro (Einzelplan 14 plus Sondervermögen), ein Rekordwert; geplanter Anstieg auf 3,5 Prozent des BIP bis 2029.",
        ],
      },
      {
        titel: "Einsätze und Missionen",
        zeilen: [
          "Mitte 2026 rund 700 Soldaten in mandatierten Auslandseinsätzen, größtes Kontingent KFOR im Kosovo.",
          "UNIFIL im Libanon endet: letztmalige Mandatsverlängerung, Deutschland wickelt nach rund 20 Jahren Beteiligung ab.",
          "Weitere Beiträge: Aspides (Schutz der Schifffahrt im Roten Meer), Irini (Libyen-Waffenembargo), NSATU für die Ukraine-Unterstützung, Baltic Sentry zum Schutz der Ostsee-Infrastruktur seit Januar 2025.",
        ],
      },
      {
        titel: "Luftraum an der Ostflanke",
        zeilen: [
          "Air Policing Baltikum seit 2005: Estland, Lettland und Litauen besitzen keine eigenen Kampfjets, die Kontingente umfassen bis zu sechs Eurofighter.",
          "September 2025: 19 russische Drohnen drangen in den polnischen Luftraum ein, NATO-Jets schossen mehrere ab, der erste Waffeneinsatz der NATO über Bündnisgebiet; kurz darauf verletzten drei MiG-31 den estnischen Luftraum.",
          "Antwort der NATO ist die Operation Eastern Sentry entlang der ganzen Ostflanke; Deutschland verlegte dafür fünf Eurofighter aus Nörvenich nach Polen.",
        ],
      },
      {
        titel: "Drohnen über Deutschland",
        zeilen: [
          "Oktober 2025: Der Flughafen München stellte wegen Drohnensichtungen zeitweise den Betrieb ein; hinter vielen Vorfällen werden staatliche Akteure vermutet.",
          "Seit März 2026 gilt das novellierte Luftsicherheitsgesetz: Die Bundespolizei führt die Drohnenabwehr an Flughäfen, die Länder können die Bundeswehr im Eilverfahren zur Amtshilfe anfordern.",
          "Im August 2026 folgten neue Vorfälle, darunter eine Sprengstoffdrohne am Flughafen Leipzig/Halle und Überflüge über eine Kaserne in Mechernich.",
        ],
      },
      {
        titel: "Ukraine-Unterstützung",
        zeilen: [
          "Deutschland ist mit rund 55 Milliarden Euro seit 2022 der größte Unterstützer der Ukraine in Europa, für 2026 sind 11,5 Milliarden Euro eingeplant.",
          "Schwerpunkt Luftverteidigung: unter anderem Patriot-Lenkflugkörper und 36 IRIS-T-Startgeräte aus dem Paket vom April 2026; fünf eigene Patriot-Systeme wurden abgegeben.",
        ],
      },
      {
        titel: "Projekte und Übungen",
        zeilen: [
          "Das Kampfjet-Projekt FCAS mit Frankreich und Spanien wurde im Juni 2026 für gescheitert erklärt, vor allem wegen des Führungsstreits zwischen Dassault und Airbus; Teile der Vernetzungsarbeit laufen weiter.",
          "Ramstein Flag 2026: NATO-Luftwaffenübung mit 18 Nationen und über 200 Flugzeugen, erstmals als Doppelmanöver Nord und Süd.",
          "Die Bundeswehr übt seit 2023 jährlich in der Serie Quadriga, 2026 verzahnt mit der NATO-Übung Steadfast Dart.",
        ],
      },
    ],
    fragen: [
      { frage: "In welchem Land ist die Panzerbrigade 45 dauerhaft stationiert?", form: "eingabe", loesungen: ["Litauen"] },
      { frage: "Bis zu welchem Jahr soll die Brigade Litauen voll einsatzbereit sein?", form: "eingabe", loesungen: ["2027"] },
      { frage: "Wie viel Prozent des BIP sollen NATO-Staaten bis 2035 insgesamt erreichen?", form: "eingabe", loesungen: ["5", "fünf", "5 Prozent", "fuenf"] },
      { frage: "Welches Land beantragte nach dem Drohneneinflug im September 2025 Konsultationen nach Artikel 4?", form: "eingabe", loesungen: ["Polen"] },
      { frage: "Wie heißt die NATO-Operation zur Stärkung der Ostflanke seit September 2025?", form: "eingabe", loesungen: ["Eastern Sentry"] },
      { frage: "Wie heißt die EU-Operation zum Schutz der Schifffahrt im Roten Meer?", form: "eingabe", loesungen: ["Aspides"] },
      {
        frage: "Warum fliegt die NATO das Air Policing Baltikum?", form: "auswahl",
        richtig: "Estland, Lettland und Litauen besitzen keine eigenen Kampfjets",
        falsch: ["Russland hat es im Friedensvertrag verlangt", "Die baltischen Piloten sind noch in der Ausbildung", "Es ist eine reine Übungsserie"],
      },
      {
        frage: "Was geschah im Juni 2026 mit dem Kampfjet-Projekt FCAS?", form: "auswahl",
        richtig: "Deutschland und Frankreich erklärten das gemeinsame Projekt für gescheitert",
        falsch: ["Der erste Prototyp flog", "Großbritannien trat bei", "Es wurde in Eurofighter 2 umbenannt"],
      },
      {
        frage: "Wo steht das größte deutsche Einsatzkontingent?", form: "auswahl",
        richtig: "KFOR im Kosovo", falsch: ["UNIFIL im Libanon", "Aspides im Roten Meer", "Irini im Mittelmeer"],
      },
      {
        frage: "Was schützt die NATO-Aktivität Baltic Sentry?", form: "auswahl",
        richtig: "Kritische Unterwasser-Infrastruktur in der Ostsee",
        falsch: ["Die Fischbestände der Ostsee", "Fährverbindungen nach Schweden", "Ölplattformen in der Nordsee"],
      },
      {
        frage: "Wie groß ist der Verteidigungshaushalt 2026 einschließlich Sondervermögen?", form: "auswahl",
        richtig: "Rund 108 Milliarden Euro", falsch: ["Rund 50 Milliarden Euro", "Rund 75 Milliarden Euro", "Rund 150 Milliarden Euro"],
      },
      {
        frage: "Welche Rolle spielt Deutschland bei der Ukraine-Unterstützung?", form: "auswahl",
        richtig: "Größter Unterstützer in Europa mit rund 55 Milliarden Euro seit 2022",
        falsch: ["Nur humanitäre Hilfe ohne Waffen", "Drittgrößter Unterstützer hinter Polen und Frankreich", "Die Unterstützung wurde 2025 beendet"],
      },
      {
        frage: "Was war Ramstein Flag 2026?", form: "auswahl",
        richtig: "Eine NATO-Luftwaffenübung mit 18 Nationen und über 200 Flugzeugen",
        falsch: ["Eine Beschaffungskonferenz", "Ein Manöver der Marine", "Eine Cyberabwehrübung"],
      },
      {
        frage: "Was regelt die Novelle des Luftsicherheitsgesetzes seit März 2026?", form: "auswahl",
        richtig: "Die Bundespolizei führt die Drohnenabwehr an Flughäfen, die Bundeswehr kann im Eilverfahren Amtshilfe leisten",
        falsch: ["Die Luftwaffe darf Drohnen über Städten abschießen", "Private dürfen Störsender betreiben", "Flughäfen müssen eigene Abfangdrohnen kaufen"],
      },
    ],
  },
  beschaffung: {
    name: "Beschaffungen und Bestände",
    wissen: [
      {
        titel: "Eurofighter",
        zeilen: [
          "Bestand 138, nach Zulauf aller Bestellungen wächst die Flotte auf 163.",
          "Tranche 4 (Projekt Quadriga): 38 Maschinen, bestellt 2020, Erstflug Juli 2026, Auslieferung bis 2030.",
          "Tranche 5: 20 weitere, bestellt im Oktober 2025 für rund 3,75 Milliarden Euro, Zulauf 2031 bis 2034.",
          "Eurofighter EK: 15 Maschinen werden mit Arexis-Sensorik und AARGM für den Elektronischen Kampf umgerüstet, übernehmen bis 2030 die SEAD-Rolle vom Tornado ECR.",
        ],
      },
      {
        titel: "Tornado und F-35A",
        zeilen: [
          "Noch rund 93 Tornado IDS und ECR, Ausmusterung bis 2030; die F-35A übernimmt die IDS-Rolle samt nuklearer Teilhabe, der Eurofighter EK die ECR-Rolle.",
          "35 F-35A bestellt, Gesamtpaket knapp zehn Milliarden Euro; die erste Maschine 35+01 verlässt im September 2026 das Werk.",
          "Die ersten acht bleiben zur Ausbildung in Fort Smith (Arkansas), ab Ende 2027 beginnt die Stationierung in Büchel, Anfangsbefähigung 2029.",
          "Bewaffnung im Zulauf: bis zu 400 Luft-Luft-Flugkörper AIM-120D-3 AMRAAM und die Abstandswaffe Joint Strike Missile.",
        ],
      },
      {
        titel: "Transport und Tanker",
        zeilen: [
          "A400M: Flotte mit 53 Maschinen komplett (letzte Landung April 2026 in Wunstorf), die größte A400M-Flotte der Welt.",
          "C-130J: sechs Maschinen in der binationalen Staffel mit Frankreich.",
          "A330 MRTT: multinationale Flotte wächst bis 2029 auf zwölf; Deutschland hält 62 Prozent und erhält rund 5500 Flugstunden im Jahr, eine Maschine steht in Köln ständig für die medizinische Evakuierung bereit.",
        ],
      },
      {
        titel: "Hubschrauber",
        zeilen: [
          "CH-47F Chinook: 60 bestellt, Zulauf viertes Quartal 2027 bis 2032, 47 nach Holzdorf, zwölf nach Laupheim, einer nach Manching; sie ersetzen die CH-53, von der noch 66 fliegen.",
          "H145M: 82 fest bestellt (Option über 20 im Dezember 2025 eingelöst), 72 fürs Heer, zehn für die Luftwaffe.",
        ],
      },
      {
        titel: "Aufklärung",
        zeilen: [
          "P-8A Poseidon: acht bestellt für rund 3,1 Milliarden Euro, Mitte 2026 drei in Nordholz, Rest bis 2029.",
          "Heron TP: fünf geleaste Drohnen in Jagel, drei weitere bestellt, insgesamt acht.",
          "Pegasus: Signalaufklärung auf drei Bombardier Global 6000, Zulauf ab 2027 nach Jagel.",
        ],
      },
      {
        titel: "Bodengebundene Luftverteidigung",
        zeilen: [
          "Arrow 3: Anfangsbefähigung seit Dezember 2025 in Holzdorf, fängt ballistische Raketen außerhalb der Atmosphäre ab, Vollbefähigung 2030.",
          "IRIS-T SLM: sechs Feuereinheiten bestellt, 14 weitere für 3,18 Milliarden Euro, Zielbestand 20.",
          "Patriot: fünf Feuereinheiten an die Ukraine abgegeben, sieben verblieben, acht neu bestellt mit Zulauf ab Ende 2026, Zielbestand 15.",
        ],
      },
    ],
    fragen: [
      { frage: "Wie viele Eurofighter hat die Luftwaffe im Bestand?", form: "eingabe", loesungen: ["138"] },
      { frage: "Wie viele F-35A hat Deutschland bestellt?", form: "eingabe", loesungen: ["35"] },
      { frage: "Wie viele A400M umfasst die fertige Flotte?", form: "eingabe", loesungen: ["53"] },
      { frage: "Wie viele CH-47F Chinook sind bestellt?", form: "eingabe", loesungen: ["60"] },
      { frage: "Wie viele P-8A Poseidon sind bestellt?", form: "eingabe", loesungen: ["8", "acht"] },
      { frage: "Wie viele Eurofighter der Tranche 5 wurden im Oktober 2025 bestellt?", form: "eingabe", loesungen: ["20", "zwanzig"] },
      { frage: "Wie viele Eurofighter werden zum Eurofighter EK umgerüstet?", form: "eingabe", loesungen: ["15", "fünfzehn", "fuenfzehn"] },
      { frage: "Wie viele Tornados fliegt die Luftwaffe noch ungefähr?", form: "eingabe", loesungen: ["93", "rund 93", "etwa 93"] },
      {
        frage: "Wer übernimmt die nukleare Teilhabe vom Tornado?", form: "auswahl",
        richtig: "Die F-35A", falsch: ["Der Eurofighter EK", "Der Eurofighter Tranche 5", "Die A400M"],
      },
      {
        frage: "Bis wann sollen alle Tornados ausgemustert sein?", form: "auswahl",
        richtig: "Bis 2030", falsch: ["Bis 2026", "Bis 2035", "Bis 2040"],
      },
      {
        frage: "Wie viele Patriot-Feuereinheiten hat Deutschland an die Ukraine abgegeben?", form: "auswahl",
        richtig: "Fünf", falsch: ["Zwei", "Acht", "Alle zwölf"],
      },
      {
        frage: "Wie lautet der Zielbestand bei Patriot?", form: "auswahl",
        richtig: "15 Feuereinheiten", falsch: ["7 Feuereinheiten", "10 Feuereinheiten", "24 Feuereinheiten"],
      },
      {
        frage: "Wie lautet der Zielbestand bei IRIS-T SLM?", form: "auswahl",
        richtig: "20 Feuereinheiten", falsch: ["6 Feuereinheiten", "12 Feuereinheiten", "44 Feuereinheiten"],
      },
      {
        frage: "Was ist Pegasus?", form: "auswahl",
        richtig: "Signalaufklärung auf drei Bombardier Global 6000",
        falsch: ["Eine neue Transportdrohne", "Das Nachfolgesystem der Patriot", "Ein Tankerprogramm mit Frankreich"],
      },
      {
        frage: "Was leistet Arrow 3?", form: "auswahl",
        richtig: "Es fängt ballistische Raketen außerhalb der Atmosphäre ab",
        falsch: ["Es bekämpft Drohnen im Tiefflug", "Es ersetzt IRIS-T SLM", "Es schützt nur Flugplätze im Einsatzland"],
      },
      {
        frage: "Wie verteilen sich die 82 bestellten H145M?", form: "auswahl",
        richtig: "72 fürs Heer, zehn für die Luftwaffe", falsch: ["Alle 82 für die Luftwaffe", "41 je Teilstreitkraft", "62 fürs Heer, 20 für die Marine"],
      },
    ],
  },
  persoenlich: {
    name: "Persönliches",
    wissen: [
      {
        titel: "Grundsätze fürs Gespräch",
        zeilen: [
          "Ehrlich bleiben: Die Prüfer führen solche Gespräche täglich und merken auswendig gelernte Antworten sofort.",
          "Jede Aussage mit einem konkreten Beispiel aus dem eigenen Leben belegen können.",
          "Motivation in eigenen Worten, nicht in Werbesprüchen der Bundeswehr.",
          "Zur eigenen Bewerbung stehen: Wer zweifelnd wirkt, wirft Fragen auf.",
        ],
      },
      {
        titel: "Worauf die Prüfer achten",
        zeilen: [
          "Realistisches Bild vom Beruf: Bereitschaftsdienst, Versetzungen, Auslandseinsätze und jahrelange Ausbildung gehören dazu, nicht nur das Fliegen.",
          "Belastbarkeit und Umgang mit Rückschlägen, am liebsten an erlebten Situationen.",
          "Informiertheit: aktuelle Themen, Standorte, Ausbildungsweg, Muster.",
          "Gefestigte Haltung zum Dienst mit der Waffe, ohne Schulterzucken und ohne Heldenpose.",
        ],
      },
    ],
    fragen: [
      {
        frage: "Warum wollen Sie Kampfpilot bei der Bundeswehr werden und nicht Pilot bei einer Airline?",
        form: "reflexion",
        hinweise: [
          "Beides greifbar machen: das Fliegen als Handwerk und den Dienst als Auftrag.",
          "Den Airline-Vergleich aktiv aufnehmen, nicht ausweichen: Linienflug ist Transport, der fliegerische Dienst ist Auftrag im Team mit taktischer Tiefe.",
          "Eigene Erlebnisse nennen, die die Entscheidung geprägt haben.",
        ],
      },
      {
        frage: "Was machen Sie, wenn Sie die fliegerische Ausbildung nicht bestehen?",
        form: "reflexion",
        hinweise: [
          "Einen echten Plan B innerhalb der Bundeswehr zeigen, etwa eine andere Verwendung als Offizier.",
          "Die Frage prüft, ob die Bewerbung an der Bundeswehr hängt oder nur am Fliegen.",
          "Realismus zeigen: Die Durchfallquoten sind bekannt, wer sie kennt, wirkt vorbereitet.",
        ],
      },
      {
        frage: "Nennen Sie Ihre größten Stärken und eine echte Schwäche.",
        form: "reflexion",
        hinweise: [
          "Stärken mit Beleg: je ein konkretes Beispiel, sonst bleibt es Behauptung.",
          "Die Schwäche muss echt sein, keine verkleidete Stärke wie Perfektionismus.",
          "Zur Schwäche gehört der Umgang damit: Was tust du dagegen, was hat sich verbessert?",
        ],
      },
      {
        frage: "Erzählen Sie von einem Misserfolg und wie Sie damit umgegangen sind.",
        form: "reflexion",
        hinweise: [
          "Ein erlebtes, überprüfbares Beispiel wählen, kein konstruiertes.",
          "Struktur: Lage, eigener Anteil, was du daraus gelernt und danach anders gemacht hast.",
          "Eigenen Anteil benennen statt Umstände oder andere verantwortlich zu machen.",
        ],
      },
      {
        frage: "Sind Sie bereit, im Einsatz Waffen gegen Menschen einzusetzen?",
        form: "reflexion",
        hinweise: [
          "Die Frage kommt fast sicher und verlangt eine durchdachte, gefestigte Antwort.",
          "Weder Schulterzucken noch Heldenpose: Der Einsatz ist an Auftrag, Recht und Verhältnismäßigkeit gebunden und bleibt eine Gewissensentscheidung, die man vor sich vertreten können muss.",
          "Wer hier sichtbar noch nie nachgedacht hat, fällt durch das Raster.",
        ],
      },
      {
        frage: "Wie steht Ihr Umfeld zu Ihrer Bewerbung, und sind Sie bereit, den Wohnort zu wechseln?",
        form: "reflexion",
        hinweise: [
          "Versetzungsbereitschaft ist Grundbedingung, das sollte ohne Einschränkung stehen.",
          "Rückhalt des Umfelds ehrlich beschreiben, auch Bedenken dürfen vorkommen, wenn du zeigst, wie ihr damit umgeht.",
        ],
      },
      {
        frage: "Was wissen Sie über den Alltag eines Kampfpiloten jenseits des Fliegens?",
        form: "reflexion",
        hinweise: [
          "Alarmrotte und Bereitschaft, Übungen und Verlegungen, Simulator, Nachbereitung, Nebenaufgaben im Verband, Sport und ständige Überprüfungen.",
          "Die Flugstunden sind ein kleiner Teil des Dienstalltags, das sollte man wissen und aussprechen können.",
        ],
      },
      {
        frage: "Warum sollten wir uns für Sie entscheiden?",
        form: "reflexion",
        hinweise: [
          "Zwei bis drei belegbare Stärken mit Bezug zum fliegerischen Dienst, etwa Belastbarkeit, Lernfähigkeit, Teamverhalten.",
          "Selbstbewusst ohne Überheblichkeit: kein Vergleich mit anderen Bewerbern, sondern das eigene Profil.",
        ],
      },
      {
        frage: "Wo sehen Sie sich in fünfzehn Jahren?",
        form: "reflexion",
        hinweise: [
          "Eine realistische Laufbahnvorstellung zeigen: Einsatzreife, Verwendung im Geschwader, spätere Aufgaben in Ausbildung oder Führung.",
          "Die lange Verpflichtungszeit als bewusste Entscheidung darstellen, nicht als Preis.",
        ],
      },
      {
        frage: "Wie haben Sie sich auf dieses Gespräch vorbereitet?",
        form: "reflexion",
        hinweise: [
          "Konkret werden: aktuelle Themen verfolgt, Standorte und Muster gelernt, mit Soldaten oder Piloten gesprochen, eigene Motivation hinterfragt.",
          "Vorbereitung zeigt Ernsthaftigkeit, aber sie muss zur eigenen Erzählung passen.",
        ],
      },
      {
        frage: "Was war bisher Ihre größte Herausforderung, und wie haben Sie sie gemeistert?",
        form: "reflexion",
        hinweise: [
          "Eine Situation mit echtem Einsatz wählen, sportlich, schulisch, beruflich oder privat.",
          "Zeigen, wie du planst, durchhältst und mit Druck umgehst, das ist der Kern der Frage.",
        ],
      },
      {
        frage: "Was würden Sie tun, wenn ein Kamerad in Ihrer Gruppe dauerhaft schlechtgemacht wird?",
        form: "reflexion",
        hinweise: [
          "Haltung zeigen: Kameradschaft ist Pflicht, Wegsehen ist keine Option.",
          "Abgestuft handeln: ansprechen, dazwischengehen, notfalls melden, und das auch so benennen.",
        ],
      },
    ],
  },
};

// Reihenfolge der Bereiche in Auswahl und Lexikon; die Flugzeugmuster
// stehen als eigener Bereich davor (siehe uebung6.js).
export const WISSEN6_REIHE = ["standorte", "ausbildung", "dienstgrade", "aufbau", "themen", "beschaffung", "persoenlich"];
