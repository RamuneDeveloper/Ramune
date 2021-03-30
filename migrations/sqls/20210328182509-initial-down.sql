DROP TABLE manga;
DROP INDEX IF EXISTS search_idx;
DROP INDEX IF EXISTS romaji_title_idx;
DROP INDEX IF EXISTS japanese_title;
DROP INDEX IF EXISTS author_idx;
DROP INDEX IF EXISTS artist_idx;

DROP TABLE chapters;
DROP INDEX IF EXISTS manga_id_idx;

DROP TABLE uploads;
DROP INDEX IF EXISTS chapter_id_idx;
DROP INDEX IF EXISTS original_hash_idx;