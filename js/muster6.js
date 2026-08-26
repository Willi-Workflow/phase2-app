// Flugzeugmuster für Mission 6: Lexikon und Musterabfrage.
// Jedes Muster hat eine Kennung, den vollen Namen, die Gruppe, einen
// Steckbrief für das Lexikon und die Liste der Antworten, die als richtig
// gelten. Die Antwortprüfung ist bewusst großzügig (Willis Vorgabe vom
// 26.08.2026): Es geht darum zu wissen, welches Muster zu sehen ist, nicht
// um Bindestriche, Groß- und Kleinschreibung oder den vollen Herstellernamen.
// Die Lösungen stehen in Anzeigeschreibweise, geprüft wird normalisiert.
// Reine Daten und Logik ohne DOM, mit node --test prüfbar.

export const GRUPPEN = [
  { id: "bw-aktuell", name: "Bundeswehr, im Dienst" },
  { id: "bw-zulauf", name: "Bundeswehr, im Zulauf" },
  { id: "bw-ausser", name: "Bundeswehr, außer Dienst" },
  { id: "kampf-aktuell", name: "Kampfflugzeuge international" },
  { id: "bw-klassiker", name: "Klassiker der Bundeswehr" },
  { id: "klassiker", name: "Internationale Klassiker" },
  { id: "legenden", name: "Legenden der Propellerzeit" },
];

