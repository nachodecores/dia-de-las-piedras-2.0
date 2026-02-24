"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  raffle_participants?: PrizeWinner | PrizeWinner[] | null;
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
  const [participarModalOpen, setParticiparModalOpen] = useState(false);

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
        (a, b) =>
          new Date((a as Prize).created_at || 0).getTime() -
          new Date((b as Prize).created_at || 0).getTime()
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

  const pageBg = {
    background:
      "linear-gradient(135deg, #0f2e1e 0%, #0c4a6e 50%, #0f172a 100%)",
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-8"
        style={pageBg}
      >
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen px-6 py-8" style={pageBg}>
        <h1 className="text-2xl font-semibold mb-4 text-white">Sorteos</h1>
        <p className="text-white/90">
          No hay un sorteo activo en este momento.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-8 max-w-lg mx-auto"
      style={pageBg}
    >
      <div className="flex items-center gap-2 mb-2">
        <Gift className="h-6 w-6 text-white" />
        <h1 className="text-2xl font-semibold text-white">Sorteos</h1>
      </div>

      <div className="rounded-lg border bg-[#e8f5e9] p-5 shadow-sm">
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
                  className="flex items-start gap-3 py-2 px-3 rounded-md bg-muted/50 border border-[#21A85B]"
                >
                  <span className="font-mono text-sm font-semibold text-primary shrink-0">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-[#21A85B]">{prize.name}</div>
                    {prize.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {prize.description}
                      </p>
                    )}
                    {(() => {
                      const winner = Array.isArray(prize.raffle_participants)
                        ? prize.raffle_participants[0]
                        : prize.raffle_participants;
                      return winner ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ganador: {getInitials(winner.name)} {maskPhone(winner.whatsapp)}
                        </p>
                      ) : null;
                    })()}
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

        <button
          type="button"
          onClick={() => setParticiparModalOpen(true)}
          className="mt-6 block w-full rounded-lg bg-[#21A85B] px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-[#1a8649]"
        >
          Participá del sorteo
        </button>
      </div>

      <Dialog open={participarModalOpen} onOpenChange={setParticiparModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Participar del sorteo</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Para participar del sorteo tenés que escanear el código presente en
            cualquiera de los{" "}
            <Link
              href="/comercios"
              className="font-medium text-primary underline underline-offset-2 hover:no-underline"
              onClick={() => setParticiparModalOpen(false)}
            >
              comercios adheridos
            </Link>
            .
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
