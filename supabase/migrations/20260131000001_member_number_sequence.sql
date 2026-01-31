-- Create sequence starting at 1000
CREATE SEQUENCE IF NOT EXISTS member_number_seq START WITH 1000;

-- Set default value for member_number using the sequence
ALTER TABLE members
ALTER COLUMN member_number SET DEFAULT nextval('member_number_seq');
