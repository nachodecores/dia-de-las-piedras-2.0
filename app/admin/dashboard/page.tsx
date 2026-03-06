"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Store } from "lucide-react";

type MemberRow = {
  id: string;
  created_at: string;
  segment_id: string | null;
  segments: { name: string } | { name: string }[] | null;
};

type ComercioRow = {
  id: string;
  created_at: string;
  active: boolean;
};

type SegmentCount = {
  name: string;
  value: number;
};

type TimePoint = {
  mes: string;
  total: number;
  fecha: string;
};

type MetricRow = {
  metric_type: string;
  value: number;
  recorded_at: string;
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const INSTAGRAM_TYPE = "instagram_followers";

function formatMesLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("es-UY", { month: "short", year: "2-digit" });
}

function aggregateByMonthCumulative<T extends { created_at: string }>(
  rows: T[],
  filter?: (r: T) => boolean
): TimePoint[] {
  const filtered = filter ? rows.filter(filter) : rows;
  const byMonth: Record<string, number> = {};
  filtered
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .forEach((r) => {
      const mes = r.created_at.slice(0, 7);
      byMonth[mes] = (byMonth[mes] ?? 0) + 1;
    });
  const months = Object.keys(byMonth).sort();
  let cum = 0;
  return months.map((mes) => {
    cum += byMonth[mes];
    return {
      mes: formatMesLabel(`${mes}-01`),
      total: cum,
      fecha: mes,
    };
  });
}

export default function DashboardPage() {
  const [segmentData, setSegmentData] = useState<SegmentCount[]>([]);
  const [sociosOverTime, setSociosOverTime] = useState<TimePoint[]>([]);
  const [comerciosOverTime, setComerciosOverTime] = useState<TimePoint[]>([]);
  const [comerciosTotal, setComerciosTotal] = useState(0);
  const [instagramData, setInstagramData] = useState<TimePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMetricOpen, setAddMetricOpen] = useState(false);
  const [newMetricValue, setNewMetricValue] = useState("");
  const [newMetricDate, setNewMetricDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [savingMetric, setSavingMetric] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [membersRes, comerciosRes, metricsRes] = await Promise.all([
        supabase.from("members").select("id, created_at, segment_id, segments(name)").order("created_at", { ascending: true }),
        supabase.from("comercios").select("id, created_at, active").eq("active", true).order("created_at", { ascending: true }),
        supabase
          .from("metrics")
          .select("metric_type, value, recorded_at")
          .eq("metric_type", INSTAGRAM_TYPE)
          .order("recorded_at", { ascending: true }),
      ]);

      const members = (membersRes.data || []) as MemberRow[];
      const comercios = (comerciosRes.data || []) as ComercioRow[];
      const metrics = (metricsRes.data || []) as MetricRow[];

      const bySegment: Record<string, number> = {};
      members.forEach((m) => {
        const seg = Array.isArray(m.segments) ? m.segments[0] : m.segments;
        const label = seg?.name ?? "Sin segmento";
        bySegment[label] = (bySegment[label] ?? 0) + 1;
      });
      setSegmentData(
        Object.entries(bySegment)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      );

      setSociosOverTime(aggregateByMonthCumulative(members));
      setComerciosOverTime(aggregateByMonthCumulative(comercios));
      setComerciosTotal(comercios.length);

      setInstagramData(
        metrics.map((m) => ({
          mes: formatMesLabel(m.recorded_at),
          total: Number(m.value),
          fecha: m.recorded_at,
        }))
      );
      setLoading(false);
    };

    fetchAll();
  }, []);

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(newMetricValue);
    if (isNaN(value) || value < 0) {
      toast.error("Ingresá un valor numérico válido");
      return;
    }
    setSavingMetric(true);
    const { error } = await supabase.from("metrics").upsert(
      {
        metric_type: INSTAGRAM_TYPE,
        value,
        recorded_at: newMetricDate,
      },
      { onConflict: "metric_type,recorded_at" }
    );
    if (error) {
      toast.error("Error al guardar", { description: error.message });
      setSavingMetric(false);
      return;
    }
    toast.success("Dato guardado");
    setNewMetricValue("");
    setNewMetricDate(new Date().toISOString().slice(0, 10));
    setSavingMetric(false);
    setAddMetricOpen(false);

    const { data } = await supabase
      .from("metrics")
      .select("metric_type, value, recorded_at")
      .eq("metric_type", INSTAGRAM_TYPE)
      .order("recorded_at", { ascending: true });
    const rows = (data || []) as MetricRow[];
    setInstagramData(
      rows.map((m) => ({
        mes: formatMesLabel(m.recorded_at),
        total: Number(m.value),
        fecha: m.recorded_at,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI: Comercios adheridos */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Comercios adheridos (DDLP)</p>
            <p className="text-2xl font-bold">{comerciosTotal}</p>
          </div>
        </div>
      </div>

      {/* Socios por segmento (pie) */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Socios activos por segmento</h2>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : segmentData.length === 0 ? (
          <p className="text-muted-foreground">No hay datos para mostrar.</p>
        ) : (
          <div className="min-h-[360px] w-full max-w-2xl overflow-visible pb-8">
            <ResponsiveContainer width="100%" height={360}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={segmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="50%"
                  outerRadius="75%"
                >
                  {segmentData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry: { payload?: { value: number } }) =>
                    `${value}: ${entry.payload?.value ?? ""}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Socios mes a mes */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Socios acumulados por mes</h2>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : sociosOverTime.length === 0 ? (
          <p className="text-muted-foreground">No hay datos para mostrar.</p>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sociosOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Socios" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Comercios acumulados por mes */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Comercios adheridos acumulados por mes</h2>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : comerciosOverTime.length === 0 ? (
          <p className="text-muted-foreground">No hay datos para mostrar.</p>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comerciosOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Bar dataKey="total" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Comercios" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Instagram followers */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Seguidores de Instagram</h2>
          <Dialog open={addMetricOpen} onOpenChange={setAddMetricOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Cargar dato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cargar seguidores de Instagram</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMetric} className="space-y-4">
                <div>
                  <Label htmlFor="metric_value">Cantidad de seguidores</Label>
                  <Input
                    id="metric_value"
                    type="number"
                    min={0}
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    placeholder="Ej: 1250"
                  />
                </div>
                <div>
                  <Label htmlFor="metric_date">Fecha</Label>
                  <Input
                    id="metric_date"
                    type="date"
                    value={newMetricDate}
                    onChange={(e) => setNewMetricDate(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={savingMetric}>
                  {savingMetric ? "Guardando..." : "Guardar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : instagramData.length === 0 ? (
          <p className="text-muted-foreground">
            No hay datos. Usá &quot;Cargar dato&quot; para agregar el primer registro.
          </p>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={instagramData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-3)" }}
                  name="Seguidores"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
