ALTER TABLE uploads ADD COLUMN uploader integer;
UPDATE uploads SET uploader = 0;
ALTER TABLE uploads ALTER COLUMN uploader SET NOT NULL;