-- Add ticket_number column (sequential per raffle)
ALTER TABLE raffle_participants ADD COLUMN ticket_number INTEGER;

-- Create function to auto-assign ticket number per raffle
CREATE OR REPLACE FUNCTION assign_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(ticket_number), 0) + 1
    INTO NEW.ticket_number
    FROM raffle_participants
    WHERE raffle_id = NEW.raffle_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert
CREATE TRIGGER set_ticket_number
    BEFORE INSERT ON raffle_participants
    FOR EACH ROW
    EXECUTE FUNCTION assign_ticket_number();

-- Make ticket_number NOT NULL after setting up trigger
-- (existing rows will need to be backfilled if any exist)
UPDATE raffle_participants rp
SET ticket_number = sub.rn
FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY raffle_id ORDER BY created_at) as rn
    FROM raffle_participants
) sub
WHERE rp.id = sub.id AND rp.ticket_number IS NULL;

ALTER TABLE raffle_participants ALTER COLUMN ticket_number SET NOT NULL;

-- Add unique constraint per raffle
ALTER TABLE raffle_participants ADD CONSTRAINT unique_ticket_per_raffle UNIQUE (raffle_id, ticket_number);
