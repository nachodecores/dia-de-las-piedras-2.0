"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Gift } from "lucide-react";
import { formatDateOnly } from "@/lib/utils";

type PrizeWinner = {
  name: string;
  whatsapp: string;
};

type Prize = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  raffle_participants?: PrizeWinner | null;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return "•".repeat(digits.length - 4) + digits.slice(-4);
}

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
        .select(
          "id, name, raffle_date, raffle_prizes(id, name, description, created_at, raffle_participants!winner_participant_id(name, whatsapp))"
        )
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
        (a: Prize, b: Prize) =>
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
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
      <div
        className="min-h-screen px-6 py-8"
        style={{ background: "linear-gradient(to bottom, #1F2A44, #E6E6E6)" }}
      >
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div
        className="min-h-screen px-6 py-8"
        style={{ background: "linear-gradient(to bottom, #1F2A44, #E6E6E6)" }}
      >
        <h1 className="text-2xl font-semibold mb-4">Sorteos</h1>
        <p className="text-muted-foreground">
          No hay un sorteo activo en este momento.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-8 max-w-lg mx-auto"
      style={{ background: "linear-gradient(to bottom, #1F2A44, #E6E6E6)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Gift className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Sorteos</h1>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Sorteo de{" "}
          {raffle.raffle_date
            ? formatDateOnly(raffle.raffle_date, { month: "long" })
            : "este mes"}
        </h2>

        {raffle.prizes.length > 0 ? (
          <div className="mt-6">
            <ol className="space-y-2">
              {raffle.prizes.map((prize, index) => (
                <li
                  key={prize.id}
                  className="flex items-start gap-3 py-2 px-3 rounded-md bg-muted/50"
                >
                  <span className="font-mono text-sm font-semibold text-primary shrink-0">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-medium">{prize.name}</div>
                    {prize.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {prize.description}
                      </p>
                    )}
                    {prize.raffle_participants && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ganador: {getInitials(prize.raffle_participants.name)}{" "}
                        {maskPhone(prize.raffle_participants.whatsapp)}
                      </p>
                    )}
                  </div>
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
