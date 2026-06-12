-- SquareBoards Vision 2.0 — marketplace catalog + board metadata

CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY,
  espn_game_id text NOT NULL,
  espn_sport text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  kickoff_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (espn_sport, espn_game_id)
);

CREATE INDEX IF NOT EXISTS games_sport_kickoff_idx ON games (espn_sport, kickoff_at);
CREATE INDEX IF NOT EXISTS games_status_idx ON games (status);

ALTER TABLE pools ADD COLUMN IF NOT EXISTS game_id text;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS board_index integer NOT NULL DEFAULT 1;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS kickoff_at timestamptz;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS auto_created boolean NOT NULL DEFAULT false;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS locked_at timestamptz;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS marketplace_visible boolean NOT NULL DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pools_game_id_fkey'
  ) THEN
    ALTER TABLE pools
      ADD CONSTRAINT pools_game_id_fkey
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS pools_game_id_idx ON pools (game_id);
CREATE INDEX IF NOT EXISTS pools_marketplace_idx ON pools (marketplace_visible, status);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "games_public_read" ON games FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "games_service_write" ON games FOR ALL USING (true) WITH CHECK (true);
