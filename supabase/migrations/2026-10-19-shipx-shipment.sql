-- =============================================================
-- Migracja: integracja InPost ShipX (etykiety przesyłek)
-- =============================================================
-- Uruchom RAZ w Supabase → SQL Editor → New query → Run.
-- Bezpieczne do wielokrotnego uruchomienia.
-- Zmienia wyłącznie strukturę tabeli orders (dodaje kolumny ShipX).
-- =============================================================

-- 1. ID przesyłki w ShipX (używane do pobrania etykiety PDF)
alter table orders
  add column if not exists shipx_shipment_id integer;

-- 2. Numer nadania InPost (tracking number) — widoczny w panelu admina
alter table orders
  add column if not exists shipx_tracking_number text;

-- 3. Indeks do szybkiego filtrowania po numerze nadania
create index if not exists orders_shipx_tracking_idx
  on orders (shipx_tracking_number)
  where shipx_tracking_number is not null;

-- 4. Kontrola: powinno zwrócić dwie kolumny (shipx_shipment_id, shipx_tracking_number)
select column_name, data_type
  from information_schema.columns
 where table_name = 'orders'
   and column_name like 'shipx%'
 order by column_name;
