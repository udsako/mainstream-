-- Run this once in Supabase: Project → SQL Editor → New Query → paste → Run

create table opportunities (
  id text primary key,
  title text not null,
  category text not null,
  venue text not null,
  description text not null,
  deadline date not null,
  keep_visible_after_deadline boolean default false,
  created_at timestamptz default now()
);

create table users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Seed the same 4 postings you already have, so the live site isn't empty on day one.
insert into opportunities (id, title, category, venue, description, deadline, keep_visible_after_deadline) values
  ('combine-2026', 'Draft Combine Tryouts', 'Tryout', 'VGC Park', 'Open tryouts for the next draft class. Physical testing and skills evaluation — all levels welcome.', '2026-09-05', true),
  ('draft-night-2026', 'Draft Night', 'Tournament', 'Bermondsey Hotel, Lekki', 'Rosters are drafted live from combine standouts.', '2026-09-20', true),
  ('championship-2026', 'Club Championship', 'Tournament', 'OBN Academy', 'Season finale — one club takes the title.', '2026-11-01', true),
  ('sponsorship-2026', 'Sponsorship — Platinum to Bronze', 'Sponsorship', 'Club-wide', 'Partner with Mainstream. Tiers from ₦250,000 to ₦2,000,000 with jersey, event, and naming-rights placement.', '2026-12-31', true);
