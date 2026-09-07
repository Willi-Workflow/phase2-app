-- Umrechnung der gespeicherten Läufe von Mission 1 und 2 auf die neue
-- Wertung (Stand 07.09.2026 abends: M1 Abschuss-Bestwert 12 je Minute,
-- M2 Erledigungen je Element an eigenen Bestwerten: Stick 7, Ruder 4,
-- Schub 4). In der Supabase-Konsole als Ganzes ausführen; der anonyme
-- Schlüssel darf laeufe nicht mehr ändern, darum dieser Weg. Die alte
-- Kennzahl bleibt als kennzahlAlt in den Laufdaten, die Umrechnung ist
-- rückholbar; schon umgerechnete Zeilen werden übersprungen. Mission 3
-- bleibt unangetastet (Rohdaten für den aufgewickelten Kursfehler fehlen).
begin;
update laeufe set kennzahl = 44, daten = daten || '{"wertung": 44, "erfuellung": 44, "kennzahlAlt": 11, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'luigi' and bereich = 2 and zeitpunkt = '2026-09-01T19:54:41.11+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 49, daten = daten || '{"wertung": 49, "erfuellung": 65, "kennzahlAlt": 75, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'luigi' and bereich = 1 and zeitpunkt = '2026-09-05T21:15:10.22+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 54, daten = daten || '{"wertung": 54, "erfuellung": 59, "kennzahlAlt": 63, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'luigi' and bereich = 1 and zeitpunkt = '2026-09-05T21:27:14.178+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 53, daten = daten || '{"wertung": 53, "erfuellung": 53, "kennzahlAlt": 12, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'luigi' and bereich = 2 and zeitpunkt = '2026-09-05T21:34:52.051+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 56, daten = daten || '{"wertung": 56, "erfuellung": 56, "kennzahlAlt": 12, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'luigi' and bereich = 2 and zeitpunkt = '2026-09-05T21:40:49.007+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 52, daten = daten || '{"wertung": 52, "erfuellung": 69, "kennzahlAlt": 75, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'willi' and bereich = 1 and zeitpunkt = '2026-09-06T20:55:56.404+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 56, daten = daten || '{"wertung": 56, "erfuellung": 75, "kennzahlAlt": 75, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'willi' and bereich = 1 and zeitpunkt = '2026-09-06T21:00:17.86+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 72, daten = daten || '{"wertung": 72, "erfuellung": 85, "kennzahlAlt": 20, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'willi' and bereich = 2 and zeitpunkt = '2026-09-06T21:14:22.766+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 68, daten = daten || '{"wertung": 68, "erfuellung": 80, "kennzahlAlt": 22, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'willi' and bereich = 2 and zeitpunkt = '2026-09-06T21:39:57.583+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 65, daten = daten || '{"wertung": 65, "erfuellung": 86, "kennzahlAlt": 75, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'willi' and bereich = 1 and zeitpunkt = '2026-09-07T14:07:20.616+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 56, daten = daten || '{"wertung": 56, "erfuellung": 56, "kennzahlAlt": 15, "umgerechnet": "2026-09-07"}'::jsonb
 where profil = 'willi' and bereich = 2 and zeitpunkt = '2026-09-07T14:16:20.852+00:00' and daten ? 'kennzahlAlt' = false;
commit;
