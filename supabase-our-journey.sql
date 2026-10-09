-- Run this in Supabase SQL Editor before using Our Journey admin.
create table if not exists public.our_journey_entries (
  id text primary key,
  category_id text not null check (category_id in ('tournament-2025','championship-2026','featured-tournaments','friendlies')),
  title text not null,
  description text not null default '',
  images text[] not null default '{}',
  links jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('our-journey', 'our-journey', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
