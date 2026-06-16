-- OnboardingQueue™ Engine (Platform Build Spec #010)
-- Centralized onboarding state + admin module configuration

CREATE TABLE IF NOT EXISTS onboarding_queue_state (
  email TEXT PRIMARY KEY,
  current_step_id TEXT,
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  skipped_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  interrupted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_queue_current_step
  ON onboarding_queue_state (current_step_id);

CREATE TABLE IF NOT EXISTS onboarding_queue_config (
  module_id TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  order_override INTEGER,
  delay_ms INTEGER NOT NULL DEFAULT 0,
  eligibility_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  testing_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO onboarding_queue_config (module_id, order_override) VALUES
  ('account_created', 1),
  ('welcome', 2),
  ('mystery_pass', 3),
  ('reward_reveal', 4),
  ('founder', 5),
  ('birthday', 6),
  ('flash_event', 7),
  ('season_event', 8),
  ('profile', 9),
  ('missions', 10),
  ('competitor_score', 11),
  ('choose_journey', 12),
  ('navigate_dashboard', 13),
  ('daily_bonus', 100),
  ('surprise', 101)
ON CONFLICT (module_id) DO NOTHING;