// Die Bilder liegen unter bilder/muster/<id>/1.jpg aufwärts, mindestens vier
// Ansichten je Muster; die Anzahl je Muster steht in muster6-ansichten.js.
export const MUSTER = [
  {
    id: "eurofighter", name: "Eurofighter Typhoon", gruppe: "bw-aktuell",
    loesungen: ["Eurofighter", "Typhoon", "Eurofighter Typhoon", "EF2000", "EF 2000"],
    steckbrief: "Hauptkampfflugzeug der Luftwaffe, Deltaflügel mit Canards, rund 138 Stück im Dienst.",
  },
  {
    id: "tornado", name: "Panavia Tornado", gruppe: "bw-aktuell",
    loesungen: ["Tornado", "Panavia Tornado", "Tornado IDS", "Tornado ECR"],
    steckbrief: "Schwenkflügler für Tiefangriff und Aufklärung, Ausmusterung bis 2030 geplant.",
  },
  {
    id: "a400m", name: "Airbus A400M Atlas", gruppe: "bw-aktuell",
    loesungen: ["A400M", "A 400 M", "Atlas", "Airbus A400M", "A400"],
    steckbrief: "Transporter mit vier gegenläufigen Propellern, 52 Stück, auch als Tanker.",
  },
  {
    id: "c130j", name: "Lockheed C-130J Super Hercules", gruppe: "bw-aktuell",
    loesungen: ["C-130J", "C-130", "Hercules", "Super Hercules", "Herkules"],
    steckbrief: "Taktischer Transporter, binational mit Frankreich in Evreux betrieben.",
  },
  {
    id: "a330mrtt", name: "Airbus A330 MRTT", gruppe: "bw-aktuell",
    loesungen: ["A330 MRTT", "MRTT", "A330", "Airbus A330"],
    steckbrief: "Tank- und Transportflugzeug im multinationalen Verband, Heimat Eindhoven und Köln.",
  },
  {
    id: "a350", name: "Airbus A350 der Flugbereitschaft", gruppe: "bw-aktuell",
    loesungen: ["A350", "Airbus A350", "A 350"],
    steckbrief: "Langstreckenflugzeug der Flugbereitschaft für Regierungsflüge.",
  },
  {
    id: "p8a", name: "Boeing P-8A Poseidon", gruppe: "bw-aktuell",
    loesungen: ["P-8A", "P-8", "Poseidon", "P-8 Poseidon"],
    steckbrief: "Seefernaufklärer der Marine auf Basis der Boeing 737, seit November 2025 in Deutschland.",
  },
  {
    id: "do228", name: "Dornier Do 228", gruppe: "bw-aktuell",
    loesungen: ["Do 228", "Dornier 228", "Dornier Do 228", "228"],
    steckbrief: "Kleiner Schulterdecker der Marine für die Ölüberwachung über Nord- und Ostsee.",
  },
  {
    id: "g120tp", name: "Grob G120TP", gruppe: "bw-aktuell",
    loesungen: ["G120TP", "G 120 TP", "G120", "Grob 120", "Grob G120"],
    steckbrief: "Einmotoriges Schulflugzeug für die fliegerische Grundausbildung.",
  },
  {
    id: "herontp", name: "Heron TP", gruppe: "bw-aktuell",
    loesungen: ["Heron TP", "Heron", "Heron 1"],
    steckbrief: "Unbemannte Aufklärungsdrohne mit großer Spannweite und langer Stehzeit.",
  },
  {
    id: "f35", name: "Lockheed Martin F-35A Lightning II", gruppe: "bw-zulauf",
    loesungen: ["F-35", "F-35A", "Lightning II", "Lightning 2", "Lightning", "F-35 Lightning"],
    steckbrief: "Tarnkappenjet der fünften Generation, 35 Stück für Büchel, Auslieferung ab 2027.",
  },
  {
    id: "p3c", name: "Lockheed P-3C Orion", gruppe: "bw-ausser",
    loesungen: ["P-3C", "P-3", "Orion", "P-3 Orion"],
    steckbrief: "Seefernaufklärer mit vier Turboprops, Flugbetrieb der Marine Ende 2025 beendet.",
  },
  {
    id: "c160", name: "Transall C-160", gruppe: "bw-ausser",
    loesungen: ["C-160", "Transall", "Transall C-160"],
    steckbrief: "Zweimotoriger Transporter, über fünf Jahrzehnte das Arbeitspferd, 2021 ausgemustert.",
  },
  {
    id: "learjet35", name: "Learjet 35A", gruppe: "bw-ausser",
    loesungen: ["Learjet", "Learjet 35", "Learjet 35A", "Lear Jet"],
    steckbrief: "Schneller Geschäftsreisejet, bei der Luftwaffe zur Zieldarstellung, 2020 ausgemustert.",
  },
  {
    id: "f4f", name: "McDonnell Douglas F-4F Phantom II", gruppe: "bw-ausser",
    loesungen: ["F-4", "F-4F", "Phantom", "Phantom II", "Phantom 2", "F-4 Phantom"],
    steckbrief: "Zweisitziger Abfangjäger mit charakteristisch geknickten Flügeln, 2013 ausgemustert.",
  },
  {
    id: "alphajet", name: "Dassault-Dornier Alpha Jet", gruppe: "bw-ausser",
    loesungen: ["Alpha Jet", "Alphajet"],
    steckbrief: "Leichter Schul- und Erdkampfjet, bis 2012 im Dienst der Luftwaffe.",
  },
  {
    id: "f16", name: "Lockheed Martin F-16 Fighting Falcon", gruppe: "kampf-aktuell",
    loesungen: ["F-16", "Fighting Falcon", "Falcon", "Viper"],
    steckbrief: "Meistgebauter westlicher Kampfjet, einstrahlig, Blasenkanzel, Spitzname Viper.",
  },
  {
    id: "f15", name: "Boeing F-15E Strike Eagle", gruppe: "kampf-aktuell",
    loesungen: ["F-15", "F-15E", "Strike Eagle", "Eagle", "F-15 Eagle"],
    steckbrief: "Zweistrahliger Luftüberlegenheitsjäger, in der E-Fassung Jagdbomber mit zwei Sitzen.",
  },
  {
    id: "fa18", name: "Boeing F/A-18E Super Hornet", gruppe: "kampf-aktuell",
    loesungen: ["F-18", "F/A-18", "FA-18", "Hornet", "Super Hornet", "Rhino"],
    steckbrief: "Trägergestützter Mehrzweckjet der US Navy, doppelt schräg gestellte Leitwerke.",
  },
  {
    id: "f22", name: "Lockheed Martin F-22 Raptor", gruppe: "kampf-aktuell",
    loesungen: ["F-22", "Raptor", "F-22 Raptor"],
    steckbrief: "Tarnkappenjäger mit rechteckigen Schubdüsen und gekippten Doppelleitwerken.",
  },
  {
    id: "rafale", name: "Dassault Rafale", gruppe: "kampf-aktuell",
    loesungen: ["Rafale", "Dassault Rafale"],
    steckbrief: "Französischer Deltaflügler mit Canards, an Bord und an Land im Einsatz.",
  },
  {
    id: "gripen", name: "Saab JAS 39 Gripen", gruppe: "kampf-aktuell",
    loesungen: ["Gripen", "JAS 39", "Saab Gripen", "JAS 39 Gripen"],
    steckbrief: "Schwedischer Deltaflügler mit Canards, für kurze Straßenpisten ausgelegt.",
  },
  {
    id: "a10", name: "Fairchild A-10 Thunderbolt II", gruppe: "kampf-aktuell",
    loesungen: ["A-10", "Warthog", "Thunderbolt", "Thunderbolt II", "Thunderbolt 2", "A-10 Warthog"],
    steckbrief: "Erdkampfflugzeug um eine siebenläufige Kanone herum gebaut, Spitzname Warthog.",
  },
  {
    id: "mirage2000", name: "Dassault Mirage 2000", gruppe: "kampf-aktuell",
    loesungen: ["Mirage 2000", "Mirage"],
    steckbrief: "Französischer Deltaflügler ohne Leitwerk, Nachfolger der Mirage III.",
  },
  {
    id: "su27", name: "Suchoi Su-27 und Su-35", gruppe: "kampf-aktuell",
    loesungen: ["Su-27", "Su-35", "Flanker", "Suchoi 27", "Sukhoi 27"],
    steckbrief: "Großer zweistrahliger Luftüberlegenheitsjäger, im Westen Flanker genannt.",
  },
  {
    id: "su57", name: "Suchoi Su-57", gruppe: "kampf-aktuell",
    loesungen: ["Su-57", "Felon", "Suchoi 57", "Sukhoi 57"],
    steckbrief: "Russischer Tarnkappenjäger der fünften Generation, im Westen Felon genannt.",
  },
  {
    id: "mig29", name: "Mikojan-Gurewitsch MiG-29", gruppe: "kampf-aktuell",
    loesungen: ["MiG-29", "Fulcrum"],
    steckbrief: "Zweistrahliger Jäger, nach der Wende auch bei der Luftwaffe geflogen, Codename Fulcrum.",
  },
  {
    id: "mig31", name: "Mikojan-Gurewitsch MiG-31", gruppe: "kampf-aktuell",
    loesungen: ["MiG-31", "Foxhound"],
    steckbrief: "Schwerer Abfangjäger für große Höhen und hohe Geschwindigkeit, Codename Foxhound.",
  },
  {
    id: "j20", name: "Chengdu J-20", gruppe: "kampf-aktuell",
    loesungen: ["J-20", "Mighty Dragon", "Chengdu J-20"],
    steckbrief: "Chinesischer Tarnkappenjäger mit Canards und langem Rumpf.",
  },
  {
    id: "f104", name: "Lockheed F-104G Starfighter", gruppe: "bw-klassiker",
    loesungen: ["F-104", "F-104G", "Starfighter", "F-104 Starfighter"],
    steckbrief: "Rasiermesserdünne Stummelflügel, prägte die frühe Luftwaffe und gilt als ihr Sinnbild.",
  },
  {
    id: "g91", name: "Fiat G.91", gruppe: "bw-klassiker",
    loesungen: ["G.91", "G91", "Fiat G.91", "Gina"],
    steckbrief: "Kleiner Erdkämpfer aus Italien, bei der Truppe Gina genannt.",
  },
  {
    id: "f84f", name: "Republic F-84F Thunderstreak", gruppe: "bw-klassiker",
    loesungen: ["F-84", "F-84F", "Thunderstreak", "F-84 Thunderstreak"],
    steckbrief: "Gepfeilter Jagdbomber der Aufbaujahre, Nachfolger der geraden Thunderjet.",
  },
  {
    id: "sabre", name: "Canadair Sabre Mk.6", gruppe: "bw-klassiker",
    loesungen: ["Sabre", "Canadair Sabre", "Sabre Mk.6", "F-86"],
    steckbrief: "In Kanada gebaute Fassung der F-86, erster Jagdjet der jungen Bundeswehr.",
  },
  {
    id: "noratlas", name: "Nord Noratlas", gruppe: "bw-klassiker",
    loesungen: ["Noratlas", "Nord Noratlas", "Nord 2501", "N2501"],
    steckbrief: "Transporter mit Doppelleitwerk und Ladeluke im Heck, bis 1971 im Dienst.",
  },
  {
    id: "f14", name: "Grumman F-14 Tomcat", gruppe: "klassiker",
    loesungen: ["F-14", "Tomcat", "F-14 Tomcat"],
    steckbrief: "Trägergestützter Schwenkflügler der US Navy, bekannt aus Top Gun.",
  },
  {
    id: "harrier", name: "Hawker Siddeley Harrier und AV-8B", gruppe: "klassiker",
    loesungen: ["Harrier", "AV-8B", "Sea Harrier", "Jump Jet"],
    steckbrief: "Senkrechtstarter mit schwenkbaren Schubdüsen, im Falklandkrieg berühmt geworden.",
  },
  {
    id: "f117", name: "Lockheed F-117 Nighthawk", gruppe: "klassiker",
    loesungen: ["F-117", "Nighthawk", "F-117 Nighthawk", "Stealth Fighter"],
    steckbrief: "Kantiger Tarnkappenbomber, wegen seiner Facetten unverwechselbar.",
  },
  {
    id: "sr71", name: "Lockheed SR-71 Blackbird", gruppe: "klassiker",
    loesungen: ["SR-71", "Blackbird", "SR-71 Blackbird"],
    steckbrief: "Aufklärer für dreifache Schallgeschwindigkeit, bis heute Rekordhalter.",
  },
  {
    id: "f86", name: "North American F-86 Sabre", gruppe: "klassiker",
    loesungen: ["F-86", "Sabre", "F-86 Sabre"],
    steckbrief: "Gepfeilter Jäger des Koreakriegs, Gegenspieler der MiG-15.",
  },
  {
    id: "mig15", name: "Mikojan-Gurewitsch MiG-15", gruppe: "klassiker",
    loesungen: ["MiG-15", "Fagot"],
    steckbrief: "Sowjetischer Jäger mit hochgesetztem Leitwerk, Gegner der F-86 über Korea.",
  },
  {
    id: "mig21", name: "Mikojan-Gurewitsch MiG-21", gruppe: "klassiker",
    loesungen: ["MiG-21", "Fishbed"],
    steckbrief: "Deltaflügler mit Nasenlufteinlauf, meistgebauter Überschalljäger der Welt.",
  },
  {
    id: "mig25", name: "Mikojan-Gurewitsch MiG-25", gruppe: "klassiker",
    loesungen: ["MiG-25", "Foxbat"],
    steckbrief: "Schwerer Hochgeschwindigkeitsabfangjäger, im Westen lange überschätzt.",
  },
  {
    id: "a4", name: "Douglas A-4 Skyhawk", gruppe: "klassiker",
    loesungen: ["A-4", "Skyhawk", "A-4 Skyhawk", "Scooter"],
    steckbrief: "Kleiner trägergestützter Erdkämpfer mit Deltaflügel, Spitzname Scooter.",
  },
  {
    id: "f5", name: "Northrop F-5 Tiger II", gruppe: "klassiker",
    loesungen: ["F-5", "Tiger II", "Tiger 2", "Freedom Fighter", "F-5 Tiger"],
    steckbrief: "Leichter Jäger, weltweit verbreitet und heute oft als Gegner im Training.",
  },
  {
    id: "mirage3", name: "Dassault Mirage III", gruppe: "klassiker",
    loesungen: ["Mirage III", "Mirage 3", "Mirage"],
    steckbrief: "Erster erfolgreicher französischer Deltaflügler, Vorbild vieler Nachfolger.",
  },
  {
    id: "draken", name: "Saab 35 Draken", gruppe: "klassiker",
    loesungen: ["Draken", "Saab 35", "J35", "Saab Draken"],
    steckbrief: "Schwedischer Jäger mit Doppeldelta, Silhouette wie ein Drachen.",
  },
  {
    id: "viggen", name: "Saab 37 Viggen", gruppe: "klassiker",
    loesungen: ["Viggen", "Saab 37", "JA37", "Saab Viggen"],
    steckbrief: "Schwedischer Deltaflügler mit Entenflügeln, für Straßenstarts gebaut.",
  },
  {
    id: "lightning", name: "English Electric Lightning", gruppe: "klassiker",
    loesungen: ["Lightning", "English Electric Lightning", "EE Lightning"],
    steckbrief: "Britischer Abfangjäger mit zwei übereinander liegenden Triebwerken, enorme Steigleistung.",
  },
  {
    id: "f111", name: "General Dynamics F-111 Aardvark", gruppe: "klassiker",
    loesungen: ["F-111", "Aardvark", "F-111 Aardvark"],
    steckbrief: "Großer Schwenkflügel-Jagdbomber, Vorbild für den Tornado.",
  },
  {
    id: "su25", name: "Suchoi Su-25", gruppe: "klassiker",
    loesungen: ["Su-25", "Frogfoot", "Suchoi 25", "Sukhoi 25"],
    steckbrief: "Gepanzertes Erdkampfflugzeug, das östliche Gegenstück zur A-10.",
  },
  {
    id: "spitfire", name: "Supermarine Spitfire", gruppe: "legenden",
    loesungen: ["Spitfire", "Supermarine Spitfire", "Spit"],
    steckbrief: "Britischer Jäger mit elliptischen Flügeln, Sinnbild der Luftschlacht um England.",
  },
  {
    id: "p51", name: "North American P-51 Mustang", gruppe: "legenden",
    loesungen: ["P-51", "Mustang", "P-51 Mustang"],
    steckbrief: "Amerikanischer Langstreckenjäger mit Bauchkühler, begleitete die Bomber bis Berlin.",
  },
  {
    id: "bf109", name: "Messerschmitt Bf 109", gruppe: "legenden",
    loesungen: ["Bf 109", "Me 109", "109", "Messerschmitt 109"],
    steckbrief: "Meistgebauter Jäger der Geschichte, schmaler Rumpf und schmalspuriges Fahrwerk.",
  },
  {
    id: "fw190", name: "Focke-Wulf Fw 190", gruppe: "legenden",
    loesungen: ["Fw 190", "190", "Focke-Wulf 190", "Würger"],
    steckbrief: "Robuster Jäger mit Sternmotor, breitspuriges Fahrwerk, genannt Würger.",
  },
  {
    id: "me262", name: "Messerschmitt Me 262", gruppe: "legenden",
    loesungen: ["Me 262", "262", "Schwalbe", "Messerschmitt 262"],
    steckbrief: "Erstes einsatzreifes Düsenjagdflugzeug der Welt, zwei Triebwerke unter den Flügeln.",
  },
];

