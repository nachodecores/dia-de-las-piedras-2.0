-- Create segments lookup table
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default segments
INSERT INTO segments (name) VALUES
  ('Comercio minorista'),
  ('Comercio Mayorista y distribución'),
  ('Industria y producción'),
  ('Servicios personales'),
  ('Servicios empresariales'),
  ('Agropecuarios'),
  ('Instituciones sociales y Asociaciones civiles'),
  ('Socios colaboradores');

-- Add foreign key to members table
ALTER TABLE members
ADD COLUMN segment_id UUID REFERENCES segments(id);

-- Drop old column
ALTER TABLE members DROP COLUMN main_segment;
