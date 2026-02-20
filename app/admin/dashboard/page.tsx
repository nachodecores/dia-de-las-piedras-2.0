"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type MemberRow = {
  id: string;
  segment_id: string | null;
  segments: { name: string } | { name: string }[] | null;
};

type SegmentCount = {
  name: string;
  value: number;
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function DashboardPage() {
  const [data, setData] = useState<SegmentCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembersBySegment = async () => {
      const { data: members, error } = await supabase
        .from("members")
        .select("id, segment_id, segments(name)")
        .order("created_at", { ascending: false });

      if (error) {
        setData([]);
        setLoading(false);
        return;
      }

      const bySegment: Record<string, number> = {};
      (members || []).forEach((m: MemberRow) => {
        const seg = Array.isArray(m.segments) ? m.segments[0] : m.segments;
        const label = seg?.name ?? "Sin segmento";
        bySegment[label] = (bySegment[label] ?? 0) + 1;
      });

      setData(
        Object.entries(bySegment).map(([name, value]) => ({ name, value }))
      );
      setLoading(false);
    };

    fetchMembersBySegment();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Socios activos por segmento
        </h2>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground">No hay datos para mostrar.</p>
        ) : (
          <div className="min-h-[320px] w-full max-w-lg overflow-visible pb-8">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="55%"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine
                >
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
