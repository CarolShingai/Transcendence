-- Migration: cria tabelas maps e matches
-- Observe: usa JSONB e timestamps; adiciona constraints condicionalmente

CREATE TABLE IF NOT EXISTS maps (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  map_id BIGINT NOT NULL,
  score INTEGER,
  duration_seconds INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_map_id ON matches(map_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users') THEN
    BEGIN
      ALTER TABLE matches
        ADD CONSTRAINT IF NOT EXISTS fk_matches_user FOREIGN KEY (user_id) REFERENCES users(id);
    EXCEPTION WHEN duplicate_object THEN
      -- constraint already exists, do nothing
      NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'maps') THEN
    BEGIN
      ALTER TABLE matches
        ADD CONSTRAINT IF NOT EXISTS fk_matches_map FOREIGN KEY (map_id) REFERENCES maps(id);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END
$$;
