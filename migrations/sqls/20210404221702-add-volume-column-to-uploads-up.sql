ALTER TABLE uploads ADD COLUMN volume_id numeric;
UPDATE uploads SET volume_id = 0;
ALTER TABLE uploads ALTER COLUMN volume_id SET NOT NULL;