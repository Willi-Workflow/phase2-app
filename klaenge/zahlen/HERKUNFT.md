# Herkunft der Zahlenklänge

Die Dateien n0.mp3 bis n99.mp3 sowie op_plus.mp3, op_minus.mp3 und
op_mal.mp3 sind übernommen aus Willis Bundeswehr-Lern-App
(~/Desktop/Claude/Bundeswehr/App/stimme). Dort wurden sie mit ElevenLabs
erzeugt (Schlüssel aus dem macOS-Schlüsselbund, Dienst "elevenlabs") und
die Randstille wurde beschnitten.

Fünf Dateien am 03.09.2026 neu erzeugt (Stimme Ralf DE Doku,
jJxw1Rvgr2c60UdJHPBn, eleven_multilingual_v2, einzeln mit deutschem
previous_text als Aussprachekontext, Randbeschnitt 40/60 ms), weil die
Altfassungen englisch gefärbt oder verwaschen waren; per
Whisper-Rücktranskription vorgeprüft und von Willi abgehört:

- op_plus.mp3 (Kontext "drei "), op_minus.mp3 (Kontext "acht "):
  Altfassungen englisch ausgesprochen
- n9.mp3 (Kontext "sieben, acht, "), n11.mp3 (Kontext "neun, zehn, "),
  n99.mp3 (Kontext "achtundneunzig "): Altfassungen unverständlich
  ("Nun", "ölf", verwaschenes Ende)

Die Klang-URLs tragen seither die Marke ?v=2 (klangVon in
js/uebung3-lauf.js). Die Bundeswehr-Lern-App nutzt weiterhin die alten
Fassungen.

Verwendet werden sie in Mission 3 (60s Instrumentenflug) für die
angesagten Rechenaufgaben der Stufe 4: Abspielfolge Zahl, Rechenzeichen,
Zahl. Ersatz bei fehlendem Klang ist die Sprachausgabe des Browsers.
