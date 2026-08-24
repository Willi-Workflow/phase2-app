# Phase-II-App

- Entwurf: `docs/superpowers/specs/2026-08-22-phase2-app-design.md` ist die Referenz.
- Immer in Chrome prüfen, Safari kennt die Gamepad-Geräte nicht.
- Nach jeder Änderung an einer eingebundenen Datei die Versionsmarke (`?v=N`) hochzählen; bei Modulen zählt die Marke des Einstiegsskripts in der HTML-Seite.
- Reine Logik gehört in eigene Module unter `js/` und bekommt Tests unter `tests/` (`node --test tests/*.test.js`).
- Oberfläche, Bezeichner und Commits auf Deutsch, keine Gedankenstriche, keine Emojis. "Controls" und "Letter-Task" sind als Projektbegriffe erlaubt.
- Bilder nur aus `bilder/`; der Quellbestand liegt unter `entwurf/bilder/`.
- Supabase-Zugang steht in `js/konfig.js`; ohne ihn läuft die App örtlich weiter (Zustand "ohne-zugang"). Die Tabelle `laeufe` braucht den Eindeutigkeitsschlüssel (profil, bereich, zeitpunkt).
- Die sechs Übungen ersetzen den Probelauf einzeln; Einstieg ist `starteLauf` in `js/mission.js`.
