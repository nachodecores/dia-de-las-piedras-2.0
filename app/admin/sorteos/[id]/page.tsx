"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Gift, Trophy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Participant = {
  id: string;
  ticket_number: number | string;
  name: string;
  whatsapp: string;
  comercio_id: string | null;
  comercios: { fantasy_name: string; slug: string } | null;
  created_at: string;
};

type Prize = {
  id: string;
  name: string;
  description: string | null;
  position: number;
  winner_participant_id: string | null;
  winner?: Participant | null;
};

type Raffle = {
  id: string;
  name: string;
  raffle_date: string | null;
  active: boolean;
};

export default function SorteoParticipantsPage() {
  const params = useParams();
  const raffleId = params.id as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPrizeName, setNewPrizeName] = useState("");
  const [addingPrize, setAddingPrize] = useState(false);

  const fetchData = async () => {
    const [raffleRes, participantsRes, prizesRes] = await Promise.all([
      supabase.from("raffles").select("id, name, raffle_date, active").eq("id", raffleId).single(),
      supabase
        .from("raffle_participants")
        .select("*, comercios(fantasy_name, slug)")
        .eq("raffle_id", raffleId)
        .order("ticket_number", { ascending: true }),
      supabase
        .from("raffle_prizes")
        .select("*")
        .eq("raffle_id", raffleId)
        .order("position", { ascending: true }),
    ]);

    setRaffle(raffleRes.data);
    setParticipants(participantsRes.data || []);
    setPrizes(prizesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [raffleId]);

  const handleAddPrize = async () => {
    if (addingPrize || !newPrizeName.trim()) return;
    setAddingPrize(true);

    const nextPosition = prizes.length + 1;

    const { error } = await supabase.from("raffle_prizes").insert({
      raffle_id: raffleId,
      name: newPrizeName,
      position: nextPosition,
    });

    if (error) {
      toast.error("Error al agregar premio", { description: error.message });
      setAddingPrize(false);
      return;
    }

    toast.success("Premio agregado");
    setNewPrizeName("");
    setAddingPrize(false);
    fetchData();
  };

  const handleDeletePrize = async (prizeId: string) => {
    if (!confirm("¿Eliminar este premio?")) return;

    const { error } = await supabase.from("raffle_prizes").delete().eq("id", prizeId);

    if (error) {
      toast.error("Error al eliminar premio");
      return;
    }

    toast.success("Premio eliminado");
    fetchData();
  };

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
          <div className="flex items-center gap-4 mt-1">
            {raffle.raffle_date && (
              <span className="text-sm text-muted-foreground">
                {new Date(raffle.raffle_date).toLocaleDateString()}
              </span>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants.length} participantes
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Premios */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Premios</h2>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Nombre del premio"
            value={newPrizeName}
            onChange={(e) => setNewPrizeName(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleAddPrize}
            disabled={addingPrize || !newPrizeName.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            {addingPrize ? "..." : "Agregar"}
          </Button>
        </div>

        {prizes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay premios configurados</p>
        ) : (
          <div className="space-y-2">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-muted-foreground">
                    #{prize.position}
                  </span>
                  <span className="font-medium">{prize.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePrize(prize.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de Participantes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Participantes
        </h2>
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
                  #{typeof p.ticket_number === "string" ? p.ticket_number : String(p.ticket_number).padStart(4, "0")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
