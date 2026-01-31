-- Create raffles table (sorteos)
CREATE TABLE raffles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    secret_code UUID NOT NULL DEFAULT gen_random_uuid(),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle participants table (participantes)
CREATE TABLE raffle_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on raffles" ON raffles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE raffle_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on raffle_participants" ON raffle_participants FOR ALL USING (true) WITH CHECK (true);
