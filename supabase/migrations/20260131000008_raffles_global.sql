-- Make raffles global (not per comercio)
-- Remove comercio_id from raffles and add it to participants instead

ALTER TABLE raffles DROP COLUMN comercio_id;

-- Add comercio_id to participants to track where they came from
ALTER TABLE raffle_participants ADD COLUMN comercio_id UUID REFERENCES comercios(id) ON DELETE SET NULL;
