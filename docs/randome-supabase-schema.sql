create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  timezone text not null default 'Asia/Seoul',
  locale text not null default 'ko-KR',
  created_at timestamptz not null default now()
);

create table if not exists public.video_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  youtube_url text not null,
  youtube_video_id text not null,
  source_title text not null,
  transcript_text text not null,
  learning_window_start time not null default '09:00',
  learning_window_end time not null default '21:00',
  daily_reminder_count smallint not null default 4,
  imported_at timestamptz not null default now()
);

create index if not exists video_imports_user_id_imported_at_idx
  on public.video_imports (user_id, imported_at desc);

create table if not exists public.sentences (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.video_imports(id) on delete cascade,
  english text not null,
  korean text not null,
  pattern text not null,
  reason text not null,
  example text not null,
  cloze text not null,
  choices jsonb not null default '[]'::jsonb,
  answer text not null,
  seen_count integer not null default 0,
  practiced_count integer not null default 0,
  starred boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sentences_import_id_created_at_idx
  on public.sentences (import_id, created_at asc);

create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  sentence_id uuid not null references public.sentences(id) on delete cascade,
  opened boolean not null default false,
  delivered_at timestamptz not null default now()
);

create index if not exists reminder_logs_user_id_delivered_at_idx
  on public.reminder_logs (user_id, delivered_at desc);
