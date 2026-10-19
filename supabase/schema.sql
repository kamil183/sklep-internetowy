-- =============================================================
-- ZODARA PARFUMS — schemat bazy danych (Supabase / PostgreSQL)
-- =============================================================
-- Uruchom w Supabase → SQL Editor → New query → Run
-- (albo lokalnie: psql "$DATABASE_URL" -f supabase/schema.sql)
-- Struktura odpowiada modelowi danych sklepu z lib/db/repository.ts.
-- =============================================================

create extension if not exists pgcrypto;

-- ---------- PRODUKTY ----------
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text,                     -- null = [NAZWA PERFUM] nieuzupełnione
  price_cents   integer,                  -- null = [CENA] nieuzupełniona
  volume        text,                     -- [POJEMNOŚĆ]
  description   text,                     -- [OPIS]
  scent_story   text,                     -- [OPIS ZAPACHU]
  notes         jsonb not null default '[]'::jsonb,  -- [NUTY ZAPACHOWE]
  stock         integer not null default 0,
  is_active     boolean not null default true,
  image_url     text,                     -- [ZDJĘCIE PRODUKTU]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- KLIENCI ----------
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  first_name  text not null,
  last_name   text not null,
  phone       text not null,
  created_at  timestamptz not null default now()
);

-- ---------- ZAMÓWIENIA ----------
create table if not exists orders (
  id                        uuid primary key default gen_random_uuid(),
  order_number              text not null unique,
  customer_id               uuid not null references customers(id) on delete restrict,
  subtotal_cents            integer,
  shipping_cents            integer not null default 0,
  total_cents               integer,
  delivery_method           text not null check (delivery_method in ('INPOST_LOCKER','INPOST_COURIER')),
  locker_code               text,
  shipping_address          jsonb,
  status                    text not null default 'NEW'
                            check (status in ('NEW','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED')),
  payment_status            text not null default 'PENDING'
                            check (payment_status in ('PENDING','PAID','FAILED','REFUNDED')),
  stripe_checkout_session_id text unique,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_payment_status_idx on orders (payment_status);
create index if not exists orders_created_at_idx on orders (created_at desc);

-- ---------- POZYCJE ZAMÓWIENIA ----------
create table if not exists order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id) on delete cascade,
  product_id       uuid not null references products(id) on delete restrict,
  quantity         integer not null check (quantity > 0),
  unit_price_cents integer
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- ---------- PRZYKŁADOWY WIERSZ PRODUKTU (jeden produkt sklepu) ----------
-- Wartości zostawione puste świadomie — uzupełnij przez panel /admin/products
-- albo bezpośrednio w tabeli (nazwa, cena, opis, zdjęcie).
insert into products (slug, name, price_cents, volume, description, scent_story, notes, stock, is_active)
values ('zodara-parfums', 'LAVIÉRA', 38999, '50 ml', 'LAVIÉRA to kompozycja stworzona dla kobiety, która nie musi wybierać między delikatnością a zmysłowością. Otula skórę miękkim, kremowym aromatem.', 'LAVIÉRA nie opowiada o kobiecości w oczywisty sposób. Pozwala ją poczuć.', '["Miękki", "Kremowy", "Zmysłowy"]'::jsonb, 10, true)
on conflict (slug) do update set
  name = excluded.name,
  price_cents = excluded.price_cents,
  volume = excluded.volume,
  stock = excluded.stock,
  is_active = excluded.is_active,
  updated_at = now();
