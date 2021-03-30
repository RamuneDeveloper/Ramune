DROP INDEX IF EXISTS search_idx;
CREATE INDEX IF NOT EXISTS search_idx ON manga USING GIN (to_tsvector('english', eng_title));