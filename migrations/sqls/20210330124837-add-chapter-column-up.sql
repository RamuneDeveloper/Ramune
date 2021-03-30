ALTER TABLE uploads ADD COLUMN manga_id integer;
UPDATE uploads SET manga_id = (
  SELECT manga_id
  FROM chapters
  WHERE uploads.chapter_id = chapters.identifier
);
DELETE FROM uploads WHERE manga_id is null;
ALTER TABLE uploads ALTER COLUMN manga_id SET NOT NULL;