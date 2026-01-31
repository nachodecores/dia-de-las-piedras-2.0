-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

-- Policies for members (allow all for now - tighten later if needed)
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);

-- Policies for segments (read-only for everyone)
CREATE POLICY "Allow read on segments" ON segments FOR SELECT USING (true);
