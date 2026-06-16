-- SquarePass™ New Competitor Automated Experience (#009 extension)
-- Per-player onboarding state + configurable mystery reward pool

CREATE TABLE IF NOT EXISTS square_pass_automation_state (
  email TEXT PRIMARY KEY,
  welcome_completed_at TIMESTAMPTZ,
  mystery_revealed_at TIMESTAMPTZ,
  reward_reveal_completed_at TIMESTAMPTZ,
  founder_claimed_at TIMESTAMPTZ,
  whats_next_completed_at TIMESTAMPTZ,
  profile_customization_completed_at TIMESTAMPTZ,
  last_daily_bonus_at TIMESTAMPTZ,
  flash_events_seen JSONB NOT NULL DEFAULT '[]'::jsonb,
  surprises_claimed JSONB NOT NULL DEFAULT '[]'::jsonb,
  experiences_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_square_pass_automation_welcome
  ON square_pass_automation_state (welcome_completed_at);

CREATE TABLE IF NOT EXISTS square_pass_mystery_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  reward JSONB NOT NULL,
  weight INTEGER NOT NULL DEFAULT 100 CHECK (weight > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mystery SquarePass campaign (automatic redemptions — no promo code)
INSERT INTO square_pass_campaigns (
  slug, name, campaign_type, description, rewards, active, auto_activate,
  usage_limit_per_player, eligibility_rules
) VALUES (
  'mystery-square-pass',
  'Mystery SquarePass',
  'event',
  'Guaranteed welcome mystery reward — every new competitor receives one.',
  '[]'::jsonb,
  true,
  true,
  1,
  '{"newAccountsOnly": true, "maxAgeHours": 168}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Founder recognition campaign
INSERT INTO square_pass_campaigns (
  slug, name, campaign_type, description, rewards, active, auto_activate,
  usage_limit_per_player, eligibility_rules
) VALUES (
  'founding-competitor',
  'Founding Competitor',
  'vip',
  'Historic founder status for early platform competitors.',
  '[
    {"type": "badge", "itemId": "founding_competitor", "label": "Founding Competitor Badge"},
    {"type": "profile_frame", "itemId": "frame_founding", "label": "Founder Frame"},
    {"type": "themes", "itemId": "theme_founding_gold", "label": "Founder Gold Theme"},
    {"type": "xp", "amount": 500, "label": "500 Founder XP"}
  ]'::jsonb,
  true,
  true,
  1,
  '{}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Daily SquarePass campaign template
INSERT INTO square_pass_campaigns (
  slug, name, campaign_type, description, rewards, active, auto_activate,
  usage_limit_per_player, eligibility_rules
) VALUES (
  'daily-square-pass',
  'Daily SquarePass',
  'event',
  'First login of the day bonus.',
  '[
    {"type": "xp", "amount": 50, "label": "50 Daily XP"},
    {"type": "reward_drops", "amount": 1, "label": "Daily Reward Drop"}
  ]'::jsonb,
  true,
  true,
  null,
  '{}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Flash event template (admin activates via dates)
INSERT INTO square_pass_campaigns (
  slug, name, campaign_type, description, rewards, active, auto_activate,
  usage_limit_per_player, starts_at, ends_at, eligibility_rules
) VALUES (
  'flash-double-xp',
  'Flash Event — Double XP',
  'event',
  'Limited-time double XP opportunity.',
  '[
    {"type": "xp", "amount": 200, "label": "200 Flash XP"},
    {"type": "badge", "itemId": "flash_event_participant", "label": "Flash Event Badge"}
  ]'::jsonb,
  false,
  true,
  1,
  null,
  null,
  '{}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Seed mystery pool — guaranteed rewards, weighted random
INSERT INTO square_pass_mystery_pool (slug, label, reward, weight, sort_order) VALUES
  ('mystery-xp-250', '250 XP Boost', '{"type": "xp", "amount": 250, "label": "250 XP"}'::jsonb, 250, 1),
  ('mystery-contest-ticket', 'Contest Entry Ticket', '{"type": "contest_tickets", "amount": 1, "label": "Contest Entry Ticket"}'::jsonb, 180, 2),
  ('mystery-reward-drop', 'Reward Drop', '{"type": "reward_drops", "amount": 1, "label": "Mystery Reward Drop"}'::jsonb, 150, 3),
  ('mystery-rookie-badge', 'Rookie Badge', '{"type": "badge", "itemId": "mystery_rookie_badge", "label": "Rookie Badge"}'::jsonb, 120, 4),
  ('mystery-avatar-frame', 'Avatar Frame', '{"type": "profile_frame", "itemId": "frame_mystery_welcome", "label": "Welcome Avatar Frame"}'::jsonb, 100, 5),
  ('mystery-profile-banner', 'Profile Banner', '{"type": "themes", "itemId": "banner_mystery_rookie", "label": "Rookie Profile Banner"}'::jsonb, 80, 6),
  ('mystery-golden-ticket', 'Golden Ticket', '{"type": "contest_tickets", "amount": 3, "label": "Golden Ticket (3 Entries)"}'::jsonb, 15, 7),
  ('mystery-collectible', 'Limited Collectible', '{"type": "badge", "itemId": "collectible_mystery_genesis", "label": "Genesis Collectible"}'::jsonb, 25, 8)
ON CONFLICT (slug) DO NOTHING;
