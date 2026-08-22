# Phase-II-App: Entwurf

Stand 22.08.2026, mit Willi abgestimmt und abgenommen.

## Zweck

Vorbereitungs-App für die fliegerische Phase II der Bundeswehr. Zwei Personen (Willi und Luigi) üben getrennt, vergleichen sich aber gegenseitig. Sechs Übungsbereiche, Auswertung pro Lauf, gemeinsame Datenhaltung, gemeinsame Codebasis: eine Änderung erreicht beide sofort.

## Feststehende Entscheidungen

- Nutzung nur am Rechner oder Laptop, immer in Chrome (Safari meldet die Flug-Controls über die Gamepad-API nicht).
- Kein VR.
- Genau zwei Profile, Willi und Luigi, ohne Passwort. Die Profilwahl wird je Gerät gemerkt.
- Ergebnisse überstehen jedes App-Update. Gelöscht wird nur über einen Zurücksetzen-Knopf mit Sicherheitsabfrage, getrennt je Profil.
- Die sechs Bereiche starten als Platzhalter und werden später einzeln gefüllt:
  1. Flugzeugverfolgung
  2. Multitasking Controls
  3. 60s Instrumentenflug
  4. Instrumente merken
  5. Test Flugphysik
  6. Vorbereitung Psychologisches Gespräch

## Technik

**Frontend:** Reine Web-App aus HTML, CSS und JavaScript ohne Rahmenwerk, nach dem Muster der bestehenden Bundeswehr-Lern-App. Eine Seite je Bildschirm, gemeinsame Stildatei, gemeinsames Skript für Profil, Daten und Controls.

**Verteilung:** GitHub Pages. Das Repository liegt auf GitHub, jede gepushte Änderung ist unter der festen Adresse sofort für beide da. Chrome-Zwischenspeicher wird über Versionsmarken (`?v=N`) an Skript- und Stileinbindungen umgangen.

**Datenhaltung:** Supabase, kostenlose Stufe.
- Tabelle `laeufe`: `id`, `profil` (willi | luigi), `bereich` (1 bis 6), `zeitpunkt`, `daten` (JSON, Format bestimmt der jeweilige Bereich), `kennzahl` (Zahl für Listen, Bestwert und Vergleich).
- Tabelle `einstellungen`: `profil`, `schluessel`, `wert` (JSON). Darin auch die Controls-Zuordnung je Profil.
- Der Browser hält eine örtliche Kopie (localStorage). Ohne Netz wird örtlich gespeichert und beim nächsten Kontakt nachgemeldet. Der Verbindungszustand ist im Profilmenü sichtbar.
- Zugriff über den öffentlichen Supabase-Schlüssel; bei zwei bekannten Nutzern ist das ausreichend, sensible Daten liegen nicht an.

**Controls:** Gamepad-API.
- Rollen: Stick quer, Stick längs, Schub, Ruder, dazu Knöpfe (flankengesteuert, jeder Knopf jedes Geräts zählt, sofern die Übung nichts anderes verlangt).
- Anlernen statt fester Achsennummern: "Zuweisen" klicken, Achse bewegen, der größte Ausschlag gegenüber der eingefrorenen Ruhelage gewinnt. Die Suche läuft über alle verbundenen Geräte gleichzeitig, damit Joystick, separater Schubhebel und Ruderpedale parallel nutzbar sind. Gespeichert wird je Rolle Gerätekennung, Achsennummer und Umkehrung.
- Totzone, Umkehrung je Rolle und Empfindlichkeit einstellbar, gespeichert je Profil.
- Abfrage je Bild über requestAnimationFrame, Verbindungs-Ereignisse nur für die Statusanzeige. Hinweis in der Oberfläche, dass Geräte erst nach einem Tastendruck am Gerät erscheinen (Chrome-Datenschutzregel).
- Tastatur als Ersatzsteuerung, damit ohne angeschlossene Geräte geübt werden kann.

## Bildschirme

**Startbildschirm (Profilwahl):** Camo-Grund, Titel, darunter hängen zwei große rote Bänder von oben herab, links LUIGI, rechts WILLI, jeweils mit Eurofighter, Name und Schwinge. Ein Klick zieht das Band nach unten (Anlehnung an Remove before flight), merkt die Wahl auf dem Gerät und öffnet den Übungsbereich. Wer schon gewählt hat, landet beim Start direkt im Übungsbereich.

