"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Gift, Trophy } from "lucide-react";

type Prize = {
  id: string;
  name: string;
  position: number;
};

type ActiveRaffle = {
  id: string;
  name: string;
  raffle_date: string | null;
  prizes: Prize[];
};

export default function SorteosPage() {
  const [raffle, setRaffle] = useState<ActiveRaffle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveRaffle = async () => {
      const { data } = await supabase
        .from("raffles")
        .select("id, name, raffle_date, raffle_prizes(id, name, position)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) {
        setRaffle(null);
        setLoading(false);
        return;
      }

      const prizes = (data.raffle_prizes || []).sort(
        (a: Prize, b: Prize) => a.position - b.position
      );
      setRaffle({
        id: data.id,
        name: data.name,
        raffle_date: data.raffle_date,
        prizes,
      });
      setLoading(false);
    };

    fetchActiveRaffle();
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-2xl font-semibold mb-4">Sorteos</h1>
        <p className="text-muted-foreground">
          No hay un sorteo activo en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Sorteos</h1>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-bold">{raffle.name}</h2>
        {raffle.raffle_date && (
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(raffle.raffle_date).toLocaleDateString("es-UY", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        {raffle.prizes.length > 0 ? (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Trophy className="h-4 w-4" />
              Premios
            </div>
            <ol className="space-y-2">
              {raffle.prizes.map((prize) => (
                <li
                  key={prize.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/50"
                >
                  <span className="font-mono text-sm font-semibold text-primary">
                    #{prize.position}
                  </span>
                  <span>{prize.name}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">
            Premios por definir.
          </p>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-6 text-center">
        Participá escaneando el QR en los comercios adheridos.
      </p>
    </div>
  );
}
