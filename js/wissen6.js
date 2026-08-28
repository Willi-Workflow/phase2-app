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
          "Das Rückgrat der Luftwaffe bilden vier <b>Eurofighter</b>-Geschwader: das Taktische Luftwaffengeschwader 31 Boelcke in <b>Nörvenich</b>, das <b>TaktLwG 71 Richthofen</b> in <b>Wittmund</b>, das <b>TaktLwG 73 Steinhoff</b> in <b>Laage</b> und das <b>TaktLwG 74</b> in <b>Neuburg an der Donau</b>, das als einziges keinen Traditionsnamen führt. <b>Wittmund</b> und Neuburg stellen die <b>Alarmrotten Nord und Süd</b>: Dort stehen rund um die Uhr <b>Eurofighter</b> bereit, die nach der Alarmierung binnen 15 Minuten in der Luft sein müssen, um den deutschen Luftraum zu schützen.",
          "Eine Sonderrolle hat <b>Laage</b> bei Rostock: Mit rund <b>35 Maschinen</b> bildet das Geschwader alle <b>Eurofighter</b>-Piloten der Luftwaffe aus, dazu die des österreichischen Bundesheeres.",
        ],
      },
      {
        titel: "Die Tornado-Geschwader",
        absaetze: [
          "Das <b>TaktLwG 33</b> in <b>Büchel</b> in der Eifel stellt den deutschen Beitrag zur <b>nuklearen Teilhabe</b> der NATO. Nach rund vier Jahren Ausweichbetrieb in <b>Nörvenich</b> und einer Bahnsanierung für etwa <b>260 Millionen Euro</b> kehrten die <b>Tornado</b>s im Juni <b>2026</b> nach <b>Büchel</b> zurück. Ab Ende <b>2027</b> wird der Fliegerhorst zur Heimat der <b>F-35A</b>, der neue <b>F-35</b>-Campus soll ab November <b>2026</b> bezugsfertig sein.",
          "Das <b>TaktLwG 51 Immelmann</b> in <b>Schleswig-Jagel</b> fliegt <b>Tornado IDS und ECR</b> sowie die Drohnen <b>Heron 1</b> und <b>Heron TP</b>. Seine Aufträge sind die taktische Luftaufklärung und die Niederhaltung gegnerischer Flugabwehr; künftig werden dort der <b>Eurofighter EK</b> und die <b>Pegasus</b>-Signalaufklärer stationiert.",
        ],
      },
      {
        titel: "Transport und Flugbereitschaft",
        absaetze: [
          "Das <b>Lufttransportgeschwader 62</b> in <b>Wunstorf</b> ist das einzige Lufttransportgeschwader der Luftwaffe und fliegt den <b>A400M</b>; am 17. April <b>2026</b> landete dort die 53. und letzte Maschine. Mit Frankreich betreibt die Luftwaffe außerdem eine gemeinsame <b>C-130J</b>-Staffel im französischen <b>Évreux</b>.",
          "Die <b>Flugbereitschaft BMVg</b> hat ihren Hauptsitz in <b>Köln-Wahn</b>, der politische Flugbetrieb läuft ab Berlin. Zur Flotte gehören unter anderem drei <b>A350-900</b>, zwei <b>A321neo LR</b> für die medizinische Evakuierung und drei <b>Global 6000</b>.",
        ],
      },
      {
        titel: "Bodengebundene Luftverteidigung und Schutz",
        absaetze: [
          "Das <b>Flugabwehrraketengeschwader 1</b> in <b>Husum</b> ist seit <b>2013</b> das einzige seiner Art in der Luftwaffe, sein Hauptwaffensystem ist <b>Patriot</b>. Gegen ballistische Raketen steht seit Dezember <b>2025</b> die erste Arrow-3-Stellung in <b>Holzdorf</b> mit Anfangsbefähigung bereit; insgesamt sind drei Stellungen geplant, die Vollbefähigung soll <b>2030</b> erreicht sein.",
          "Das <b>Objektschutzregiment der Luftwaffe Friesland</b> in Schortens kann mit seinen Infanteriekräften im Einsatzgebiet ein komplettes Flugfeld aufbauen, betreiben und schützen.",
        ],
      },
      {
        titel: "Marineflieger in Nordholz",
        absaetze: [
          "Die fliegenden Verbände der Marine sind in <b>Nordholz</b> bei Cuxhaven zu Hause. Das <b>Marinefliegergeschwader 3 Graf Zeppelin</b> stellt die Seefernaufklärung und U-Boot-Jagd und fliegt seit November <b>2025</b> die <b>P-8A Poseidon</b> als Ablösung der <b>P-3C Orion</b>.",
        ],
      },
      {
        titel: "Führung und Schulen",
        absaetze: [
          "Geführt wird die Luftwaffe vom Kommando Luftwaffe in <b>Berlin-Gatow</b>, die fliegenden Verbände unterstehen dem Luftwaffentruppenkommando in <b>Köln-Wahn</b>. Die <b>Offizierschule der Luftwaffe</b> steht seit Oktober <b>2025</b> in <b>Roth bei Nürnberg</b>, die Unteroffizierschule verteilt sich auf Appen und Heide.",
          "Ein großer Teil der fliegerischen Ausbildung findet in den USA statt: die Jetausbildung <b>ENJJPT</b> in <b>Sheppard</b> (Texas), die fliegerische Grundschulung in <b>Goodyear</b> (Arizona) und die künftige <b>F-35</b>-Ausbildung in <b>Fort Smith</b> (Arkansas).",
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
          "Der <b>Eurofighter</b> ist ein <b>Deltaflügler mit Canards</b> und absichtlich instabil ausgelegt: Erst die <b>Fly-by-wire-Steuerung</b> macht ihn fliegbar, genau das verschafft ihm seine Wendigkeit. Die Zelle misst <b>15,96 Meter</b> Länge bei <b>10,95 Metern</b> Spannweite, wiegt leer rund elf Tonnen und startet mit höchstens <b>rund 23,5 Tonnen</b>.",
          "Zwei Eurojet-<b>EJ200</b>-Triebwerke liefern je <b>rund 60 Kilonewton</b> Trockenschub und <b>rund 90 Kilonewton</b> mit Nachbrenner. Damit erreicht der Jet <b>Mach 2,0</b> und eine Dienstgipfelhöhe von <b>rund 16.800 Metern</b> (<b>55.000 Fuß</b>), steigt in etwa zweieinhalb Minuten auf über <b>10.000 Meter</b> und ist für <b>+9 g</b> zugelassen. Als eine von wenigen Maschinen beherrscht er <b>Supercruise</b>, also anhaltenden Überschallflug ohne Nachbrenner.",
        ],
      },
      {
        titel: "Der Eurofighter: Bewaffnung",
        absaetze: [
          "Fest eingebaut ist die 27-mm-Bordkanone <b>Mauser BK-27</b>, dazu kommen <b>13 Außenlaststationen</b>. In der Luft-Luft-Rolle trägt der <b>Eurofighter</b> <b>IRIS-T</b>, <b>AMRAAM</b> und den Langstreckenflugkörper <b>Meteor</b>, gegen Bodenziele je nach Rüststand Präzisionsbomben und den Marschflugkörper <b>Taurus</b>. Sein Erstflug war <b>1994</b>, bei der Luftwaffe fliegt er seit <b>2004</b>.",
        ],
      },
      {
        titel: "Die F-35A: Zelle und Antrieb",
        absaetze: [
          "Die <b>F-35A Lightning II</b> ist ein einstrahliger Tarnkappenjet der fünften Generation. Sie ist mit <b>15,7 Metern</b> Länge und <b>10,7 Metern</b> Spannweite ähnlich groß wie der <b>Eurofighter</b>, aber deutlich schwerer: <b>rund 13 Tonnen</b> leer, bis zu <b>31,8 Tonnen</b> beim Start.",
          "Ihr einzelnes Pratt-und-Whitney-<b>F135</b>-Triebwerk ist mit <b>rund 125 Kilonewton</b> Trockenschub und <b>rund 190 Kilonewton</b> mit Nachbrenner das stärkste Kampfjettriebwerk im Truppendienst. Die <b>F-35A</b> erreicht <b>Mach 1,6</b> und <b>rund 15.000 Meter</b> Dienstgipfelhöhe (<b>50.000 Fuß</b>), fliegt <b>+9 g</b> und hat einen Kampfradius von <b>rund 1.100 Kilometern</b>.",
        ],
      },
      {
        titel: "Die F-35A: Bewaffnung und Besonderheiten",
        absaetze: [
          "Ihre Hauptbewaffnung trägt die <b>F-35</b> im internen Waffenschacht, damit die Tarnwirkung erhalten bleibt. Wenn Tarnung nicht gefragt ist, lädt sie im sogenannten <b>Beast Mode</b> auf vier internen und sechs externen Stationen deutlich mehr. Fest eingebaut ist die vierläufige 25-mm-Kanone <b>GAU-22/A</b>, die nur die A-Version intern führt.",
          "Ihre eigentliche Stärke ist die <b>Sensorfusion</b>: Radar, elektrooptische Sensoren und das <b>Distributed Aperture System</b> verschmelzen zu einem Lagebild direkt im Helm, der Pilot blickt damit durch die eigene Zelle hindurch. Der Erstflug war <b>2006</b>; Deutschland erhält <b>35 Maschinen</b> im Rüststand Block 4.",
        ],
      },
      {
        titel: "Der Direktvergleich",
        absaetze: [
          "Die Rollen ergänzen sich: Der <b>Eurofighter</b> ist der Luftüberlegenheitsjäger, schneller und höher steigend, mit <b>Mach 2</b> und <b>Supercruise</b>. Die <b>F-35A</b> ist der tarnkappengestützte Mehrzweckjet und übernimmt die <b>nukleare Teilhabe</b>. Zwei <b>EJ200</b> stehen einem <b>F135</b> gegenüber, 13 äußere Stationen dem internen Schacht mit <b>Beast Mode</b>. Beide fliegen <b>+9 g</b>; der eine ist der Athlet, die andere sieht alles und bleibt dabei unentdeckt.",
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
          "Der Weg beginnt bei der Karriereberatung und führt zur Offizier-Eignungsfeststellung am <b>Assessmentcenter für Führungskräfte der Bundeswehr</b> in Köln, zwei Tage plus Anreisetag. Wer besteht, geht in Phase II ans <b>Zentrum für Luft- und Raumfahrtmedizin</b> der Luftwaffe: fliegerärztliche Untersuchungen und fliegerpsychologische Tests zu Rechenfähigkeit, Merkfähigkeit, Koordination und Belastbarkeit entscheiden über die <b>Wehrfliegerverwendungsfähigkeit</b>.",
          "Den Abschluss bildet Phase III, eine simulatorgestützte Lern- und Arbeitsprobe (für Flächenflugzeuge das System <b>FPS/F</b>). Bewertet wird sie von Fliegerpsychologen, Simulatorlehrern und einem Prüfstabsoffizier.",
        ],
      },
      {
        titel: "Drei Wege ins Cockpit",
        absaetze: [
          "Ins Kampfjetcockpit führen drei Wege: direkt ohne Studium in die fliegerische Ausbildung, über den dualen Studiengang <b>Aeronautical Engineering</b> oder erst über ein volles Studium. Ein Studium ist im fliegerischen Dienst keine Pflicht, auch mit mittlerer Reife ist die Laufbahn möglich.",
          "<b>Aeronautical Engineering</b> läuft seit <b>2015</b> an der <b>Universität der Bundeswehr München</b>: rund zwei Jahre Theorie, dann die fliegerische Ausbildung. Dieser Weg führt in etwa sieben Jahren zum einsatzbereiten Kampfpiloten mit Bachelorabschluss.",
        ],
      },
      {
        titel: "Die Offizierausbildung",
        absaetze: [
          "Die <b>Offizierschule der Luftwaffe</b> steht seit Oktober <b>2025</b> in <b>Roth bei Nürnberg</b>, vorher war sie jahrzehntelang in Fürstenfeldbruck. Offizieranwärter durchlaufen dort im Schnitt rund acht Monate, bevor Studium oder fliegerische Ausbildung beginnen.",
        ],
      },
      {
        titel: "Die fliegerische Ausbildung in den USA",
        absaetze: [
          "Fliegen lernen die Jetpilotenanwärter in den USA. Den Anfang macht die Grundschulung bei der 3. Deutschen Luftwaffenausbildungsstaffel in <b>Goodyear</b> in Arizona: drei bis vier Monate auf der kunstflugtauglichen <b>Grob G 120TP</b>.",
          "Danach folgt das <b>Euro-NATO Joint Jet Pilot Training</b> in <b>Sheppard</b> in Texas, das seit <b>1981</b> besteht und über 2600 deutsche Jetpiloten hervorgebracht hat. Das <b>Undergraduate Pilot Training</b> dauert <b>55 Wochen</b> mit <b>rund 200 Flugstunden</b> auf der <b>T-6A Texan II</b> und der <b>T-38C Talon</b>, jährlich beginnen dort etwa 24 deutsche Flugschüler. Künftige Kampfpiloten hängen den rund zehnwöchigen Kurs <b>Introduction to Fighter Fundamentals</b> auf der <b>T-38C</b> an, insgesamt stehen damit etwa 15 Monate Texas im Plan.",
        ],
      },
      {
        titel: "Die Waffensystemausbildung",
        absaetze: [
          "Mit den Schwingen geht es an das eigentliche Muster. Die <b>Eurofighter</b>-Ausbildung übernimmt das <b>TaktLwG 73 Steinhoff</b> in <b>Laage</b>, beginnend mit <b>285 Stunden Theorie</b>; planmäßig ist schon der siebte Flug der erste Alleinflug im einsitzigen <b>Eurofighter</b>. Die <b>F-35</b>-Ausbildung läuft ab Herbst <b>2026</b> auf der <b>Ebbing Air National Guard Base</b> in <b>Fort Smith</b> in Arkansas, mit acht dauerhaft dort stationierten deutschen Maschinen.",
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
          "Die Bundeswehr ordnet ihre Dienstgrade in sieben Gruppen, aufsteigend: Mannschaften, Unteroffiziere ohne <b>Portepee</b>, Unteroffiziere mit <b>Portepee</b>, Leutnante, Hauptleute, Stabsoffiziere und Generale. Das <b>Portepee</b> war einst die Trageschlaufe am Seitengewehr und ist heute ein Statusmerkmal: Alle Feldwebel tragen es, Unteroffizier und Stabsunteroffizier nicht.",
        ],
      },
      {
        titel: "Mannschaften und Unteroffiziere",
        absaetze: [
          "Die Mannschaftslaufbahn beginnt beim Soldaten mit Tätigkeitsbezeichnung, in der Luftwaffe also beim Flieger, und steigt über Gefreiter, Obergefreiter, Hauptgefreiter und Stabsgefreiter zum Oberstabsgefreiten. Neu eingeschoben sind Korporal und Stabskorporal als Spitzendienstgrade der Mannschaften.",
          "Bei den Unteroffizieren ohne <b>Portepee</b> gibt es nur zwei Dienstgrade, Unteroffizier und Stabsunteroffizier, erkennbar an der <b>silbernen Tresse</b> um die Schulterklappe. Darüber folgt die <b>Feldwebelreihe</b>: Feldwebel, Oberfeldwebel, Hauptfeldwebel, Stabsfeldwebel und Oberstabsfeldwebel.",
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
          "Die Marine führt eigene Bezeichnungen, die sich sauber zuordnen lassen: Der Leutnant zur See entspricht dem Leutnant, der <b>Kapitänleutnant</b> dem Hauptmann, der <b>Korvettenkapitän</b> dem Major, der <b>Fregattenkapitän</b> dem Oberstleutnant und der <b>Kapitän zur See</b> dem Oberst. Die Admirale steigen vom Flottillenadmiral über Konteradmiral und Vizeadmiral zum Admiral auf.",
        ],
      },
      {
        titel: "Anwärter und NATO-Codes",
        absaetze: [
          "Offizieranwärter durchlaufen die Stufen <b>Fahnenjunker, Fähnrich und Oberfähnrich</b>, wobei der Fähnrich auf der Ebene des Feldwebels steht. International gelten die <b>NATO-Rangcodes</b>: OR für Mannschaften und Unteroffiziere, OF für Offiziere. Leutnant und Oberleutnant teilen sich OF-1, der Hauptmann trägt OF-2, der Major OF-3, der Oberst OF-5 und der General OF-9.",
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
          "Seit dem 1. Mai <b>2024</b> hat die Bundeswehr vier Teilstreitkräfte: Heer, Luftwaffe, Marine und den <b>Cyber- und Informationsraum</b>, der seit <b>2017</b> als Organisationsbereich bestand und mit der Reform zur vierten Teilstreitkraft wurde. Grundlage ist der <b>Osnabrücker Erlass</b> vom 30. April <b>2024</b>, der den Dresdner Erlass ablöste. Die Reform unter dem Titel <b>Bundeswehr der Zeitenwende</b> zielt auf Kriegstüchtigkeit, weniger Schnittstellen und schnellere Entscheidungen.",
        ],
      },
      {
        titel: "Der Unterstützungsbereich",
        absaetze: [
          "Streitkräftebasis und Zentraler Sanitätsdienst wurden zum 1. Oktober <b>2025</b> aufgelöst und gingen im neuen <b>Unterstützungsbereich</b> auf, mit rund <b>55.000</b> Angehörigen der zweitgrößte militärische Bereich. Geführt wird er vom <b>Unterstützungskommando der Bundeswehr</b> in Bonn; den Sanitätsdienst führt das <b>Kommando Gesundheitsversorgung</b> in Koblenz. Gebündelt sind dort Logistik, ABC-Abwehr, Feldjäger, die zivil-militärische Zusammenarbeit und die Gesundheitsversorgung.",
        ],
      },
      {
        titel: "Das Operative Führungskommando",
        absaetze: [
          "Zum 1. Oktober <b>2024</b> entstand aus dem Einsatzführungskommando in Schwielowsee und dem Territorialen Führungskommando in Berlin das <b>Operative Führungskommando der Bundeswehr</b>, in Dienst gestellt am 1. April <b>2025</b>. Es plant und führt alle Operationen aus einer Hand: Landes- und Bündnisverteidigung, Krisenmanagement, Evakuierungen sowie Amts- und Katastrophenhilfe. Befehlshaber ist Generalleutnant <b>Alexander Sollfrank</b>.",
        ],
      },
      {
        titel: "Die Spitzengliederung",
        absaetze: [
          "An der Spitze steht Verteidigungsminister <b>Boris Pistorius</b>, im Amt seit Januar <b>2023</b>. Ranghöchster Soldat und militärischer Berater der Bundesregierung ist Generalinspekteur General <b>Carsten Breuer</b>, seit März <b>2023</b> im Amt und Anfang <b>2026</b> für den Vorsitz des NATO-Militärausschusses nominiert. Die Luftwaffe führt seit Mai <b>2025</b> Generalleutnant <b>Holger Neumann</b> als Nachfolger von Ingo Gerhartz, das Heer Generalleutnant <b>Christian Freuding</b>, die Marine Vizeadmiral <b>Jan Christian Kaack</b>.",
        ],
      },
      {
        titel: "Personal und Aufwuchs",
        absaetze: [
          "Im Sommer <b>2026</b> dienen rund <b>186.700</b> aktive Soldatinnen und Soldaten, dazu kommen rund <b>81.000</b> zivile Beschäftigte, der höchste Stand seit <b>2013</b>. Bis Mitte der 2030er Jahre soll die aktive Truppe auf rund <b>260.000 Soldaten</b> wachsen, ergänzt um rund <b>200.000</b> Reservisten, zusammen etwa <b>460.000</b> Kräfte. Der Bedarf leitet sich aus den NATO-Fähigkeitszielen ab.",
        ],
      },
      {
        titel: "Der neue Wehrdienst",
        absaetze: [
          "Seit dem 1. Januar <b>2026</b> gilt das <b>Wehrdienst-Modernisierungsgesetz</b>. Der neue Wehrdienst ist grundsätzlich freiwillig, dauert mindestens sechs Monate und läuft ab zwölf Monaten als Soldat auf Zeit. Alle 18-Jährigen erhalten einen Fragebogen, den Männer ab Jahrgang <b>2008</b> beantworten müssen; für sie beginnt am 1. Juli <b>2027</b> die verpflichtende Musterung. Verpflichtende Dienstelemente gäbe es nur durch einen eigenen Bundestagsbeschluss, eine Wehrpflicht für Frauen bräuchte eine Grundgesetzänderung. Die <b>Heimatschutzdivision</b> ist seit April <b>2025</b> die vierte Division des Heeres.",
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
          "Die <b>Panzerbrigade 45 Litauen</b> ist seit dem 1. April <b>2025</b> in Dienst und der erste dauerhaft im Ausland stationierte Großverband der Bundeswehr, mit den Standorten <b>Rūdninkai</b> bei Vilnius und <b>Rukla</b>. Anfang <b>2026</b> standen rund <b>1.800</b> Brigadeangehörige vor Ort, unterstellt sind unter anderem das Panzerbataillon 203, das Panzergrenadierbataillon 122 und die multinationale NATO-Battlegroup. Bis <b>2027</b> soll die Brigade mit rund <b>5.000 Soldaten</b> und zivilen Beschäftigten voll einsatzbereit sein.",
        ],
      },
      {
        titel: "NATO-Ziele und Verteidigungshaushalt",
        absaetze: [
          "Auf dem Gipfel von Den Haag im Juni <b>2025</b> beschloss die NATO das Ziel von <b>5 Prozent</b> des Bruttoinlandsprodukts bis <b>2035</b>, davon mindestens <b>3,5 Prozent</b> für klassische Verteidigung und bis zu <b>1,5 Prozent</b> für verteidigungsrelevante Ausgaben. Aus den neuen Fähigkeitszielen leitet Deutschland einen Bedarf von insgesamt rund <b>460.000</b> aktiven Soldaten und Reservisten ab.",
          "Der Verteidigungshaushalt <b>2026</b> umfasst mit Einzelplan 14 und Sondervermögen <b>108,2 Milliarden Euro</b>, ein Rekordwert; geplant ist der Anstieg auf <b>3,5 Prozent</b> des Bruttoinlandsprodukts bis <b>2029</b>.",
        ],
      },
      {
        titel: "Einsätze und Missionen",
        absaetze: [
          "Mitte <b>2026</b> standen rund <b>700 Soldaten</b> in mandatierten Auslandseinsätzen, das größte Kontingent bei <b>KFOR</b> im Kosovo. <b>UNIFIL</b> im Libanon endet nach rund 20 Jahren deutscher Beteiligung, das Mandat wurde letztmalig verlängert. Daneben laufen <b>Aspides</b> zum Schutz der Schifffahrt im Roten Meer, <b>Irini</b> zur Überwachung des Libyen-Embargos, <b>NSATU</b> zur Koordinierung der Ukraine-Unterstützung und seit Januar <b>2025</b> <b>Baltic Sentry</b> zum Schutz der Unterwasser-Infrastruktur in der Ostsee.",
        ],
      },
      {
        titel: "Der Luftraum an der Ostflanke",
        absaetze: [
          "Seit <b>2005</b> sichert die NATO mit dem <b>Air Policing Baltikum</b> den Luftraum von Estland, Lettland und Litauen, die keine eigenen Kampfjets besitzen; die Kontingente umfassen bis zu sechs <b>Eurofighter</b>.",
          "Im September <b>2025</b> spitzte sich die Lage zu: 19 russische Drohnen drangen in den polnischen Luftraum ein, NATO-Jets schossen mehrere ab, der erste Waffeneinsatz des Bündnisses über eigenem Gebiet. Kurz darauf verletzten drei MiG-31 den estnischen Luftraum. Die Antwort ist die Operation <b>Eastern Sentry</b> entlang der gesamten Ostflanke; Deutschland verlegte dafür fünf <b>Eurofighter</b> aus <b>Nörvenich</b> nach Polen.",
        ],
      },
      {
        titel: "Drohnen über Deutschland",
        absaetze: [
          "Auch im Inland häufen sich Drohnenvorfälle: Im Oktober <b>2025</b> stellte der Flughafen München wegen Sichtungen zeitweise den Betrieb ein, hinter vielen Fällen werden staatliche Akteure vermutet. Seit März <b>2026</b> gilt das novellierte <b>Luftsicherheitsgesetz</b>: Die Bundespolizei führt die Drohnenabwehr an Flughäfen, die Länder können die Bundeswehr im Eilverfahren zur Amtshilfe anfordern. Im August <b>2026</b> folgten eine Sprengstoffdrohne am Flughafen Leipzig/Halle und Überflüge über eine Kaserne in Mechernich.",
        ],
      },
      {
        titel: "Die Ukraine-Unterstützung",
        absaetze: [
          "Deutschland ist mit <b>rund 55 Milliarden Euro</b> seit <b>2022</b> der größte Unterstützer der Ukraine in Europa, für <b>2026</b> sind <b>11,5 Milliarden Euro</b> eingeplant. Der Schwerpunkt liegt auf der Luftverteidigung, unter anderem mit <b>Patriot</b>-Lenkflugkörpern und 36 <b>IRIS-T</b>-Startgeräten aus dem Paket vom April <b>2026</b>; fünf eigene <b>Patriot</b>-Systeme hat Deutschland abgegeben.",
        ],
      },
      {
        titel: "Projekte und Übungen",
        absaetze: [
          "Das Kampfjet-Projekt <b>FCAS</b> mit Frankreich und Spanien wurde im Juni <b>2026</b> für gescheitert erklärt, vor allem am Führungsstreit zwischen Dassault und Airbus; Teile der Vernetzungsarbeit laufen weiter. Geübt wird derweil groß: <b>Ramstein Flag 2026</b> brachte als NATO-Luftwaffenübung <b>18 Nationen</b> und über <b>200 Flugzeuge</b> zusammen, erstmals als Doppelmanöver Nord und Süd, und die Bundeswehr übt seit <b>2023</b> jährlich in der Serie <b>Quadriga</b>, <b>2026</b> verzahnt mit <b>Steadfast Dart</b>.",
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
          "Die Luftwaffe fliegt 138 <b>Eurofighter</b>, nach Zulauf aller Bestellungen wächst die Flotte auf 163. Aus dem Projekt <b>Quadriga</b> (Tranche 4) kommen <b>38 Maschinen</b>, bestellt <b>2020</b>, mit Erstflug im Juli <b>2026</b> und Auslieferung bis <b>2030</b>. Im Oktober <b>2025</b> folgte die Tranche 5 mit 20 weiteren Jets für <b>rund 3,75 Milliarden Euro</b>, Zulauf <b>2031</b> bis <b>2034</b>. Dazu werden <b>15 Maschinen</b> mit Arexis-Sensorik und AARGM zum <b>Eurofighter EK</b> für den Elektronischen Kampf umgerüstet, der bis <b>2030</b> die SEAD-Rolle vom <b>Tornado ECR</b> übernimmt.",
        ],
      },
      {
        titel: "Vom Tornado zur F-35A",
        absaetze: [
          "Noch fliegen rund 93 <b>Tornado IDS und ECR</b>, bis <b>2030</b> werden alle ausgemustert. Die Nachfolge ist geteilt: Die <b>F-35A</b> übernimmt die IDS-Rolle samt nuklearer Teilhabe, der <b>Eurofighter EK</b> die ECR-Rolle.",
          "35 <b>F-35A</b> sind bestellt, das Gesamtpaket kostet knapp zehn Milliarden Euro. Die erste Maschine mit der Kennung 35+01 verlässt im September <b>2026</b> das Werk, die ersten acht bleiben zur Ausbildung in <b>Fort Smith</b>, ab Ende <b>2027</b> beginnt die Stationierung in <b>Büchel</b>, die Anfangsbefähigung ist für <b>2029</b> geplant. An Bewaffnung laufen bis zu 400 Luft-Luft-Flugkörper <b>AIM-120D-3 AMRAAM</b> und die Abstandswaffe <b>Joint Strike Missile</b> zu.",
        ],
      },
      {
        titel: "Transport und Tanker",
        absaetze: [
          "Die <b>A400M</b>-Flotte ist mit <b>53 Maschinen</b> komplett, die letzte landete im April <b>2026</b> in <b>Wunstorf</b>, es ist die größte <b>A400M</b>-Flotte der Welt. Sechs <b>C-130J</b> fliegen in der binationalen Staffel mit Frankreich. Die multinationale A330-MRTT-Flotte wächst bis <b>2029</b> auf zwölf Maschinen; Deutschland hält <b>62 Prozent</b> der Anteile, erhält <b>rund 5500 Flugstunden</b> im Jahr, und eine Maschine steht in Köln ständig für die medizinische Evakuierung bereit.",
        ],
      },
      {
        titel: "Aufklärung",
        absaetze: [
          "Für die Seefernaufklärung sind acht <b>P-8A Poseidon</b> für <b>rund 3,1 Milliarden Euro</b> bestellt; Mitte <b>2026</b> standen drei in <b>Nordholz</b>, der Rest folgt bis <b>2029</b>. In <b>Jagel</b> fliegen fünf geleaste <b>Heron TP</b>, drei weitere sind bestellt. Die Signalaufklärung übernimmt künftig <b>Pegasus</b> auf drei Bombardier <b>Global 6000</b>, mit Zulauf ab <b>2027</b> ebenfalls nach <b>Jagel</b>.",
        ],
      },
      {
        titel: "Bodengebundene Luftverteidigung",
        absaetze: [
          "<b>Arrow 3</b> fängt seit Dezember <b>2025</b> von <b>Holzdorf</b> aus ballistische Raketen außerhalb der Atmosphäre ab, die Vollbefähigung ist für <b>2030</b> geplant. Bei <b>IRIS-T SLM</b> sind sechs Feuereinheiten bestellt und 14 weitere für <b>3,18 Milliarden Euro</b> beauftragt, Zielbestand 20. Bei <b>Patriot</b> hat Deutschland fünf Feuereinheiten an die Ukraine abgegeben und sieben behalten; acht neue sind bestellt, der Zulauf beginnt Ende <b>2026</b>, der Zielbestand liegt bei 15.",
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
