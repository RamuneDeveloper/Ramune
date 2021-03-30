ALTER TABLE uploads ADD COLUMN original_hash text;
ALTER TABLE uploads ADD COLUMN repacked_hash text;
ALTER TABLE uploads ADD COLUMN resized_hash text;

UPDATE uploads SET original_hash = '';
UPDATE uploads SET repacked_hash = '';
UPDATE uploads SET resized_hash = '';

ALTER TABLE uploads ALTER COLUMN original_hash SET NOT NULL;
ALTER TABLE uploads ALTER COLUMN repacked_hash SET NOT NULL;
ALTER TABLE uploads ALTER COLUMN resized_hash SET NOT NULL;