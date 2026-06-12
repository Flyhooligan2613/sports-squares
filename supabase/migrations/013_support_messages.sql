-- Player support message center

create table if not exists public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  subject text not null,
  category text not null default 'general',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_threads_user_email_idx
  on public.support_threads (user_email);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads (id) on delete cascade,
  sender_type text not null check (sender_type in ('player', 'staff')),
  body text not null,
  read_by_player boolean not null default false,
  read_by_staff boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_thread_id_idx
  on public.support_messages (thread_id);

alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

create policy "support_threads_authenticated_own" on public.support_threads
  for all to authenticated
  using (lower(user_email) = lower(auth.jwt() ->> 'email'))
  with check (lower(user_email) = lower(auth.jwt() ->> 'email'));

create policy "support_messages_authenticated_own" on public.support_messages
  for all to authenticated
  using (
    exists (
      select 1 from public.support_threads t
      where t.id = thread_id
        and lower(t.user_email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1 from public.support_threads t
      where t.id = thread_id
        and lower(t.user_email) = lower(auth.jwt() ->> 'email')
    )
  );

grant all on table public.support_threads to service_role;
grant all on table public.support_messages to service_role;

create policy "support_threads_service_role_all" on public.support_threads
  for all to service_role using (true) with check (true);

create policy "support_messages_service_role_all" on public.support_messages
  for all to service_role using (true) with check (true);
