"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Gift } from "lucide-react";
import Link from "next/link";

type Participant = {
  id: string;
  ticket_number: number;
  name: string;
  whatsapp: string;
  comercio_id: string | null;
  comercios: { fantasy_name: string; slug: string } | null;
  created_at: string;
};

type Raffle = {
  id: string;
  name: string;
  active: boolean;
};

export default function SorteoParticipantsPage() {
  const params = useParams();
  const raffleId = params.id as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [raffleRes, participantsRes] = await Promise.all([
        supabase.from("raffles").select("id, name, active").eq("id", raffleId).single(),
        supabase
          .from("raffle_participants")
          .select("*, comercios(fantasy_name, slug)")
          .eq("raffle_id", raffleId)
          .order("ticket_number", { ascending: true }),
      ]);

      setRaffle(raffleRes.data);
      setParticipants(participantsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [raffleId]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!raffle) {
    return <div>Sorteo no encontrado</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/sorteos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <h1 className="text-2xl font-bold">{raffle.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Users className="h-3 w-3" />
            {participants.length} participantes
          </p>
        </div>
      </div>

      {participants.length === 0 ? (
        <p className="text-muted-foreground">No hay participantes aún</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {participants.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.whatsapp}</div>
                {p.comercios && (
                  <div className="text-xs text-muted-foreground mt-1">
                    via {p.comercios.fantasy_name || p.comercios.slug}
                  </div>
                )}
              </div>
              <div className="text-lg font-mono font-bold">
                #{p.ticket_number}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
