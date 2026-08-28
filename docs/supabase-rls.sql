-- Zugriffsregeln (Row-Level-Security) für die Phase-II-App
-- =========================================================
--
-- Warum das nötig ist:
-- Der Publishable-Schlüssel liegt im öffentlichen Repository (js/konfig.js) und
-- ist dafür auch gedacht. Er schützt aber nichts von allein: Ohne RLS kann jeder,
-- der das Repo findet, mit diesem Schlüssel die Tabellen laeufe und einstellungen
-- lesen, beschreiben und löschen. Am 28.08.2026 war das nachweislich der Fall
-- (einstellungen gab sieben Zeilen heraus, ein INSERT in laeufe ging durch).
--
-- WICHTIGE GRENZE, ehrlich benannt:
-- Die App hat keine echte Anmeldung. "profil" ist nur eine Textspalte, die der
-- Browser frei setzt. Deshalb kann KEINE Regel "willi" von "luigi" oder von einem
-- Fremden unterscheiden. Dieses Skript sperrt daher nicht den entschlossenen
-- Angreifer aus, der den Schlüssel aus dem Repo nimmt. Es tut das Erreichbare:
--   1. RLS überhaupt einschalten (der eigentliche Missstand),
--   2. nur die Operationen erlauben, die die App wirklich braucht,
--   3. fremde Profilnamen und andere Tabellen aussperren.
-- Ein echter Riegel bräuchte eine Anmeldung (Supabase Auth mit auth.uid() in den
-- Regeln) oder ein Geheimnis, das nicht im öffentlichen Repo steht. Das ist eine
-- Entscheidung über das Sicherheitsmodell, kein reiner Code-Schritt.
--
-- Ausführen: Supabase-Projekt öffnen, SQL Editor, dieses Skript einfügen und
-- laufen lassen. Danach prüft die App im Betrieb weiter wie bisher.

-- Nur die beiden bekannten Profile sind gültige Schreibziele. Erweitern, falls
-- ein drittes Profil dazukommt.
-- ----------------------------------------------------------------------------

-- === Tabelle laeufe =========================================================
alter table public.laeufe enable row level security;

-- Alte Regeln entfernen, damit ein erneuter Lauf des Skripts sauber durchläuft.
drop policy if exists laeufe_select on public.laeufe;
drop policy if exists laeufe_insert on public.laeufe;
drop policy if exists laeufe_delete on public.laeufe;

-- Lesen: die gemeinsame Vergleichsansicht braucht den ganzen Bestand.
create policy laeufe_select on public.laeufe
  for select to anon
  using (true);

-- Einfügen: nur die bekannten Profile, kein freier Profilname.
create policy laeufe_insert on public.laeufe
  for insert to anon
  with check (profil in ('willi', 'luigi'));

-- Löschen: nur die bekannten Profile (die Zurücksetzen-Funktion der App).
create policy laeufe_delete on public.laeufe
  for delete to anon
  using (profil in ('willi', 'luigi'));

-- Kein UPDATE: Läufe werden nie geändert, nur eingefügt (ON CONFLICT DO NOTHING).

-- === Tabelle einstellungen ==================================================
alter table public.einstellungen enable row level security;

drop policy if exists einstellungen_select on public.einstellungen;
drop policy if exists einstellungen_insert on public.einstellungen;
drop policy if exists einstellungen_update on public.einstellungen;

-- Lesen: die App lädt die eigene Controls-Zuordnung je Profil.
create policy einstellungen_select on public.einstellungen
  for select to anon
  using (true);

-- Einfügen und Aktualisieren: die App speichert Einstellungen als UPSERT
-- (ON CONFLICT DO UPDATE, Prefer resolution=merge-duplicates), darum braucht
-- einstellungen anders als laeufe auch UPDATE.
create policy einstellungen_insert on public.einstellungen
  for insert to anon
  with check (profil in ('willi', 'luigi'));

create policy einstellungen_update on public.einstellungen
  for update to anon
  using (profil in ('willi', 'luigi'))
  with check (profil in ('willi', 'luigi'));

-- Prüfen nach dem Lauf:
--   select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' and tablename in ('laeufe','einstellungen');
-- rowsecurity muss bei beiden auf true stehen.
