// Hangartür-Übergang: zwei Torflügel fahren vor der Seite zu und wieder auf.
// Ein Bild (bilder/hangartuer.jpg), mittig an der Warnstreifen-Fuge geteilt,
// jeder Flügel zeigt eine Hälfte. Für die Ergebnistafel lässt sich die
// geschlossene Tür verwischen.
const FAHRZEIT = 1000; // Millisekunden je Fahrt, passend zur Übergangszeit im Stil

export function erzeugeHangartuer() {
  let tuer = null;
  // Fahrten laufen serialisiert: eine neue Fahrt beginnt erst, wenn die laufende
  // fertig ist. Sonst schalten überlappende schliesse/oeffne die Klasse
  // gegeneinander um und ein Aufrufer arbeitet hinter einer in Wahrheit schon
  // offenen oder entfernten Tür weiter.
  let kette = Promise.resolve();

  function baue() {
    tuer = document.createElement("div");
    tuer.className = "hangartuer";
    tuer.innerHTML = `<div class="torfluegel links"></div><div class="torfluegel rechts"></div>`;
    document.body.append(tuer);
  }

  const fahre = (zu) => {
    kette = kette.then(() => new Promise((fertig) => {
      if (!tuer) baue();
      // Erzwungener Layout-Durchlauf: so startet die Fahrt sicher vom
      // Ausgangszustand, statt dass der Flügel ans Ziel springt.
      void tuer.offsetHeight;
      tuer.classList.toggle("zu", zu);
      setTimeout(fertig, FAHRZEIT);
    }));
    // Ohne diesen Fang bliebe die Kette nach einem einzigen Fehler dauerhaft
    // abgelehnt: Jede spaetere Fahrt haengt sich an ein abgelehntes
    // Versprechen und laeuft nie an, die Tuer bleibt fuer immer stehen.
    // Der Fang gibt die Kette wieder frei, der Fehler steht in der Konsole.
    kette = kette.catch((fehler) => {
      console.error("Hangartuer: Fahrt fehlgeschlagen, Kette freigegeben", fehler);
    });
    return kette;
  };

  return {
    schliesse: () => fahre(true),
    oeffne() {
      // Das Entfernen hängt am Ende derselben Kette, damit eine danach
      // eingereihte Fahrt die Tür sauber neu aufbaut statt an einer halb
      // entfernten weiterzumachen.
      fahre(false);
      kette = kette.then(() => { tuer?.remove(); tuer = null; });
      return kette;
    },
    verwische(an) { tuer?.classList.toggle("verwischt", an); },
  };
}
