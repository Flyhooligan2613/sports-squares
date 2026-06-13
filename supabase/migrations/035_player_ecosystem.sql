-- SquareBoards Player Ecosystem™ — progression, referrals, rewards, loyalty

-- Extend public player profile with ecosystem identity
alter table public.player_profiles
  add column if not exists player_id text,
  add column if not exists username text,
  add column if not exists phone text,
  add column if not exists username_changed_at timestamptz,
  add column if not exists referred_by_email text,
  add column if not exists referred_by_code text,
  add column if not exists profile_frame_id text,
  add column if not exists tier_slug text not null default 'rookie',
  add column if not exists tier_level integer not null default 1,
  add column if not exists lifetime_tier_credits bigint not null default 0,
  add column if not exists available_tier_credits bigint not null default 0,
  add column if not exists weekly_tier_credits bigint not null default 0,
  add column if not exists weekly_gameplay_cents bigint not null default 0,
  add column if not exists weekly_period_key text,
  add column if not exists square_credits_cents integer not null default 0,
  add column if not exists pickem_credits_cents integer not null default 0,
  add column if not exists mystery_boxes_opened integer not null default 0,
  add column if not exists rewards_redeemed integer not null default 0,
  add column if not exists qualified_referrals integer not null default 0,
  add column if not exists total_referrals integer not null default 0;

create unique index if not exists player_profiles_player_id_uidx
  on public.player_profiles (player_id)
  where player_id is not null;

create unique index if not exists player_profiles_username_uidx
  on public.player_profiles (lower(username))
  where username is not null;

create unique index if not exists player_profiles_phone_uidx
  on public.player_profiles (phone)
  where phone is not null;

create table if not exists public.player_username_history (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  username text not null,
  changed_at timestamptz not null default now()
);

create index if not exists player_username_history_email_idx
  on public.player_username_history (email, changed_at desc);

create table if not exists public.player_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_email text not null,
  referee_email text not null unique,
  referral_code text not null,
  status text not null default 'pending'
    check (status in ('pending', 'qualified', 'rewarded', 'rejected')),
  first_deposit_cents integer not null default 0,
  qualified_gameplay_cents integer not null default 0,
  referee_device_hash text,
  referee_ip_hash text,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists player_referrals_referrer_idx
  on public.player_referrals (referrer_email, created_at desc);

create table if not exists public.player_referral_milestones (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  milestone_count integer not null,
  reward_type text not null,
  reward_value jsonb not null default '{}',
  rewarded_at timestamptz not null default now(),
  unique (email, milestone_count)
);

create table if not exists public.player_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  entry_type text not null check (entry_type in ('earn', 'spend')),
  credit_kind text not null check (credit_kind in ('tier', 'square', 'pickem')),
  amount bigint not null,
  balance_after bigint,
  source text not null,
  game_type text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists player_credit_ledger_email_idx
  on public.player_credit_ledger (email, created_at desc);

create table if not exists public.ecosystem_tier_definitions (
  slug text primary key,
  display_name text not null,
  sort_order integer not null,
  min_lifetime_credits bigint not null,
  benefits jsonb not null default '[]',
  profile_frame_id text,
  active boolean not null default true
);

create table if not exists public.ecosystem_rewards_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title text not null,
  description text not null default '',
  credit_cost bigint not null,
  reward_type text not null,
  reward_value jsonb not null default '{}',
  min_tier_slug text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecosystem_reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  catalog_item_id uuid not null references public.ecosystem_rewards_catalog(id),
  credits_spent bigint not null,
  status text not null default 'pending'
    check (status in ('pending', 'fulfilled', 'cancelled')),
  fulfillment jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists ecosystem_reward_redemptions_email_idx
  on public.ecosystem_reward_redemptions (email, created_at desc);

create table if not exists public.ecosystem_achievements (
  slug text primary key,
  title text not null,
  description text not null default '',
  emoji text not null default '🏆',
  category text not null default 'general',
  credit_reward bigint not null default 0,
  criteria jsonb not null default '{}',
  active boolean not null default true
);

create table if not exists public.player_ecosystem_achievements (
  email text not null,
  achievement_slug text not null references public.ecosystem_achievements(slug),
  unlocked_at timestamptz not null default now(),
  primary key (email, achievement_slug)
);

create table if not exists public.ecosystem_challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  challenge_type text not null check (challenge_type in ('daily', 'weekly')),
  criteria jsonb not null default '{}',
  credit_reward bigint not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.player_challenge_progress (
  email text not null,
  challenge_id uuid not null references public.ecosystem_challenges(id),
  period_key text not null,
  progress jsonb not null default '{}',
  completed_at timestamptz,
  primary key (email, challenge_id, period_key)
);

create table if not exists public.player_mystery_boxes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  week_key text not null,
  tier_slug text not null,
  rewards jsonb not null default '[]',
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email, week_key)
);

