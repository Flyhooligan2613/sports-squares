-- Premium profile emojis: cash (SquareWallet) + credit shop catalog

create table if not exists public.premium_emojis (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  emoji text not null,
  title text not null,
  description text not null default '',
  cash_cents integer not null check (cash_cents > 0),
  credit_cost bigint not null check (credit_cost > 0),
  pack_slugs text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_premium_emojis (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  premium_emoji_id uuid not null references public.premium_emojis(id) on delete cascade,
  source text not null check (source in ('wallet', 'credits')),
  amount_paid_cents integer,
  credits_spent bigint,
  created_at timestamptz not null default now(),
  unique (email, premium_emoji_id)
);

create index if not exists player_premium_emojis_email_idx
  on public.player_premium_emojis (email);

-- Seed premium emoji catalog
-- Cash: $0.99–$2.99 tier · Credits: ~7.5× cash cents (aligned with credit shop game items)
insert into public.premium_emojis (slug, emoji, title, description, cash_cents, credit_cost, pack_slugs, sort_order)
values
  (
    'premium-lion',
    '🦁',
    'Lion Pride',
    'Bold competitor spirit — stand out on leaderboards and your Competitor Card.',
    99,
    750,
    '{}',
    1
  ),
  (
    'premium-unicorn',
    '🦄',
    'Unicorn',
    'Rare and unmistakable — a premium profile mark for elite competitors.',
    99,
    750,
    '{}',
    2
  ),
  (
    'premium-star',
    '⭐',
    'Rising Star',
    'Signal momentum — perfect for climbers on the tier ladder.',
    99,
    750,
    '{}',
    3
  ),
  (
    'premium-alien',
    '👾',
    'Pixel Champion',
    'Retro arcade energy for the modern competitor.',
    149,
    900,
    '{}',
    4
  ),
  (
    'premium-eagle',
    '🦅',
    'Golden Eagle',
    'Sharp vision and dominance — a premium badge of intent.',
    149,
    900,
    '{}',
    5
  ),
  (
    'premium-medal',
    '🎖️',
    'Victory Medal',
    'Earned aesthetic — celebrate your competitive journey.',
    199,
    1200,
    '{}',
    6
  ),
  (
    'premium-trident',
    '🔱',
    'Elite Trident',
    'Legend-tier profile flair for hall-of-fame competitors.',
    199,
    1200,
    '{}',
    7
  ),
  (
    'premium-crown-jewel',
    '💫',
    'Crown Jewel',
    'The ultimate premium emoji — radiant status on every surface.',
    299,
    2000,
    '{}',
    8
  ),
  (
    'premium-champion-pack',
    '🏅',
    'Champion Pack',
    'Three premium emojis: Victory Medal, Rising Star, and Lion Pride — best value.',
    499,
    3500,
    array['premium-medal', 'premium-star', 'premium-lion'],
    9
  )
on conflict (slug) do update set
  emoji = excluded.emoji,
  title = excluded.title,
  description = excluded.description,
  cash_cents = excluded.cash_cents,
  credit_cost = excluded.credit_cost,
  pack_slugs = excluded.pack_slugs,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

-- Credit shop / reward store entries (same emojis, credit pricing)
insert into public.ecosystem_rewards_catalog (slug, category, title, description, credit_cost, reward_type, reward_value, sort_order)
values
  (
    'premium-emoji-lion',
    'premium_emojis',
    '🦁 Lion Pride',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    750,
    'premium_emoji',
    '{"emojiSlug":"premium-lion"}',
    1
  ),
  (
    'premium-emoji-unicorn',
    'premium_emojis',
    '🦄 Unicorn',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    750,
    'premium_emoji',
    '{"emojiSlug":"premium-unicorn"}',
    2
  ),
  (
    'premium-emoji-star',
    'premium_emojis',
    '⭐ Rising Star',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    750,
    'premium_emoji',
    '{"emojiSlug":"premium-star"}',
    3
  ),
  (
    'premium-emoji-alien',
    'premium_emojis',
    '👾 Pixel Champion',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    900,
    'premium_emoji',
    '{"emojiSlug":"premium-alien"}',
    4
  ),
  (
    'premium-emoji-eagle',
    'premium_emojis',
    '🦅 Golden Eagle',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    900,
    'premium_emoji',
    '{"emojiSlug":"premium-eagle"}',
    5
  ),
  (
    'premium-emoji-medal',
    'premium_emojis',
    '🎖️ Victory Medal',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    1200,
    'premium_emoji',
    '{"emojiSlug":"premium-medal"}',
    6
  ),
  (
    'premium-emoji-trident',
    'premium_emojis',
    '🔱 Elite Trident',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    1200,
    'premium_emoji',
    '{"emojiSlug":"premium-trident"}',
    7
  ),
  (
    'premium-emoji-crown-jewel',
    'premium_emojis',
    '💫 Crown Jewel',
    'Premium profile emoji — unlock in your Competitor Card emoji picker.',
    2000,
    'premium_emoji',
    '{"emojiSlug":"premium-crown-jewel"}',
    8
  ),
  (
    'premium-emoji-champion-pack',
    'premium_emojis',
    '🏅 Champion Pack (3)',
    'Unlock Lion Pride, Rising Star, and Victory Medal premium emojis.',
    3500,
    'premium_emoji',
    '{"emojiSlug":"premium-champion-pack","emojiSlugs":["premium-medal","premium-star","premium-lion"]}',
    9
  )
on conflict (slug) do update set
  category = excluded.category,
  title = excluded.title,
  description = excluded.description,
  credit_cost = excluded.credit_cost,
  reward_type = excluded.reward_type,
  reward_value = excluded.reward_value,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

alter table public.premium_emojis enable row level security;
alter table public.player_premium_emojis enable row level security;

do $$
begin
  execute 'drop policy if exists "premium_emojis_service" on public.premium_emojis';
  execute 'create policy "premium_emojis_service" on public.premium_emojis for all using (true) with check (true)';
  execute 'drop policy if exists "player_premium_emojis_service" on public.player_premium_emojis';
  execute 'create policy "player_premium_emojis_service" on public.player_premium_emojis for all using (true) with check (true)';
end $$;

comment on table public.premium_emojis is 'Premium profile emoji catalog — cash (wallet) and credit shop pricing';
comment on table public.player_premium_emojis is 'Player-owned premium profile emojis';
