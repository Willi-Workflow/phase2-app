# Mission 1: Flugzeugverfolgung (PMT-Nachbau)

Stand 24.08.2026, mit Willi abgestimmt. Nachbau des Psycho-Motorischen-Tests (PMT) aus dem Testsystem ICA der fliegerischen Eignungsfeststellung, nach Punkt 3.3.1 samt Abbildung 3-7 der Dissertation (`~/Desktop/Claude/Phase II/Phase II Doc.pdf`, Seiten 45 bis 46) und den Bildschirmaufnahmen aus der ZentrLuRMedLw-Doku (Video YGWbm79pxcg, Testraum ab 7:00, Vorführlauf 12:40 bis 13:10, Steuerkonsole 9:48). Maßgabe von Willi: Die Gestaltung folgt dem Video.

## Referenzbilder

Unter `entwurf/bilder/`:

- `pmt-referenz-schirm.jpg`: Vollbild der Verfolgungsszene (Video 13:05)
- `pmt-referenz-gruen.jpg`: Zielkreis türkisgrün neben dem Flugzeug
- `pmt-referenz-rot.jpg`: Zielkreis rot in Deckung auf dem Flugzeug
- `pmt-referenz-pult.jpg`: Steuerkonsole mit unverkippter Szene; belegt, dass das Zielsymbol ein Kreis mit senkrecht-waagerechtem Kreuz ist (das X auf den Nahaufnahmen ist Kameraverkippung)

## Aufgabe

Mit Centerstick und Ruderpedalen den Zielkreis in Deckung mit dem vorausfliegenden Flugzeug bringen und eine Sekunde halten. Bei Deckung wechselt der Kreis von Türkisgrün auf Rot. Der Zielkreis sitzt fest in der Bildmitte (Willis Festlegung vom 24.08.2026 nach der ersten Sichtung); nach einem Treffer blitzt er kurz auf und das Flugzeug springt an eine andere Stelle des Sichtfelds, dann wird neu angelegt. Wahlweise läuft zusätzlich die Letter-Task, angelehnt an die Zusatzaufgabe aus Testphase 3 des Originals, aber mit Willis Regel der versetzten Doppelung statt der Buchstabenkombination SLA (Festlegung vom 25.08.2026, Abschnitt Letter-Task).

## Aufbau

Drei neue Teile nach dem Muster der bestehenden Übungen:

- `js/uebung1.js`: reine Logik ohne Bildschirm. Eigenflugzustand, Bahn des Zielflugzeugs, Ablage des Zielkreises, Deckungsprüfung, Haltezeit, Trefferzählung, Buchstabenreihe, Ergebnisrechnung. Deterministisch mit übergebenem Zufall.
- `js/uebung1-lauf.js`: Vollbild-Anzeige wie bei Mission 2, mit Hangartür, Kopfzeile (gewählte Dauer und Restzeit) und Ergebnistafel. Hier lebt die 3D-Szene.
- `js/fremd/three.module.js`: three.js als feste Datei im Repository, kein Fremdserver zur Laufzeit. Erste und einzige Fremdbibliothek; nur das Laufmodul fasst sie an, nie die Logik oder die Tests.

Eingehängt wird die Übung über die Zuordnung `UEBUNGEN` in `js/mission.js` (Eintrag `1`).

## Szene

