-- SquarePass™ — Dynamic Promotion & Referral Engine (Platform Build Spec #009)

create table if not exists public.square_pass_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  campaign_type text not null check (
    campaign_type in (
      'signup', 'referral', 'promo', 'influencer', 'partner',
      'launch', 'vip', 'seasonal', 'event'
    )
  ),
  description text,
  rewards jsonb not null default '[]'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit_per_player integer,
  total_redemption_limit integer,
  total_redemptions integer not null default 0,
  eligibility_rules jsonb not null default '{}'::jsonb,
  active boolean not null default false,
  auto_activate boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists square_pass_campaigns_type_active_idx
  on public.square_pass_campaigns (campaign_type, active);

create table if not exists public.square_pass_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  campaign_id uuid not null references public.square_pass_campaigns (id) on delete cascade,
  usage_limit_per_player integer,
  max_redemptions integer,
  current_redemptions integer not null default 0,
  eligible_sports text[],
  eligible_regions text[],
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint square_pass_codes_code_unique unique (code)
);

create index if not exists square_pass_codes_campaign_idx
  on public.square_pass_codes (campaign_id);

create table if not exists public.square_pass_redemptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_id uuid references public.square_pass_codes (id) on delete set null,
  campaign_id uuid not null references public.square_pass_campaigns (id) on delete cascade,
  code_string text not null,
  rewards_granted jsonb not null default '[]'::jsonb,
  fraud_flags jsonb not null default '[]'::jsonb,
  blocked boolean not null default false,
  ip_hash text,
  device_hash text,
  created_at timestamptz not null default now()
);

create index if not exists square_pass_redemptions_email_idx
  on public.square_pass_redemptions (email, created_at desc);

create index if not exists square_pass_redemptions_campaign_idx
  on public.square_pass_redemptions (campaign_id, created_at desc);

create table if not exists public.square_pass_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_email text not null,
  referee_email text not null,
  referral_code text not null,
  status text not null default 'pending' check (
    status in ('pending', 'qualified', 'rewarded', 'rejected')
  ),
  milestone_rewards jsonb not null default '[]'::jsonb,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint square_pass_referrals_referee_unique unique (referee_email)
);

create index if not exists square_pass_referrals_referrer_idx
  on public.square_pass_referrals (referrer_email, created_at desc);

create table if not exists public.player_referral_codes (
  email text primary key,
  code text not null,
  created_at timestamptz not null default now(),
  constraint player_referral_codes_code_unique unique (code)
);

alter table public.player_profiles
  add column if not exists square_pass_redemptions_count integer not null default 0,
  add column if not exists square_pass_referrals_qualified integer not null default 0,
  add column if not exists competitor_score_bonus integer not null default 0;

comment on table public.square_pass_campaigns is 'SquarePass™ admin-configured promotion campaigns';
comment on table public.square_pass_codes is 'Redeemable promo codes linked to campaigns';
comment on table public.square_pass_redemptions is 'Audit log of code redemptions and rewards';
comment on table public.square_pass_referrals is 'SquarePass referral tracking with milestone state';
comment on table public.player_referral_codes is 'Personal vanity invite codes per competitor';
comment on column public.player_profiles.competitor_score_bonus is 'Merit score boost from SquarePass rewards';

alter table public.square_pass_campaigns enable row level security;
alter table public.square_pass_codes enable row level security;
alter table public.square_pass_redemptions enable row level security;
alter table public.square_pass_referrals enable row level security;
alter table public.player_referral_codes enable row level security;

drop policy if exists square_pass_campaigns_service on public.square_pass_campaigns;
create policy square_pass_campaigns_service on public.square_pass_campaigns for all using (true);

drop policy if exists square_pass_codes_service on public.square_pass_codes;
create policy square_pass_codes_service on public.square_pass_codes for all using (true);

drop policy if exists square_pass_redemptions_service on public.square_pass_redemptions;
create policy square_pass_redemptions_service on public.square_pass_redemptions for all using (true);

drop policy if exists square_pass_referrals_service on public.square_pass_referrals;
create policy square_pass_referrals_service on public.square_pass_referrals for all using (true);

drop policy if exists player_referral_codes_service on public.player_referral_codes;
create policy player_referral_codes_service on public.player_referral_codes for all using (true);

-- Template campaigns — activate via admin; no hardcoded promo logic in app code
insert into public.square_pass_campaigns (
  slug, name, campaign_type, description, rewards, starts_at, active, auto_activate, eligibility_rules
) values
(
  'genesis-signup-welcome',
  'Genesis Welcome Bonus',
  'signup',
  'Exclusive welcome opportunity for new competitors — aligned with Project Genesis™.',
  '[
    {"type":"xp","amount":250,"label":"250 XP"},
    {"type":"badge","itemId":"rookie_competitor","label":"Rookie Competitor Badge"},
    {"type":"profile_frame","itemId":"genesis_rookie_frame","label":"Rookie Avatar Frame"}
  ]'::jsonb,
  now(),
  true,
  true,
  '{"newAccountsOnly":true,"requiresGenesis":true}'::jsonb
),
(
  'launch-rookie-ticket',
  'Launch Contest Ticket',
  'launch',
  'Limited launch opportunity — one free contest entry for new roster members.',
  '[
    {"type":"contest_tickets","amount":1,"label":"Free Contest Ticket"}
  ]'::jsonb,
  now(),
  false,
  true,
  '{"newAccountsOnly":true,"maxAgeHours":72}'::jsonb
),
(
  'vip-partner-template',
  'VIP Partner Opportunity',
  'partner',
  'Template for partner/influencer campaigns — configure codes in admin.',
  '[
    {"type":"wallet_credits","amountCents":500,"label":"$5 Platform Credits"},
    {"type":"xp","amount":100,"label":"100 XP"}
  ]'::jsonb,
  null,
  false,
  false,
  '{"regions":[],"sports":[]}'::jsonb
),
(
  'referral-milestone-engine',
  'Referral Milestone Rewards',
  'referral',
  'Automatic milestone rewards at 1/5/10/25/50/100 qualified referrals.',
  '[]'::jsonb,
  now(),
  true,
  true,
  '{"milestones":[1,5,10,25,50,100]}'::jsonb
)
on conflict (slug) do nothing;

insert into public.square_pass_codes (code, campaign_id, max_redemptions, active)
select 'WELCOME25', c.id, 10000, true
from public.square_pass_campaigns c
where c.slug = 'genesis-signup-welcome'
on conflict (code) do nothing;

insert into public.square_pass_codes (code, campaign_id, max_redemptions, active, expires_at)
select 'LAUNCH2026', c.id, 5000, false, (now() + interval '90 days')
from public.square_pass_campaigns c
where c.slug = 'launch-rookie-ticket'
on conflict (code) do nothing;
