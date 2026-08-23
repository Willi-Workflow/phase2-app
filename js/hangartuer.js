// Hangartür-Übergang: zwei Torflügel fahren vor der Seite zu und wieder auf.
// Ein Bild (bilder/hangartuer.jpg), mittig an der Warnstreifen-Fuge geteilt,
// jeder Flügel zeigt eine Hälfte. Für die Ergebnistafel lässt sich die
// geschlossene Tür verwischen.
const FAHRZEIT = 1000; // Millisekunden je Fahrt, passend zur Übergangszeit im Stil

export function erzeugeHangartuer() {
  let tuer = null;

  function baue() {
    tuer = document.createElement("div");
    tuer.className = "hangartuer";
    tuer.innerHTML = `<div class="torfluegel links"></div><div class="torfluegel rechts"></div>`;
    document.body.append(tuer);
  }

  const fahre = (zu) => new Promise((fertig) => {
    if (!tuer) baue();
    // Erzwungener Layout-Durchlauf: so startet die Fahrt sicher vom
    // Ausgangszustand, statt dass der Flügel ans Ziel springt.
    void tuer.offsetHeight;
    tuer.classList.toggle("zu", zu);
    setTimeout(fertig, FAHRZEIT);
  });

  return {
    schliesse: () => fahre(true),
    async oeffne() {
      await fahre(false);
      tuer?.remove();
      tuer = null;
    },
    verwische(an) { tuer?.classList.toggle("verwischt", an); },
  };
}
