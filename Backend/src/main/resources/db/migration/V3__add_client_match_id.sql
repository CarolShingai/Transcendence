ALTER TABLE matches ADD COLUMN client_match_id VARCHAR(120);

CREATE UNIQUE INDEX IF NOT EXISTS uq_matches_client_match_id ON matches(client_match_id);
