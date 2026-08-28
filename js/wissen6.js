// Wissensbereiche der Mission 6 neben den Flugzeugmustern: je Bereich ein
// Name, Lexikonabschnitte (wissen: Teilüberschrift und Absätze in Fließtext,
// Willis Vorgabe vom 28.08.2026) und ein Fragenkatalog (fragen). Drei
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
        titel: "Die Eurofighter-Geschwader",
        absaetze: [
          "Das Rückgrat der Luftwaffe bilden vier Eurofighter-Geschwader: das Taktische Luftwaffengeschwader 31 Boelcke in Nörvenich, das TaktLwG 71 Richthofen in Wittmund, das TaktLwG 73 Steinhoff in Laage und das TaktLwG 74 in Neuburg an der Donau, das als einziges keinen Traditionsnamen führt. Wittmund und Neuburg stellen die Alarmrotten Nord und Süd: Dort stehen rund um die Uhr Eurofighter bereit, die nach der Alarmierung binnen 15 Minuten in der Luft sein müssen, um den deutschen Luftraum zu schützen.",
          "Eine Sonderrolle hat Laage bei Rostock: Mit rund 35 Maschinen bildet das Geschwader alle Eurofighter-Piloten der Luftwaffe aus, dazu die des österreichischen Bundesheeres.",
        ],
      },
      {
        titel: "Die Tornado-Geschwader",
        absaetze: [
          "Das TaktLwG 33 in Büchel in der Eifel stellt den deutschen Beitrag zur nuklearen Teilhabe der NATO. Nach rund vier Jahren Ausweichbetrieb in Nörvenich und einer Bahnsanierung für etwa 260 Millionen Euro kehrten die Tornados im Juni 2026 nach Büchel zurück. Ab Ende 2027 wird der Fliegerhorst zur Heimat der F-35A, der neue F-35-Campus soll ab November 2026 bezugsfertig sein.",
          "Das TaktLwG 51 Immelmann in Schleswig-Jagel fliegt Tornado IDS und ECR sowie die Drohnen Heron 1 und Heron TP. Seine Aufträge sind die taktische Luftaufklärung und die Niederhaltung gegnerischer Flugabwehr; künftig werden dort der Eurofighter EK und die Pegasus-Signalaufklärer stationiert.",
        ],
      },
      {
        titel: "Transport und Flugbereitschaft",
        absaetze: [
          "Das Lufttransportgeschwader 62 in Wunstorf ist das einzige Lufttransportgeschwader der Luftwaffe und fliegt den A400M; am 17. April 2026 landete dort die 53. und letzte Maschine. Mit Frankreich betreibt die Luftwaffe außerdem eine gemeinsame C-130J-Staffel im französischen Évreux.",
          "Die Flugbereitschaft BMVg hat ihren Hauptsitz in Köln-Wahn, der politische Flugbetrieb läuft ab Berlin. Zur Flotte gehören unter anderem drei A350-900, zwei A321neo LR für die medizinische Evakuierung und drei Global 6000.",
        ],
      },
      {
        titel: "Bodengebundene Luftverteidigung und Schutz",
        absaetze: [
          "Das Flugabwehrraketengeschwader 1 in Husum ist seit 2013 das einzige seiner Art in der Luftwaffe, sein Hauptwaffensystem ist Patriot. Gegen ballistische Raketen steht seit Dezember 2025 die erste Arrow-3-Stellung in Holzdorf mit Anfangsbefähigung bereit; insgesamt sind drei Stellungen geplant, die Vollbefähigung soll 2030 erreicht sein.",
          "Das Objektschutzregiment der Luftwaffe Friesland in Schortens kann mit seinen Infanteriekräften im Einsatzgebiet ein komplettes Flugfeld aufbauen, betreiben und schützen.",
        ],
      },
      {
        titel: "Marineflieger in Nordholz",
        absaetze: [
          "Die fliegenden Verbände der Marine sind in Nordholz bei Cuxhaven zu Hause. Das Marinefliegergeschwader 3 Graf Zeppelin stellt die Seefernaufklärung und U-Boot-Jagd und fliegt seit November 2025 die P-8A Poseidon als Ablösung der P-3C Orion.",
        ],
      },
      {
        titel: "Führung und Schulen",
        absaetze: [
          "Geführt wird die Luftwaffe vom Kommando Luftwaffe in Berlin-Gatow, die fliegenden Verbände unterstehen dem Luftwaffentruppenkommando in Köln-Wahn. Die Offizierschule der Luftwaffe steht seit Oktober 2025 in Roth bei Nürnberg, die Unteroffizierschule verteilt sich auf Appen und Heide.",
          "Ein großer Teil der fliegerischen Ausbildung findet in den USA statt: die Jetausbildung ENJJPT in Sheppard (Texas), die fliegerische Grundschulung in Goodyear (Arizona) und die künftige F-35-Ausbildung in Fort Smith (Arkansas).",
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
  technik: {
    name: "Technik: F-35 und Eurofighter",
    wissen: [
      {
        titel: "Der Eurofighter: Zelle und Antrieb",
        absaetze: [
          "Der Eurofighter ist ein Deltaflügler mit Canards und absichtlich instabil ausgelegt: Erst die Fly-by-wire-Steuerung macht ihn fliegbar, genau das verschafft ihm seine Wendigkeit. Die Zelle misst 15,96 Meter Länge bei 10,95 Metern Spannweite, wiegt leer rund elf Tonnen und startet mit höchstens rund 23,5 Tonnen.",
          "Zwei Eurojet-EJ200-Triebwerke liefern je rund 60 Kilonewton Trockenschub und rund 90 Kilonewton mit Nachbrenner. Damit erreicht der Jet Mach 2,0 und eine Dienstgipfelhöhe von rund 16.800 Metern (55.000 Fuß), steigt in etwa zweieinhalb Minuten auf über 10.000 Meter und ist für +9 g zugelassen. Als eine von wenigen Maschinen beherrscht er Supercruise, also anhaltenden Überschallflug ohne Nachbrenner.",
        ],
      },
      {
        titel: "Der Eurofighter: Bewaffnung",
        absaetze: [
          "Fest eingebaut ist die 27-mm-Bordkanone Mauser BK-27, dazu kommen 13 Außenlaststationen. In der Luft-Luft-Rolle trägt der Eurofighter IRIS-T, AMRAAM und den Langstreckenflugkörper Meteor, gegen Bodenziele je nach Rüststand Präzisionsbomben und den Marschflugkörper Taurus. Sein Erstflug war 1994, bei der Luftwaffe fliegt er seit 2004.",
        ],
      },
      {
        titel: "Die F-35A: Zelle und Antrieb",
        absaetze: [
          "Die F-35A Lightning II ist ein einstrahliger Tarnkappenjet der fünften Generation. Sie ist mit 15,7 Metern Länge und 10,7 Metern Spannweite ähnlich groß wie der Eurofighter, aber deutlich schwerer: rund 13 Tonnen leer, bis zu 31,8 Tonnen beim Start.",
          "Ihr einzelnes Pratt-und-Whitney-F135-Triebwerk ist mit rund 125 Kilonewton Trockenschub und rund 190 Kilonewton mit Nachbrenner das stärkste Kampfjettriebwerk im Truppendienst. Die F-35A erreicht Mach 1,6 und rund 15.000 Meter Dienstgipfelhöhe (50.000 Fuß), fliegt +9 g und hat einen Kampfradius von rund 1.100 Kilometern.",
        ],
      },
      {
        titel: "Die F-35A: Bewaffnung und Besonderheiten",
        absaetze: [
          "Ihre Hauptbewaffnung trägt die F-35 im internen Waffenschacht, damit die Tarnwirkung erhalten bleibt. Wenn Tarnung nicht gefragt ist, lädt sie im sogenannten Beast Mode auf vier internen und sechs externen Stationen deutlich mehr. Fest eingebaut ist die vierläufige 25-mm-Kanone GAU-22/A, die nur die A-Version intern führt.",
          "Ihre eigentliche Stärke ist die Sensorfusion: Radar, elektrooptische Sensoren und das Distributed Aperture System verschmelzen zu einem Lagebild direkt im Helm, der Pilot blickt damit durch die eigene Zelle hindurch. Der Erstflug war 2006; Deutschland erhält 35 Maschinen im Rüststand Block 4.",
        ],
      },
      {
        titel: "Der Direktvergleich",
        absaetze: [
          "Die Rollen ergänzen sich: Der Eurofighter ist der Luftüberlegenheitsjäger, schneller und höher steigend, mit Mach 2 und Supercruise. Die F-35A ist der tarnkappengestützte Mehrzweckjet und übernimmt die nukleare Teilhabe. Zwei EJ200 stehen einem F135 gegenüber, 13 äußere Stationen dem internen Schacht mit Beast Mode. Beide fliegen +9 g; der eine ist der Athlet, die andere sieht alles und bleibt dabei unentdeckt.",
        ],
      },
    ],
    fragen: [
      { frage: "Wie viele Triebwerke hat der Eurofighter, und wie heißen sie?", form: "eingabe", loesungen: ["Zwei Eurojet EJ200", "2 EJ200", "zwei EJ200", "EJ200"] },
      { frage: "Welches Triebwerk treibt die F-35A an?", form: "eingabe", loesungen: ["Pratt und Whitney F135", "F135", "Pratt & Whitney F135"] },
      { frage: "Welche Höchstgeschwindigkeit erreicht der Eurofighter?", form: "eingabe", loesungen: ["Mach 2,0", "Mach 2"] },
      { frage: "Welche Höchstgeschwindigkeit erreicht die F-35A?", form: "eingabe", loesungen: ["Mach 1,6", "Mach 1.6"] },
      { frage: "Welche Bordkanone trägt der Eurofighter?", form: "eingabe", loesungen: ["27-mm-Mauser BK-27", "BK-27", "BK27", "Mauser BK-27"] },
      { frage: "Welche Bordkanone trägt die F-35A?", form: "eingabe", loesungen: ["25-mm-GAU-22/A, vierläufig und intern", "GAU-22", "GAU22", "GAU-22/A"] },
      { frage: "Wie hoch liegt die Dienstgipfelhöhe des Eurofighters?", form: "eingabe", loesungen: ["Rund 16.800 Meter (55.000 Fuß)", "16800", "55000 Fuß", "16.800 m"] },
      { frage: "Wie viele Außenlaststationen hat der Eurofighter?", form: "eingabe", loesungen: ["13", "dreizehn"] },
      { frage: "In welchem Jahr flog der Eurofighter zum ersten Mal?", form: "eingabe", loesungen: ["1994"] },
      { frage: "In welchem Jahr flog die F-35 zum ersten Mal?", form: "eingabe", loesungen: ["2006"] },
      {
        frage: "Was bedeutet Supercruise, das der Eurofighter beherrscht?", form: "auswahl",
        richtig: "Überschallflug ohne Nachbrenner",
        falsch: ["Automatischer Tiefflug", "Gekoppelter Formationsflug", "Sparsamer Reiseflug mit einem Triebwerk"],
      },
      {
        frage: "Warum trägt die F-35 ihre Hauptbewaffnung im internen Schacht?", form: "auswahl",
        richtig: "Damit die Tarnwirkung erhalten bleibt",
        falsch: ["Weil die Flügel keine Lasten tragen können", "Zum Schutz vor Vereisung", "Um Treibstoff zu sparen"],
      },
      {
        frage: "Welche Bauweise kennzeichnet den Eurofighter?", form: "auswahl",
        richtig: "Deltaflügel mit Canards, instabil ausgelegt, Fly-by-wire",
        falsch: ["Schwenkflügel mit Doppelleitwerk", "Nurflügel ohne Leitwerk", "Pfeilflügel mit T-Leitwerk"],
      },
      {
        frage: "Welcher Generation wird die F-35 zugerechnet?", form: "auswahl",
        richtig: "Der fünften Generation",
        falsch: ["Der vierten Generation", "Der Generation 4,5", "Der sechsten Generation"],
      },
      {
        frage: "Wie viele Waffenstationen nutzt die F-35 im Beast Mode?", form: "auswahl",
        richtig: "Zehn: vier interne und sechs externe",
        falsch: ["Vier, alle intern", "Sechs, alle extern", "Dreizehn wie der Eurofighter"],
      },
      {
        frage: "Welche Belastungsgrenze fliegen Eurofighter und F-35A?", form: "auswahl",
        richtig: "+9 g",
        falsch: ["+6 g", "+7,5 g", "+12 g"],
      },
      {
        frage: "Wie groß ist der Kampfradius der F-35A ungefähr?", form: "auswahl",
        richtig: "Rund 1.100 Kilometer",
        falsch: ["Rund 400 Kilometer", "Rund 700 Kilometer", "Rund 2.500 Kilometer"],
      },
      {
        frage: "Was leistet das F135-Triebwerk mit Nachbrenner ungefähr?", form: "auswahl",
        richtig: "Rund 190 Kilonewton",
        falsch: ["Rund 90 Kilonewton", "Rund 120 Kilonewton", "Rund 260 Kilonewton"],
      },
      {
        frage: "Was zeigt das Distributed Aperture System der F-35 dem Piloten?", form: "auswahl",
        richtig: "Ein Rundumbild direkt im Helm, auch durch die Zelle hindurch",
        falsch: ["Nur das Radarbild", "Die Triebwerkswerte", "Das Wetterradar der Umgebung"],
      },
      {
        frage: "Wie schwer ist der Eurofighter leer ungefähr?", form: "auswahl",
        richtig: "Rund 11 Tonnen",
        falsch: ["Rund 6 Tonnen", "Rund 16 Tonnen", "Rund 23 Tonnen"],
      },
    ],
  },
  ausbildung: {
    name: "Eigener Ausbildungsweg",
    wissen: [
      {
        titel: "Das Auswahlverfahren",
        absaetze: [
          "Der Weg beginnt bei der Karriereberatung und führt zur Offizier-Eignungsfeststellung am Assessmentcenter für Führungskräfte der Bundeswehr in Köln, zwei Tage plus Anreisetag. Wer besteht, geht in Phase II ans Zentrum für Luft- und Raumfahrtmedizin der Luftwaffe: fliegerärztliche Untersuchungen und fliegerpsychologische Tests zu Rechenfähigkeit, Merkfähigkeit, Koordination und Belastbarkeit entscheiden über die Wehrfliegerverwendungsfähigkeit.",
          "Den Abschluss bildet Phase III, eine simulatorgestützte Lern- und Arbeitsprobe (für Flächenflugzeuge das System FPS/F). Bewertet wird sie von Fliegerpsychologen, Simulatorlehrern und einem Prüfstabsoffizier.",
        ],
      },
      {
        titel: "Drei Wege ins Cockpit",
        absaetze: [
          "Ins Kampfjetcockpit führen drei Wege: direkt ohne Studium in die fliegerische Ausbildung, über den dualen Studiengang Aeronautical Engineering oder erst über ein volles Studium. Ein Studium ist im fliegerischen Dienst keine Pflicht, auch mit mittlerer Reife ist die Laufbahn möglich.",
          "Aeronautical Engineering läuft seit 2015 an der Universität der Bundeswehr München: rund zwei Jahre Theorie, dann die fliegerische Ausbildung. Dieser Weg führt in etwa sieben Jahren zum einsatzbereiten Kampfpiloten mit Bachelorabschluss.",
        ],
      },
      {
        titel: "Die Offizierausbildung",
        absaetze: [
          "Die Offizierschule der Luftwaffe steht seit Oktober 2025 in Roth bei Nürnberg, vorher war sie jahrzehntelang in Fürstenfeldbruck. Offizieranwärter durchlaufen dort im Schnitt rund acht Monate, bevor Studium oder fliegerische Ausbildung beginnen.",
        ],
      },
      {
        titel: "Die fliegerische Ausbildung in den USA",
        absaetze: [
          "Fliegen lernen die Jetpilotenanwärter in den USA. Den Anfang macht die Grundschulung bei der 3. Deutschen Luftwaffenausbildungsstaffel in Goodyear in Arizona: drei bis vier Monate auf der kunstflugtauglichen Grob G 120TP.",
          "Danach folgt das Euro-NATO Joint Jet Pilot Training in Sheppard in Texas, das seit 1981 besteht und über 2600 deutsche Jetpiloten hervorgebracht hat. Das Undergraduate Pilot Training dauert 55 Wochen mit rund 200 Flugstunden auf der T-6A Texan II und der T-38C Talon, jährlich beginnen dort etwa 24 deutsche Flugschüler. Künftige Kampfpiloten hängen den rund zehnwöchigen Kurs Introduction to Fighter Fundamentals auf der T-38C an, insgesamt stehen damit etwa 15 Monate Texas im Plan.",
        ],
      },
      {
        titel: "Die Waffensystemausbildung",
        absaetze: [
          "Mit den Schwingen geht es an das eigentliche Muster. Die Eurofighter-Ausbildung übernimmt das TaktLwG 73 Steinhoff in Laage, beginnend mit 285 Stunden Theorie; planmäßig ist schon der siebte Flug der erste Alleinflug im einsitzigen Eurofighter. Die F-35-Ausbildung läuft ab Herbst 2026 auf der Ebbing Air National Guard Base in Fort Smith in Arkansas, mit acht dauerhaft dort stationierten deutschen Maschinen.",
        ],
      },
      {
        titel: "Dauer und Verpflichtung",
        absaetze: [
          "Vom Diensteintritt bis zum einsatzbereiten Kampfpiloten vergehen je nach Weg fünf bis zehn Jahre. Die Verpflichtungszeit für Jetpiloten beträgt mindestens 16 Jahre und ist bis 25 Jahre verlängerbar; festgesetzt wird sie stufenweise nach den bestandenen Ausbildungsabschnitten.",
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
        falsch: ["Die direkte Verlegung nach Laage", "Ein Transportfliegerlehrgang", "Die F-35-Ausbildung in Eglin"],
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
        titel: "Das System der Dienstgradgruppen",
        absaetze: [
          "Die Bundeswehr ordnet ihre Dienstgrade in sieben Gruppen, aufsteigend: Mannschaften, Unteroffiziere ohne Portepee, Unteroffiziere mit Portepee, Leutnante, Hauptleute, Stabsoffiziere und Generale. Das Portepee war einst die Trageschlaufe am Seitengewehr und ist heute ein Statusmerkmal: Alle Feldwebel tragen es, Unteroffizier und Stabsunteroffizier nicht.",
        ],
      },
      {
        titel: "Mannschaften und Unteroffiziere",
        absaetze: [
          "Die Mannschaftslaufbahn beginnt beim Soldaten mit Tätigkeitsbezeichnung, in der Luftwaffe also beim Flieger, und steigt über Gefreiter, Obergefreiter, Hauptgefreiter und Stabsgefreiter zum Oberstabsgefreiten. Neu eingeschoben sind Korporal und Stabskorporal als Spitzendienstgrade der Mannschaften.",
          "Bei den Unteroffizieren ohne Portepee gibt es nur zwei Dienstgrade, Unteroffizier und Stabsunteroffizier, erkennbar an der silbernen Tresse um die Schulterklappe. Darüber folgt die Feldwebelreihe: Feldwebel, Oberfeldwebel, Hauptfeldwebel, Stabsfeldwebel und Oberstabsfeldwebel.",
        ],
      },
      {
        titel: "Die Offizierlaufbahn",
        absaetze: [
          "Die Offiziere steigen vom Leutnant über Oberleutnant, Hauptmann und Stabshauptmann zu den Stabsoffizieren Major, Oberstleutnant und Oberst auf, darüber folgen Brigadegeneral, Generalmajor, Generalleutnant und General. Stabsoffiziere tragen das geflochtene silberne Schulterstück, mit einem Stern beim Major, zwei beim Oberstleutnant und drei beim Oberst.",
          "Die Reihenfolge der Generale wirkt auf den ersten Blick unlogisch, weil der Generalmajor über dem Brigadegeneral steht. Sie ist NATO-üblich und folgt der Geschichte der Titel, nicht der Logik der Truppendienstgrade.",
        ],
      },
      {
        titel: "Die Marine-Entsprechungen",
        absaetze: [
          "Die Marine führt eigene Bezeichnungen, die sich sauber zuordnen lassen: Der Leutnant zur See entspricht dem Leutnant, der Kapitänleutnant dem Hauptmann, der Korvettenkapitän dem Major, der Fregattenkapitän dem Oberstleutnant und der Kapitän zur See dem Oberst. Die Admirale steigen vom Flottillenadmiral über Konteradmiral und Vizeadmiral zum Admiral auf.",
        ],
      },
      {
        titel: "Anwärter und NATO-Codes",
        absaetze: [
          "Offizieranwärter durchlaufen die Stufen Fahnenjunker, Fähnrich und Oberfähnrich, wobei der Fähnrich auf der Ebene des Feldwebels steht. International gelten die NATO-Rangcodes: OR für Mannschaften und Unteroffiziere, OF für Offiziere. Leutnant und Oberleutnant teilen sich OF-1, der Hauptmann trägt OF-2, der Major OF-3, der Oberst OF-5 und der General OF-9.",
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
        absaetze: [
          "Seit dem 1. Mai 2024 hat die Bundeswehr vier Teilstreitkräfte: Heer, Luftwaffe, Marine und den Cyber- und Informationsraum, der seit 2017 als Organisationsbereich bestand und mit der Reform zur vierten Teilstreitkraft wurde. Grundlage ist der Osnabrücker Erlass vom 30. April 2024, der den Dresdner Erlass ablöste. Die Reform unter dem Titel Bundeswehr der Zeitenwende zielt auf Kriegstüchtigkeit, weniger Schnittstellen und schnellere Entscheidungen.",
        ],
      },
      {
        titel: "Der Unterstützungsbereich",
        absaetze: [
          "Streitkräftebasis und Zentraler Sanitätsdienst wurden zum 1. Oktober 2025 aufgelöst und gingen im neuen Unterstützungsbereich auf, mit rund 55.000 Angehörigen der zweitgrößte militärische Bereich. Geführt wird er vom Unterstützungskommando der Bundeswehr in Bonn; den Sanitätsdienst führt das Kommando Gesundheitsversorgung in Koblenz. Gebündelt sind dort Logistik, ABC-Abwehr, Feldjäger, die zivil-militärische Zusammenarbeit und die Gesundheitsversorgung.",
        ],
      },
      {
        titel: "Das Operative Führungskommando",
        absaetze: [
          "Zum 1. Oktober 2024 entstand aus dem Einsatzführungskommando in Schwielowsee und dem Territorialen Führungskommando in Berlin das Operative Führungskommando der Bundeswehr, in Dienst gestellt am 1. April 2025. Es plant und führt alle Operationen aus einer Hand: Landes- und Bündnisverteidigung, Krisenmanagement, Evakuierungen sowie Amts- und Katastrophenhilfe. Befehlshaber ist Generalleutnant Alexander Sollfrank.",
        ],
      },
      {
        titel: "Die Spitzengliederung",
        absaetze: [
          "An der Spitze steht Verteidigungsminister Boris Pistorius, im Amt seit Januar 2023. Ranghöchster Soldat und militärischer Berater der Bundesregierung ist Generalinspekteur General Carsten Breuer, seit März 2023 im Amt und Anfang 2026 für den Vorsitz des NATO-Militärausschusses nominiert. Die Luftwaffe führt seit Mai 2025 Generalleutnant Holger Neumann als Nachfolger von Ingo Gerhartz, das Heer Generalleutnant Christian Freuding, die Marine Vizeadmiral Jan Christian Kaack.",
        ],
      },
      {
        titel: "Personal und Aufwuchs",
        absaetze: [
          "Im Sommer 2026 dienen rund 186.700 aktive Soldatinnen und Soldaten, dazu kommen rund 81.000 zivile Beschäftigte, der höchste Stand seit 2013. Bis Mitte der 2030er Jahre soll die aktive Truppe auf rund 260.000 Soldaten wachsen, ergänzt um rund 200.000 Reservisten, zusammen etwa 460.000 Kräfte. Der Bedarf leitet sich aus den NATO-Fähigkeitszielen ab.",
        ],
      },
      {
        titel: "Der neue Wehrdienst",
        absaetze: [
          "Seit dem 1. Januar 2026 gilt das Wehrdienst-Modernisierungsgesetz. Der neue Wehrdienst ist grundsätzlich freiwillig, dauert mindestens sechs Monate und läuft ab zwölf Monaten als Soldat auf Zeit. Alle 18-Jährigen erhalten einen Fragebogen, den Männer ab Jahrgang 2008 beantworten müssen; für sie beginnt am 1. Juli 2027 die verpflichtende Musterung. Verpflichtende Dienstelemente gäbe es nur durch einen eigenen Bundestagsbeschluss, eine Wehrpflicht für Frauen bräuchte eine Grundgesetzänderung. Die Heimatschutzdivision ist seit April 2025 die vierte Division des Heeres.",
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
        titel: "Die Brigade Litauen",
        absaetze: [
          "Die Panzerbrigade 45 Litauen ist seit dem 1. April 2025 in Dienst und der erste dauerhaft im Ausland stationierte Großverband der Bundeswehr, mit den Standorten Rūdninkai bei Vilnius und Rukla. Anfang 2026 standen rund 1.800 Brigadeangehörige vor Ort, unterstellt sind unter anderem das Panzerbataillon 203, das Panzergrenadierbataillon 122 und die multinationale NATO-Battlegroup. Bis 2027 soll die Brigade mit rund 5.000 Soldaten und zivilen Beschäftigten voll einsatzbereit sein.",
        ],
      },
      {
        titel: "NATO-Ziele und Verteidigungshaushalt",
        absaetze: [
          "Auf dem Gipfel von Den Haag im Juni 2025 beschloss die NATO das Ziel von 5 Prozent des Bruttoinlandsprodukts bis 2035, davon mindestens 3,5 Prozent für klassische Verteidigung und bis zu 1,5 Prozent für verteidigungsrelevante Ausgaben. Aus den neuen Fähigkeitszielen leitet Deutschland einen Bedarf von insgesamt rund 460.000 aktiven Soldaten und Reservisten ab.",
          "Der Verteidigungshaushalt 2026 umfasst mit Einzelplan 14 und Sondervermögen 108,2 Milliarden Euro, ein Rekordwert; geplant ist der Anstieg auf 3,5 Prozent des Bruttoinlandsprodukts bis 2029.",
        ],
      },
      {
        titel: "Einsätze und Missionen",
        absaetze: [
          "Mitte 2026 standen rund 700 Soldaten in mandatierten Auslandseinsätzen, das größte Kontingent bei KFOR im Kosovo. UNIFIL im Libanon endet nach rund 20 Jahren deutscher Beteiligung, das Mandat wurde letztmalig verlängert. Daneben laufen Aspides zum Schutz der Schifffahrt im Roten Meer, Irini zur Überwachung des Libyen-Embargos, NSATU zur Koordinierung der Ukraine-Unterstützung und seit Januar 2025 Baltic Sentry zum Schutz der Unterwasser-Infrastruktur in der Ostsee.",
        ],
      },
      {
        titel: "Der Luftraum an der Ostflanke",
        absaetze: [
          "Seit 2005 sichert die NATO mit dem Air Policing Baltikum den Luftraum von Estland, Lettland und Litauen, die keine eigenen Kampfjets besitzen; die Kontingente umfassen bis zu sechs Eurofighter.",
          "Im September 2025 spitzte sich die Lage zu: 19 russische Drohnen drangen in den polnischen Luftraum ein, NATO-Jets schossen mehrere ab, der erste Waffeneinsatz des Bündnisses über eigenem Gebiet. Kurz darauf verletzten drei MiG-31 den estnischen Luftraum. Die Antwort ist die Operation Eastern Sentry entlang der gesamten Ostflanke; Deutschland verlegte dafür fünf Eurofighter aus Nörvenich nach Polen.",
        ],
      },
      {
        titel: "Drohnen über Deutschland",
        absaetze: [
          "Auch im Inland häufen sich Drohnenvorfälle: Im Oktober 2025 stellte der Flughafen München wegen Sichtungen zeitweise den Betrieb ein, hinter vielen Fällen werden staatliche Akteure vermutet. Seit März 2026 gilt das novellierte Luftsicherheitsgesetz: Die Bundespolizei führt die Drohnenabwehr an Flughäfen, die Länder können die Bundeswehr im Eilverfahren zur Amtshilfe anfordern. Im August 2026 folgten eine Sprengstoffdrohne am Flughafen Leipzig/Halle und Überflüge über eine Kaserne in Mechernich.",
        ],
      },
      {
        titel: "Die Ukraine-Unterstützung",
        absaetze: [
          "Deutschland ist mit rund 55 Milliarden Euro seit 2022 der größte Unterstützer der Ukraine in Europa, für 2026 sind 11,5 Milliarden Euro eingeplant. Der Schwerpunkt liegt auf der Luftverteidigung, unter anderem mit Patriot-Lenkflugkörpern und 36 IRIS-T-Startgeräten aus dem Paket vom April 2026; fünf eigene Patriot-Systeme hat Deutschland abgegeben.",
        ],
      },
      {
        titel: "Projekte und Übungen",
        absaetze: [
          "Das Kampfjet-Projekt FCAS mit Frankreich und Spanien wurde im Juni 2026 für gescheitert erklärt, vor allem am Führungsstreit zwischen Dassault und Airbus; Teile der Vernetzungsarbeit laufen weiter. Geübt wird derweil groß: Ramstein Flag 2026 brachte als NATO-Luftwaffenübung 18 Nationen und über 200 Flugzeuge zusammen, erstmals als Doppelmanöver Nord und Süd, und die Bundeswehr übt seit 2023 jährlich in der Serie Quadriga, 2026 verzahnt mit Steadfast Dart.",
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
        titel: "Der Eurofighter-Bestand wächst",
        absaetze: [
          "Die Luftwaffe fliegt 138 Eurofighter, nach Zulauf aller Bestellungen wächst die Flotte auf 163. Aus dem Projekt Quadriga (Tranche 4) kommen 38 Maschinen, bestellt 2020, mit Erstflug im Juli 2026 und Auslieferung bis 2030. Im Oktober 2025 folgte die Tranche 5 mit 20 weiteren Jets für rund 3,75 Milliarden Euro, Zulauf 2031 bis 2034. Dazu werden 15 Maschinen mit Arexis-Sensorik und AARGM zum Eurofighter EK für den Elektronischen Kampf umgerüstet, der bis 2030 die SEAD-Rolle vom Tornado ECR übernimmt.",
        ],
      },
      {
        titel: "Vom Tornado zur F-35A",
        absaetze: [
          "Noch fliegen rund 93 Tornado IDS und ECR, bis 2030 werden alle ausgemustert. Die Nachfolge ist geteilt: Die F-35A übernimmt die IDS-Rolle samt nuklearer Teilhabe, der Eurofighter EK die ECR-Rolle.",
          "35 F-35A sind bestellt, das Gesamtpaket kostet knapp zehn Milliarden Euro. Die erste Maschine mit der Kennung 35+01 verlässt im September 2026 das Werk, die ersten acht bleiben zur Ausbildung in Fort Smith, ab Ende 2027 beginnt die Stationierung in Büchel, die Anfangsbefähigung ist für 2029 geplant. An Bewaffnung laufen bis zu 400 Luft-Luft-Flugkörper AIM-120D-3 AMRAAM und die Abstandswaffe Joint Strike Missile zu.",
        ],
      },
      {
        titel: "Transport und Tanker",
        absaetze: [
          "Die A400M-Flotte ist mit 53 Maschinen komplett, die letzte landete im April 2026 in Wunstorf, es ist die größte A400M-Flotte der Welt. Sechs C-130J fliegen in der binationalen Staffel mit Frankreich. Die multinationale A330-MRTT-Flotte wächst bis 2029 auf zwölf Maschinen; Deutschland hält 62 Prozent der Anteile, erhält rund 5500 Flugstunden im Jahr, und eine Maschine steht in Köln ständig für die medizinische Evakuierung bereit.",
        ],
      },
      {
        titel: "Aufklärung",
        absaetze: [
          "Für die Seefernaufklärung sind acht P-8A Poseidon für rund 3,1 Milliarden Euro bestellt; Mitte 2026 standen drei in Nordholz, der Rest folgt bis 2029. In Jagel fliegen fünf geleaste Heron TP, drei weitere sind bestellt. Die Signalaufklärung übernimmt künftig Pegasus auf drei Bombardier Global 6000, mit Zulauf ab 2027 ebenfalls nach Jagel.",
        ],
      },
      {
        titel: "Bodengebundene Luftverteidigung",
        absaetze: [
          "Arrow 3 fängt seit Dezember 2025 von Holzdorf aus ballistische Raketen außerhalb der Atmosphäre ab, die Vollbefähigung ist für 2030 geplant. Bei IRIS-T SLM sind sechs Feuereinheiten bestellt und 14 weitere für 3,18 Milliarden Euro beauftragt, Zielbestand 20. Bei Patriot hat Deutschland fünf Feuereinheiten an die Ukraine abgegeben und sieben behalten; acht neue sind bestellt, der Zulauf beginnt Ende 2026, der Zielbestand liegt bei 15.",
        ],
      },
    ],
    fragen: [
      { frage: "Wie viele Eurofighter hat die Luftwaffe im Bestand?", form: "eingabe", loesungen: ["138"] },
      { frage: "Wie viele F-35A hat Deutschland bestellt?", form: "eingabe", loesungen: ["35"] },
      { frage: "Wie viele A400M umfasst die fertige Flotte?", form: "eingabe", loesungen: ["53"] },
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
    ],
  },
  persoenlich: {
    name: "Persönliches",
    wissen: [
      {
        titel: "Grundsätze fürs Gespräch",
        absaetze: [
          "Die wichtigste Regel ist Ehrlichkeit: Die Prüfer führen solche Gespräche täglich und erkennen auswendig gelernte Antworten sofort. Jede Aussage sollte sich mit einem konkreten Beispiel aus dem eigenen Leben belegen lassen, und die Motivation gehört in eigene Worte statt in Werbesprüche der Bundeswehr. Wer zur eigenen Bewerbung steht, statt zweifelnd zu wirken, wirft keine unnötigen Fragen auf.",
        ],
      },
      {
        titel: "Worauf die Prüfer achten",
        absaetze: [
          "Geprüft wird das realistische Bild vom Beruf: Bereitschaftsdienst, Versetzungen, Auslandseinsätze und jahrelange Ausbildung gehören dazu, nicht nur das Fliegen. Die Prüfer achten auf Belastbarkeit und den Umgang mit Rückschlägen, am liebsten an erlebten Situationen, auf Informiertheit über aktuelle Themen, Standorte, Ausbildungsweg und Muster sowie auf eine gefestigte Haltung zum Dienst mit der Waffe, ohne Schulterzucken und ohne Heldenpose.",
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
export const WISSEN6_REIHE = ["technik", "standorte", "ausbildung", "dienstgrade", "aufbau", "themen", "beschaffung", "persoenlich"];