- Heller Himmelsverlauf, große Bodenebene mit einem nahtlos kachelbaren Luftbild als Textur, Dunst zum Horizont über Nebel in der Szene. Der Nebel kaschiert zugleich die Kachelwiederholung. Inhalt nach Willis Festlegung vom 24.08.2026: überwiegend Landschaft (Wiesen, Felder, Hecken, kleine Wälder), nur vereinzelt eine Ortschaft; erzeugt über Higgsfield nach Prompt-Freigabe, Willis Wahl ist Fassung 5 (bilder/stadt.jpg, Entwurfsfassungen unter entwurf/bilder/stadt-*.jpg).
- Das Zielflugzeug ist ein kleines rotes Kunstflugzeug als einfaches 3D-Modell aus Grundkörpern (Rumpf, Doppeldeckerflächen, Leitwerk), damit es sich in Kurven echt neigt.
- Der Zielkreis mit senkrecht-waagerechtem Plus-Kreuz liegt als SVG-Ebene über dem 3D-Bild: konstant groß, gestochene Linien, türkisgrün und in Deckung rot. Kein weiterer Text und keine weiteren Anzeigen auf der Bühne, nur die Kopfzeile wie bei Mission 2.

## Spiellogik

- **Eigenflug:** Stick quer rollt, Stick längs nickt, die Pedale gieren; Ratensteuerung mit sanfter Dämpfung, das eigene Flugzeug fliegt stetig vorwärts. Der Horizont kippt beim Rollen.
- **Zielflugzeug:** fliegt voraus in ähnlicher Höhe und zieht sanfte zufällige Kurven (begrenzter Zufallslauf). Es bleibt in einem Kegel vor dem eigenen Flugzeug und kann nicht entkommen.
- **Zielkreis:** sitzt fest in der Bildmitte, wie das Visier im Original. Deckung besteht, wenn das Flugzeug im sichtbaren Kreis liegt (Winkelabstand unter der Kreisgröße; die Deckungszone ist der sichtbare Kreis, dieselbe Regel wie bei Mission 2). Bei Deckung Farbwechsel auf Rot; nach einer Sekunde ununterbrochenen Haltens der Treffer: kurzes Aufblitzen, dann springt das Zielflugzeug an eine neue zufällige Stelle im Kegel, deutlich außerhalb der Deckung (mit Schleifenwächter bei der Zufallswahl).

## Einstellungen

Vor dem Start auf der Missionsseite, gespeichert über die Einstellungen wie bei den anderen Übungen:

- Dauer wählbar: 3, 5 oder 10 Minuten, Vorgabe 5.
- Die Buchstabeneinstellungen liegen in einem ausklappbaren Block, geöffnet über einen kleinen Pfeil (zu ▾, offen ▴) (zu Beginn zugeklappt, Willis Ordnungswunsch vom 24.08.2026): Schalter "LETTER-TASK" mit der Aufschrift EIN beziehungsweise AUS (Vorgabe aus), Tempo und der Übungsknopf. Anzeigename der Aufgabe ist überall "Letter-Task" (Willis Festlegung vom 24.08.2026, erlaubter Projektbegriff wie "Controls"); die internen Bezeichner bleiben bei sla.
- Buchstabentempo wählbar: 2,5, 2, 1,5 oder 1 Sekunde Abstand, Vorgabe 2 (Original); gilt für die SLA-Aufgabe im Flug und für die Hörübung (Willis Erweiterung vom 24.08.2026).
- Knopf "NUR ÜBEN": startet die Buchstabenaufgabe als reine Hörübung ohne Flug (dunkler Schirm, Kopfzeile mit Restzeit, Ergebnistafel mit erkannt, verpasst und Fehlalarm). Die Übung zählt nie zur Statistik. Rückmeldung (Willis Erweiterung vom 25.08.2026, als eigener Schalter RÜCKMELDUNG im Buchstabenblock, Vorgabe ein): Bei erkanntem Druck erklingt ein kurzer Bestätigungston und der Schirm bekommt eine grüne Umrandung; bei einem Fehldruck und beim ungenutzt abgelaufenen Antwortfenster (mit der nächsten Ansage) blitzt der Schirm kurz rot. Der Schalter gilt für die Hörübung und für die Letter-Task im Flug; ausgeschaltet verhält sich der Flug wie das Original ohne Blitze.

## Letter-Task (versetzte Doppelung)

