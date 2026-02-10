-- One participation per (raffle, comercio, whatsapp). Same person can participate again from another comercio.
-- Remove duplicates first, keeping the earliest participation per (raffle_id, comercio_id, whatsapp).
DELETE FROM raffle_participants a
USING raffle_participants b
WHERE a.id > b.id
  AND a.raffle_id = b.raffle_id
  AND a.comercio_id = b.comercio_id
  AND a.whatsapp = b.whatsapp;

ALTER TABLE raffle_participants
  ADD CONSTRAINT raffle_participants_one_per_comercio_whatsapp
  UNIQUE (raffle_id, comercio_id, whatsapp);
