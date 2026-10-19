-- =============================================================
-- Migracja: obsługa płatności za pobraniem (COD)
-- =============================================================
-- Uruchom RAZ w Supabase → SQL Editor → New query → Run.
-- Bezpieczne do wielokrotnego uruchomienia.
--
-- UWAGA: nie uruchamiaj całego supabase/schema.sql na działającej
-- bazie — tam jest insert produktu z ON CONFLICT DO UPDATE, który
-- nadpisałby nazwę, cenę i stan magazynowy ustawione w panelu.
-- Ten plik zmienia wyłącznie strukturę tabeli orders.
-- =============================================================

-- 1. Nowa kolumna: stripe (online) albo cod (za pobraniem)
alter table orders
  add column if not exists payment_method text not null default 'stripe';

-- 2. Nowy status płatności dla zamówień pobraniowych
alter table orders
  drop constraint if exists orders_payment_status_check;
alter table orders
  add constraint orders_payment_status_check
  check (payment_status in ('PENDING','PAID','FAILED','REFUNDED','ON_DELIVERY'));

-- 3. Dozwolone wartości metody płatności
alter table orders
  drop constraint if exists orders_payment_method_check;
alter table orders
  add constraint orders_payment_method_check
  check (payment_method in ('stripe','cod'));

-- 4. Szybkie filtrowanie po metodzie w panelu
create index if not exists orders_payment_method_idx on orders (payment_method);

-- 5. Kontrola: powinno zwrócić jedną kolumnę payment_method
select column_name, data_type, column_default
  from information_schema.columns
 where table_name = 'orders' and column_name = 'payment_method';
