-- Ejecutá este SQL en el SQL Editor de Supabase (Dashboard > SQL Editor)

-- Tabla genérica de métricas (Instagram, newsletter, etc.)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_type, recorded_at)
);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on metrics" ON metrics FOR ALL USING (true) WITH CHECK (true);
