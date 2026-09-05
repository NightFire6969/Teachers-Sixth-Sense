-- Teacher's Sixth Sense — lesson history schema
-- Intentionally minimal: no student names, IDs, or personal data of any kind.
-- Only the lesson material a teacher pastes/uploads and the resulting
-- AI analysis are stored.

create extension if not exists "pgcrypto";

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  subject text not null,
  grade text not null,
  topic text not null,
  material text not null,
  material_truncated boolean not null default false,
  misconceptions jsonb not null default '[]'::jsonb,
  limited_analysis boolean not null default false,
  limited_reason text,
  briefing jsonb,
  high_count int not null default 0,
  medium_count int not null default 0,
  low_count int not null default 0
);

create index if not exists lessons_created_at_idx on public.lessons (created_at desc);
create index if not exists lessons_subject_idx on public.lessons (subject);

-- Row Level Security: this hackathon build has no teacher-account auth,
-- so lesson history is shared/anonymous. If you add auth later, add a
-- teacher_id column and scope these policies to auth.uid().
alter table public.lessons enable row level security;

create policy "public read access" on public.lessons
  for select using (true);

create policy "public insert access" on public.lessons
  for insert with check (true);

create policy "public update access" on public.lessons
  for update using (true);
