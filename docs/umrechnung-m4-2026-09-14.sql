-- Umrechnung der gespeicherten Mission-4-Läufe auf die neue Faktorleiter
-- (Stand 14.09.2026: Höchstwertung ab 5 s Anzeigezeit, ZEITFAKTOR 7 s 0,92,
-- 10 s 0,82, 15 s 0,71; Fragenfaktor unverändert). In der Supabase-Konsole
-- als Ganzes ausführen; der öffentliche Schlüssel darf laeufe nicht ändern.
-- Alte Kennzahl und alter Faktor bleiben als kennzahlAlt und faktorAlt in den
-- Laufdaten, schon umgerechnete Zeilen werden übersprungen.
begin;
update laeufe set kennzahl = 37, daten = daten || '{"faktor": 0.667, "kennzahlAlt": 34, "faktorAlt": 0.611, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-01T19:17:23.232+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 41, daten = daten || '{"faktor": 0.549, "kennzahlAlt": 38, "faktorAlt": 0.503, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T14:22:49.956+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 47, daten = daten || '{"faktor": 0.549, "kennzahlAlt": 43, "faktorAlt": 0.503, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T14:28:28.964+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 40, daten = daten || '{"faktor": 0.616, "kennzahlAlt": 37, "faktorAlt": 0.57, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T14:34:24.019+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 48, daten = daten || '{"faktor": 0.616, "kennzahlAlt": 44, "faktorAlt": 0.57, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T14:41:14.114+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 60, daten = daten || '{"faktor": 0.8, "kennzahlAlt": 55, "faktorAlt": 0.739, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T14:55:55.626+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 55, daten = daten || '{"faktor": 0.8, "kennzahlAlt": 51, "faktorAlt": 0.739, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T15:02:52.733+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 57, daten = daten || '{"faktor": 0.8, "kennzahlAlt": 53, "faktorAlt": 0.739, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T15:16:19.243+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 75, daten = daten || '{"faktor": 0.92, "kennzahlAlt": 70, "faktorAlt": 0.85, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-07T15:29:41.036+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 49, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 45, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-08T21:17:17.351+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 60, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 55, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-08T21:23:55.714+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 65, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 60, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-08T21:29:20.77+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 54, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 50, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-08T21:35:05.397+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 67, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 62, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-08T21:41:24.418+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 58, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 53, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-08T21:47:10.487+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 67, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 62, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-08T21:52:30.562+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 61, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 57, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-10T17:44:12.915+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 65, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 60, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-10T17:49:34.702+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 67, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 62, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-10T18:17:50.522+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 67, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 62, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-10T18:24:41.494+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 76, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 70, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-11T14:01:10.006+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 74, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 68, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-11T14:07:41.797+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 75, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 69, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-12T11:08:34.923+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 75, daten = daten || '{"faktor": 0.865, "kennzahlAlt": 69, "faktorAlt": 0.799, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'luigi' and bereich = 4 and zeitpunkt = '2026-09-13T12:37:20.094+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 48, daten = daten || '{"faktor": 0.616, "kennzahlAlt": 44, "faktorAlt": 0.57, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-14T08:22:19.088+00:00' and daten ? 'kennzahlAlt' = false;
update laeufe set kennzahl = 84, daten = daten || '{"faktor": 0.92, "kennzahlAlt": 77, "faktorAlt": 0.85, "umgerechnet": "2026-09-14"}'::jsonb
 where profil = 'willi' and bereich = 4 and zeitpunkt = '2026-09-14T11:13:02.177+00:00' and daten ? 'kennzahlAlt' = false;
commit;