create table if not exists public.ecosystem_admin_config (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Seed tier ladder
insert into public.ecosystem_tier_definitions (slug, display_name, sort_order, min_lifetime_credits, benefits, profile_frame_id)
values
  ('rookie', 'Rookie', 1, 0, '["Welcome bonus eligibility","Standard weekly boxes"]', 'frame_rookie'),
  ('contender', 'Contender', 2, 500, '["Enhanced weekly boxes","Referral badge"]', 'frame_contender'),
  ('all-star', 'All-Star', 3, 2000, '["Priority promotions","Exclusive cosmetics"]', 'frame_all_star'),
  ('champion', 'Champion', 4, 5000, '["VIP giveaways","Special profile frame"]', 'frame_champion'),
  ('elite', 'Elite', 5, 15000, '["Premium reward pool","Early access events"]', 'frame_elite'),
  ('legend', 'Legend', 6, 40000, '["Legend badge","Elite mystery boxes"]', 'frame_legend'),
  ('hall-of-fame', 'Hall of Fame', 7, 100000, '["Hall of Fame frame","Exclusive experiences"]', 'frame_hof'),
  ('immortal', 'Immortal', 8, 250000, '["Immortal status","Luxury reward access"]', 'frame_immortal')
on conflict (slug) do nothing;

-- Seed rewards marketplace
insert into public.ecosystem_rewards_catalog (slug, category, title, description, credit_cost, reward_type, reward_value, sort_order)
values
  ('square-credit-1', 'square_credits', '$1 Square Credit', 'Redeem for any SquareBoards board.', 400, 'square_credit', '{"amountCents":100}', 1),
  ('square-credit-2', 'square_credits', '$2 Square Credit', 'Stackable board credit.', 800, 'square_credit', '{"amountCents":200}', 2),
  ('board-credit-5', 'square_credits', '$5 Board Credit', 'Premium board credit.', 2000, 'square_credit', '{"amountCents":500}', 3),
  ('pickem-entry', 'pickem_credits', 'Pick''em Entry', 'One weekly Pick''em entry credit.', 5000, 'pickem_entry', '{"entryTierCents":1000}', 4),
  ('hoodie', 'merchandise', 'SquareBoards Hoodie', 'Official premium hoodie.', 25000, 'merchandise', '{"sku":"hoodie"}', 5),
  ('signed-football', 'collectibles', 'Signed Football', 'Limited collectible reward.', 50000, 'collectible', '{"item":"signed_football"}', 6),
  ('vip-experience', 'experiences', 'VIP Experience', 'Exclusive VIP event access.', 100000, 'experience', '{"tier":"vip"}', 7),
  ('weekend-vacation', 'travel', 'Weekend Vacation', 'Luxury travel experience reward.', 160000, 'travel', '{"tier":"weekend"}', 8)
on conflict (slug) do nothing;

-- Seed achievements
insert into public.ecosystem_achievements (slug, title, description, emoji, category, credit_reward, criteria)
values
  ('first-win', 'First Win', 'Win your first quarter.', '🏆', 'wins', 50, '{"lifetimeWins":1}'),
  ('ten-wins', '10 Wins', 'Reach 10 lifetime wins.', '🔥', 'wins', 200, '{"lifetimeWins":10}'),
  ('hundred-wins', '100 Wins', 'Reach 100 lifetime wins.', '👑', 'wins', 1000, '{"lifetimeWins":100}'),
  ('referral-champion', 'Referral Champion', '5 qualified referrals.', '🎁', 'referrals', 500, '{"qualifiedReferrals":5}'),
  ('elite-tier', 'Elite Tier', 'Reach Elite tier.', '💎', 'tiers', 750, '{"tierSlug":"elite"}'),
  ('legend-tier', 'Legend Tier', 'Reach Legend tier.', '🌟', 'tiers', 1500, '{"tierSlug":"legend"}'),
  ('perfect-week', 'Perfect Week', 'Perfect Pick''em week.', '✨', 'pickem', 300, '{"perfectWeek":true}'),
  ('thousand-picks', '1000 Correct Picks', 'Lifetime pick accuracy milestone.', '🎯', 'pickem', 2000, '{"correctPicks":1000}')
on conflict (slug) do nothing;

-- Seed referral milestones + platform config
insert into public.ecosystem_admin_config (key, value)
values
  ('referral', '{"rewardCents":1000,"minDepositCents":2500,"minGameplayCents":1500,"milestones":[5,10,25,50,100,250,500,1000]}'),
  ('tier_credits', '{"centsPerCredit":100}'),
  ('mystery_box', '{"minWeeklyGameplayCents":50000}'),
  ('username', '{"freeChangeDays":90,"paidChangeCredits":500}'),
  ('game_status', '{"delayed":"pause_payouts","postponed":"preserve_entries","cancelled":"refund","forfeit":"official_ruling"}')
on conflict (key) do nothing;

alter table public.player_username_history enable row level security;
alter table public.player_referrals enable row level security;
alter table public.player_referral_milestones enable row level security;
alter table public.player_credit_ledger enable row level security;
alter table public.ecosystem_tier_definitions enable row level security;
alter table public.ecosystem_rewards_catalog enable row level security;
alter table public.ecosystem_reward_redemptions enable row level security;
alter table public.ecosystem_achievements enable row level security;
alter table public.player_ecosystem_achievements enable row level security;
alter table public.ecosystem_challenges enable row level security;
alter table public.player_challenge_progress enable row level security;
alter table public.player_mystery_boxes enable row level security;
alter table public.ecosystem_admin_config enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'player_username_history','player_referrals','player_referral_milestones',
    'player_credit_ledger','ecosystem_tier_definitions','ecosystem_rewards_catalog',
    'ecosystem_reward_redemptions','ecosystem_achievements','player_ecosystem_achievements',
    'ecosystem_challenges','player_challenge_progress','player_mystery_boxes','ecosystem_admin_config'
  ] loop
    execute format('drop policy if exists "%s_service" on public.%I', t, t);
    execute format('create policy "%s_service" on public.%I for all using (true) with check (true)', t, t);
  end loop;
end $$;

comment on column public.player_profiles.player_id is 'Permanent public Player ID e.g. ISAIAH742';
