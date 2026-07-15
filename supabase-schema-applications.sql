-- Run this in Supabase SQL Editor if you already ran supabase-schema.sql before.
-- (If you haven't run that yet, just add this table alongside the others in one go.)

create table applications (
  id text primary key,
  opportunity_id text references opportunities(id) on delete set null,
  opportunity_title text not null,
  name text not null,
  email text not null,
  phone text,
  message text,
  created_at timestamptz default now()
);
