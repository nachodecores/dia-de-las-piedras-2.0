-- Create comercios table for piedras_day_member members
CREATE TABLE comercios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    short_description TEXT,
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    website VARCHAR(255),
    whatsapp VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    display_address VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id)
);

-- RLS policies
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on comercios" ON comercios FOR ALL USING (true) WITH CHECK (true);
