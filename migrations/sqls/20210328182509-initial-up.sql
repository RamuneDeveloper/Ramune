CREATE TABLE IF NOT EXISTS manga (
  "id" SERIAL PRIMARY KEY,
  "eng_title" text NOT NULL,
  "romaji_title" text,
  "japanese_title" text,
  "author" text,
  "artist" text,
  "description" text NOT NULL DEFAULT '',
  "cover" text NOT NULL,
  "added" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "views" integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS search_idx ON manga USING GIN (to_tsvector('english', eng_title));
CREATE INDEX IF NOT EXISTS eng_title_idx ON manga USING btree ("eng_title");
CREATE INDEX IF NOT EXISTS romaji_title_idx ON manga USING btree ("romaji_title");
CREATE INDEX IF NOT EXISTS japanese_title_idx ON manga USING btree ("japanese_title");
CREATE INDEX IF NOT EXISTS author_idx ON manga USING btree ("author");
CREATE INDEX IF NOT EXISTS artist_idx ON manga USING btree ("artist");

CREATE TABLE IF NOT EXISTS chapters (
  "id" SERIAL PRIMARY KEY,
  "manga_id" integer NOT NULL,
  "identifier" integer NOT NULL,
  "title" text
);
CREATE INDEX IF NOT EXISTS manga_id_idx ON chapters USING btree ("manga_id");

CREATE TABLE IF NOT EXISTS uploads (
  "id" SERIAL PRIMARY KEY,
  "chapter_id" integer NOT NULL,
  "source" text,
  "group" integer,
  -- "uploader" integer NOT NULL,
  "rating" integer NOT NULL DEFAULT 0,
  "rating_count" integer NOT NULL DEFAULT 0,
  "original_hash" text NOT NULL,
  "repacked_hash" text NOT NULL,
  "resized_hash" text NOT NULL
);
CREATE INDEX IF NOT EXISTS chapter_id_idx ON uploads USING btree ("chapter_id");
CREATE INDEX IF NOT EXISTS original_hash_idx ON uploads USING btree ("original_hash");