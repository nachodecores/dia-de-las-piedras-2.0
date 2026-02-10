-- Store ticket_number as zero-padded string (0001, 0002, ...)

-- Drop trigger and constraint so we can change the column type
DROP TRIGGER IF EXISTS set_ticket_number ON raffle_participants;
ALTER TABLE raffle_participants DROP CONSTRAINT IF EXISTS unique_ticket_per_raffle;

-- Convert INTEGER to VARCHAR(4) with leading zeros
ALTER TABLE raffle_participants
  ALTER COLUMN ticket_number TYPE VARCHAR(4)
  USING LPAD(ticket_number::text, 4, '0');

-- Trigger function: next number per raffle in 0001 format
CREATE OR REPLACE FUNCTION assign_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(ticket_number::integer), 0) + 1
  INTO next_num
  FROM raffle_participants
  WHERE raffle_id = NEW.raffle_id;

  NEW.ticket_number := LPAD(next_num::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON raffle_participants
  FOR EACH ROW
  EXECUTE FUNCTION assign_ticket_number();

ALTER TABLE raffle_participants ADD CONSTRAINT unique_ticket_per_raffle UNIQUE (raffle_id, ticket_number);
