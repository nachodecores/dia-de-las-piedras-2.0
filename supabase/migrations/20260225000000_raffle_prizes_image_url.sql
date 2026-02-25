-- Add image_url to raffle_prizes for prize photos
ALTER TABLE raffle_prizes ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