// Antwortprüfung: Groß- und Kleinschreibung, Bindestriche, Punkte, Schräg-
// striche, Leerzeichen und Umlaute spielen keine Rolle. Aus "F-16", "f16"
// und "Fighting Falcon" wird gleichermaßen eine gültige Antwort.
export function normalisiere(text) {
  return String(text ?? "")
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .replace(/[^a-z0-9]/g, "");
}

export function istRichtig(eingabe, muster) {
  const geprueft = normalisiere(eingabe);
  if (geprueft === "") return false;
  return muster.loesungen.some((l) => normalisiere(l) === geprueft)
    || normalisiere(muster.name) === geprueft;
}

// Klammerliste fürs Lexikon: jede normalisierte Form nur einmal, und was
// bereits dem vollen Namen entspricht, fällt weg.
export function anzeigenamen(muster) {
  const gesehen = new Set([normalisiere(muster.name)]);
  const namen = [];
  for (const l of muster.loesungen) {
    const norm = normalisiere(l);
    if (gesehen.has(norm)) continue;
    gesehen.add(norm);
    namen.push(l);
  }
  return namen;
}

export function musterNachGruppe(gruppe) {
  return MUSTER.filter((m) => m.gruppe === gruppe);
}

// Bildpfad eines Musters: bilder/muster/<id>/<nummer>.jpg
export function bildpfad(id, nummer) {
  return `bilder/muster/${id}/${nummer}.jpg`;
}
