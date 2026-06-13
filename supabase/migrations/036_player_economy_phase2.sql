-- Player Economy Phase 2 — inventory, promotions, avatars, legacy stats

alter table public.player_profiles
  add column if not exists avatar_emoji text not null default '🎮',
  add column if not exists tier_xp integer not null default 0,
  add column if not exists pending_rewards_count integer not null default 0,
  add column if not exists lifetime_gameplay_cents bigint not null default 0,
  add column if not exists lifetime_purchases_cents bigint not null default 0,
  add column if not exists lifetime_rewards_earned bigint not null default 0,
  add column if not exists login_streak_days integer not null default 0,
  add column if not exists last_login_date date;

create table if not exists public.player_inventory (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  item_type text not null check (item_type in (
    'square_credit', 'pickem_entry', 'reward_token', 'mystery_box',
    'coupon', 'tier_reward', 'merch_coupon', 'giveaway_ticket',
    'cosmetic', 'badge', 'referral_bonus', 'promo_credit'
  )),
  title text not null,
  quantity integer not null default 1,
  value_cents integer,
  metadata jsonb not null default '{}',
  source text not null,
  status text not null default 'active' check (status in ('active', 'used', 'expired', 'claimed')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists player_inventory_email_idx
  on public.player_inventory (email, status, created_at desc);

create table if not exists public.ecosystem_promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  promo_type text not null default 'bonus' check (promo_type in (
    'bonus', 'double_credits', 'deposit_bonus', 'giveaway', 'holiday', 'vip'
  )),
  credit_reward bigint not null default 0,
  square_credit_cents integer not null default 0,
  multiplier numeric(4,2) not null default 1,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  min_tier_slug text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.player_promotion_claims (
  email text not null,
  promotion_id uuid not null references public.ecosystem_promotions(id),
  claimed_at timestamptz not null default now(),
  primary key (email, promotion_id)
);

create table if not exists public.player_pending_rewards (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  title text not null,
  reward_type text not null,
  value jsonb not null default '{}',
  source text not null,
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists player_pending_rewards_email_idx
  on public.player_pending_rewards (email, claimed_at, created_at desc);

insert into public.ecosystem_promotions (slug, title, description, promo_type, credit_reward, square_credit_cents, sort_order)
values
  ('friday-bonus', 'Friday Bonus', 'Extra Tier Credits on every purchase this Friday.', 'bonus', 100, 0, 1),
  ('weekend-double', 'Weekend Double Credits', 'Earn 2x Tier Credits Saturday & Sunday.', 'double_credits', 0, 0, 2),
  ('nfl-opening', 'NFL Opening Week', 'Kickoff season with bonus Square Credits.', 'giveaway', 0, 500, 3),
  ('vip-weekend', 'VIP Weekend', 'Elite+ players receive exclusive bonus rewards.', 'vip', 250, 0, 4)
on conflict (slug) do nothing;

alter table public.player_inventory enable row level security;
alter table public.ecosystem_promotions enable row level security;
alter table public.player_promotion_claims enable row level security;
alter table public.player_pending_rewards enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'player_inventory','ecosystem_promotions','player_promotion_claims','player_pending_rewards'
  ] loop
    execute format('drop policy if exists "%s_service" on public.%I', t, t);
    execute format('create policy "%s_service" on public.%I for all using (true) with check (true)', t, t);
  end loop;
end $$;
