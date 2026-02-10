-- Add secret_code to comercios for permanent QR / participation link per store
-- Existing rows get a random UUID via DEFAULT
ALTER TABLE comercios
  ADD COLUMN secret_code UUID UNIQUE NOT NULL DEFAULT gen_random_uuid();