Regel nach Willis Festlegung vom 25.08.2026: Gedrückt wird, wenn ein Buchstabe mit genau einem Buchstaben Versatz doppelt kommt (etwa K, F, K), und zwar bevor der nächste Buchstabe angesagt wird. Sie ersetzt bewusst die Buchstabenkombination SLA, die die Dissertation für das ICA 90 II beschreibt; die internen Bezeichner bleiben bei sla.

- Die Logik erzeugt die Buchstabenreihe deterministisch aus dem übergebenen Zufall: Die Ereignisse (echte Doppelung K-x-K oder Beinahe-Falle ohne Versatz K-K beziehungsweise mit zwei dazwischen K-x-y-K) kommen zufällig verteilt, aber verlässlich wiederkehrend, mit 6 bis 20 Füllbuchstaben Lücke zwischen den Ereignissen und höchstens zwei Fallen nacheinander (Willis Festlegung vom 25.08.2026: deutlich dichter als ein Ereignis je Minute, damit nie minutenlang nichts kommt). Die Füllbuchstaben wiederholen nie einen Buchstaben im Drückabstand, ungeplante Ziele entstehen nicht.
- Gesprochen über ElevenLabs-Aufnahmen (Stimme Ralf DE Doku, deutsche Buchstabierweise, je Buchstabe eine Datei unter klaenge/buchstaben); die Sprachausgabe des Browsers ist nur der Ersatz, falls ein Klang nicht spielt. Der Abstand folgt dem gewählten Tempo.
- Bestätigung mit der Schusstaste des Joysticks (Ersatz Leertaste). Das Antwortfenster ist das gewählte Tempo selbst: Es beginnt mit der Ansage der Doppelung und endet mit der nächsten Ansage (Willis Regel; schnellere Tempostufen verkürzen damit auch die Reaktionszeit).
- **Schusstaste:** `controls.js` wird um eine Knopf-Zuordnung nach dem Vorbild des Achsen-Fangs erweitert. Beim ersten Einschalten der Buchstabenaufgabe (oder auf der Geräteseite) fordert die App auf, einmal die Schusstaste zu drücken, und merkt sich Gerät und Knopfnummer. Danach zählt nur diese Taste.
- Ergebnistafel zeigt erkannt, verpasst und Fehlalarme, rein informativ; in die Deckungsquote fließt nichts ein (das Original wertet die Vigilanz ebenfalls nicht).

## Wertung

- Führende Kennzahl: **Deckungsquote in Prozent** (Anteil der Laufzeit, in der der Kreis auf dem Flugzeug lag). `js/missionen.js` benennt die Kennzahl von "Treffer %" auf "Deckung %" um, Skalenende 100 bleibt.
- Ergebnistafel daneben: Treffer gesamt, Zeit bis zum ersten Treffer, mittlere Zeit je Treffer (die Messgrößen des Originals), bei eingeschalteter Buchstabenaufgabe deren Zählwerte.
- Probebetrieb bleibt an (`wertung: false`), bis Willi die Übung als fertig einstuft.

## Tests

Gleiche Dichte wie bei Mission 2, alles gegen `js/uebung1.js` ohne 3D:

- Winkelmathe und Deckungsregel
- Haltezeit und Trefferfolge
- Kreis springt nur innerhalb des Sichtfelds, Schleifenwächter greift
- Zielbahn bleibt im Kegel
- Buchstabenreihe enthält die geplanten Doppelungen und Fallen und sonst keine Wiederholung im Drückabstand, Antwortfenster und Fehlalarm-Zählung stimmen
- Ergebnisrechnung (Deckungsquote, Zeiten, SLA-Zählwerte)

three.js taucht in keinem Test auf.

## Sichtprüfung

`entwurf/uebung1-probe.html` mit gestellten Achsen (Sinusfahrt) für den headless-Durchlauf; die Optik wird örtlich gezeigt und von Willi abgenommen, bevor gepusht wird. Versionsmarken nach jeder Änderung hochzählen.
