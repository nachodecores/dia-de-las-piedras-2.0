"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Printer } from "lucide-react";

type Comercio = {
  id: string;
  fantasy_name: string | null;
  slug: string;
};

export default function DevCartelPage() {
  const isDev = process.env.NODE_ENV === "development";
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [posterSize, setPosterSize] = useState<"A5" | "A6">("A5");

  useEffect(() => {
    const fetchComercios = async () => {
      const { data } = await supabase
        .from("comercios")
        .select("id, fantasy_name, slug")
        .eq("active", true)
        .order("fantasy_name");
      const list = data ?? [];
      setComercios(list);
      setSelectedIds(new Set(list.map((c) => c.id)));
    };
    fetchComercios();
  }, []);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(comercios.map((c) => c.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const printUrl = (size: "A5" | "A6") => {
    const ids = [...selectedIds].join(",");
    return `/dev/cartel/print-all?size=${size}${ids ? `&ids=${ids}` : ""}`;
  };

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-muted-foreground">Esta página solo está disponible en desarrollo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Imprimir carteles con QR</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seleccioná los comercios y el tamaño, luego hacé clic en Imprimir.
          </p>
        </div>

        {/* Tamaño */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño del cartel
          </label>
          <select
            id="size"
            value={posterSize}
            onChange={(e) => setPosterSize(e.target.value as "A5" | "A6")}
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="A5">A5 (148 × 210 mm)</option>
            <option value="A6">A6 (105 × 148 mm)</option>
          </select>
        </div>

        {/* Comercios */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Comercios ({selectedIds.size} de {comercios.length} seleccionados)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-primary underline hover:no-underline"
              >
                Todos
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-muted-foreground underline hover:no-underline"
              >
                Ninguno
              </button>
            </div>
          </div>
          <div className="border rounded-md bg-white divide-y max-h-72 overflow-y-auto">
            {comercios.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">Sin comercios activos</p>
            )}
            {comercios.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleId(c.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{c.fantasy_name || c.slug}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botón imprimir */}
        <a
          href={printUrl(posterSize)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            selectedIds.size === 0
              ? "bg-gray-200 text-gray-400 pointer-events-none"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
          aria-disabled={selectedIds.size === 0}
        >
          <Printer className="h-4 w-4" />
          Imprimir {selectedIds.size > 0 ? `${selectedIds.size} cartel${selectedIds.size !== 1 ? "es" : ""}` : "carteles"}
        </a>
      </div>
    </div>
  );
}