**Übungsbereich (Übersicht):** Der abgenommene Stand:
- Hintergrund Splittertarn in Waldgrün: eckige Splitterflächen (#161c11, #2c3520, #242013 auf #232a19), sanft weichgezeichnete Übergänge (etwa 3 px), darüber ein dunkler Schleier (rgba(8,10,6,0.5)).
- Titel mittig: PHASE II groß, darunter FLIEGERISCHE EIGNUNG gesperrt.
- Sechs Schilder in zwei Dreierreihen: Gunmetal-Stahl, flacher Rahmen mit Stufe zur hellen, matt lackierten Tafel, leicht gerundete Ecken, Schattenwurf. Alle sechs stammen vom selben Grundschild (identische Form, gleicher Lichteinfall, keine Spiegelungen), der Rost sitzt individuell je Schild und ausschließlich am Rahmen. Beschriftung: kleine Missionsnummer, darunter der Bereichsname.
- Rechts oben der Profilknopf: senkrecht hängendes rotes Band mit Metallring, Öse und Schwalbenschwanz, darauf untereinander Eurofighter (Draufsicht), Profilname und Schwinge nach dem Vorbild des Bundeswehr-Stoffabzeichens.

**Profilmenü** (öffnet hinter dem Anhänger): Profil wechseln, Controls einrichten (Geräteliste, Zuweisen, Rohachsen-Anzeige, Totzone, Umkehrung, Empfindlichkeit), Ergebnisse zurücksetzen (je Profil, mit Sicherheitsabfrage), Verbindungszustand zum Datendienst.

**Missionsseite** (je Bereich): links Startknopf und Übungseinstellungen des Bereichs, rechts fest die Auswertung: letzte Läufe mit Kennzahl, Bestwert, Durchschnitt, darunter der Vergleich Willi gegen Luigi als Balkenpaar. Dazu der Gerätestatus (welche Rollen zugewiesen und verbunden sind). Der Lauf selbst läuft im Vollbild ohne Ablenkung; Abbruch über Esc; nach dem Lauf zurück zur Missionsseite mit aktualisierten Zahlen.

**Schrift:** Black Ops One auf der ganzen Seite (Google Fonts, örtlich ins Repository gelegt, damit die App nicht von fremden Servern abhängt).

## Gestaltungsbestand

Alle erzeugten Bilder liegen unter `entwurf/bilder/` und wandern bei der Umsetzung in den Auslieferungsordner:

| Datei | Inhalt |
|---|---|
| `schild-01.png` bis `schild-06.png` | Die sechs Missions-Schilder, gleiche Form, individueller Randrost (fertig montiert: saubere Tafel liegt über der Rost-Variante) |
| `schild-grundform.png` | Das rostfreie Grundschild für künftige Varianten |
| `anhaenger.png` | Der hängende Profilanhänger mit Metallring, freigestellt und zugeschnitten |
| `anhaenger-roh.png` | Ungeschnittene Fassung des Anhängers |
| `schwinge.png` | Schwinge nach Bundeswehr-Vorbild, auf Schwarz (Einsatz mit mix-blend-mode: screen) |
| `eurofighter.svg` | Eurofighter-Draufsicht als Vektor, Hintergrund entfernt |

Größere Fassungen (etwa die Startbildschirm-Bänder für LUIGI) werden bei Bedarf nach demselben Verfahren erzeugt: Erzeugung über Higgsfield, Hintergrund entfernen, vermessen, zuschneiden.

## Auswertung und Vergleich

- Jeder Lauf erzeugt einen Datensatz mit `kennzahl` (das Vergleichsmaß des Bereichs, etwa Trefferquote) und `daten` (freie Details des Bereichs).
- Die Missionsseite zeigt je Profil: Liste der letzten Läufe, Bestwert, Durchschnitt.
- Der Vergleich zeigt beide Profile nebeneinander (Durchschnitt und Bestwert), unabhängig davon, auf welchem Gerät die Läufe entstanden, da alles über Supabase läuft.
- Zurücksetzen löscht die Läufe eines Profils (wahlweise je Bereich oder gesamt) erst nach Sicherheitsabfrage.

## Fehlerverhalten

- Kein Netz: Läufe landen im örtlichen Zwischenspeicher und werden nachgemeldet; das Profilmenü zeigt den Zustand.
- Kein Gerät erkannt: Hinweis auf den nötigen Tastendruck am Gerät, Tastatur als Ersatz.
- Safari oder anderer Browser: deutlicher Hinweis, Chrome zu nutzen.

## Prüfung

- Je Baustein (Datenzugriff, Controls-Anlernen, Auswertungsrechnung) kleine Prüfungen nach dem Muster der bestehenden Projekte.
- Sichtprüfung der Bildschirme in Chrome über die eingebaute Browsersteuerung, wie im Entwurfsprozess geschehen.

## Nicht Teil dieses Entwurfs

- Die Inhalte der sechs Übungsbereiche (werden einzeln entworfen und gebaut, Bereich 1 zuerst).
- Handy-Tauglichkeit.
- Weitere Profile über Willi und Luigi hinaus.
